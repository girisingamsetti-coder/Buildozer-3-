'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, ChevronLeft,
  Upload, X, FileText, Eye, Trash2, Save, Send, ClipboardList,
  Building2, Calendar, User, Hash, BookOpen,
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
  { id: 'AMR-001', name: 'Seed Access Road',        number: 'AMR-001', title: 'Construction of Seed Access Road',           manager: 'K. Ramesh',   boq: 'BOQ-2024-001', boqDesc: 'Road construction & allied works',             customer: 'CRDA Amaravati' },
  { id: 'AMR-002', name: 'Capital Building (CBD)',  number: 'AMR-002', title: 'Capital City CBD Development',               manager: 'P. Srinivas', boq: 'BOQ-2024-002', boqDesc: 'Commercial & civic infrastructure works',      customer: 'CRDA Amaravati' },
  { id: 'AMR-003', name: 'Government Complex',      number: 'AMR-003', title: 'Integrated Government Offices Complex',      manager: 'M. Rao',      boq: 'BOQ-2024-003', boqDesc: 'Multi-block government office construction',    customer: 'CRDA Amaravati' },
  { id: 'AMR-004', name: 'High Court Complex',      number: 'AMR-004', title: 'Andhra Pradesh High Court Complex',          manager: 'R. Sharma',   boq: 'BOQ-2024-004', boqDesc: 'Judicial complex construction & landscaping',  customer: 'CRDA Amaravati' },
  { id: 'AMR-005', name: 'Legislative Assembly',    number: 'AMR-005', title: 'AP Legislative Assembly Building',           manager: 'S. Reddy',    boq: 'BOQ-2024-005', boqDesc: 'Assembly hall, offices & utility works',       customer: 'CRDA Amaravati' },
  { id: 'AMR-006', name: 'Secretariat Building',    number: 'AMR-006', title: 'AP State Secretariat Complex',               manager: 'A. Kumar',    boq: 'BOQ-2024-006', boqDesc: 'Administrative block & support facilities',    customer: 'CRDA Amaravati' },
  { id: 'AMR-007', name: 'Amaravati Riverfront',    number: 'AMR-007', title: 'Riverfront Development – Krishna River',     manager: 'V. Prasad',   boq: 'BOQ-2024-007', boqDesc: 'Promenade, ghats & public infrastructure',     customer: 'CRDA Amaravati' },
  { id: 'AMR-008', name: 'CRDA Township Phase 1',   number: 'AMR-008', title: 'Amaravati Residential Township Phase 1',    manager: 'L. Naidu',    boq: 'BOQ-2024-008', boqDesc: 'Residential plots, roads & utilities',          customer: 'CRDA Amaravati' },
  { id: 'AMR-009', name: 'PMGSY Roads Package',     number: 'AMR-009', title: 'PMGSY Rural Road Connectivity Package',     manager: 'B. Raju',     boq: 'BOQ-2024-009', boqDesc: 'Village road upgradation & surfacing works',    customer: 'CRDA Amaravati' },
  { id: 'AMR-010', name: 'Town & Country Planning', number: 'AMR-010', title: 'Amaravati Town & Country Planning Works',   manager: 'N. Devi',     boq: 'BOQ-2024-010', boqDesc: 'Urban planning infrastructure & zoning works',  customer: 'CRDA Amaravati' },
]

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const YEARS = ['2024', '2025', '2026']

