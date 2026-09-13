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

    // Convert date strings to Date objects where appropriate
    const updateData: any = { ...data }
    if (updateData.dateOfIncident) updateData.dateOfIncident = new Date(updateData.dateOfIncident)
    if (updateData.dateReportedToPIU) updateData.dateReportedToPIU = new Date(updateData.dateReportedToPIU)
    if (updateData.dateReportedToWB) updateData.dateReportedToWB = new Date(updateData.dateReportedToWB)

    if (isSubmit) {
      updateData.submittedAt = new Date()
      // You could map 'submittedBy' if using session data
    }

    const partB = await db.incidentPartB.upsert({
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
      incidentUpdates.partBStatus = 'Submitted'
      incidentUpdates.status = 'Investigation Pending' // transition to next stage
    } else {
      incidentUpdates.partBStatus = 'Draft'
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
    console.error('POST /api/incidents/[id]/part-b error:', error)
    return NextResponse.json({ error: 'Failed to save Part B' }, { status: 500 })
  }
}
