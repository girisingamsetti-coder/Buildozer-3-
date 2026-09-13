import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

// POST /api/payroll/salary/bulk-verify
// Body: { period, userName }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { period, userName } = body

    if (!period) {
      return errorResponse('period is required', 400)
    }

    // Find all pending verification records that have actual payment data
    const pending = await db.salaryPaymentRecord.findMany({
      where: {
        period,
        verificationStatus: 'Pending Verification',
        paymentStatus: { not: 'Not Recorded' },
      },
      select: { id: true },
    })

    if (pending.length === 0) {
      return successResponse({ count: 0, message: 'No pending records to verify' })
    }

    const verifiedAt = new Date()
    const verifiedBy = userName || 'Bulk Verify'

    await db.salaryPaymentRecord.updateMany({
      where: { id: { in: pending.map(r => r.id) } },
      data: {
        verificationStatus: 'Verified',
        verifiedBy,
        verifiedAt,
        verificationRemarks: `Bulk verified by ${verifiedBy}`,
      },
    })

    await db.auditLog.create({
      data: {
        action: 'BULK_VERIFY_SALARY_RECORDS',
        entity: 'SalaryPaymentRecord',
        entityId: period,
        userName: verifiedBy,
        field: 'verificationStatus',
        oldValue: 'Pending Verification',
        newValue: `Verified (${pending.length} records)`,
      },
    })

    return successResponse({ count: pending.length, period, verifiedBy })
  } catch (error) {
    return handleApiError(error, 'POST /api/payroll/salary/bulk-verify')
  }
}