const CHECKLIST_ITEMS = [
  { sno: 1,  title: 'Approved Traffic Management Plan (TMP)',   description: 'Availability of an approved Traffic Management Plan (TMP) by PMC as per IRC SP:55-2014.' },
  { sno: 2,  title: 'Indicative Signages',                      description: 'Site implementation of indicative signages as per CESMP – Chapter 7.' },
  { sno: 3,  title: 'Diversion Plans Approval',                 description: 'Approval of diversion plans as per IRC SP:55-2014 by PMC / Road Safety / Engineer-in-Charge.' },
  { sno: 4,  title: 'Temporary Traffic Barriers / Barricades',  description: 'Provision of temporary traffic barriers, barricades and caution tapes in construction zones as per approved diversion plans.' },
  { sno: 5,  title: 'Night Safety Arrangements',                description: 'Provision of night safety arrangements including lighting/illumination, reflective hazard markers, solar blinkers, and warning signages at accident-prone sections.' },
  { sno: 6,  title: 'Traffic Marshals / Flagmen',               description: 'Deployment of Traffic Marshals / Flagmen at work zones and implementation of planned traffic control systems.' },
  { sno: 7,  title: 'Traffic Calming Measures',                 description: 'Provision of traffic calming measures such as speed breakers, rumble strips and thermoplastic road markings.' },
  { sno: 8,  title: 'Alternate Routes',                         description: 'Preparation and implementation of alternate route plans and route maps to avoid village sections near project sites.' },
  { sno: 9,  title: 'Crash Barriers',                           description: 'Provision of plastic / water-filled crash barriers at high-risk and vulnerable locations.' },
  { sno: 10, title: 'Road Safety Awareness',                    description: 'Conduct of road safety awareness programs at project sites.' },
  { sno: 11, title: 'Controlled Access',                        description: 'Arrangements for controlled access and regulated entry to construction zones.' },
  { sno: 12, title: 'Road User & Pedestrian Safety',            description: 'Safety arrangements for road users and pedestrians, including safe crossings and walkways.' },
  { sno: 13, title: 'Construction Worker Safety / PPE',         description: 'Construction worker safety, including provision and use of Personal Protective Equipment (PPE).' },
  { sno: 14, title: 'Monthly Advance Action Plan',              description: 'Record / submit the Monthly Advance Action Plan for road safety measures.', isTextarea: true },
  { sno: 15, title: 'Monthly Progress Report – Road Safety',    description: 'Record / submit the Monthly Progress Report for Road Safety Measures.', isTextarea: true },
]

// ==================== TYPES ====================

export interface UploadedFile {
  name: string
  size: number
  type: string
  dataUrl: string
}

export interface ChecklistEntry {
  sno: number
  answer: 'yes' | 'no' | null
  remarks: string
  textValue: string   // for items 14 & 15
  files: UploadedFile[]
}

export interface RoadSafetySubmission {
  id: string
  projectName: string
  reportingMonth: string // e.g. "September 2025"
  projectNumber: string
  projectTitle: string
  manager: string
  customer: string
  boq: string
  boqDesc: string
  createdDate: string
  checklist: ChecklistEntry[]
  safetyAuditConducted: boolean | null
  safetyAuditRemarks: string
  safetyAuditFile: UploadedFile | null
  status: 'Draft' | 'Submitted' | 'Needs Corrective Action'
  submittedAt?: string
  submittedBy: string
}

const RS_STORAGE_KEY = 'road-safety-submissions'

export function loadRoadSafetySubmissions(): RoadSafetySubmission[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(RS_STORAGE_KEY) || '[]') } catch { return [] }
}

