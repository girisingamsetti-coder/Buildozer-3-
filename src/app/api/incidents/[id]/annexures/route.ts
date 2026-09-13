import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type, otherType, fileName, fileUrl, uploadedBy } = body

    const existing = await db.incident.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    const annexure = await db.incidentAnnexure.create({
      data: {
        incidentId: id,
        type,
        otherType: otherType || null,
        fileName,
        fileUrl,
        uploadedBy: uploadedBy || null,
      },
    })

    return NextResponse.json({ data: annexure }, { status: 201 })
  } catch (error) {
    console.error('POST /api/incidents/[id]/annexures error:', error)
    return NextResponse.json({ error: 'Failed to upload annexure' }, { status: 500 })
  }
}
