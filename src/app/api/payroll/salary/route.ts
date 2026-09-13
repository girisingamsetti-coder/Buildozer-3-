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

// GET /api/payroll/salary
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '2026-09'
    const search = searchParams.get('search') || ''
    const siteId = searchParams.get('siteId') || undefined
    const contractorId = searchParams.get('contractorId') || undefined
    const labourCampId = searchParams.get('labourCampId') || undefined
    const designationId = searchParams.get('designationId') || undefined
    const paymentStatus = searchParams.get('paymentStatus') || undefined
    const paymentMode = searchParams.get('paymentMode') || undefined
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
    if (labourCampId && labourCampId !== 'all') {
      where.worker.labourCampId = labourCampId
    }
    if (designationId && designationId !== 'all') {
      where.worker.designationId = designationId
    }
    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus
    }
    if (paymentMode && paymentMode !== 'all') {
      where.paymentMode = paymentMode
    }
    if (verificationStatus && verificationStatus !== 'all') {
      where.verificationStatus = verificationStatus
    }

    if (search) {
      where.worker.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
        { externalReference: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      db.salaryPaymentRecord.findMany({
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
      db.salaryPaymentRecord.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/salary')
  }
}

// POST /api/payroll/salary - Record an externally completed salary payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      workerId,
      period,
      payableDays,
      grossSalary,
      deductions,
      netSalary,
      paymentStatus,
      paymentDate,
      paymentMode,
      externalReference,
      paymentSource,
      bankName,
      accountLast4,
      proofDocumentName,
      proofDocumentUrl,
      remarks,
      userName,
    } = body

    if (!workerId || !period) {
      return errorResponse('workerId and period are required', 400)
    }

    const worker = await db.worker.findUnique({ where: { id: workerId } })
    if (!worker) {
      return errorResponse('Worker not found', 404)
    }

    const existing = await db.salaryPaymentRecord.findUnique({
      where: { workerId_period: { workerId, period } },
    })

    const pDate = paymentDate ? new Date(paymentDate) : null
    const net = netSalary !== undefined ? Number(netSalary) : Number(grossSalary || 0) - Number(deductions || 0)

    const record = await db.salaryPaymentRecord.upsert({
      where: {
        workerId_period: { workerId, period },
      },
      update: {
        payableDays: payableDays ?? 26,
        grossSalary: Number(grossSalary || 0),
        deductions: Number(deductions || 0),
        netSalary: net,
        paymentStatus: paymentStatus || 'Paid',
        paymentDate: pDate,
        paymentMode: paymentMode || 'Bank Transfer',
        externalReference: externalReference || null,
        paymentSource: paymentSource || 'Contractor',
        bankName: bankName || null,
        accountLast4: accountLast4 || null,
        proofDocumentName: proofDocumentName || null,
        proofDocumentUrl: proofDocumentUrl || null,
        remarks: remarks || null,
        updatedBy: userName || 'Admin',
      },
      create: {
        workerId,
        period,
        payableDays: payableDays ?? 26,
        grossSalary: Number(grossSalary || 0),
        deductions: Number(deductions || 0),
        netSalary: net,
        paymentStatus: paymentStatus || 'Paid',
        paymentDate: pDate,
        paymentMode: paymentMode || 'Bank Transfer',
        externalReference: externalReference || null,
        paymentSource: paymentSource || 'Contractor',
        bankName: bankName || null,
        accountLast4: accountLast4 || null,
        proofDocumentName: proofDocumentName || null,
        proofDocumentUrl: proofDocumentUrl || null,
        verificationStatus: 'Pending Verification',
        remarks: remarks || null,
        createdBy: userName || 'Admin',
      },
      include: {
        worker: {
          select: {
            id: true,
            employeeNumber: true,
            fullName: true,
            designation: true,
            contractor: true,
            site: true,
          },
        },
      },
    })

    // Log Audit
    await db.auditLog.create({
      data: {
        action: existing ? 'UPDATE_SALARY_PAYMENT_RECORD' : 'CREATE_SALARY_PAYMENT_RECORD',
        entity: 'SalaryPaymentRecord',
        entityId: record.id,
        userName: userName || 'Admin',
        field: 'paymentStatus',
        oldValue: existing?.paymentStatus || null,
        newValue: record.paymentStatus,
      },
    })

    return successResponse(record, 201)
  } catch (error) {
    return handleApiError(error, 'POST /api/payroll/salary')
  }
}

// PUT /api/payroll/salary - Update / Verify payment record
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, verificationStatus, verificationRemarks, verifiedBy, remarks, userName, reason } = body

    if (!id) {
      return errorResponse('Record id is required', 400)
    }

    const current = await db.salaryPaymentRecord.findUnique({ where: { id } })
    if (!current) {
      return errorResponse('Record not found', 404)
    }

    const updateData: any = {}
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus
      updateData.verifiedBy = verifiedBy || userName || 'Compliance Officer'
      updateData.verifiedAt = new Date()
      if (verificationRemarks !== undefined) updateData.verificationRemarks = verificationRemarks
    }
    if (remarks !== undefined) updateData.remarks = remarks
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus
    if (body.paymentDate !== undefined) updateData.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null
    if (body.externalReference !== undefined) updateData.externalReference = body.externalReference
    if (body.proofDocumentName !== undefined) updateData.proofDocumentName = body.proofDocumentName
    if (body.proofDocumentUrl !== undefined) updateData.proofDocumentUrl = body.proofDocumentUrl

    const updated = await db.salaryPaymentRecord.update({
      where: { id },
      data: updateData,
      include: {
        worker: true,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        action: verificationStatus ? 'VERIFY_SALARY_RECORD' : 'UPDATE_SALARY_RECORD',
        entity: 'SalaryPaymentRecord',
        entityId: id,
        userName: userName || verifiedBy || 'Admin',
        field: verificationStatus ? 'verificationStatus' : 'recordDetails',
        oldValue: current.verificationStatus,
        newValue: verificationStatus || updated.paymentStatus,
      },
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error, 'PUT /api/payroll/salary')
  }
}
