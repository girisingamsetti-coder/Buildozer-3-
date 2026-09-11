'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, ChevronLeft,
  Upload, X, FileText, Eye, Trash2, Save, Send, ClipboardList,
  Building2, Calendar, User, Hash, BookOpen, Plus
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ==================== CONSTANTS ====================

export const AMARAVATI_PROJECTS = [
  { id: 'AMR-001', name: 'Seed Access Road',        number: 'AMR-001', title: 'Construction of Seed Access Road',           manager: 'K. Ramesh',   boq: 'OHS Monitoring', boqDesc: 'Road construction & allied works',             customer: 'CRDA Amaravati' },
  { id: 'AMR-002', name: 'Capital Building (CBD)',  number: 'AMR-002', title: 'Capital City CBD Development',               manager: 'P. Srinivas', boq: 'OHS Monitoring', boqDesc: 'Commercial & civic infrastructure works',      customer: 'CRDA Amaravati' },
  { id: 'AMR-003', name: 'Government Complex',      number: 'AMR-003', title: 'Integrated Government Offices Complex',      manager: 'M. Rao',      boq: 'OHS Monitoring', boqDesc: 'Multi-block government office construction',    customer: 'CRDA Amaravati' },
  { id: 'AMR-004', name: 'High Court Complex',      number: 'AMR-004', title: 'Andhra Pradesh High Court Complex',          manager: 'R. Sharma',   boq: 'OHS Monitoring', boqDesc: 'Judicial complex construction & landscaping',  customer: 'CRDA Amaravati' },
  { id: 'AMR-005', name: 'Legislative Assembly',    number: 'AMR-005', title: 'AP Legislative Assembly Building',           manager: 'S. Reddy',    boq: 'OHS Monitoring', boqDesc: 'Assembly hall, offices & utility works',       customer: 'CRDA Amaravati' },
  { id: 'AMR-006', name: 'Secretariat Building',    number: 'AMR-006', title: 'AP State Secretariat Complex',               manager: 'A. Kumar',    boq: 'OHS Monitoring', boqDesc: 'Administrative block & support facilities',    customer: 'CRDA Amaravati' },
  { id: 'AMR-007', name: 'Amaravati Riverfront',    number: 'AMR-007', title: 'Riverfront Development – Krishna River',     manager: 'V. Prasad',   boq: 'OHS Monitoring', boqDesc: 'Promenade, ghats & public infrastructure',     customer: 'CRDA Amaravati' },
  { id: 'AMR-008', name: 'CRDA Township Phase 1',   number: 'AMR-008', title: 'Amaravati Residential Township Phase 1',    manager: 'L. Naidu',    boq: 'OHS Monitoring', boqDesc: 'Residential plots, roads & utilities',          customer: 'CRDA Amaravati' },
  { id: 'AMR-009', name: 'PMGSY Roads Package',     number: 'AMR-009', title: 'PMGSY Rural Road Connectivity Package',     manager: 'B. Raju',     boq: 'OHS Monitoring', boqDesc: 'Village road upgradation & surfacing works',    customer: 'CRDA Amaravati' },
  { id: 'AMR-010', name: 'Town & Country Planning', number: 'AMR-010', title: 'Amaravati Town & Country Planning Works',   manager: 'N. Devi',     boq: 'OHS Monitoring', boqDesc: 'Urban planning infrastructure & zoning works',  customer: 'CRDA Amaravati' },
]

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const YEARS = ['2024', '2025', '2026']

// ==================== TYPES ====================

export interface UploadedFile {
  name: string
  size: number
  type: string
  dataUrl: string
  lat?: string
  lng?: string
  date?: string
}

export interface OHSInduction {
  status: 'yes' | 'no' | null
  date: string
  participants: string
  document: UploadedFile | null
  remarks: string
}

export interface TBTRecord {
  id: string
  status: 'yes' | 'no' | null
  date: string
  topic: string
  documents: UploadedFile[]
  remarks: string
}

export interface TrainingRecord {
  id: string
  date: string
  topic: string
  frequency: string
  type: string
  otherType: string
  participants: string
  attendanceSheet: UploadedFile | null
  relevantDocument: UploadedFile | null
  remarks: string
}

export interface InspectionRecord {
  id: string
  date: string
  type: string
  inspector: string
  report: UploadedFile | null
  remarks: string
}

export interface IncidentRecord {
  id: string
  type: string
  otherType: string
  description: string
  rca: string
  capa: string
  report: UploadedFile | null
}

export interface SOPSubmission {
  id: string
  name: string
  file: UploadedFile | null
  otherName?: string
  remarks?: string
}