export function saveRoadSafetySubmissions(data: RoadSafetySubmission[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(RS_STORAGE_KEY, JSON.stringify(data))
}

// ==================== HELPERS ====================

function emptyChecklist(): ChecklistEntry[] {
  return CHECKLIST_ITEMS.map(item => ({
    sno: item.sno, answer: null, remarks: '', textValue: '', files: [],
  }))
}

// ==================== FILE UPLOAD BUTTON ====================

function FileUploadButton({
  files, onAdd, onRemove,
}: { files: UploadedFile[]; onAdd: (f: UploadedFile) => void; onRemove: (i: number) => void }) {
  const ref = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size is 5 MB'); return }
    const reader = new FileReader()
    reader.onload = () => onAdd({ name: file.name, size: file.size, type: file.type, dataUrl: reader.result as string })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-1.5">
      <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" onChange={handleFile} />
      <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => ref.current?.click()}>
        <Upload className="h-3 w-3" /> Upload Evidence
      </Button>
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-2 bg-muted/40 rounded px-2 py-1 text-xs">
          <FileText className="h-3 w-3 text-[#0d9488] shrink-0" />
          <span className="truncate flex-1">{f.name}</span>
          <span className="text-muted-foreground shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
          <button type="button" onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ==================== STEP PROGRESS ====================

const STEPS = ['Project Checklist', 'Review & Submit']

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => (
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
          {i < STEPS.length - 1 && (
            <div className={cn('h-0.5 flex-1 mx-1 mb-4', i < current ? 'bg-[#0d9488]' : 'bg-slate-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ==================== STEP 1: PROJECT & MONTH ====================

function Step1({
  projectName, setProjectName, month, setMonth, year, setYear,
}: {
  projectName: string; setProjectName: (v: string) => void
  month: string; setMonth: (v: string) => void
  year: string; setYear: (v: string) => void
}) {
  const proj = AMARAVATI_PROJECTS.find(p => p.name === projectName)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Project *</Label>
          <Select value={projectName} onValueChange={setProjectName}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              {AMARAVATI_PROJECTS.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Reporting Month *</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select month" /></SelectTrigger>
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

      {proj && (
        <Card className="bg-[#0d9488]/5 border-[#0d9488]/20">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-[#0d9488] uppercase tracking-wider mb-3">Project Information (Auto-filled)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { icon: User,        label: 'Customer',        value: proj.customer },
                { icon: Hash,        label: 'Project No.',     value: proj.number },
                { icon: Building2,   label: 'Project Title',   value: proj.title },
                { icon: User,        label: 'Manager',         value: proj.manager },
                { icon: BookOpen,    label: 'BOQ',             value: proj.boq },
                { icon: ClipboardList, label: 'BOQ Description', value: proj.boqDesc },
                { icon: Calendar,    label: 'Form Created',    value: new Date().toLocaleDateString('en-IN') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" />{label}</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ==================== STEP 2: CHECKLIST ====================

function Step2({
  checklist, onChange,
}: { checklist: ChecklistEntry[]; onChange: (i: number, partial: Partial<ChecklistEntry>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Answer all 15 road safety checklist items. Remarks are mandatory when answer is <span className="text-red-500 font-semibold">No</span>.</p>
      {CHECKLIST_ITEMS.map((item, idx) => {
        const entry = checklist[idx]
        const isNo = entry.answer === 'no'
        const isYes = entry.answer === 'yes'
        return (
          <Card key={item.sno} className={cn('border transition-colors', isNo ? 'border-red-300 bg-red-50/40 dark:bg-red-950/10' : isYes ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10' : 'border-slate-200')}>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5',
                    isNo ? 'bg-red-500 text-white' : isYes ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  )}>{item.sno}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                {/* Yes / No toggle */}
                {!item.isTextarea && (
                  <div className="flex gap-1.5 shrink-0">
                    <button type="button"
                      onClick={() => onChange(idx, { answer: entry.answer === 'yes' ? null : 'yes' })}
                      className={cn('px-3 py-1 rounded text-xs font-bold border transition-all',
                        isYes ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300 text-slate-500 hover:border-emerald-400')}>
                      Yes
                    </button>
                    <button type="button"
                      onClick={() => onChange(idx, { answer: entry.answer === 'no' ? null : 'no' })}
                      className={cn('px-3 py-1 rounded text-xs font-bold border transition-all',
                        isNo ? 'bg-red-500 text-white border-red-500' : 'border-slate-300 text-slate-500 hover:border-red-400')}>
                      No
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea for items 14 & 15 */}
              {item.isTextarea && (
                <Textarea
                  placeholder={`Enter ${item.title}...`}
                  value={entry.textValue}
                  onChange={e => onChange(idx, { textValue: e.target.value })}
                  className="text-sm min-h-[80px]"
                />
              )}

              {/* Remarks — mandatory when No */}
              {isNo && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-red-600">Remarks / Reason (Required) *</Label>
                  <Textarea
                    placeholder="Explain the non-compliance or reason..."
                    value={entry.remarks}
                    onChange={e => onChange(idx, { remarks: e.target.value })}
                    className="text-xs min-h-[60px] border-red-300 focus:border-red-400"
                  />
                </div>
              )}

              {/* Optional remarks when Yes */}
              {isYes && (
                <Input
                  placeholder="Remarks (optional)"
                  value={entry.remarks}
                  onChange={e => onChange(idx, { remarks: e.target.value })}
                  className="text-xs h-8"
                />
              )}

              {/* File Upload */}
              {!item.isTextarea && (
                <FileUploadButton
                  files={entry.files}
                  onAdd={f => onChange(idx, { files: [...entry.files, f] })}
                  onRemove={i => onChange(idx, { files: entry.files.filter((_, fi) => fi !== i) })}
                />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ==================== STEP 3: SAFETY AUDIT ====================

function Step3({
  conducted, setConducted, remarks, setRemarks, file, setFile,
}: {
  conducted: boolean | null; setConducted: (v: boolean) => void
  remarks: string; setRemarks: (v: string) => void
  file: UploadedFile | null; setFile: (f: UploadedFile | null) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { toast.error('Max 10 MB'); return }
    const reader = new FileReader()
    reader.onload = () => setFile({ name: f.name, size: f.size, type: f.type, dataUrl: reader.result as string })
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Has a safety audit been conducted?</p>
          <div className="flex gap-3">
            <button type="button"
              onClick={() => setConducted(true)}
              className={cn('flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center gap-2',
                conducted === true ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-slate-500 hover:border-emerald-400')}>
              <CheckCircle2 className="h-4 w-4" /> Yes
            </button>
            <button type="button"
              onClick={() => setConducted(false)}
              className={cn('flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center gap-2',
                conducted === false ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300 text-slate-500 hover:border-red-400')}>
              <XCircle className="h-4 w-4" /> No
            </button>
          </div>

          {conducted === true && (
            <div className="space-y-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200">
              <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Upload Safety Audit Document (Required) *</Label>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFile} />
              {file ? (
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded px-3 py-2 border text-xs">
                  <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="flex-1 truncate font-medium">{file.name}</span>
                  <span className="text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => setFile(null)} className="text-red-400 hover:text-red-600 ml-1"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" /> Select Document
                </Button>
              )}
            </div>
          )}

          {conducted === false && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks (Optional)</Label>
              <Textarea
                placeholder="Reason for not conducting a safety audit..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="text-sm min-h-[80px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== STEP 4: REVIEW & SUBMIT ====================

function Step4({
  projectName, month, year, checklist, conducted, auditFile, auditRemarks, onSaveDraft, onSubmit,
}: {
  projectName: string; month: string; year: string
  checklist: ChecklistEntry[]
  conducted: boolean | null; auditFile: UploadedFile | null; auditRemarks: string
  onSaveDraft: () => void; onSubmit: () => void
}) {
  const proj = AMARAVATI_PROJECTS.find(p => p.name === projectName)
  const yesCount = checklist.filter(c => c.answer === 'yes').length
  const noCount  = checklist.filter(c => c.answer === 'no').length
  const unanswered = checklist.filter(c => c.answer === null && !CHECKLIST_ITEMS[c.sno - 1].isTextarea).length
  const noItems = checklist.filter(c => c.answer === 'no')

  return (
    <div className="space-y-4">

      {/* Project Summary */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <p className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">Project Details</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">Project</span><span className="font-semibold">{projectName || '—'}</span>
            <span className="text-muted-foreground">Number</span><span className="font-semibold">{proj?.number || '—'}</span>
            <span className="text-muted-foreground">Manager</span><span className="font-semibold">{proj?.manager || '—'}</span>
            <span className="text-muted-foreground">Reporting Month</span><span className="font-semibold">{month && year ? `${month} ${year}` : '—'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Summary */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <p className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">Checklist Summary</p>
          <div className="flex gap-3">
            <div className="flex-1 text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200">
              <p className="text-2xl font-black text-emerald-600">{yesCount}</p>
              <p className="text-[9px] text-emerald-700 font-semibold uppercase">Compliant</p>
            </div>
            <div className="flex-1 text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200">
              <p className="text-2xl font-black text-red-500">{noCount}</p>
              <p className="text-[9px] text-red-600 font-semibold uppercase">Non-Compliant</p>
            </div>
            <div className="flex-1 text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200">
              <p className="text-2xl font-black text-slate-500">{unanswered}</p>
              <p className="text-[9px] text-slate-500 font-semibold uppercase">Unanswered</p>
            </div>
          </div>

          {noItems.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-red-600">Non-Compliant Items:</p>
              {noItems.map(c => {
                const item = CHECKLIST_ITEMS[c.sno - 1]
                return (
                  <div key={c.sno} className="flex items-start gap-2 text-[10px] p-1.5 bg-red-50 dark:bg-red-950/10 rounded border border-red-200">
                    <XCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{item.sno}. {item.title}</span>
                      {c.remarks && <p className="text-muted-foreground mt-0.5">→ {c.remarks}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Audit */}
      <Card>
        <CardContent className="p-3 space-y-1">
          <p className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">Safety Audit</p>
          <p className="text-xs">
            Conducted:{' '}
            {conducted === null ? <span className="text-orange-500 font-semibold">Not answered</span>
              : conducted ? <span className="text-emerald-600 font-semibold">Yes</span>
              : <span className="text-red-500 font-semibold">No</span>}
          </p>
          {conducted && auditFile && (
            <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" />{auditFile.name}</p>
          )}
          {conducted === false && auditRemarks && (
            <p className="text-xs text-muted-foreground">Remarks: {auditRemarks}</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onSaveDraft}>
          <Save className="h-3.5 w-3.5" /> Save as Draft
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5"
          onClick={onSubmit}
        >
          <Send className="h-3.5 w-3.5" /> Submit Form
        </Button>
      </div>
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

export default function RoadSafetyFormDialog({ open, onOpenChange, onSaved, defaultProject }: Props) {
  const [step, setStep] = useState(0)

  // Step 1
  const [projectName, setProjectName] = useState(defaultProject || '')
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()])
  const [year, setYear] = useState(String(new Date().getFullYear()))

  // Step 2
  const [checklist, setChecklist] = useState<ChecklistEntry[]>(emptyChecklist)

  // Step 3
  const [conducted, setConducted] = useState<boolean | null>(null)
  const [auditRemarks, setAuditRemarks] = useState('')
  const [auditFile, setAuditFile] = useState<UploadedFile | null>(null)

  const handleChecklistChange = useCallback((idx: number, partial: Partial<ChecklistEntry>) => {
    setChecklist(prev => prev.map((e, i) => i === idx ? { ...e, ...partial } : e))
  }, [])

  const buildSubmission = (status: 'Draft' | 'Submitted'): RoadSafetySubmission => {
    const proj = AMARAVATI_PROJECTS.find(p => p.name === projectName)!
    return {
      id: `rs-${Date.now()}`,
      projectName, reportingMonth: `${month} ${year}`,
      projectNumber: proj?.number || '', projectTitle: proj?.title || '',
      manager: proj?.manager || '', customer: proj?.customer || '',
      boq: proj?.boq || '', boqDesc: proj?.boqDesc || '',
      createdDate: new Date().toLocaleDateString('en-IN'),
      checklist,
      safetyAuditConducted: conducted, safetyAuditRemarks: auditRemarks, safetyAuditFile: auditFile,
      status: status === 'Submitted' && checklist.some(c => c.answer === 'no') ? 'Needs Corrective Action' : status,
      submittedAt: status === 'Submitted' ? new Date().toISOString() : undefined,
      submittedBy: 'Current User',
    }
  }

  const handleSaveDraft = () => {
    const submissions = loadRoadSafetySubmissions()
    saveRoadSafetySubmissions([buildSubmission('Draft'), ...submissions])
    toast.success('Saved as draft')
    onSaved(); onOpenChange(false)
  }

  const handleSubmit = () => {
    // Fail only if nothing at all has been filled
    const hasAnyData =
      !!projectName ||
      checklist.some(c => c.answer !== null || c.textValue.trim()) ||
      conducted !== null
    if (!hasAnyData) {
      toast.error('Failed to Create')
      return
    }
    const submissions = loadRoadSafetySubmissions()
    saveRoadSafetySubmissions([buildSubmission('Submitted'), ...submissions])
    toast.success('Successfully Submitted')
    onSaved(); onOpenChange(false)
  }

  const next = () => setStep(s => Math.min(s + 1, 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const canNext = step < 1 // always allow Next

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-5xl h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#0d9488] text-white">
              <ClipboardList className="h-3.5 w-3.5" />
            </span>
            Road Safety Form
          </DialogTitle>
          <StepProgress current={step} />
        </DialogHeader>

        <div className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-5 py-4">
          {step === 0 && (
            <div className="space-y-6">
              {/* Project, Month & Year */}
              <div>
                <p className="text-xs font-bold text-[#0d9488] uppercase tracking-wider mb-3">Project Information</p>
                <Step1 projectName={projectName} setProjectName={setProjectName} month={month} setMonth={setMonth} year={year} setYear={setYear} />
              </div>
              <div className="border-t pt-5">
                <p className="text-xs font-bold text-[#0d9488] uppercase tracking-wider mb-3">Road Safety Checklist</p>
                <Step2 checklist={checklist} onChange={handleChecklistChange} />
              </div>
              <div className="border-t pt-5">
                <p className="text-xs font-bold text-[#0d9488] uppercase tracking-wider mb-3">Safety Audit</p>
                <Step3 conducted={conducted} setConducted={setConducted} remarks={auditRemarks} setRemarks={setAuditRemarks} file={auditFile} setFile={setAuditFile} />
              </div>
            </div>
          )}
          {step === 1 && <Step4 projectName={projectName} month={month} year={year} checklist={checklist} conducted={conducted} auditFile={auditFile} auditRemarks={auditRemarks} onSaveDraft={handleSaveDraft} onSubmit={handleSubmit} />}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-5 py-3 border-t shrink-0 bg-muted/20">
          <Button type="button" variant="outline" size="sm" onClick={prev} disabled={step === 0} className="gap-1.5">
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>
          <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
          {step < 1 ? (
            <Button type="button" size="sm" onClick={next} className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleSaveDraft}>
              <Save className="h-3.5 w-3.5" /> Save Draft
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
