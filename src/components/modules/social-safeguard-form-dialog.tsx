'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2, ChevronRight, ChevronLeft, Upload, X, FileText,
  Save, Send, ClipboardList, Plus, Trash2, Users, AlertTriangle,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AMARAVATI_PROJECTS } from './road-safety-form-dialog'

// ==================== CONSTANTS ====================

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS = ['2024','2025','2026']
const STEPS = [
  'Project & Staff',
  'Inspections & GRC',
  'Programs & Trainings',
  'Labour Influx & Health',
  'Community Profile',
  'Review & Submit'
]
const STORAGE_KEY = 'social-safeguard-submissions'

// ==================== TYPES ====================

export interface UFile { name: string; size: number; type: string; dataUrl: string }

export interface ESStaff { id: string; position: string; name: string; dateOfAppointment: string; expectedJoiningDate: string }
export interface PMCVist { id: string; month: string; pmcName: string; envVisits: string; socVisits: string; ohsVisits: string; totalVisits: string }
export interface GRCEntry { id: string; month: string; meetings: string; compReceived: string; compResolved: string; compPending: string; cumPending: string; doc: UFile | null }
export interface SubCommittee { id: string; reportsIssued: string; details: string; obsIssued: string; obsClosed: string; reportsClosed: string; pendingObs: string; targetCloseDate: string }
export interface ProgramEvent { id: string; date: string; details: string; participantType: string; male: string; female: string; total: string; photos: UFile[]; reports: UFile[] }
export interface TrainingEntry { id: string; date: string; topic: string; targetAudience: string; otherSpec: string; male: string; female: string; total: string; photos: UFile[]; reports: UFile[] }
export interface MeetingEntry { id: string; date: string; type: string; topic: string; male: string; female: string; total: string; photos: UFile[]; reports: UFile[] }
export interface CampDetail { id: string; camp: string; location: string; male: string; female: string; total: string; policeDetails: 'Yes' | 'No' | '' }
export interface MedicalActivity { id: string; activity: string; type: string; male: string; female: string; children: string; total: string; reports: UFile[]; photos: UFile[] }
export interface HostProfile { id: string; village: string; population: string; vulnerable: string; elderly: string; disabled: string; womenHeaded: string }
export interface HealthSurvey { id: string; village: string; date: string; families: string }

export interface SocialSafeguardSubmission {
  id: string; projectName: string; reportingMonth: string
  projectNumber: string; projectTitle: string; manager: string; customer: string; boq: string; boqDesc: string; createdDate: string
  staff: ESStaff[]
  inspections: { 
    visits: PMCVist[]; 
    plan: string; reports: string; compliance: string; gen: string; obsRaised: string; obsClosed: string; obsPending: string; cumTotals: string 
  }
  grc: GRCEntry[]
  subCommittee: SubCommittee[]
  programs: ProgramEvent[]
  trainings: TrainingEntry[]
  meetings: MeetingEntry[]
  labourInflux: { campDetails: CampDetail[]; migrantWorkers: CampDetail[]; newWorkers: CampDetail[] }
  medical: MedicalActivity[]
  hostCommunity: { isApplicable: boolean; profiles: HostProfile[] }
  healthSurveys: HealthSurvey[]
  status: 'Draft' | 'Submitted' | 'Pending PM Certification' | 'Pending PMC' | 'Pending PgMC' | 'Returned' | 'Approved'
  submittedAt?: string
}

// ==================== STORAGE ====================