export interface OHSSubmission {
  id: string
  projectName: string
  reportingMonth: string
  projectNumber: string
  projectTitle: string
  manager: string
  customer: string
  boq: string
  boqDesc: string
  createdDate: string
  status: 'Draft' | 'Submitted' | 'Needs Corrective Action'
  submittedAt?: string
  submittedBy: string

  // Daily
  induction: OHSInduction
  tbtRecords: TBTRecord[]
  
  // Weekly
  wmsHira: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  fireSafety: { status: 'yes'|'no'|null; photos: UploadedFile[]; remarks: string }
  drinkingWater: { status: 'yes'|'no'|null; photo: UploadedFile|null; remarks: string }
  
  // Monthly
  ohsCommittee: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  committeeMeeting: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  workerRep: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  mpr: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  
  // Promotional
  recognition: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  rewards: { staff: string; workers: string; total: string; remarks: string }
  
  // Trainings
  trainings: TrainingRecord[]
  
  // Inspections
  inspections: InspectionRecord[]
  
  // Audits
  safetyAudit: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string; complianceDocument: UploadedFile|null; complianceRemarks: string }
  internalAudit: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string; complianceDocument: UploadedFile|null; complianceRemarks: string }
  msasAudit: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string; complianceDocument: UploadedFile|null; complianceRemarks: string }
  electricalAudit: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string; complianceDocument: UploadedFile|null; complianceRemarks: string }
  
  // HIRA & SOP
  hira: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  sops: SOPSubmission[]
  
  // Policies & Plans
  ohsPolicy: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  ohsPlan: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  erp: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  liftingTools: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  heatStress: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  monsoon: { status: 'yes'|'no'|null; document: UploadedFile|null; remarks: string }
  
  // Incidents
  incidents: IncidentRecord[]
}

const STORAGE_KEY = 'ohs-submissions-v2'

