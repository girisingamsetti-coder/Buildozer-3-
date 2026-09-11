'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2, ChevronRight, ChevronLeft, Upload, X, Save, Send, ClipboardList, Plus, Trash2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AMARAVATI_PROJECTS } from './road-safety-form-dialog'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS = ['2024','2025','2026']
const STEPS = [
  'Setup & Compliance',
  'Camp Facilities',
  'Sub-Contractors & Employees',
  'Wages & Attendance',
  'Labour Profile & Overtime',
  'Recovery & Gaps',
  'Review & Submit'
]
const STORAGE_KEY = 'labour-law-submissions'

const ACTS = ['BOCW Act 1996','Contract Labour Act 1970','Inter-State Migrant Workmen Act 1979','EPF Act 1952','ESI Act 1948','Workmen Compensation Policy','Motor Transport Workers Registration – 1961']
const FACILITIES = ['Canteen','Rest Room','Drinking Water','Creches','First Aid','GRC','ICC','Notice Board — Abstract of Acts','Notice Board — Display of Wages Details']

export interface UFile { name: string; size: number; type: string; dataUrl: string }

export interface RegEntry { act: string; licenseNo: string; startDate: string; expiryDate: string; status: string; doc: UFile | null }
export interface FacEntry { req: string; status: string; doc: UFile | null }
export interface SubCont { id: string; nameAddress: string; nature: string; location: string; from: string; to: string; maxWorkers: string }
export interface EmpData { id: string; empCode: string; name: string; surname: string; gender: string; fatherSpouse: string; dob: string; nationality: string; edu: string; doj: string; designation: string; category: string; address: string; empType: string; mobile: string; uan: string; pan: string; esic: string; lwf: string; aadhaar: string; bankAcc: string; ifsc: string; presentAddr: string; permAddr: string; serviceBook: string; exitDate: string; exitReason: string; mark: string; sign: string; remarks: string }
export interface WageRec { id: string; name: string; wageRate: string; days: string; otHours: string; basic: string; specialBasic: string; da: string; payOt: string; hra: string; others: string; total: string; pf: string; esic: string; society: string; incomeTax: string; insurance: string; otherRecov: string; totalRecov: string; net: string; empShare: string; pfWelfare: string; receipt: string; payDate: string; remarks: string }
export interface Attend { id: string; date: string; daily: string; records: string }
export interface SummaryRow { row: string; a: string; b: string; c: string; d: string; e: string }
export interface Overtime { id: string; name: string; fatherHusband: string; gender: string; desig: string; datesOt: string; totalOt: string; normalRate: string; otRate: string; otEarnings: string; datePaid: string; remarks: string }
export interface Recovery { id: string; name: string; recType: string; particulars: string; damageDate: string; amount: string; showCause: string; explHeard: string; instalments: string; firstMonth: string; lastMonth: string; dateComplete: string; remarks: string }
export interface Gap { id: string; gap: string; rec: string; responsible: string; targetDate: string; status: string }

export interface LabourLawSubmission {
  id: string; projectName: string; reportingMonth: string; projectNumber: string; projectTitle: string; manager: string; customer: string; boq: string; boqDesc: string; createdDate: string
  registrations: RegEntry[]
  facilities: FacEntry[]
  subContractors: { records: SubCont[]; doc: UFile | null }
  employees: { records: EmpData[]; doc: UFile | null }
  wages: { records: WageRec[]; doc: UFile | null }
  attendance: Attend[]
  profile: { gender: SummaryRow[]; skill: SummaryRow[]; origin: SummaryRow[]; age: SummaryRow[]; source: SummaryRow[] }
  overtime: { records: Overtime[]; doc: UFile | null }
  recovery: { records: Recovery[]; doc: UFile | null }
  wageSlips: UFile[]
  gaps: Gap[]
  status: 'Draft' | 'Submitted' | 'Returned' | 'Approved'
  submittedAt?: string
}

