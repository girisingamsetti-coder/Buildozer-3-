import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { ensurePayrollDataForPeriod } from '@/lib/payroll-seed'

// GET /api/payroll/ecr?period=2026-09
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '2026-09'

    await ensurePayrollDataForPeriod(period)

    const ecrRecords = await db.eCRRecord.findMany({
      where: { period },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(ecrRecords)
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/ecr')
  }
}

// POST /api/payroll/ecr
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      period,
      contractorId,
      contractorName,
      workerCount,
      ecrReference,
      filingDate,
      totalAmount,
      challanNumber,
      challanDate,
      depositDate,
      status,
      remarks,
    } = body

    if (!period || !ecrReference) {
      return errorResponse('period and ecrReference are required', 400)
    }

    const record = await db.eCRRecord.create({
      data: {
        period,
        contractorId: contractorId || null,
        contractorName: contractorName || null,
        workerCount: Number(workerCount || 0),
        ecrReference,
        filingDate: filingDate ? new Date(filingDate) : new Date(),
        totalAmount: Number(totalAmount || 0),
        challanNumber: challanNumber || null,
        challanDate: challanDate ? new Date(challanDate) : null,
        depositDate: depositDate ? new Date(depositDate) : null,
        status: status || 'Filed',
        verificationStatus: 'Verified',
        remarks: remarks || null,
      },
    })

    return successResponse(record, 201)
  } catch (error) {
    return handleApiError(error, 'POST /api/payroll/ecr')
  }
}
