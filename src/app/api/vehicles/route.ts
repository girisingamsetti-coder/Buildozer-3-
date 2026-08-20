import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  handleApiError,
  parsePagination,
} from '@/lib/api-utils'

// GET /api/vehicles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const vehicleType = searchParams.get('vehicleType') || undefined
    const condition = searchParams.get('condition') || undefined
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search } },
      ]
    }
    if (vehicleType) where.vehicleType = vehicleType
    if (condition) where.condition = condition

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          contractor: { select: { id: true, name: true, code: true } },
          site: { select: { id: true, name: true, code: true } },
          driver: { select: { id: true, fullName: true, employeeNumber: true } },
          _count: { select: { documents: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.vehicle.count({ where }),
    ])

    return paginatedResponse(vehicles, total, page, limit)
  } catch (error) {
    return handleApiError(error, 'GET /api/vehicles')
  }
}

// POST /api/vehicles
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.vehicleNumber || !body.vehicleType) {
      return errorResponse('vehicleNumber and vehicleType are required', 400)
    }

    const vehicle = await db.vehicle.create({
      data: {
        vehicleNumber: body.vehicleNumber,
        vehicleType: body.vehicleType,
        owner: body.owner || 'Contractor',
        condition: body.condition || 'Fit',
        lastInspectionDate: body.lastInspectionDate ? new Date(body.lastInspectionDate) : null,
        nextInspectionDue: body.nextInspectionDue ? new Date(body.nextInspectionDue) : null,
        contractorId: body.contractorId || null,
        siteId: body.siteId || null,
        driverId: body.driverId || null,
      },
      include: {
        contractor: true,
        site: true,
        driver: { select: { id: true, fullName: true, employeeNumber: true } },
      },
    })

    return successResponse(vehicle, 201)
  } catch (error) {
    return handleApiError(error, 'POST /api/vehicles')
  }
}