export function loadLabourLawSubmissions(): LabourLawSubmission[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
export function saveLabourLawSubmissions(data: LabourLawSubmission[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function initData(): Omit<LabourLawSubmission, 'id' | 'projectName' | 'reportingMonth' | 'projectNumber' | 'projectTitle' | 'manager' | 'customer' | 'boq' | 'boqDesc' | 'createdDate' | 'status' | 'submittedAt'> {
  return {
    registrations: ACTS.map(a => ({ act: a, licenseNo: '', startDate: '', expiryDate: '', status: '', doc: null })),
    facilities: FACILITIES.map(f => ({ req: f, status: '', doc: null })),
    subContractors: { records: [], doc: null },
    employees: { records: [], doc: null },
    wages: { records: [], doc: null },
    attendance: [],
    profile: {
      gender: [{ row: 'Male', a:'',b:'',c:'',d:'',e:'' },{ row: 'Female', a:'',b:'',c:'',d:'',e:'' },{ row: 'Total', a:'',b:'',c:'',d:'',e:'' }],
      skill: [{ row: 'Highly Skilled', a:'',b:'',c:'',d:'',e:'' },{ row: 'Skilled', a:'',b:'',c:'',d:'',e:'' },{ row: 'Semi-Skilled', a:'',b:'',c:'',d:'',e:'' },{ row: 'Unskilled', a:'',b:'',c:'',d:'',e:'' },{ row: 'Total', a:'',b:'',c:'',d:'',e:'' }],
      origin: [{ row: 'Local', a:'',b:'',c:'',d:'',e:'' },{ row: 'Other State', a:'',b:'',c:'',d:'',e:'' },{ row: 'Other Country', a:'',b:'',c:'',d:'',e:'' },{ row: 'Total', a:'',b:'',c:'',d:'',e:'' }],
      age: [{ row: '14-18', a:'',b:'',c:'',d:'',e:'' },{ row: '18-25', a:'',b:'',c:'',d:'',e:'' },{ row: '25-50', a:'',b:'',c:'',d:'',e:'' },{ row: 'Above 50', a:'',b:'',c:'',d:'',e:'' },{ row: 'Total', a:'',b:'',c:'',d:'',e:'' }],
      source: [{ row: 'Main Contractor', a:'',b:'',c:'',d:'',e:'' },{ row: 'Sub-contractor', a:'',b:'',c:'',d:'',e:'' },{ row: 'Independent', a:'',b:'',c:'',d:'',e:'' },{ row: 'Other', a:'',b:'',c:'',d:'',e:'' },{ row: 'Total', a:'',b:'',c:'',d:'',e:'' }]
    },
    overtime: { records: [], doc: null },
    recovery: { records: [], doc: null },
    wageSlips: [],
    gaps: []
  }
}

function FileUploader({ files, onAdd, onRemove, multiple = true }: { files: UFile[], onAdd: (fs: UFile[]) => void, onRemove: (idx: number) => void, multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, type: f.type, dataUrl: URL.createObjectURL(f) }))
    onAdd(multiple ? [...files, ...newFiles] : newFiles)
    if (ref.current) ref.current.value = ''
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-xs">
            <span className="truncate max-w-[120px]" title={f.name}>{f.name}</span>
            <Button type="button" variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground" onClick={() => onRemove(i)}><X className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
      {(multiple || files.length === 0) && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs border-dashed" onClick={() => ref.current?.click()}><Upload className="h-3 w-3 mr-1" /> Upload</Button>
          <input ref={ref} type="file" multiple={multiple} className="hidden" onChange={handleChange} />
        </div>
      )}
    </div>
  )
}