export function loadOHSSubmissions(): OHSSubmission[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

export function saveOHSSubmissions(data: OHSSubmission[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const initialData = (): Omit<OHSSubmission, 'id' | 'projectName' | 'reportingMonth' | 'projectNumber' | 'projectTitle' | 'manager' | 'customer' | 'boq' | 'boqDesc' | 'createdDate' | 'status' | 'submittedBy'> => ({
  induction: { status: null, date: '', participants: '', document: null, remarks: '' },
  tbtRecords: [],
  wmsHira: { status: null, document: null, remarks: '' },
  fireSafety: { status: null, photos: [], remarks: '' },
  drinkingWater: { status: null, photo: null, remarks: '' },
  ohsCommittee: { status: null, document: null, remarks: '' },
  committeeMeeting: { status: null, document: null, remarks: '' },
  workerRep: { status: null, document: null, remarks: '' },
  mpr: { status: null, document: null, remarks: '' },
  recognition: { status: null, document: null, remarks: '' },
  rewards: { staff: '', workers: '', total: '', remarks: '' },
  trainings: [],
  inspections: [],
  safetyAudit: { status: null, document: null, remarks: '', complianceDocument: null, complianceRemarks: '' },
  internalAudit: { status: null, document: null, remarks: '', complianceDocument: null, complianceRemarks: '' },
  msasAudit: { status: null, document: null, remarks: '', complianceDocument: null, complianceRemarks: '' },
  electricalAudit: { status: null, document: null, remarks: '', complianceDocument: null, complianceRemarks: '' },
  hira: { status: null, document: null, remarks: '' },
  sops: [],
  ohsPolicy: { status: null, document: null, remarks: '' },
  ohsPlan: { status: null, document: null, remarks: '' },
  erp: { status: null, document: null, remarks: '' },
  liftingTools: { status: null, document: null, remarks: '' },
  heatStress: { status: null, document: null, remarks: '' },
  monsoon: { status: null, document: null, remarks: '' },
  incidents: [],
})

// ==================== UPLOAD HELPER ====================

function FileUploadBox({ file, onChange, label = "Upload Document", accept = "*/*", needGeo = false }: { file: UploadedFile | null, onChange: (f: UploadedFile | null) => void, label?: string, accept?: string, needGeo?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange({
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl: ev.target?.result as string,
        ...(needGeo ? { lat: '16.5151', lng: '80.5182', date: new Date().toLocaleString() } : {})
      })
    }
    reader.readAsDataURL(f)
  }

  return (
    <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
      <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={handleFile} />
      {file ? (
        <div className="w-full text-left">
          <div className="flex items-center justify-between bg-white p-2 border rounded text-xs shadow-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="h-4 w-4 text-[#0d9488] shrink-0" />
              <span className="truncate max-w-[150px] font-medium">{file.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onChange(null)}><Trash2 className="h-3 w-3" /></Button>
          </div>
          {needGeo && file.lat && (
            <p className="text-[10px] text-muted-foreground mt-1 text-center">Geo: {file.lat}, {file.lng} | {file.date}</p>
          )}
        </div>
      ) : (
        <>
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><Upload className="h-4 w-4" /></div>
          <p className="text-xs font-semibold text-slate-600">{label}</p>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => inputRef.current?.click()}>Select File</Button>
        </>
      )}
    </div>
  )
}

function MultiFileUploadBox({ files, onChange, label = "Upload Documents", accept = "*/*" }: { files: UploadedFile[], onChange: (f: UploadedFile[]) => void, label?: string, accept?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange([...files, { name: f.name, size: f.size, type: f.type, dataUrl: ev.target?.result as string }])
    }
    reader.readAsDataURL(f)
  }

  return (
    <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
      <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={handleFile} />
      <div className="flex flex-col gap-2">
        {files.map((file, i) => (
          <div key={i} className="flex items-center justify-between bg-white p-2 border rounded text-xs shadow-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="h-4 w-4 text-[#0d9488] shrink-0" />
              <span className="truncate max-w-[150px] font-medium">{file.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onChange(files.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-8 text-xs w-full gap-2 mt-1 border-dashed" onClick={() => inputRef.current?.click()}><Plus className="h-3.5 w-3.5" /> {label}</Button>
      </div>
    </div>
  )
}

// ==================== STEPS ====================

const STEPS = [
  'General', 'Daily', 'Weekly', 'Monthly', 'Promotional',
  'Trainings', 'Inspections', 'Audits', 'HIRA & SOP', 'Policies', 'Incidents', 'Review'
]

function YesNoQuestion({
  title, status, onStatusChange,
  document, onDocumentChange, documentLabel,
  remarks, onRemarksChange,
  multiDoc = false, docs = [], onDocsChange = () => {},
  needGeo = false
}: {
  title: string, status: 'yes'|'no'|null, onStatusChange: (v: 'yes'|'no') => void,
  document?: UploadedFile|null, onDocumentChange?: (v: UploadedFile|null) => void, documentLabel?: string,
  remarks: string, onRemarksChange: (v: string) => void,
  multiDoc?: boolean, docs?: UploadedFile[], onDocsChange?: (v: UploadedFile[]) => void,
  needGeo?: boolean
}) {
  return (
    <Card className="bg-white shadow-sm border-slate-200">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant={status === 'yes' ? 'default' : 'outline'} size="sm" className={cn("h-8 px-4", status === 'yes' && 'bg-emerald-600 hover:bg-emerald-700')} onClick={() => onStatusChange('yes')}>Yes</Button>
            <Button type="button" variant={status === 'no' ? 'default' : 'outline'} size="sm" className={cn("h-8 px-4", status === 'no' && 'bg-red-600 hover:bg-red-700')} onClick={() => onStatusChange('no')}>No</Button>
          </div>
        </div>

        {status === 'yes' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {multiDoc ? (
              <MultiFileUploadBox files={docs} onChange={onDocsChange} label={documentLabel} />
            ) : (
              <FileUploadBox file={document || null} onChange={onDocumentChange || (() => {})} label={documentLabel} needGeo={needGeo} />
            )}
          </div>
        )}

        {status === 'no' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-1.5">
            <Label className="text-xs font-semibold text-red-600">Remarks / Reason (Mandatory) *</Label>
            <Textarea value={remarks} onChange={e => onRemarksChange(e.target.value)} placeholder="Please explain why this is not compliant..." className="h-20 text-sm border-red-200 focus-visible:ring-red-500" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== STEP PROGRESS ====================

function StepProgress({ current, steps }: { current: number, steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-2 mt-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
              i < current  ? 'bg-[#0d9488] border-[#0d9488] text-white' :
              i === current ? 'border-[#0d9488] text-[#0d9488] bg-white dark:bg-slate-900' :
                             'border-slate-300 text-slate-400 bg-white dark:bg-slate-900',
            )}>
              {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-[9px] text-center leading-tight hidden sm:block', i === current ? 'text-[#0d9488] font-semibold' : 'text-muted-foreground')}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('h-0.5 flex-1 mx-1 mb-4', i < current ? 'bg-[#0d9488]' : 'bg-slate-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ==================== MAIN DIALOG ====================

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  defaultProject?: string
}

export default function OHSFormDialog({ open, onOpenChange, onSaved, defaultProject }: Props) {
  const [step, setStep] = useState(0)
  const [projectName, setProjectName] = useState(defaultProject || '')
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()])
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [data, setData] = useState(initialData())

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const buildSubmission = (status: 'Draft' | 'Submitted'): OHSSubmission => {
    const proj = AMARAVATI_PROJECTS.find(p => p.name === projectName)!
    return {
      id: `ohs-${Date.now()}`,
      projectName, reportingMonth: `${month} ${year}`,
      projectNumber: proj?.number || '', projectTitle: proj?.title || '',
      manager: proj?.manager || '', customer: proj?.customer || '',
      boq: proj?.boq || '', boqDesc: proj?.boqDesc || '',
      createdDate: new Date().toLocaleDateString('en-IN'),
      status,
      submittedAt: status === 'Submitted' ? new Date().toISOString() : undefined,
      submittedBy: 'Current User',
      ...data
    }
  }

  const handleSaveDraft = () => {
    const submissions = loadOHSSubmissions()
    saveOHSSubmissions([buildSubmission('Draft'), ...submissions])
    toast.success('Saved as draft')
    onSaved(); onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!projectName) { toast.error('Please select a project first.'); return }
    const submissions = loadOHSSubmissions()
    saveOHSSubmissions([buildSubmission('Submitted'), ...submissions])
    toast.success('Successfully Submitted OHS Form')
    onSaved(); onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:!max-w-[1100px] h-[90vh] max-h-[750px] rounded-2xl flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-950">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#0d9488] text-white">
              <ClipboardList className="h-3.5 w-3.5" />
            </span>
            OHS – Occupational Health & Safety Monitoring
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 sm:px-8 py-4 border-b shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <StepProgress current={step} steps={STEPS} />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 px-7 sm:px-8 py-6">
          
          {step === 0 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Project *</Label>
                  <Select value={projectName} onValueChange={setProjectName}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>{AMARAVATI_PROJECTS.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Reporting Month *</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Year *</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <Badge className="bg-[#0d9488]">Daily</Badge>
              <YesNoQuestion
                title="1. OHS Induction training for Workers, Employees and Visitors"
                status={data.induction.status} onStatusChange={v => setData({...data, induction: {...data.induction, status: v}})}
                document={data.induction.document} onDocumentChange={v => setData({...data, induction: {...data.induction, document: v}})}
                documentLabel="Upload Document of Induction"
                remarks={data.induction.remarks} onRemarksChange={v => setData({...data, induction: {...data.induction, remarks: v}})}
              />
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">2. Daily Tool Box Talks</h3>
                  <Button size="sm" onClick={() => setData({...data, tbtRecords: [...data.tbtRecords, { id: Date.now().toString(), status: null, date: '', topic: '', documents: [], remarks: '' }]})} className="h-8 gap-1"><Plus className="h-3.5 w-3.5"/> Add TBT</Button>
                </div>
                {data.tbtRecords.map((tbt, i) => (
                  <Card key={tbt.id} className="mb-4">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between">
                        <Label className="font-semibold">TBT #{i+1}</Label>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => setData({...data, tbtRecords: data.tbtRecords.filter((_, idx) => idx !== i)})}><Trash2 className="h-3 w-3"/></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Date" type="date" value={tbt.date} onChange={e => { const v = [...data.tbtRecords]; v[i].date = e.target.value; setData({...data, tbtRecords: v}) }} />
                        <Input placeholder="Topic" value={tbt.topic} onChange={e => { const v = [...data.tbtRecords]; v[i].topic = e.target.value; setData({...data, tbtRecords: v}) }} />
                      </div>
                      <YesNoQuestion
                        title="TBT Conducted?"
                        status={tbt.status} onStatusChange={val => { const v = [...data.tbtRecords]; v[i].status = val; setData({...data, tbtRecords: v}) }}
                        multiDoc={true} docs={tbt.documents} onDocsChange={docs => { const v = [...data.tbtRecords]; v[i].documents = docs; setData({...data, tbtRecords: v}) }}
                        documentLabel="Upload TBT Documents"
                        remarks={tbt.remarks} onRemarksChange={val => { const v = [...data.tbtRecords]; v[i].remarks = val; setData({...data, tbtRecords: v}) }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <Badge className="bg-[#0d9488]">Weekly</Badge>
              <YesNoQuestion
                title="1. Is construction work covered with Work Method Statements with HIRA approved?"
                status={data.wmsHira.status} onStatusChange={v => setData({...data, wmsHira: {...data.wmsHira, status: v}})}
                document={data.wmsHira.document} onDocumentChange={v => setData({...data, wmsHira: {...data.wmsHira, document: v}})} documentLabel="Upload Approved WMS"
                remarks={data.wmsHira.remarks} onRemarksChange={v => setData({...data, wmsHira: {...data.wmsHira, remarks: v}})}
              />
              <YesNoQuestion
                title="2. Were fire extinguishers, hydrant system, sand buckets and fire alarm in place and in use?"
                status={data.fireSafety.status} onStatusChange={v => setData({...data, fireSafety: {...data.fireSafety, status: v}})}
                multiDoc={true} docs={data.fireSafety.photos} onDocsChange={v => setData({...data, fireSafety: {...data.fireSafety, photos: v}})} documentLabel="Upload photographs"
                remarks={data.fireSafety.remarks} onRemarksChange={v => setData({...data, fireSafety: {...data.fireSafety, remarks: v}})}
              />
              <YesNoQuestion
                title="3. Is drinking water available on-site and at the campsite?"
                status={data.drinkingWater.status} onStatusChange={v => setData({...data, drinkingWater: {...data.drinkingWater, status: v}})}
                document={data.drinkingWater.photo} onDocumentChange={v => setData({...data, drinkingWater: {...data.drinkingWater, photo: v}})} documentLabel="Upload Geo-tagged Photograph"
                remarks={data.drinkingWater.remarks} onRemarksChange={v => setData({...data, drinkingWater: {...data.drinkingWater, remarks: v}})} needGeo={true}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <Badge className="bg-[#0d9488]">Monthly</Badge>
              <YesNoQuestion
                title="1. Is OHS Committee formed?"
                status={data.ohsCommittee.status} onStatusChange={v => setData({...data, ohsCommittee: {...data.ohsCommittee, status: v}})}
                document={data.ohsCommittee.document} onDocumentChange={v => setData({...data, ohsCommittee: {...data.ohsCommittee, document: v}})} documentLabel="Upload Document"
                remarks={data.ohsCommittee.remarks} onRemarksChange={v => setData({...data, ohsCommittee: {...data.ohsCommittee, remarks: v}})}
              />
              <YesNoQuestion
                title="2. Is OHS Committee meeting conducted on a monthly basis?"
                status={data.committeeMeeting.status} onStatusChange={v => setData({...data, committeeMeeting: {...data.committeeMeeting, status: v}})}
                document={data.committeeMeeting.document} onDocumentChange={v => setData({...data, committeeMeeting: {...data.committeeMeeting, document: v}})} documentLabel="Upload Document"
                remarks={data.committeeMeeting.remarks} onRemarksChange={v => setData({...data, committeeMeeting: {...data.committeeMeeting, remarks: v}})}
              />
              <YesNoQuestion
                title="3. Is worker representative participating in OHS Committee meetings?"
                status={data.workerRep.status} onStatusChange={v => setData({...data, workerRep: {...data.workerRep, status: v}})}
                document={data.workerRep.document} onDocumentChange={v => setData({...data, workerRep: {...data.workerRep, document: v}})} documentLabel="Upload MOM"
                remarks={data.workerRep.remarks} onRemarksChange={v => setData({...data, workerRep: {...data.workerRep, remarks: v}})}
              />
              <YesNoQuestion
                title="4. Is MPR prepared as per C-ESMP?"
                status={data.mpr.status} onStatusChange={v => setData({...data, mpr: {...data.mpr, status: v}})}
                document={data.mpr.document} onDocumentChange={v => setData({...data, mpr: {...data.mpr, document: v}})} documentLabel="Upload Attachment"
                remarks={data.mpr.remarks} onRemarksChange={v => setData({...data, mpr: {...data.mpr, remarks: v}})}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <YesNoQuestion
                title="1. Are manpower recognized in Promotional and Motivational Program for the Month?"
                status={data.recognition.status} onStatusChange={v => setData({...data, recognition: {...data.recognition, status: v}})}
                document={data.recognition.document} onDocumentChange={v => setData({...data, recognition: {...data.recognition, document: v}})} documentLabel="Upload Attachment"
                remarks={data.recognition.remarks} onRemarksChange={v => setData({...data, recognition: {...data.recognition, remarks: v}})}
              />
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-slate-800">2. No. of Rewards and Recognitions at site</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Staff Recognized</Label><Input type="number" value={data.rewards.staff} onChange={e => setData({...data, rewards: {...data.rewards, staff: e.target.value}})} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Workers Recognized</Label><Input type="number" value={data.rewards.workers} onChange={e => setData({...data, rewards: {...data.rewards, workers: e.target.value}})} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Total</Label><Input type="number" value={data.rewards.total} onChange={e => setData({...data, rewards: {...data.rewards, total: e.target.value}})} /></div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-xs">Remarks</Label><Textarea value={data.rewards.remarks} onChange={e => setData({...data, rewards: {...data.rewards, remarks: e.target.value}})} className="h-16" /></div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Training Records</h3>
                <Button size="sm" onClick={() => setData({...data, trainings: [...data.trainings, { id: Date.now().toString(), date: '', topic: '', frequency: '', type: '', otherType: '', participants: '', attendanceSheet: null, relevantDocument: null, remarks: '' }]})} className="h-8 gap-1"><Plus className="h-3.5 w-3.5"/> Add Training</Button>
              </div>
              {data.trainings.map((tr, i) => (
                <Card key={tr.id} className="mb-4">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between"><Label className="font-semibold">Training #{i+1}</Label><Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => setData({...data, trainings: data.trainings.filter((_, idx) => idx !== i)})}><Trash2 className="h-3 w-3"/></Button></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Date</Label><Input type="date" value={tr.date} onChange={e => { const v = [...data.trainings]; v[i].date = e.target.value; setData({...data, trainings: v}) }} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Topic</Label><Input value={tr.topic} onChange={e => { const v = [...data.trainings]; v[i].topic = e.target.value; setData({...data, trainings: v}) }} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Frequency</Label><Input value={tr.frequency} onChange={e => { const v = [...data.trainings]; v[i].frequency = e.target.value; setData({...data, trainings: v}) }} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Participants</Label><Input type="number" value={tr.participants} onChange={e => { const v = [...data.trainings]; v[i].participants = e.target.value; setData({...data, trainings: v}) }} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <Select value={tr.type} onValueChange={val => { const v = [...data.trainings]; v[i].type = val; setData({...data, trainings: v}) }}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent><SelectItem value="Induction">Induction</SelectItem><SelectItem value="Job Specific">Job Specific</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {tr.type === 'Other' && <div className="space-y-1.5"><Label className="text-xs">Specify Other</Label><Input value={tr.otherType} onChange={e => { const v = [...data.trainings]; v[i].otherType = e.target.value; setData({...data, trainings: v}) }} /></div>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FileUploadBox file={tr.attendanceSheet} onChange={f => { const v = [...data.trainings]; v[i].attendanceSheet = f; setData({...data, trainings: v}) }} label="Attendance Sheet" />
                      <FileUploadBox file={tr.relevantDocument} onChange={f => { const v = [...data.trainings]; v[i].relevantDocument = f; setData({...data, trainings: v}) }} label="Relevant Document" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">OHS Inspections – according to frequency</h3>
                <Button size="sm" onClick={() => setData({...data, inspections: [...data.inspections, { id: Date.now().toString(), date: '', type: '', inspector: '', report: null, remarks: '' }]})} className="h-8 gap-1"><Plus className="h-3.5 w-3.5"/> Add Inspection</Button>
              </div>
              {data.inspections.map((ins, i) => (
                <Card key={ins.id} className="mb-4">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between"><Label className="font-semibold">Inspection #{i+1}</Label><Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => setData({...data, inspections: data.inspections.filter((_, idx) => idx !== i)})}><Trash2 className="h-3 w-3"/></Button></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Date</Label><Input type="date" value={ins.date} onChange={e => { const v = [...data.inspections]; v[i].date = e.target.value; setData({...data, inspections: v}) }} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Type</Label><Input value={ins.type} onChange={e => { const v = [...data.inspections]; v[i].type = e.target.value; setData({...data, inspections: v}) }} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Inspector</Label><Input value={ins.inspector} onChange={e => { const v = [...data.inspections]; v[i].inspector = e.target.value; setData({...data, inspections: v}) }} /></div>
                    </div>
                    <FileUploadBox file={ins.report} onChange={f => { const v = [...data.inspections]; v[i].report = f; setData({...data, inspections: v}) }} label="Upload Inspection Report" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <YesNoQuestion
                title="1. Is Safety and Security Audit conducted monthly?"
                status={data.safetyAudit.status} onStatusChange={v => setData({...data, safetyAudit: {...data.safetyAudit, status: v}})}
                document={data.safetyAudit.document} onDocumentChange={v => setData({...data, safetyAudit: {...data.safetyAudit, document: v}})} documentLabel="Upload Audit Documents"
                remarks={data.safetyAudit.remarks} onRemarksChange={v => setData({...data, safetyAudit: {...data.safetyAudit, remarks: v}})}
              />
              <YesNoQuestion
                title="2. Is Internal OHS Audit conducted as per C-ESMP – Half-Yearly by Third Party?"
                status={data.internalAudit.status} onStatusChange={v => setData({...data, internalAudit: {...data.internalAudit, status: v}})}
                document={data.internalAudit.document} onDocumentChange={v => setData({...data, internalAudit: {...data.internalAudit, document: v}})} documentLabel="Upload Audit Documents"
                remarks={data.internalAudit.remarks} onRemarksChange={v => setData({...data, internalAudit: {...data.internalAudit, remarks: v}})}
              />
              <YesNoQuestion
                title="3. Is OHS (MSAS) Audits conducted as per C-ESMP – Quarterly?"
                status={data.msasAudit.status} onStatusChange={v => setData({...data, msasAudit: {...data.msasAudit, status: v}})}
                document={data.msasAudit.document} onDocumentChange={v => setData({...data, msasAudit: {...data.msasAudit, document: v}})} documentLabel="Upload Audit Documents"
                remarks={data.msasAudit.remarks} onRemarksChange={v => setData({...data, msasAudit: {...data.msasAudit, remarks: v}})}
              />
              <YesNoQuestion
                title="4. Is Electrical Safety Audit conducted monthly?"
                status={data.electricalAudit.status} onStatusChange={v => setData({...data, electricalAudit: {...data.electricalAudit, status: v}})}
                document={data.electricalAudit.document} onDocumentChange={v => setData({...data, electricalAudit: {...data.electricalAudit, document: v}})} documentLabel="Upload Audit Documents"
                remarks={data.electricalAudit.remarks} onRemarksChange={v => setData({...data, electricalAudit: {...data.electricalAudit, remarks: v}})}
              />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <YesNoQuestion
                title="1. Is HIRA carried out for all the Activities – Quarterly?"
                status={data.hira.status} onStatusChange={v => setData({...data, hira: {...data.hira, status: v}})}
                document={data.hira.document} onDocumentChange={v => setData({...data, hira: {...data.hira, document: v}})} documentLabel="Upload HIRA Register"
                remarks={data.hira.remarks} onRemarksChange={v => setData({...data, hira: {...data.hira, remarks: v}})}
              />
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">2. SOP Submission List</h3>
                  <Button size="sm" onClick={() => setData({...data, sops: [...data.sops, { id: Date.now().toString(), name: '', file: null, remarks: '' }]})} className="h-8 gap-1"><Plus className="h-3.5 w-3.5"/> Add SOP</Button>
                </div>
                {data.sops.map((sop, i) => (
                  <Card key={sop.id} className="mb-4">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between"><Label className="font-semibold">SOP #{i+1}</Label><Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => setData({...data, sops: data.sops.filter((_, idx) => idx !== i)})}><Trash2 className="h-3 w-3"/></Button></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">SOP Name</Label>
                          <Select value={sop.name} onValueChange={val => { const v = [...data.sops]; v[i].name = val; setData({...data, sops: v}) }}>
                            <SelectTrigger><SelectValue placeholder="Select SOP" /></SelectTrigger>
                            <SelectContent><SelectItem value="Excavation">Excavation</SelectItem><SelectItem value="Hot Work">Hot Work</SelectItem><SelectItem value="Other">Other — Specify</SelectItem></SelectContent>
                          </Select>
                        </div>
                        {sop.name === 'Other' && <div className="space-y-1.5"><Label className="text-xs">Other Name</Label><Input value={sop.otherName || ''} onChange={e => { const v = [...data.sops]; v[i].otherName = e.target.value; setData({...data, sops: v}) }} /></div>}
                      </div>
                      <FileUploadBox file={sop.file} onChange={f => { const v = [...data.sops]; v[i].file = f; setData({...data, sops: v}) }} label="Upload SOP Document" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <YesNoQuestion
                title="1. Does the Contractor have Health and Safety Policy available and displayed?"
                status={data.ohsPolicy.status} onStatusChange={v => setData({...data, ohsPolicy: {...data.ohsPolicy, status: v}})}
                document={data.ohsPolicy.document} onDocumentChange={v => setData({...data, ohsPolicy: {...data.ohsPolicy, document: v}})} documentLabel="Upload Updated OHS Policy"
                remarks={data.ohsPolicy.remarks} onRemarksChange={v => setData({...data, ohsPolicy: {...data.ohsPolicy, remarks: v}})}
              />
              <YesNoQuestion
                title="2. Is Approved OHS Plan Available – Half-Yearly?"
                status={data.ohsPlan.status} onStatusChange={v => setData({...data, ohsPlan: {...data.ohsPlan, status: v}})}
                document={data.ohsPlan.document} onDocumentChange={v => setData({...data, ohsPlan: {...data.ohsPlan, document: v}})} documentLabel="Upload OHS Plan"
                remarks={data.ohsPlan.remarks} onRemarksChange={v => setData({...data, ohsPlan: {...data.ohsPlan, remarks: v}})}
              />
              <YesNoQuestion
                title="3. Emergency Response and Preparedness Plan – Half-Yearly"
                status={data.erp.status} onStatusChange={v => setData({...data, erp: {...data.erp, status: v}})}
                document={data.erp.document} onDocumentChange={v => setData({...data, erp: {...data.erp, document: v}})} documentLabel="Upload Approved ERP"
                remarks={data.erp.remarks} onRemarksChange={v => setData({...data, erp: {...data.erp, remarks: v}})}
              />
              <YesNoQuestion
                title="4. Was the Lifting Tools and Tackles Third Party Inspection conducted?"
                status={data.liftingTools.status} onStatusChange={v => setData({...data, liftingTools: {...data.liftingTools, status: v}})}
                document={data.liftingTools.document} onDocumentChange={v => setData({...data, liftingTools: {...data.liftingTools, document: v}})} documentLabel="Upload relevant document"
                remarks={data.liftingTools.remarks} onRemarksChange={v => setData({...data, liftingTools: {...data.liftingTools, remarks: v}})}
              />
              <YesNoQuestion
                title="5. Heat Stress Management Plan"
                status={data.heatStress.status} onStatusChange={v => setData({...data, heatStress: {...data.heatStress, status: v}})}
                document={data.heatStress.document} onDocumentChange={v => setData({...data, heatStress: {...data.heatStress, document: v}})} documentLabel="Upload relevant document"
                remarks={data.heatStress.remarks} onRemarksChange={v => setData({...data, heatStress: {...data.heatStress, remarks: v}})}
              />
              <YesNoQuestion
                title="6. Monsoon Preparedness Plan"
                status={data.monsoon.status} onStatusChange={v => setData({...data, monsoon: {...data.monsoon, status: v}})}
                document={data.monsoon.document} onDocumentChange={v => setData({...data, monsoon: {...data.monsoon, document: v}})} documentLabel="Upload relevant document"
                remarks={data.monsoon.remarks} onRemarksChange={v => setData({...data, monsoon: {...data.monsoon, remarks: v}})}
              />
            </div>
          )}

          {step === 10 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Near Miss / Incident Reports</h3>
                <Button size="sm" onClick={() => setData({...data, incidents: [...data.incidents, { id: Date.now().toString(), type: '', otherType: '', description: '', rca: '', capa: '', report: null }]})} className="h-8 gap-1"><Plus className="h-3.5 w-3.5"/> Add Incident</Button>
              </div>
              {data.incidents.map((inc, i) => (
                <Card key={inc.id} className="mb-4">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between"><Label className="font-semibold">Record #{i+1}</Label><Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => setData({...data, incidents: data.incidents.filter((_, idx) => idx !== i)})}><Trash2 className="h-3 w-3"/></Button></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type of Incident</Label>
                        <Select value={inc.type} onValueChange={val => { const v = [...data.incidents]; v[i].type = val; setData({...data, incidents: v}) }}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent><SelectItem value="Near Miss">Near Miss</SelectItem><SelectItem value="First Aid">First Aid</SelectItem><SelectItem value="LTI">Lost Time Injury (LTI)</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {inc.type === 'Other' && <div className="space-y-1.5"><Label className="text-xs">Specify Other</Label><Input value={inc.otherType} onChange={e => { const v = [...data.incidents]; v[i].otherType = e.target.value; setData({...data, incidents: v}) }} /></div>}
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea value={inc.description} onChange={e => { const v = [...data.incidents]; v[i].description = e.target.value; setData({...data, incidents: v}) }} className="h-20" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Root Cause Analysis</Label><Textarea value={inc.rca} onChange={e => { const v = [...data.incidents]; v[i].rca = e.target.value; setData({...data, incidents: v}) }} className="h-20" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">CAPA (Corrective and Preventive Action)</Label><Textarea value={inc.capa} onChange={e => { const v = [...data.incidents]; v[i].capa = e.target.value; setData({...data, incidents: v}) }} className="h-20" /></div>
                    <FileUploadBox file={inc.report} onChange={f => { const v = [...data.incidents]; v[i].report = f; setData({...data, incidents: v}) }} label="Upload Report" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 11 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <Card className="bg-emerald-50/50 border-emerald-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-1">Ready for Submission</h3>
                  <p className="text-sm text-emerald-600">Please review your OHS monitoring data before finalizing.</p>
                </CardContent>
              </Card>
            </div>
          )}

          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-white dark:bg-slate-950 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={prev} className="gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium">Step {step + 1} of {STEPS.length}</span>
            <div className="flex gap-2">
              {step === STEPS.length - 1 ? (
                <>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleSaveDraft}>
                    <Save className="h-3.5 w-3.5" /> Save Draft
                  </Button>
                  <Button type="button" size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5" onClick={handleSubmit}>
                    <Send className="h-3.5 w-3.5" /> Submit
                  </Button>
                </>
              ) : (
                <Button type="button" size="sm" onClick={next} className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
