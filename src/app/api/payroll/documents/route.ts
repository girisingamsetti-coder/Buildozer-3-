import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { ensurePayrollDataForPeriod } from '@/lib/payroll-seed'

export const dynamic = 'force-dynamic'


// GET /api/payroll/documents?period=2026-09&category=all
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '2026-09'
    const category = searchParams.get('category') || 'all'
    const documentType = searchParams.get('documentType') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    await ensurePayrollDataForPeriod(period)

    const where: any = { period }
    if (category !== 'all') where.category = category
    if (documentType !== 'all') where.documentType = documentType
    if (status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { workerName: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
        { contractorName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const documents = await db.paymentDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(documents)
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/documents')
  }
}

// POST /api/payroll/documents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      period,
      category,
      documentType,
      fileName,
      fileUrl,
      fileSize,
      workerId,
      workerName,
      employeeNumber,
      contractorId,
      contractorName,
      siteId,
      siteName,
      remarks,
      userName,
    } = body

    if (!fileName || !category || !documentType || !period) {
      return errorResponse('fileName, category, documentType, and period are required', 400)
    }

    const doc = await db.paymentDocument.create({
      data: {
        period,
        category,
        documentType,
        fileName,
        fileUrl: fileUrl || `/upload/payroll/${period}/${fileName}`,
        fileSize: fileSize || '1.2 MB',
        workerId: workerId || null,
        workerName: workerName || null,
        employeeNumber: employeeNumber || null,
        contractorId: contractorId || null,
        contractorName: contractorName || null,
        siteId: siteId || null,
        siteName: siteName || null,
        status: 'Uploaded',
        uploadedBy: userName || 'Admin',
        remarks: remarks || null,
      },
    })

    return successResponse(doc, 201)
  } catch (error) {
    return handleApiError(error, 'POST /api/payroll/documents')
  }
}

// PUT /api/payroll/documents - Verify/Reject document
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, remarks, userName } = body

    if (!id || !status) {
      return errorResponse('id and status are required', 400)
    }

    const doc = await db.paymentDocument.update({
      where: { id },
      data: {
        status,
        verifiedBy: userName || 'Compliance Auditor',
        verifiedAt: new Date(),
        remarks: remarks !== undefined ? remarks : undefined,
      },
    })

    return successResponse(doc)
  } catch (error) {
    return handleApiError(error, 'PUT /api/payroll/documents')
  }
}