function TableWrapper({ headers, children, onAdd, addLabel = 'Add Row' }: { headers: string[], children: React.ReactNode, onAdd?: () => void, addLabel?: string }) {
  return (
    <div className="space-y-2 mb-6">
      <div className="border rounded-md overflow-x-auto"><table className="w-full text-xs min-w-[650px]"><thead className="bg-muted/40"><tr>{headers.map((h, i) => <th key={i} className="p-2 text-left font-semibold border-b whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
      {onAdd && <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-7 text-xs gap-1 border-dashed"><Plus className="h-3 w-3" /> {addLabel}</Button>}
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

export default function LabourLawFormDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const [step, setStep] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [reportMonth, setReportMonth] = useState(MONTHS[new Date().getMonth()])
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString())
  const [data, setData] = useState(initData())
  const project = AMARAVATI_PROJECTS.find(p => p.id === selectedProjectId)

  const handleSave = (isDraft: boolean) => {
    if (!project) { toast.error('Select a project first'); return }
    const sub: LabourLawSubmission = {
      id: `ll-${Date.now()}`, projectName: project.name, reportingMonth: `${reportMonth} ${reportYear}`,
      projectNumber: project.id, projectTitle: project.name, manager: project.manager, customer: project.customer,
      boq: 'BOQ-4599-22', boqDesc: 'Standard Phase 1 Construction', createdDate: new Date().toISOString().split('T')[0],
      ...data, status: isDraft ? 'Draft' : 'Submitted', submittedAt: isDraft ? undefined : new Date().toISOString()
    }
    const all = loadLabourLawSubmissions(); all.unshift(sub); saveLabourLawSubmissions(all)
    toast.success(isDraft ? 'Draft Saved' : 'Successfully Submitted')
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
            Labour Law Compliance
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 sm:px-8 py-4 border-b shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-2xl mx-auto">
            <StepProgress current={step} steps={STEPS} />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 px-7 sm:px-8 py-6">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 bg-slate-50 p-4 sm:p-5 rounded-lg border">
                    <div className="space-y-2"><Label>Select Project</Label><Select value={selectedProjectId} onValueChange={setSelectedProjectId}><SelectTrigger className="bg-white"><SelectValue placeholder="Choose a project..." /></SelectTrigger><SelectContent>{AMARAVATI_PROJECTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2"><Label>Reporting Month</Label><Select value={reportMonth} onValueChange={setReportMonth}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Year</Label><Select value={reportYear} onValueChange={setReportYear}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">A. Establishment Registration & Licenses</h3>
                    <TableWrapper headers={['Act / Registration','License Number','Start Date','Expiry Date','Status','Upload']}>
                      {data.registrations.map((r, i) => (
                        <tr key={r.act}>
                          <td className="p-2 border-b font-medium">{r.act}</td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs" value={r.licenseNo} onChange={e => { const n=[...data.registrations]; n[i].licenseNo=e.target.value; setData({...data, registrations:n})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-8 text-xs" value={r.startDate} onChange={e => { const n=[...data.registrations]; n[i].startDate=e.target.value; setData({...data, registrations:n})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-8 text-xs" value={r.expiryDate} onChange={e => { const n=[...data.registrations]; n[i].expiryDate=e.target.value; setData({...data, registrations:n})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs" value={r.status} onChange={e => { const n=[...data.registrations]; n[i].status=e.target.value; setData({...data, registrations:n})}} /></td>
                          <td className="p-1 border-b min-w-[120px]"><FileUploader multiple={false} files={r.doc ? [r.doc] : []} onAdd={f => { const n=[...data.registrations]; n[i].doc=f[0]; setData({...data, registrations:n})}} onRemove={() => { const n=[...data.registrations]; n[i].doc=null; setData({...data, registrations:n})}} /></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">B. Basic Facilities at Labour Camp</h3>
                  <TableWrapper headers={['Requirement','Status','Upload File']}>
                    {data.facilities.map((f, i) => (
                      <tr key={f.req}>
                        <td className="p-2 border-b font-medium">{f.req}</td>
                        <td className="p-1 border-b"><Input className="h-8 text-xs" value={f.status} onChange={e => { const n=[...data.facilities]; n[i].status=e.target.value; setData({...data, facilities:n})}} /></td>
                        <td className="p-1 border-b min-w-[120px]"><FileUploader multiple={false} files={f.doc ? [f.doc] : []} onAdd={fl => { const n=[...data.facilities]; n[i].doc=fl[0]; setData({...data, facilities:n})}} onRemove={() => { const n=[...data.facilities]; n[i].doc=null; setData({...data, facilities:n})}} /></td>
                      </tr>
                    ))}
                  </TableWrapper>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h3 className="text-sm font-bold text-[#0d9488]">C. Sub-Contractor Register — Form XII</h3>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Upload Form XII:</span><FileUploader multiple={false} files={data.subContractors.doc ? [data.subContractors.doc] : []} onAdd={f => setData(d => ({ ...d, subContractors: { ...d.subContractors, doc: f[0] } }))} onRemove={() => setData(d => ({ ...d, subContractors: { ...d.subContractors, doc: null } }))} /></div>
                    </div>
                    <TableWrapper headers={['S.No','Contractor Name & Addr','Nature of Work','Location','From','To','Max Workers','']} onAdd={() => setData(d => ({ ...d, subContractors: { ...d.subContractors, records: [...d.subContractors.records, { id: Date.now().toString(), nameAddress:'', nature:'', location:'', from:'', to:'', maxWorkers:'' }] } }))}>
                      {data.subContractors.records.map((r, i) => (
                        <tr key={r.id}>
                          <td className="p-2 border-b text-center">{i+1}</td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={r.nameAddress} onChange={e => { const n=[...data.subContractors.records]; n[i].nameAddress=e.target.value; setData({...data, subContractors:{...data.subContractors, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={r.nature} onChange={e => { const n=[...data.subContractors.records]; n[i].nature=e.target.value; setData({...data, subContractors:{...data.subContractors, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={r.location} onChange={e => { const n=[...data.subContractors.records]; n[i].location=e.target.value; setData({...data, subContractors:{...data.subContractors, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-24" value={r.from} onChange={e => { const n=[...data.subContractors.records]; n[i].from=e.target.value; setData({...data, subContractors:{...data.subContractors, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-24" value={r.to} onChange={e => { const n=[...data.subContractors.records]; n[i].to=e.target.value; setData({...data, subContractors:{...data.subContractors, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="number" className="h-8 text-xs w-20" value={r.maxWorkers} onChange={e => { const n=[...data.subContractors.records]; n[i].maxWorkers=e.target.value; setData({...data, subContractors:{...data.subContractors, records:n}})}} /></td>
                          <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, subContractors: { ...d.subContractors, records: d.subContractors.records.filter((_, idx) => idx !== i) } }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h3 className="text-sm font-bold text-[#0d9488]">D. Employee Master Data — Form A</h3>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Upload Master Data:</span><FileUploader multiple={false} files={data.employees.doc ? [data.employees.doc] : []} onAdd={f => setData(d => ({ ...d, employees: { ...d.employees, doc: f[0] } }))} onRemove={() => setData(d => ({ ...d, employees: { ...d.employees, doc: null } }))} /></div>
                    </div>
                    <TableWrapper headers={['Code','Name','Gender','DOB','Edu','DOJ','Desig','Type','Mobile','Aadhaar','Bank Acc','Remarks','']} onAdd={() => setData(d => ({ ...d, employees: { ...d.employees, records: [...d.employees.records, { id: Date.now().toString(), empCode:'', name:'', surname:'', gender:'', fatherSpouse:'', dob:'', nationality:'', edu:'', doj:'', designation:'', category:'', address:'', empType:'', mobile:'', uan:'', pan:'', esic:'', lwf:'', aadhaar:'', bankAcc:'', ifsc:'', presentAddr:'', permAddr:'', serviceBook:'', exitDate:'', exitReason:'', mark:'', sign:'', remarks:'' }] } }))}>
                      {data.employees.records.map((r, i) => (
                        <tr key={r.id}>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-16" value={r.empCode} onChange={e => { const n=[...data.employees.records]; n[i].empCode=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.name} onChange={e => { const n=[...data.employees.records]; n[i].name=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-12" value={r.gender} onChange={e => { const n=[...data.employees.records]; n[i].gender=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-7 text-[10px] w-20" value={r.dob} onChange={e => { const n=[...data.employees.records]; n[i].dob=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-16" value={r.edu} onChange={e => { const n=[...data.employees.records]; n[i].edu=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-7 text-[10px] w-20" value={r.doj} onChange={e => { const n=[...data.employees.records]; n[i].doj=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.designation} onChange={e => { const n=[...data.employees.records]; n[i].designation=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-16" value={r.empType} onChange={e => { const n=[...data.employees.records]; n[i].empType=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.mobile} onChange={e => { const n=[...data.employees.records]; n[i].mobile=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.aadhaar} onChange={e => { const n=[...data.employees.records]; n[i].aadhaar=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.bankAcc} onChange={e => { const n=[...data.employees.records]; n[i].bankAcc=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.remarks} onChange={e => { const n=[...data.employees.records]; n[i].remarks=e.target.value; setData({...data, employees:{...data.employees, records:n}})}} /></td>
                          <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, employees: { ...d.employees, records: d.employees.records.filter((_, idx) => idx !== i) } }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h3 className="text-sm font-bold text-[#0d9488]">E. Wages & Records</h3>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Upload Wages:</span><FileUploader multiple={false} files={data.wages.doc ? [data.wages.doc] : []} onAdd={f => setData(d => ({ ...d, wages: { ...d.wages, doc: f[0] } }))} onRemove={() => setData(d => ({ ...d, wages: { ...d.wages, doc: null } }))} /></div>
                    </div>
                    <TableWrapper headers={['Name','Rate','Days','Basic','OT','Total','PF','ESIC','Net','Receipt/Bank','Date Paid','']} onAdd={() => setData(d => ({ ...d, wages: { ...d.wages, records: [...d.wages.records, { id: Date.now().toString(), name:'', wageRate:'', days:'', otHours:'', basic:'', specialBasic:'', da:'', payOt:'', hra:'', others:'', total:'', pf:'', esic:'', society:'', incomeTax:'', insurance:'', otherRecov:'', totalRecov:'', net:'', empShare:'', pfWelfare:'', receipt:'', payDate:'', remarks:'' }] } }))}>
                      {data.wages.records.map((r, i) => (
                        <tr key={r.id}>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.name} onChange={e => { const n=[...data.wages.records]; n[i].name=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-12" value={r.wageRate} onChange={e => { const n=[...data.wages.records]; n[i].wageRate=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-12" value={r.days} onChange={e => { const n=[...data.wages.records]; n[i].days=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-16" value={r.basic} onChange={e => { const n=[...data.wages.records]; n[i].basic=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-12" value={r.otHours} onChange={e => { const n=[...data.wages.records]; n[i].otHours=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-16" value={r.total} onChange={e => { const n=[...data.wages.records]; n[i].total=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-12" value={r.pf} onChange={e => { const n=[...data.wages.records]; n[i].pf=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-12" value={r.esic} onChange={e => { const n=[...data.wages.records]; n[i].esic=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-16" value={r.net} onChange={e => { const n=[...data.wages.records]; n[i].net=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.receipt} onChange={e => { const n=[...data.wages.records]; n[i].receipt=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-7 text-[10px] w-20" value={r.payDate} onChange={e => { const n=[...data.wages.records]; n[i].payDate=e.target.value; setData({...data, wages:{...data.wages, records:n}})}} /></td>
                          <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, wages: { ...d.wages, records: d.wages.records.filter((_, idx) => idx !== i) } }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">F. Attendance Register</h3>
                    <TableWrapper headers={['Date','Daily Attendance','Attendance Records','']} onAdd={() => setData(d => ({ ...d, attendance: [...d.attendance, { id: Date.now().toString(), date:'', daily:'', records:'' }] }))}>
                      {data.attendance.map((a, i) => (
                        <tr key={a.id}>
                          <td className="p-2 border-b"><Input type="date" className="h-8 text-xs" value={a.date} onChange={e => { const n=[...data.attendance]; n[i].date=e.target.value; setData({...data, attendance:n})}} /></td>
                          <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={a.daily} onChange={e => { const n=[...data.attendance]; n[i].daily=e.target.value; setData({...data, attendance:n})}} /></td>
                          <td className="p-2 border-b"><Input className="h-8 text-xs" value={a.records} onChange={e => { const n=[...data.attendance]; n[i].records=e.target.value; setData({...data, attendance:n})}} /></td>
                          <td className="p-2 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, attendance: d.attendance.filter((_, idx) => idx !== i) }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">G. Labour Profile</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {['gender','skill','origin','age','source'].map((key) => (
                      <div key={key} className="border rounded p-2 bg-slate-50">
                        <p className="text-xs font-semibold capitalize mb-2">{key}</p>
                        <table className="w-full text-xs">
                          <tbody>
                            {(data.profile as any)[key].map((r: SummaryRow, i: number) => (
                              <tr key={r.row}><td className="p-1 border-b font-medium">{r.row}</td><td className="p-1 border-b"><Input className="h-7 text-xs w-16" value={r.a} onChange={e => { const n=[...(data.profile as any)[key]]; n[i].a=e.target.value; setData({...data, profile:{...data.profile, [key]:n}})}} /></td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h3 className="text-sm font-bold text-[#0d9488]">H. Overtime Register</h3>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Upload OT:</span><FileUploader multiple={false} files={data.overtime.doc ? [data.overtime.doc] : []} onAdd={f => setData(d => ({ ...d, overtime: { ...d.overtime, doc: f[0] } }))} onRemove={() => setData(d => ({ ...d, overtime: { ...d.overtime, doc: null } }))} /></div>
                    </div>
                    <TableWrapper headers={['Name','Desig','Dates OT','Total OT','Norm Rate','OT Rate','Earnings','Date Paid','']} onAdd={() => setData(d => ({ ...d, overtime: { ...d.overtime, records: [...d.overtime.records, { id: Date.now().toString(), name:'', fatherHusband:'', gender:'', desig:'', datesOt:'', totalOt:'', normalRate:'', otRate:'', otEarnings:'', datePaid:'', remarks:'' }] } }))}>
                      {data.overtime.records.map((r, i) => (
                        <tr key={r.id}>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-20" value={r.name} onChange={e => { const n=[...data.overtime.records]; n[i].name=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-20" value={r.desig} onChange={e => { const n=[...data.overtime.records]; n[i].desig=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={r.datesOt} onChange={e => { const n=[...data.overtime.records]; n[i].datesOt=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-16" value={r.totalOt} onChange={e => { const n=[...data.overtime.records]; n[i].totalOt=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-16" value={r.normalRate} onChange={e => { const n=[...data.overtime.records]; n[i].normalRate=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-16" value={r.otRate} onChange={e => { const n=[...data.overtime.records]; n[i].otRate=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-20" value={r.otEarnings} onChange={e => { const n=[...data.overtime.records]; n[i].otEarnings=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-24" value={r.datePaid} onChange={e => { const n=[...data.overtime.records]; n[i].datePaid=e.target.value; setData({...data, overtime:{...data.overtime, records:n}})}} /></td>
                          <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, overtime: { ...d.overtime, records: d.overtime.records.filter((_, idx) => idx !== i) } }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h3 className="text-sm font-bold text-[#0d9488]">I. Loan & Recovery Register</h3>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Upload Register:</span><FileUploader multiple={false} files={data.recovery.doc ? [data.recovery.doc] : []} onAdd={f => setData(d => ({ ...d, recovery: { ...d.recovery, doc: f[0] } }))} onRemove={() => setData(d => ({ ...d, recovery: { ...d.recovery, doc: null } }))} /></div>
                    </div>
                    <TableWrapper headers={['Name','Recovery Type','Amount','Instalments','First Month','Last Month','Complete Date','']} onAdd={() => setData(d => ({ ...d, recovery: { ...d.recovery, records: [...d.recovery.records, { id: Date.now().toString(), name:'', recType:'', particulars:'', damageDate:'', amount:'', showCause:'', explHeard:'', instalments:'', firstMonth:'', lastMonth:'', dateComplete:'', remarks:'' }] } }))}>
                      {data.recovery.records.map((r, i) => (
                        <tr key={r.id}>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={r.name} onChange={e => { const n=[...data.recovery.records]; n[i].name=e.target.value; setData({...data, recovery:{...data.recovery, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={r.recType} onChange={e => { const n=[...data.recovery.records]; n[i].recType=e.target.value; setData({...data, recovery:{...data.recovery, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-20" value={r.amount} onChange={e => { const n=[...data.recovery.records]; n[i].amount=e.target.value; setData({...data, recovery:{...data.recovery, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="number" className="h-8 text-xs w-16" value={r.instalments} onChange={e => { const n=[...data.recovery.records]; n[i].instalments=e.target.value; setData({...data, recovery:{...data.recovery, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="month" className="h-8 text-xs w-24" value={r.firstMonth} onChange={e => { const n=[...data.recovery.records]; n[i].firstMonth=e.target.value; setData({...data, recovery:{...data.recovery, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="month" className="h-8 text-xs w-24" value={r.lastMonth} onChange={e => { const n=[...data.recovery.records]; n[i].lastMonth=e.target.value; setData({...data, recovery:{...data.recovery, records:n}})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-24" value={r.dateComplete} onChange={e => { const n=[...data.recovery.records]; n[i].dateComplete=e.target.value; setData({...data, recovery:{...data.recovery, records:n}})}} /></td>
                          <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, recovery: { ...d.recovery, records: d.recovery.records.filter((_, idx) => idx !== i) } }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">J. Wage Slip</h3>
                    <FileUploader files={data.wageSlips} onAdd={f => setData(d => ({ ...d, wageSlips: [...d.wageSlips, ...f] }))} onRemove={i => setData(d => ({ ...d, wageSlips: d.wageSlips.filter((_, idx) => idx !== i) }))} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">K. Key Gaps & Corrective Actions</h3>
                    <TableWrapper headers={['Gap Identified','Recommendation','Responsible','Target Date','Status','']} onAdd={() => setData(d => ({ ...d, gaps: [...d.gaps, { id: Date.now().toString(), gap:'', rec:'', responsible:'', targetDate:'', status:'' }] }))}>
                      {data.gaps.map((g, i) => (
                        <tr key={g.id}>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={g.gap} onChange={e => { const n=[...data.gaps]; n[i].gap=e.target.value; setData({...data, gaps:n})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={g.rec} onChange={e => { const n=[...data.gaps]; n[i].rec=e.target.value; setData({...data, gaps:n})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={g.responsible} onChange={e => { const n=[...data.gaps]; n[i].responsible=e.target.value; setData({...data, gaps:n})}} /></td>
                          <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-24" value={g.targetDate} onChange={e => { const n=[...data.gaps]; n[i].targetDate=e.target.value; setData({...data, gaps:n})}} /></td>
                          <td className="p-1 border-b"><Input className="h-8 text-xs w-20" value={g.status} onChange={e => { const n=[...data.gaps]; n[i].status=e.target.value; setData({...data, gaps:n})}} /></td>
                          <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, gaps: d.gaps.filter((_, idx) => idx !== i) }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                        </tr>
                      ))}
                    </TableWrapper>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50 text-center">
                    <ClipboardList className="h-12 w-12 text-[#0d9488] mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Submit?</h3>
                    <p className="text-sm text-slate-500 max-w-md">You are about to submit the Labour Law Compliance report.</p>
                    <div className="mt-8 flex gap-4">
                      <Button variant="outline" className="px-8" onClick={() => setStep(0)}>Review Form</Button>
                      <Button className="px-8 bg-[#0d9488] hover:bg-[#0f766e]" onClick={() => handleSave(false)}><Send className="h-4 w-4 mr-2" /> Submit Report</Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-white dark:bg-slate-950 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setStep(s => Math.max(0, s - 1))} className="gap-1.5">
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
                <Button type="button" size="sm" onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5">
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
