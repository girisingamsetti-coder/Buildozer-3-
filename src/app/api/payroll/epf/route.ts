import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  handleApiError,
  parsePagination,
} from '@/lib/api-utils'
import { ensurePayrollDataForPeriod } from '@/lib/payroll-seed'

// GET /api/payroll/epf
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '2026-09'
    const search = searchParams.get('search') || ''
    const siteId = searchParams.get('siteId') || undefined
    const contractorId = searchParams.get('contractorId') || undefined
    const ecrStatus = searchParams.get('ecrStatus') || undefined
    const timelinessStatus = searchParams.get('timelinessStatus') || undefined
    const verificationStatus = searchParams.get('verificationStatus') || undefined
    const { page, limit, skip } = parsePagination(searchParams)

    await ensurePayrollDataForPeriod(period)

    const where: any = {
      period,
      worker: {
        isActive: true,
      },
    }

    if (siteId && siteId !== 'all') {
      where.worker.siteId = siteId
    }
    if (contractorId && contractorId !== 'all') {
      where.worker.contractorId = contractorId
    }
    if (ecrStatus && ecrStatus !== 'all') {
      where.ecrStatus = ecrStatus
    }
    if (timelinessStatus && timelinessStatus !== 'all') {
      where.timelinessStatus = timelinessStatus
    }
    if (verificationStatus && verificationStatus !== 'all') {
      where.verificationStatus = verificationStatus
    }

    if (search) {
      where.OR = [
        { worker: { fullName: { contains: search, mode: 'insensitive' } } },
        { worker: { employeeNumber: { contains: search, mode: 'insensitive' } } },
        { uan: { contains: search, mode: 'insensitive' } },
        { ecrReference: { contains: search, mode: 'insensitive' } },
        { challanNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total, allPeriodRecords] = await Promise.all([
      db.ePFRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          worker: {
            select: {
              id: true,
              employeeNumber: true,
              fullName: true,
              gender: true,
              uanNumber: true,
              isActive: true,
              designation: { select: { id: true, name: true } },
              contractor: { select: { id: true, name: true, code: true } },
              site: { select: { id: true, name: true, code: true } },
              labourCamp: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [
          { worker: { employeeNumber: 'asc' } },
        ],
      }),
      db.ePFRecord.count({ where }),
      db.ePFRecord.findMany({ where: { period } }),
    ])

    // Compute EPF KPIs
    const applicableWorkers = allPeriodRecords.filter(r => r.epfApplicable).length
    const uanAvailable = allPeriodRecords.filter(r => r.uan && r.uan.trim() !== '').length
    const uanMissing = applicableWorkers - uanAvailable
    const contributionRecorded = allPeriodRecords.filter(r => r.totalContribution > 0).length
    const ecrFiled = allPeriodRecords.filter(r => r.ecrStatus === 'Filed').length
    const depositRecorded = allPeriodRecords.filter(r => r.depositDate !== null).length
    const depositPending = applicableWorkers - depositRecorded
    const totalAmount = allPeriodRecords.reduce((sum, r) => sum + r.totalContribution, 0)
    const timelyDeposits = allPeriodRecords.filter(r => r.timelinessStatus === 'On Time').length
    const lateDeposits = allPeriodRecords.filter(r => r.timelinessStatus === 'Late').length

    return successResponse({
      data,
      total,
      page,
      limit,
      kpis: {
        applicableWorkers,
        uanAvailable,
        uanMissing,
        contributionRecorded,
        ecrFiled,
        depositRecorded,
        depositPending,
        totalAmount,
        timelyDeposits,
        lateDeposits,
      },
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/epf')
  }
}

// POST /api/payroll/epf - Record an external EPF deposit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      workerId,
      period,
      uan,
      epfApplicable = true,
      epfWage = 15000,
      employeeContribution,
      employerContribution,
      epsContribution,
      edliContribution,
      totalContribution,
      ecrReference,
      ecrFilingDate,
      challanNumber,
      challanDate,
      depositDate,
      dueDate,
      externalReference,
      proofDocumentName,
      proofDocumentUrl,
      verificationStatus,
      remarks,
      userName,
    } = body

    if (!workerId || !period) {
      return errorResponse('workerId and period are required', 400)
    }

    const wage = Number(epfWage || 0)
    const empContrib = employeeContribution !== undefined ? Number(employeeContribution) : Math.round(wage * 0.12)
    const empyrContrib = employerContribution !== undefined ? Number(employerContribution) : Math.round(wage * 0.0367)
    const epsContrib = epsContribution !== undefined ? Number(epsContribution) : Math.round(wage * 0.0833)
    const edliContrib = edliContribution !== undefined ? Number(edliContribution) : Math.round(wage * 0.005)
    const totContrib = totalContribution !== undefined ? Number(totalContribution) : (empContrib + empyrContrib + epsContrib + edliContrib)

    const [yearStr, monthStr] = period.split('-')
    const due = dueDate ? new Date(dueDate) : new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10), 15))
    const depDate = depositDate ? new Date(depositDate) : null

    let timeliness = 'Pending'
    let daysDiff = 0
    if (depDate) {
      const diffMs = depDate.getTime() - due.getTime()
      daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (daysDiff <= 0) {
        timeliness = 'On Time'
      } else {
        timeliness = 'Late'
      }
    } else {
      if (new Date() > due) {
        timeliness = 'Overdue'
      }
    }

    const record = await db.ePFRecord.upsert({
      where: {
        workerId_period: { workerId, period },
      },
      update: {
        uan: uan || null,
        epfApplicable,
        epfWage: wage,
        employeeContribution: empContrib,
        employerContribution: empyrContrib,
        epsContribution: epsContrib,
        edliContribution: edliContrib,
        totalContribution: totContrib,
        ecrStatus: ecrReference ? 'Filed' : 'Pending',
        ecrReference: ecrReference || null,
        ecrFilingDate: ecrFilingDate ? new Date(ecrFilingDate) : null,
        challanNumber: challanNumber || null,
        challanDate: challanDate ? new Date(challanDate) : null,
        depositDate: depDate,
        dueDate: due,
        externalReference: externalReference || null,
        timelinessStatus: timeliness,
        daysDifference: daysDiff,
        proofDocumentName: proofDocumentName || null,
        proofDocumentUrl: proofDocumentUrl || null,
        verificationStatus: verificationStatus || 'Pending Verification',
        remarks: remarks || null,
      },
      create: {
        workerId,
        period,
        uan: uan || null,
        epfApplicable,
        epfWage: wage,
        employeeContribution: empContrib,
        employerContribution: empyrContrib,
        epsContribution: epsContrib,
        edliContribution: edliContrib,
        totalContribution: totContrib,
        ecrStatus: ecrReference ? 'Filed' : 'Pending',
        ecrReference: ecrReference || null,
        ecrFilingDate: ecrFilingDate ? new Date(ecrFilingDate) : null,
        challanNumber: challanNumber || null,
        challanDate: challanDate ? new Date(challanDate) : null,
        depositDate: depDate,
        dueDate: due,
        externalReference: externalReference || null,
        timelinessStatus: timeliness,
        daysDifference: daysDiff,
        proofDocumentName: proofDocumentName || null,
        proofDocumentUrl: proofDocumentUrl || null,
        verificationStatus: verificationStatus || 'Pending Verification',
        remarks: remarks || null,
        createdBy: userName || 'Admin',
      },
    })

    // Log Audit
    await db.auditLog.create({
      data: {
        action: 'RECORD_EXTERNAL_EPF_DEPOSIT',
        entity: 'EPFRecord',
        entityId: record.id,
        userName: userName || 'Admin',
        field: 'depositDate',
        newValue: depDate ? depDate.toISOString() : null,
      },
    })

    return successResponse(record, 201)
  } catch (error) {
    return handleApiError(error, 'POST /api/payroll/epf')
  }
}

// PUT /api/payroll/epf - Verify / Update EPF Record
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, verificationStatus, verificationRemarks, verifiedBy, remarks, userName } = body

    if (!id) {
      return errorResponse('Record id is required', 400)
    }

    const current = await db.ePFRecord.findUnique({ where: { id } })
    if (!current) {
      return errorResponse('Record not found', 404)
    }

    const updateData: any = {}
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus
      updateData.verifiedBy = verifiedBy || userName || 'Compliance Auditor'
      updateData.verifiedAt = new Date()
      if (verificationRemarks !== undefined) updateData.verificationRemarks = verificationRemarks
    }
    if (remarks !== undefined) updateData.remarks = remarks

    const updated = await db.ePFRecord.update({
      where: { id },
      data: updateData,
    })

    await db.auditLog.create({
      data: {
        action: 'VERIFY_EPF_RECORD',
        entity: 'EPFRecord',
        entityId: id,
        userName: userName || verifiedBy || 'Admin',
        field: 'verificationStatus',
        oldValue: current.verificationStatus,
        newValue: verificationStatus,
      },
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error, 'PUT /api/payroll/epf')
  }
}
