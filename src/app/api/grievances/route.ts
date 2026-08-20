import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  handleApiError,
  parsePagination,
} from '@/lib/api-utils'
import { DEFAULT_GRIEVANCE_SLA_DAYS } from '@/lib/constants'

// GET /api/grievances
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const severity = searchParams.get('severity') || undefined
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { grievanceNumber: { contains: search } },
        { description: { contains: search } },
        { raisedByName: { contains: search } },
      ]
    }
    if (status) where.status = status
    if (category) where.category = category
    if (severity) where.severity = severity

    const [grievances, total] = await Promise.all([
      db.grievance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.grievance.count({ where }),
    ])

    return paginatedResponse(grievances, total, page, limit)
  } catch (error) {
    return handleApiError(error, 'GET /api/grievances')
  }
}

// POST /api/grievances
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.category || !body.description) {
      return errorResponse('category and description are required', 400)
    }

    // Auto-generate grievance number: GRV-YYYY-XXX
    const year = new Date().getFullYear()
    const prefix = `GRV-${year}-`
    const count = await db.grievance.count({
      where: { grievanceNumber: { startsWith: prefix } },
    })
    const grievanceNumber = `${prefix}${String(count + 1).padStart(3, '0')}`

    const grievance = await db.grievance.create({
      data: {
        grievanceNumber,
        dateRaised: new Date(),
        raisedBy: body.raisedBy || null,
        raisedByName: body.raisedByName || null,
        category: body.category,
        isPOSH: body.isPOSH ?? false,
        description: body.description,
        severity: body.severity || 'Medium',
        assignedTo: body.assignedTo || null,
        status: body.status || 'Open',
        slaDays: body.slaDays ?? DEFAULT_GRIEVANCE_SLA_DAYS,
        photoPaths: body.photoPaths || null,
        photos: body.photos || null,
      },
    })

    return successResponse(grievance, 201)
  } catch (error) {
    return handleApiError(error, 'POST /api/grievances')
  }
}