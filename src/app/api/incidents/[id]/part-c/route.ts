import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { isSubmit, data } = body

    const existing = await db.incident.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    const updateData: any = { ...data }

    if (isSubmit) {
      updateData.submittedAt = new Date()
    }

    const partC = await db.incidentPartC.upsert({
      where: { incidentId: id },
      create: {
        incidentId: id,
        ...updateData,
      },
      update: {
        ...updateData,
      },
    })

    const incidentUpdates: any = {}
    if (isSubmit) {
      incidentUpdates.partCStatus = 'Submitted'
    } else {
      incidentUpdates.partCStatus = 'Draft'
      incidentUpdates.status = 'Investigation In Progress'
    }

    const incident = await db.incident.update({
      where: { id },
      data: incidentUpdates,
      include: {
        partB: true,
        partC: true,
        annexures: true,
      },
    })

    return NextResponse.json({ data: incident })
  } catch (error) {
    console.error('POST /api/incidents/[id]/part-c error:', error)
    return NextResponse.json({ error: 'Failed to save Part C' }, { status: 500 })
  }
}