export function loadSocialSafeguardSubmissions(): SocialSafeguardSubmission[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
export function saveSocialSafeguardSubmissions(data: SocialSafeguardSubmission[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ==================== INITIAL DATA ====================

function initData(): Omit<SocialSafeguardSubmission, 'id' | 'projectName' | 'reportingMonth' | 'projectNumber' | 'projectTitle' | 'manager' | 'customer' | 'boq' | 'boqDesc' | 'createdDate' | 'status' | 'submittedAt'> {
  return {
    staff: [],
    inspections: { visits: [], plan: '', reports: '', compliance: '', gen: '', obsRaised: '', obsClosed: '', obsPending: '', cumTotals: '' },
    grc: [],
    subCommittee: [],
    programs: [],
    trainings: [],
    meetings: [],
    labourInflux: { campDetails: [], migrantWorkers: [], newWorkers: [] },
    medical: [],
    hostCommunity: { isApplicable: false, profiles: [] },
    healthSurveys: []
  }
}

// ==================== COMPONENTS ====================

function FileUploader({ files, onAdd, onRemove, accept, multiple = true }: { files: UFile[], onAdd: (fs: UFile[]) => void, onRemove: (idx: number) => void, accept?: string, multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name, size: f.size, type: f.type, dataUrl: URL.createObjectURL(f)
    }))
    onAdd(multiple ? [...files, ...newFiles] : newFiles)
    if (ref.current) ref.current.value = ''
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-xs">
            <span className="truncate max-w-[120px]" title={f.name}>{f.name}</span>
            <Button type="button" variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground" onClick={() => onRemove(i)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      {(multiple || files.length === 0) && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs border-dashed" onClick={() => ref.current?.click()}>
            <Upload className="h-3 w-3 mr-1" /> Upload
          </Button>
          <input ref={ref} type="file" multiple={multiple} accept={accept} className="hidden" onChange={handleChange} />
        </div>
      )}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">{children}</h3>
}

