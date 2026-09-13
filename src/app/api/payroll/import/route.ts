import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

// POST /api/payroll/import
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { period, records, dryRun = true, importType = 'salary', userName } = body

    if (!period || !Array.isArray(records) || records.length === 0) {
      return errorResponse('period and records array are required', 400)
    }

    // Fetch all active workers to validate against
    const workers = await db.worker.findMany({
      where: { isActive: true },
      select: { id: true, employeeNumber: true, fullName: true, uanNumber: true },
    })

    const workerMap = new Map(workers.map(w => [w.employeeNumber.toUpperCase(), w]))
    const seenEmployeeNumbers = new Set<string>()
    const seenReferences = new Set<string>()

    const validatedRows: any[] = []
    const errors: { row: number; employeeNumber: string; message: string }[] = []
    const warnings: { row: number; employeeNumber: string; message: string }[] = []

    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const rowNum = i + 1
      const empNo = (row.employeeNumber || '').toString().trim().toUpperCase()

      if (!empNo) {
        errors.push({ row: rowNum, employeeNumber: 'N/A', message: 'Missing Employee Number' })
        continue
      }

      const worker = workerMap.get(empNo)
      if (!worker) {
        errors.push({ row: rowNum, employeeNumber: empNo, message: `Worker ${empNo} not found in Workforce register` })
        continue
      }

      if (seenEmployeeNumbers.has(empNo)) {
        errors.push({ row: rowNum, employeeNumber: empNo, message: `Duplicate worker ${empNo} in same import sheet` })
        continue
      }
      seenEmployeeNumbers.add(empNo)

      const refNo = (row.externalReference || '').toString().trim()
      if (refNo) {
        if (seenReferences.has(refNo)) {
          warnings.push({ row: rowNum, employeeNumber: empNo, message: `Duplicate payment reference ${refNo}` })
        } else {
          seenReferences.add(refNo)
        }
      }

      const gross = parseFloat(row.grossSalary || row.gross || 0)
      const deductions = parseFloat(row.deductions || 0)
      const net = row.netSalary ? parseFloat(row.netSalary) : (gross - deductions)

      if (isNaN(gross) || gross < 0) {
        errors.push({ row: rowNum, employeeNumber: empNo, message: 'Invalid gross salary amount' })
        continue
      }

      validatedRows.push({
        workerId: worker.id,
        employeeNumber: empNo,
        workerName: worker.fullName,
        period,
        payableDays: parseInt(row.payableDays || '26', 10),
        grossSalary: gross,
        deductions,
        netSalary: net,
        paymentStatus: row.paymentStatus || 'Paid',
        paymentDate: row.paymentDate ? new Date(row.paymentDate) : new Date(),
        paymentMode: row.paymentMode || 'Bank Transfer',
        externalReference: refNo || null,
        paymentSource: row.paymentSource || 'Contractor',
        bankName: row.bankName || null,
        accountLast4: row.accountLast4 ? row.accountLast4.toString().slice(-4) : null,
        proofDocumentName: row.proofDocumentName || null,
        remarks: row.remarks || 'Imported via Excel upload',
      })
    }

    // If dryRun is true, return validation summary
    if (dryRun) {
      return successResponse({
        totalRows: records.length,
        validCount: validatedRows.length,
        warningCount: warnings.length,
        errorCount: errors.length,
        errors,
        warnings,
        preview: validatedRows.slice(0, 10),
      })
    }

    // Commit valid records
    let createdCount = 0
    for (const item of validatedRows) {
      await db.salaryPaymentRecord.upsert({
        where: {
          workerId_period: { workerId: item.workerId, period: item.period },
        },
        update: {
          payableDays: item.payableDays,
          grossSalary: item.grossSalary,
          deductions: item.deductions,
          netSalary: item.netSalary,
          paymentStatus: item.paymentStatus,
          paymentDate: item.paymentDate,
          paymentMode: item.paymentMode,
          externalReference: item.externalReference,
          paymentSource: item.paymentSource,
          bankName: item.bankName,
          accountLast4: item.accountLast4,
          proofDocumentName: item.proofDocumentName,
          remarks: item.remarks,
          updatedBy: userName || 'Admin',
        },
        create: {
          workerId: item.workerId,
          period: item.period,
          payableDays: item.payableDays,
          grossSalary: item.grossSalary,
          deductions: item.deductions,
          netSalary: item.netSalary,
          paymentStatus: item.paymentStatus,
          paymentDate: item.paymentDate,
          paymentMode: item.paymentMode,
          externalReference: item.externalReference,
          paymentSource: item.paymentSource,
          bankName: item.bankName,
          accountLast4: item.accountLast4,
          proofDocumentName: item.proofDocumentName,
          verificationStatus: 'Pending Verification',
          remarks: item.remarks,
          createdBy: userName || 'Admin',
        },
      })
      createdCount++
    }

    await db.auditLog.create({
      data: {
        action: 'BULK_IMPORT_SALARY_RECORDS',
        entity: 'SalaryPaymentRecord',
        userName: userName || 'Admin',
        field: 'bulkCount',
        newValue: `${createdCount} records imported for ${period}`,
      },
    })

    return successResponse({
      success: true,
      importedCount: createdCount,
      errors,
      warnings,
    })
  } catch (error) {
    return handleApiError(error, 'POST /api/payroll/import')
  }
}
