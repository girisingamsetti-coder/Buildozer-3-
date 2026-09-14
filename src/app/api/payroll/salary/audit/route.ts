import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

// GET /api/payroll/salary/audit?recordId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const recordId = searchParams.get('recordId')

    if (!recordId) {
      return errorResponse('recordId is required', 400)
    }

    const logs = await db.auditLog.findMany({
      where: {
        entity: 'SalaryPaymentRecord',
        entityId: recordId,
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    })

    return successResponse(logs)
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/salary/audit')
  }
}