function TableWrapper({ headers, children, onAdd, addLabel = 'Add Row' }: { headers: string[], children: React.ReactNode, onAdd?: () => void, addLabel?: string }) {
  return (
    <div className="space-y-2 mb-6">
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead className="bg-muted/40">
            <tr>
              {headers.map((h, i) => <th key={i} className="p-2 text-left font-semibold border-b whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {onAdd && (
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-7 text-xs gap-1 border-dashed">
          <Plus className="h-3 w-3" /> {addLabel}
        </Button>
      )}
    </div>
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

// ==================== MAIN COMPONENT ====================

export default function SocialSafeguardFormDialog({
  open, onOpenChange, onSaved,
}: { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  
  const [step, setStep] = useState(0)
  
  // Base details
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [reportMonth, setReportMonth] = useState(MONTHS[new Date().getMonth()])
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString())
  
  const [data, setData] = useState(initData())

  const project = AMARAVATI_PROJECTS.find(p => p.id === selectedProjectId)

  const handleNext = () => setStep(s => Math.min(STEPS.length - 1, s + 1))
  const handlePrev = () => setStep(s => Math.max(0, s - 1))

  const handleSave = (isDraft: boolean) => {
    if (!project) { toast.error('Select a project first'); return }
    const submission: SocialSafeguardSubmission = {
      id: `ss-${Date.now()}`,
      projectName: project.name,
      reportingMonth: `${reportMonth} ${reportYear}`,
      projectNumber: project.id,
      projectTitle: project.name,
      manager: project.manager,
      customer: project.customer,
      boq: 'BOQ-4599-22',
      boqDesc: 'Standard Phase 1 Construction',
      createdDate: new Date().toISOString().split('T')[0],
      ...data,
      status: isDraft ? 'Draft' : 'Submitted',
      submittedAt: isDraft ? undefined : new Date().toISOString()
    }
    const all = loadSocialSafeguardSubmissions()
    all.unshift(submission)
    saveSocialSafeguardSubmissions(all)
    toast.success(isDraft ? 'Draft Saved' : 'Successfully Submitted')
    onSaved()
    onOpenChange(false)
  }

  // Row operations
  const addStaff = () => setData(d => ({ ...d, staff: [...d.staff, { id: Date.now().toString(), position: '', name: '', dateOfAppointment: '', expectedJoiningDate: '' }] }))
  const rmStaff = (idx: number) => setData(d => ({ ...d, staff: d.staff.filter((_, i) => i !== idx) }))
  
  const addVisit = () => setData(d => ({ ...d, inspections: { ...d.inspections, visits: [...d.inspections.visits, { id: Date.now().toString(), month: '', pmcName: '', envVisits: '', socVisits: '', ohsVisits: '', totalVisits: '' }] } }))
  const rmVisit = (idx: number) => setData(d => ({ ...d, inspections: { ...d.inspections, visits: d.inspections.visits.filter((_, i) => i !== idx) } }))

  const addGRC = () => setData(d => ({ ...d, grc: [...d.grc, { id: Date.now().toString(), month: '', meetings: '', compReceived: '', compResolved: '', compPending: '', cumPending: '', doc: null }] }))
  const rmGRC = (idx: number) => setData(d => ({ ...d, grc: d.grc.filter((_, i) => i !== idx) }))

  const addSub = () => setData(d => ({ ...d, subCommittee: [...d.subCommittee, { id: Date.now().toString(), reportsIssued: '', details: '', obsIssued: '', obsClosed: '', reportsClosed: '', pendingObs: '', targetCloseDate: '' }] }))
  const rmSub = (idx: number) => setData(d => ({ ...d, subCommittee: d.subCommittee.filter((_, i) => i !== idx) }))

  const addProg = () => setData(d => ({ ...d, programs: [...d.programs, { id: Date.now().toString(), date: '', details: '', participantType: '', male: '', female: '', total: '', photos: [], reports: [] }] }))
  const rmProg = (idx: number) => setData(d => ({ ...d, programs: d.programs.filter((_, i) => i !== idx) }))

  const addTrain = () => setData(d => ({ ...d, trainings: [...d.trainings, { id: Date.now().toString(), date: '', topic: '', targetAudience: '', otherSpec: '', male: '', female: '', total: '', photos: [], reports: [] }] }))
  const rmTrain = (idx: number) => setData(d => ({ ...d, trainings: d.trainings.filter((_, i) => i !== idx) }))

  const addMeet = () => setData(d => ({ ...d, meetings: [...d.meetings, { id: Date.now().toString(), date: '', type: '', topic: '', male: '', female: '', total: '', photos: [], reports: [] }] }))
  const rmMeet = (idx: number) => setData(d => ({ ...d, meetings: d.meetings.filter((_, i) => i !== idx) }))

  const addCamp = (type: 'campDetails' | 'migrantWorkers' | 'newWorkers') => setData(d => ({ ...d, labourInflux: { ...d.labourInflux, [type]: [...d.labourInflux[type], { id: Date.now().toString(), camp: '', location: '', male: '', female: '', total: '', policeDetails: '' }] } }))
  const rmCamp = (type: 'campDetails' | 'migrantWorkers' | 'newWorkers', idx: number) => setData(d => ({ ...d, labourInflux: { ...d.labourInflux, [type]: d.labourInflux[type].filter((_, i) => i !== idx) } }))

  const addMed = () => setData(d => ({ ...d, medical: [...d.medical, { id: Date.now().toString(), activity: '', type: '', male: '', female: '', children: '', total: '', reports: [], photos: [] }] }))
  const rmMed = (idx: number) => setData(d => ({ ...d, medical: d.medical.filter((_, i) => i !== idx) }))

  const addHost = () => setData(d => ({ ...d, hostCommunity: { ...d.hostCommunity, profiles: [...d.hostCommunity.profiles, { id: Date.now().toString(), village: '', population: '', vulnerable: '', elderly: '', disabled: '', womenHeaded: '' }] } }))
  const rmHost = (idx: number) => setData(d => ({ ...d, hostCommunity: { ...d.hostCommunity, profiles: d.hostCommunity.profiles.filter((_, i) => i !== idx) } }))

  const addSurv = () => setData(d => ({ ...d, healthSurveys: [...d.healthSurveys, { id: Date.now().toString(), village: '', date: '', families: '' }] }))
  const rmSurv = (idx: number) => setData(d => ({ ...d, healthSurveys: d.healthSurveys.filter((_, i) => i !== idx) }))


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:!max-w-[1100px] h-[90vh] max-h-[750px] rounded-2xl flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-950">
        
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#0d9488] text-white">
              <ClipboardList className="h-3.5 w-3.5" />
            </span>
            Social Safeguard Compliance for MPR
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 sm:px-8 py-4 border-b shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-2xl mx-auto">
            <StepProgress current={step} steps={STEPS} />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Form Content */}
          <div className="flex-1 min-w-0 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 px-7 sm:px-8 py-6">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* STEP 0: Project & Staff */}
              {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-lg border">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Select Project</Label>
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="Choose a project..." /></SelectTrigger>
                        <SelectContent>{AMARAVATI_PROJECTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Reporting Month</Label>
                        <Select value={reportMonth} onValueChange={setReportMonth}>
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Year</Label>
                        <Select value={reportYear} onValueChange={setReportYear}>
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionHeading>A. Deployment of E&S Staff</SectionHeading>
                    <TableWrapper headers={['S.No','Position','Name','Date of Appointment','Expected Joining Date (If Vacant)','']} onAdd={addStaff} addLabel="Add Staff">
                      {data.staff.map((s, i) => (
                        <tr key={s.id}>
                          <td className="p-2 border-b text-center">{i+1}</td>
                          <td className="p-2 border-b"><Input className="h-8 text-xs" value={s.position} onChange={e => { const n = [...data.staff]; n[i].position = e.target.value; setData({...data, staff: n})}} /></td>
                          <td className="p-2 border-b"><Input className="h-8 text-xs" value={s.name} onChange={e => { const n = [...data.staff]; n[i].name = e.target.value; setData({...data, staff: n})}} /></td>
                          <td className="p-2 border-b"><Input type="date" className="h-8 text-xs" value={s.dateOfAppointment} onChange={e => { const n = [...data.staff]; n[i].dateOfAppointment = e.target.value; setData({...data, staff: n})}} /></td>
                          <td className="p-2 border-b"><Input type="date" className="h-8 text-xs" value={s.expectedJoiningDate} onChange={e => { const n = [...data.staff]; n[i].expectedJoiningDate = e.target.value; setData({...data, staff: n})}} /></td>
                          <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmStaff(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                        </tr>
                      ))}
                      {data.staff.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted-foreground border-b">No staff recorded</td></tr>}
                    </TableWrapper>
                  </div>
                </div>
              )}

              {/* STEP 1: Inspections & GRC */}
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <SectionHeading>B. Monthly Site Inspections by PMC</SectionHeading>
                    <TableWrapper headers={['S.No','Month','PMC Name','Env Mgr Visits','Soc Mgr Visits','OHS Visits','Total Visits','']} onAdd={addVisit} addLabel="Add Visit">
                      {data.inspections.visits.map((v, i) => (
                        <tr key={v.id}>
                          <td className="p-2 border-b text-center">{i+1}</td>
                          <td className="p-2 border-b"><Input className="h-8 text-xs" value={v.month} onChange={e => { const n = [...data.inspections.visits]; n[i].month = e.target.value; setData({...data, inspections: {...data.inspections, visits: n}})}} /></td>
                          <td className="p-2 border-b"><Input className="h-8 text-xs" value={v.pmcName} onChange={e => { const n = [...data.inspections.visits]; n[i].pmcName = e.target.value; setData({...data, inspections: {...data.inspections, visits: n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-20" value={v.envVisits} onChange={e => { const n = [...data.inspections.visits]; n[i].envVisits = e.target.value; setData({...data, inspections: {...data.inspections, visits: n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-20" value={v.socVisits} onChange={e => { const n = [...data.inspections.visits]; n[i].socVisits = e.target.value; setData({...data, inspections: {...data.inspections, visits: n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-20" value={v.ohsVisits} onChange={e => { const n = [...data.inspections.visits]; n[i].ohsVisits = e.target.value; setData({...data, inspections: {...data.inspections, visits: n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-20" value={v.totalVisits} onChange={e => { const n = [...data.inspections.visits]; n[i].totalVisits = e.target.value; setData({...data, inspections: {...data.inspections, visits: n}})}} /></td>
                          <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmVisit(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {['plan','reports','compliance','gen','obsRaised','obsClosed','obsPending','cumTotals'].map(f => (
                        <div key={f} className="space-y-1.5">
                          <Label className="text-xs capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <Input className="h-8 text-xs" value={(data.inspections as any)[f]} onChange={e => setData(d => ({ ...d, inspections: { ...d.inspections, [f]: e.target.value } }))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionHeading>C. Grievance Redressal Committee — GRC</SectionHeading>
                    <TableWrapper headers={['S.No','Month','Meetings','Received','Resolved','Pending','Cum Pending','Doc','']} onAdd={addGRC}>
                      {data.grc.map((g, i) => (
                        <tr key={g.id}>
                          <td className="p-2 border-b text-center">{i+1}</td>
                          <td className="p-2 border-b"><Input className="h-8 text-xs" value={g.month} onChange={e => { const n = [...data.grc]; n[i].month = e.target.value; setData({...data, grc: n})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={g.meetings} onChange={e => { const n = [...data.grc]; n[i].meetings = e.target.value; setData({...data, grc: n})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={g.compReceived} onChange={e => { const n = [...data.grc]; n[i].compReceived = e.target.value; setData({...data, grc: n})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={g.compResolved} onChange={e => { const n = [...data.grc]; n[i].compResolved = e.target.value; setData({...data, grc: n})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={g.compPending} onChange={e => { const n = [...data.grc]; n[i].compPending = e.target.value; setData({...data, grc: n})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={g.cumPending} onChange={e => { const n = [...data.grc]; n[i].cumPending = e.target.value; setData({...data, grc: n})}} /></td>
                          <td className="p-2 border-b min-w-[120px]"><FileUploader multiple={false} files={g.doc ? [g.doc] : []} onAdd={f => { const n = [...data.grc]; n[i].doc = f[0]; setData({...data, grc: n})}} onRemove={() => { const n = [...data.grc]; n[i].doc = null; setData({...data, grc: n})}} /></td>
                          <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmGRC(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>
                </div>
              )}

              {/* STEP 2: Programs & Trainings */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeading>E. Programs & Events Conducted</SectionHeading>
                  <TableWrapper headers={['S.No','Date','Details','Participant Type','M','F','Total','Media','']} onAdd={addProg}>
                    {data.programs.map((p, i) => (
                      <tr key={p.id}>
                        <td className="p-2 border-b text-center">{i+1}</td>
                        <td className="p-2 border-b"><Input type="date" className="h-8 text-xs" value={p.date} onChange={e => { const n=[...data.programs]; n[i].date=e.target.value; setData({...data, programs:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs min-w-[120px]" value={p.details} onChange={e => { const n=[...data.programs]; n[i].details=e.target.value; setData({...data, programs:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs" value={p.participantType} onChange={e => { const n=[...data.programs]; n[i].participantType=e.target.value; setData({...data, programs:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={p.male} onChange={e => { const n=[...data.programs]; n[i].male=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].female || 0)); setData({...data, programs:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={p.female} onChange={e => { const n=[...data.programs]; n[i].female=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].male || 0)); setData({...data, programs:n})}} /></td>
                        <td className="p-2 border-b font-bold text-center bg-slate-50">{p.total}</td>
                        <td className="p-2 border-b min-w-[120px]"><FileUploader files={p.photos} onAdd={f => { const n=[...data.programs]; n[i].photos=[...n[i].photos,...f]; setData({...data, programs:n})}} onRemove={idx => { const n=[...data.programs]; n[i].photos=n[i].photos.filter((_,k)=>k!==idx); setData({...data, programs:n})}} /></td>
                        <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmProg(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                      </tr>
                    ))}
                  </TableWrapper>

                  <SectionHeading>F. Trainings / Orientation</SectionHeading>
                  <TableWrapper headers={['S.No','Date','Topic','Audience','If Other','M','F','Total','Media','']} onAdd={addTrain}>
                    {data.trainings.map((t, i) => (
                      <tr key={t.id}>
                        <td className="p-2 border-b text-center">{i+1}</td>
                        <td className="p-2 border-b"><Input type="date" className="h-8 text-xs" value={t.date} onChange={e => { const n=[...data.trainings]; n[i].date=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs min-w-[120px]" value={t.topic} onChange={e => { const n=[...data.trainings]; n[i].topic=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs" value={t.targetAudience} onChange={e => { const n=[...data.trainings]; n[i].targetAudience=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs" value={t.otherSpec} onChange={e => { const n=[...data.trainings]; n[i].otherSpec=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={t.male} onChange={e => { const n=[...data.trainings]; n[i].male=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].female || 0)); setData({...data, trainings:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={t.female} onChange={e => { const n=[...data.trainings]; n[i].female=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].male || 0)); setData({...data, trainings:n})}} /></td>
                        <td className="p-2 border-b font-bold text-center bg-slate-50">{t.total}</td>
                        <td className="p-2 border-b min-w-[120px]"><FileUploader files={t.photos} onAdd={f => { const n=[...data.trainings]; n[i].photos=[...n[i].photos,...f]; setData({...data, trainings:n})}} onRemove={idx => { const n=[...data.trainings]; n[i].photos=n[i].photos.filter((_,k)=>k!==idx); setData({...data, trainings:n})}} /></td>
                        <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmTrain(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                      </tr>
                    ))}
                  </TableWrapper>

                  <SectionHeading>G. Stakeholder / Community Meetings</SectionHeading>
                  <TableWrapper headers={['S.No','Date','Type','Topic','M','F','Total','Media','']} onAdd={addMeet}>
                    {data.meetings.map((m, i) => (
                      <tr key={m.id}>
                        <td className="p-2 border-b text-center">{i+1}</td>
                        <td className="p-2 border-b"><Input type="date" className="h-8 text-xs" value={m.date} onChange={e => { const n=[...data.meetings]; n[i].date=e.target.value; setData({...data, meetings:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs" value={m.type} onChange={e => { const n=[...data.meetings]; n[i].type=e.target.value; setData({...data, meetings:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs min-w-[120px]" value={m.topic} onChange={e => { const n=[...data.meetings]; n[i].topic=e.target.value; setData({...data, meetings:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={m.male} onChange={e => { const n=[...data.meetings]; n[i].male=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].female || 0)); setData({...data, meetings:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={m.female} onChange={e => { const n=[...data.meetings]; n[i].female=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].male || 0)); setData({...data, meetings:n})}} /></td>
                        <td className="p-2 border-b font-bold text-center bg-slate-50">{m.total}</td>
                        <td className="p-2 border-b min-w-[120px]"><FileUploader files={m.photos} onAdd={f => { const n=[...data.meetings]; n[i].photos=[...n[i].photos,...f]; setData({...data, meetings:n})}} onRemove={idx => { const n=[...data.meetings]; n[i].photos=n[i].photos.filter((_,k)=>k!==idx); setData({...data, meetings:n})}} /></td>
                        <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmMeet(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                      </tr>
                    ))}
                  </TableWrapper>
                </div>
              )}

              {/* STEP 3: Labour Influx & Health */}
              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeading>H. Labour Influx & Camp Details</SectionHeading>
                  {['campDetails','migrantWorkers','newWorkers'].map((key) => {
                    const titles: any = { campDetails: 'Labour Camp Details', migrantWorkers: 'Migrant Workers Details', newWorkers: 'New Workers Details' }
                    return (
                      <div key={key} className="mb-6">
                        <p className="text-xs font-semibold mb-2">{titles[key]}</p>
                        <TableWrapper headers={['S.No','Camp','Location','M','F','Total','Submitted to Police','']} onAdd={() => addCamp(key as any)}>
                          {(data.labourInflux as any)[key].map((c: CampDetail, i: number) => (
                            <tr key={c.id}>
                              <td className="p-2 border-b text-center">{i+1}</td>
                              <td className="p-2 border-b"><Input className="h-8 text-xs" value={c.camp} onChange={e => { const n=[...(data.labourInflux as any)[key]]; n[i].camp=e.target.value; setData({...data, labourInflux:{...data.labourInflux, [key]: n}})}} /></td>
                              <td className="p-2 border-b"><Input className="h-8 text-xs" value={c.location} onChange={e => { const n=[...(data.labourInflux as any)[key]]; n[i].location=e.target.value; setData({...data, labourInflux:{...data.labourInflux, [key]: n}})}} /></td>
                              <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={c.male} onChange={e => { const n=[...(data.labourInflux as any)[key]]; n[i].male=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].female || 0)); setData({...data, labourInflux:{...data.labourInflux, [key]: n}})}} /></td>
                              <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={c.female} onChange={e => { const n=[...(data.labourInflux as any)[key]]; n[i].female=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].male || 0)); setData({...data, labourInflux:{...data.labourInflux, [key]: n}})}} /></td>
                              <td className="p-2 border-b font-bold text-center bg-slate-50">{c.total}</td>
                              <td className="p-2 border-b">
                                <Select value={c.policeDetails} onValueChange={v => { const n=[...(data.labourInflux as any)[key]]; n[i].policeDetails=v; setData({...data, labourInflux:{...data.labourInflux, [key]: n}})}}>
                                  <SelectTrigger className="h-8 text-xs w-20"><SelectValue/></SelectTrigger>
                                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                                </Select>
                              </td>
                              <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmCamp(key as any, i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                            </tr>
                          ))}
                        </TableWrapper>
                      </div>
                    )
                  })}

                  <SectionHeading>I. Medical & Health Activities</SectionHeading>
                  <TableWrapper headers={['S.No','Activity','Type','M','F','Children','Total','Media','']} onAdd={addMed}>
                    {data.medical.map((m, i) => (
                      <tr key={m.id}>
                        <td className="p-2 border-b text-center">{i+1}</td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs min-w-[120px]" value={m.activity} onChange={e => { const n=[...data.medical]; n[i].activity=e.target.value; setData({...data, medical:n})}} /></td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs" value={m.type} onChange={e => { const n=[...data.medical]; n[i].type=e.target.value; setData({...data, medical:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={m.male} onChange={e => { const n=[...data.medical]; n[i].male=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].female || 0) + Number(n[i].children || 0)); setData({...data, medical:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={m.female} onChange={e => { const n=[...data.medical]; n[i].female=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].male || 0) + Number(n[i].children || 0)); setData({...data, medical:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-16" value={m.children} onChange={e => { const n=[...data.medical]; n[i].children=e.target.value; n[i].total = String(Number(e.target.value || 0) + Number(n[i].female || 0) + Number(n[i].male || 0)); setData({...data, medical:n})}} /></td>
                        <td className="p-2 border-b font-bold text-center bg-slate-50">{m.total}</td>
                        <td className="p-2 border-b min-w-[120px]"><FileUploader files={m.photos} onAdd={f => { const n=[...data.medical]; n[i].photos=[...n[i].photos,...f]; setData({...data, medical:n})}} onRemove={idx => { const n=[...data.medical]; n[i].photos=n[i].photos.filter((_,k)=>k!==idx); setData({...data, medical:n})}} /></td>
                        <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmMed(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                      </tr>
                    ))}
                  </TableWrapper>
                </div>
              )}

              {/* STEP 4: Community Profile */}
              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeading>J. Host Community Profile</SectionHeading>
                  <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="hc-app" checked={data.hostCommunity.isApplicable} onChange={e => setData(d => ({ ...d, hostCommunity: { ...d.hostCommunity, isApplicable: e.target.checked } }))} className="rounded border-slate-300" />
                    <Label htmlFor="hc-app" className="text-sm font-semibold">Mark as Applicable</Label>
                  </div>
                  {data.hostCommunity.isApplicable && (
                    <TableWrapper headers={['S.No','Village','Total Population','Vulnerable HHs','Elderly >60','Disabled','Women-Headed HHs','']} onAdd={addHost}>
                      {data.hostCommunity.profiles.map((h, i) => (
                        <tr key={h.id}>
                          <td className="p-2 border-b text-center">{i+1}</td>
                          <td className="p-2 border-b"><Input className="h-8 text-xs" value={h.village} onChange={e => { const n=[...data.hostCommunity.profiles]; n[i].village=e.target.value; setData({...data, hostCommunity:{...data.hostCommunity, profiles:n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={h.population} onChange={e => { const n=[...data.hostCommunity.profiles]; n[i].population=e.target.value; setData({...data, hostCommunity:{...data.hostCommunity, profiles:n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={h.vulnerable} onChange={e => { const n=[...data.hostCommunity.profiles]; n[i].vulnerable=e.target.value; setData({...data, hostCommunity:{...data.hostCommunity, profiles:n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={h.elderly} onChange={e => { const n=[...data.hostCommunity.profiles]; n[i].elderly=e.target.value; setData({...data, hostCommunity:{...data.hostCommunity, profiles:n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={h.disabled} onChange={e => { const n=[...data.hostCommunity.profiles]; n[i].disabled=e.target.value; setData({...data, hostCommunity:{...data.hostCommunity, profiles:n}})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={h.womenHeaded} onChange={e => { const n=[...data.hostCommunity.profiles]; n[i].womenHeaded=e.target.value; setData({...data, hostCommunity:{...data.hostCommunity, profiles:n}})}} /></td>
                          <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmHost(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  )}

                  <SectionHeading>K. Community Health Surveys</SectionHeading>
                  <TableWrapper headers={['S.No','Name of Village','Date of Survey','Total Families / Institutions Covered','']} onAdd={addSurv}>
                    {data.healthSurveys.map((s, i) => (
                      <tr key={s.id}>
                        <td className="p-2 border-b text-center">{i+1}</td>
                        <td className="p-2 border-b"><Input className="h-8 text-xs" value={s.village} onChange={e => { const n=[...data.healthSurveys]; n[i].village=e.target.value; setData({...data, healthSurveys:n})}} /></td>
                        <td className="p-2 border-b"><Input type="date" className="h-8 text-xs" value={s.date} onChange={e => { const n=[...data.healthSurveys]; n[i].date=e.target.value; setData({...data, healthSurveys:n})}} /></td>
                        <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-32" value={s.families} onChange={e => { const n=[...data.healthSurveys]; n[i].families=e.target.value; setData({...data, healthSurveys:n})}} /></td>
                        <td className="p-2 border-b w-10"><Button variant="ghost" size="sm" onClick={() => rmSurv(i)}><Trash2 className="h-3.5 w-3.5 text-red-500"/></Button></td>
                      </tr>
                    ))}
                  </TableWrapper>
                </div>
              )}

              {/* STEP 5: Review */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50 text-center">
                    <ClipboardList className="h-12 w-12 text-[#0d9488] mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Submit?</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      You are about to submit the Social Safeguard Compliance report for MPR.
                      Make sure all fields and evidence uploads are correct.
                    </p>
                    <div className="mt-8 flex gap-4">
                      <Button variant="outline" className="px-8" onClick={() => setStep(0)}>Review Form</Button>
                      <Button className="px-8 bg-[#0d9488] hover:bg-[#0f766e]" onClick={() => handleSave(false)}>
                        <Send className="h-4 w-4 mr-2" /> Submit Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-white dark:bg-slate-950 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={handlePrev} className="gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium">Step {step + 1} of {STEPS.length}</span>
            <div className="flex gap-2">
              {step === STEPS.length - 1 ? (
                <>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => handleSave(true)}>
                    <Save className="h-3.5 w-3.5" /> Save Draft
                  </Button>
                  <Button type="button" size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5" onClick={() => handleSave(false)}>
                    <Send className="h-3.5 w-3.5" /> Submit
                  </Button>
                </>
              ) : (
                <Button type="button" size="sm" onClick={handleNext} className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5">
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
