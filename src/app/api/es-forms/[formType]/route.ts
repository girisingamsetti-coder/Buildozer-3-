import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formType: string }> }
) {
  try {
    const { formType } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const submissions = await db.eSFormSubmission.findMany({
      where: { formType },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ data: submissions })
  } catch (error) {
    const { formType } = await params.catch(() => ({ formType: 'unknown' }))
    console.error(`GET /api/es-forms/${formType} error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formType: string }> }
) {
  try {
    const { formType } = await params
    const body = await req.json()
    const {
      projectNumber,
      projectName,
      reportingMonth,
      projectTitle,
      manager,
      customer,
      boq,
      boqDesc,
      status,
      submittedAt,
      ...formData
    } = body

    const result = await db.eSFormSubmission.create({
      data: {
        formType,
        projectNumber,
        projectName,
        reportingMonth,
        projectTitle,
        manager,
        customer,
        boq,
        boqDesc,
        status: status || 'Draft',
        submittedAt: submittedAt ? new Date(submittedAt) : null,
        formData: JSON.stringify(formData),
      },
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    const { formType } = await params.catch(() => ({ formType: 'unknown' }))
    console.error(`POST /api/es-forms/${formType} error:`, error)
    return NextResponse.json(
      { error: 'Failed to save form submission' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ formType: string }> }
) {
  try {
    const { formType } = await params
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    }

    await db.eSFormSubmission.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { formType } = await params.catch(() => ({ formType: 'unknown' }))
    console.error(`DELETE /api/es-forms/${formType} error:`, error)
    return NextResponse.json(
      { error: 'Failed to delete form submission' },
      { status: 500 }
    )
  }
}
