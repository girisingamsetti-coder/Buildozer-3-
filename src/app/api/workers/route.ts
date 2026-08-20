import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  handleApiError,
  parsePagination,
} from '@/lib/api-utils'
import { AGE_RANGE, AADHAAR_REGEX } from '@/lib/constants'

function calculateAge(dob: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

// GET /api/workers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const contractorId = searchParams.get('contractorId') || undefined
    const designationId = searchParams.get('designationId') || undefined
    const siteId = searchParams.get('siteId') || undefined
    const labourCampId = searchParams.get('labourCampId') || undefined
    const gender = searchParams.get('gender') || undefined
    const status = searchParams.get('status') || undefined
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { employeeNumber: { contains: search } },
        { aadhaarNumber: { contains: search } },
      ]
    }
    if (contractorId) where.contractorId = contractorId
    if (designationId) where.designationId = designationId
    if (siteId) where.siteId = siteId
    if (labourCampId) where.labourCampId = labourCampId
    if (gender) where.gender = gender
    if (status === 'active') where.isActive = true
    else if (status === 'inactive') where.isActive = false

    const [workers, total] = await Promise.all([
      db.worker.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          employeeNumber: true,
          fullName: true,
          gender: true,
          bloodGroup: true,
          uanNumber: true,
          isActive: true,
          profilePhotoPath: true,
          policeRecords: true,
          nativeState: true,
          createdAt: true,
          designation: { select: { id: true, name: true, category: true } },
          contractor: { select: { id: true, name: true, code: true } },
          site: { select: { id: true, name: true, code: true } },
          labourCamp: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.worker.count({ where }),
    ])

    return paginatedResponse(workers, total, page, limit)
  } catch (error) {
    return handleApiError(error, 'GET /api/workers')
  }
}

// POST /api/workers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName, dateOfBirth, gender, aadhaarNumber, permanentAddress,
      currentAddress, bloodGroup, qualification, qualificationNote,
      designationId, contractorId, siteId, zone, reportingSupervisor,
      profilePhotoPath, aadhaarScanPath, emergencyContacts, nominees,
      uanNumber, labourCampId,
    } = body

    // Validate required fields
    if (!fullName || !dateOfBirth || !gender || !aadhaarNumber || !permanentAddress || !bloodGroup || !qualification || !designationId || !contractorId) {
      return errorResponse('Missing required fields', 400)
    }

    // Validate age range
    const dob = new Date(dateOfBirth)
    const age = calculateAge(dob)
    if (age < AGE_RANGE.min || age > AGE_RANGE.max) {
      return errorResponse(`Age must be between ${AGE_RANGE.min} and ${AGE_RANGE.max}`, 400, 'dateOfBirth')
    }

    // Validate aadhaar 12-digit
    if (!AADHAAR_REGEX.test(aadhaarNumber)) {
      return errorResponse('Aadhaar must be exactly 12 digits', 400, 'aadhaarNumber')
    }

    // Validate designation exists
    const designation = await db.designation.findUnique({ where: { id: designationId } })
    if (!designation) {
      return errorResponse('Designation not found', 400)
    }

    // Validate contractor exists
    const contractor = await db.contractor.findUnique({ where: { id: contractorId } })
    if (!contractor) {
      return errorResponse('Contractor not found', 400)
    }

    // Auto-generate employee number
    const count = await db.worker.count()
    const employeeNumber = `${contractor.code}-WK-${String(count + 1).padStart(4, '0')}`

    const worker = await db.worker.create({
      data: {
        employeeNumber,
        fullName,
        dateOfBirth: dob,
        age,
        gender,
        aadhaarNumber,
        aadhaarScanPath: aadhaarScanPath || null,
        permanentAddress,
        currentAddress: currentAddress || null,
        bloodGroup,
        qualification,
        qualificationNote: qualificationNote || null,
        designationId,
        contractorId,
        siteId: siteId || null,
        zone: zone || null,
        reportingSupervisor: reportingSupervisor || null,
        profilePhotoPath: profilePhotoPath || null,
        uanNumber: uanNumber || null,
        labourCampId: labourCampId || null,
        emergencyContacts: {
          create: (emergencyContacts || []).map((ec: { name: string; relationship: string; phone: string; isPrimary?: boolean }) => ({
            name: ec.name,
            relationship: ec.relationship,
            phone: ec.phone,
            isPrimary: ec.isPrimary || false,
          })),
        },
        nominees: {
          create: (nominees || []).map((n: { name: string; relationship: string; idNumber?: string; contactNumber?: string }) => ({
            name: n.name,
            relationship: n.relationship,
            idNumber: n.idNumber || null,
            contactNumber: n.contactNumber || null,
          })),
        },
      },
      include: {
        designation: true,
        contractor: true,
        site: true,
        emergencyContacts: true,
        nominees: true,
      },
    })

    return successResponse(worker, 201)
  } catch (error: unknown) {
    return handleApiError(error, 'POST /api/workers')
  }
}
