import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  handleApiError,
  parsePagination,
} from '@/lib/api-utils'

// GET /api/incidents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const incidentType = searchParams.get('incidentType') || undefined
    const severity = searchParams.get('severity') || undefined
    const status = searchParams.get('status') || undefined
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { incidentNumber: { contains: search } },
        { description: { contains: search } },
        { locationOnSite: { contains: search } },
      ]
    }
    if (incidentType) where.incidentType = incidentType
    if (severity) where.severity = severity
    if (status) where.status = status

    const [incidents, total] = await Promise.all([
      db.incident.findMany({
        where,
        skip,
        take: limit,
        include: {
          contractor: { select: { id: true, name: true, code: true } },
          site: { select: { id: true, name: true, code: true } },
          workers: { include: { worker: { select: { id: true, fullName: true, employeeNumber: true } } } },
          _count: { select: { followUps: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.incident.count({ where }),
    ])

    return paginatedResponse(incidents, total, page, limit)
  } catch (error) {
    return handleApiError(error, 'GET /api/incidents')
  }
}

// POST /api/incidents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.incidentType || !body.date || !body.description) {
      return errorResponse('incidentType, date, and description are required', 400)
    }

    // Auto-generate incident number: INC-YYYY-XXX
    const year = new Date().getFullYear()
    const prefix = `INC-${year}-`
    const count = await db.incident.count({
      where: { incidentNumber: { startsWith: prefix } },
    })
    const incidentNumber = `${prefix}${String(count + 1).padStart(3, '0')}`

    const incident = await db.incident.create({
      data: {
        incidentNumber,
        incidentType: body.incidentType,
        date: new Date(body.date),
        time: body.time || null,
        locationOnSite: body.locationOnSite || null,
        description: body.description,
        rootCause: body.rootCause || null,
        immediateAction: body.immediateAction || null,
        firstResponder: body.firstResponder || null,
        hospitalReferred: body.hospitalReferred || null,
        severity: body.severity || 'Medium',
        status: body.status || 'Open',
        isDeath: body.isDeath ?? false,
        policeFIRReference: body.policeFIRReference || null,
        employerNotifiedAt: body.employerNotifiedAt ? new Date(body.employerNotifiedAt) : null,
        compensationStatus: body.compensationStatus || null,
        familyNotified: body.familyNotified ?? false,
        closureStatus: body.closureStatus || null,
        contractorId: body.contractorId || null,
        siteId: body.siteId || null,
        photoPaths: body.photoPaths || null,
        workers: {
          create: (body.workers || []).map((w: { workerId?: string; workerName?: string; injuryDesc?: string }) => ({
            workerId: w.workerId || null,
            workerName: w.workerName || null,
            injuryDesc: w.injuryDesc || null,
          })),
        },
      },
      include: {
        contractor: true,
        site: true,
        workers: { include: { worker: { select: { id: true, fullName: true, employeeNumber: true } } } },
      },
    })

    return successResponse(incident, 201)
  } catch (error) {
    return handleApiError(error, 'POST /api/incidents')
  }
}