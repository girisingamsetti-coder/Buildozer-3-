import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

// GET /api/workers/[id]/payroll
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const worker = await db.worker.findUnique({ where: { id } })
    if (!worker) {
      return errorResponse('Worker not found', 404)
    }

    const [salaryHistory, epfHistory] = await Promise.all([
      db.salaryPaymentRecord.findMany({
        where: { workerId: id },
        orderBy: { period: 'desc' },
      }),
      db.ePFRecord.findMany({
        where: { workerId: id },
        orderBy: { period: 'desc' },
      }),
    ])

    return successResponse({
      workerId: id,
      salaryHistory,
      epfHistory,
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/workers/[id]/payroll')
  }
}
