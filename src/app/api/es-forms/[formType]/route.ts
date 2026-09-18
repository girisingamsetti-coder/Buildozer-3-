import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// In-memory store for newly submitted forms when PostgreSQL table is not migrated
const inMemoryStore: Record<string, any[]> = {}

const FORM_FILE_MAP: Record<string, string> = {
  OHS: 'ohs_monitoring.json',
  EVM: 'environmental_compliance_monitoring.json',
  RoadSafety: 'road_safety_checklist.json',
  'Road Safety': 'road_safety_checklist.json',
  Gender: 'gender.json',
  LabourLaw: 'labour_law_compliance.json',
  'Labour Law': 'labour_law_compliance.json',
  SkillTraining: 'skill_training_and_employment.json',
  'Skill Training': 'skill_training_and_employment.json',
  SocialSafeguard: 'social_safeguard_compliance.json',
  'Social Safeguard': 'social_safeguard_compliance.json',
}

function getSyntheticFallbackData(formType: string) {
  const fileName = FORM_FILE_MAP[formType]
  if (!fileName) return []

  try {
    const filePath = path.join(process.cwd(), 'public', 'synthetic_data', fileName)
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      const records = parsed.records || []

      return records.map((r: any) => {
        const enrichedData: Record<string, any> = { ...r }

        if (formType === 'OHS') {
          enrichedData.induction = { status: r.daily_monitoring?.ohs_induction_conducted ? 'yes' : 'no' }
          enrichedData.wmsHira = { status: r.weekly_reporting?.wms_hira_approval === 'Approved' ? 'yes' : 'no' }
          enrichedData.ohsCommittee = { status: r.monthly_monitoring?.ohs_committee_formed ? 'yes' : 'no' }
          enrichedData.safetyAudit = { status: r.ohs_audits?.length > 0 ? 'yes' : 'no' }
          enrichedData.hira = { status: r.hazard_id_sop?.hira_carried_out_quarterly ? 'yes' : 'no' }
          enrichedData.ohsPolicy = { status: r.ohs_policies?.health_and_safety_policy_displayed ? 'yes' : 'no' }
        } else if (formType === 'RoadSafety' || formType === 'Road Safety') {
          enrichedData.checklist = (r.checklist || []).map((c: any) => ({
            ...c,
            answer: c.status?.toLowerCase() === 'yes' ? 'yes' : 'no'
          }))
        } else if (formType === 'Gender') {
          enrichedData.gbvInstances = (r.sea_sh_complaints?.monthly_registered || 0) > 0 ? 'Yes' : 'No'
        }

        return {
          id: r.id,
          projectNumber: r.project_no || 'WIN/0032/24-25',
          projectName: r.project_title || "Hon'ble MLAs and MLCs and AIS Officers - Housing",
          reportingMonth: r.reporting_month,
          projectTitle: r.project_title,
          manager: r.manager,
          customer: r.customer,
          boq: 'BOQ-AMR-01',
          boqDesc: 'Standard Infrastructure Work',
          status: r.rag_status === 'Red' ? 'Rejected' : (r.rag_status === 'Amber' ? 'PMC' : 'Approved'),
          submittedAt: r.form_created_date === 'Invalid date' ? '2025-06-01' : r.form_created_date,
          formData: JSON.stringify(enrichedData),
          createdAt: new Date(r.reporting_month + '-01')
        }
      })
    }
  } catch (err) {
    console.warn('Failed to read fallback synthetic file:', err)
  }
  return []
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formType: string }> }
) {
  const { formType } = await params
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    if ((db as any)?.eSFormSubmission) {
      const submissions = await (db as any).eSFormSubmission.findMany({
        where: { formType },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      if (submissions && submissions.length > 0) {
        return NextResponse.json({ data: submissions })
      }
    }
  } catch (error) {
    console.warn(`Database query for ${formType} failed or table missing, falling back to synthetic dataset.`)
  }

  // Fallback to in-memory + synthetic records
  const memoryItems = inMemoryStore[formType] || []
  const syntheticItems = getSyntheticFallbackData(formType)
  const combined = [...memoryItems, ...syntheticItems].slice(0, limit)

  return NextResponse.json({ data: combined })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formType: string }> }
) {
  const { formType } = await params
  try {
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

    if ((db as any)?.eSFormSubmission) {
      const result = await (db as any).eSFormSubmission.create({
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
    }
  } catch (error) {
    console.warn(`DB save failed for ${formType}, persisting in memory:`, error)
  }

  // Fallback to in-memory store
  const id = `${formType}-${Date.now()}`
  const body = await req.json().catch(() => ({}))
  const newSubmission = {
    id,
    formType,
    projectNumber: body.projectNumber || 'WIN/0032/24-25',
    projectName: body.projectName || "Hon'ble MLAs and MLCs and AIS Officers - Housing",
    reportingMonth: body.reportingMonth || '2025-06',
    projectTitle: body.projectTitle || "Hon'ble MLAs and MLCs and AIS Officers - Housing",
    manager: body.manager || '-',
    customer: body.customer || null,
    boq: body.boq || '',
    boqDesc: body.boqDesc || '',
    status: body.status || 'Pending',
    submittedAt: new Date().toISOString().split('T')[0],
    formData: JSON.stringify(body),
    createdAt: new Date()
  }

  if (!inMemoryStore[formType]) inMemoryStore[formType] = []
  inMemoryStore[formType].unshift(newSubmission)

  return NextResponse.json({ data: newSubmission }, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ formType: string }> }
) {
  const { formType } = await params
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  try {
    if ((db as any)?.eSFormSubmission) {
      await (db as any).eSFormSubmission.delete({
        where: { id },
      })
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.warn(`DB delete failed for ${formType}, removing from in-memory:`, error)
  }

  if (inMemoryStore[formType]) {
    inMemoryStore[formType] = inMemoryStore[formType].filter(item => item.id !== id)
  }

  return NextResponse.json({ success: true })
}
