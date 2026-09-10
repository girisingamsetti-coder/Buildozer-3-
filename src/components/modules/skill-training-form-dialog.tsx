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
  'Setup & Summary',
  'Skill Distribution',
  'Worker Logs',
  'Vacancies',
  'Review & Submit'
]
const STORAGE_KEY = 'skill-training-submissions'

const SKILL_SETS = [
  'Front Office Assistance','Masonry','Electrician','Driver','Fitter','Security','House Keeping',
  'Welder','Operator','Carpentry','Surveyor','Painter','Driller','Food Processing','Bar Bender',
  'Foreman','Gardener','Chipper','First Aid','Wheel Load Operator','Mechanic','Plumber',
  'Scaffolder','Gas Cutter','Rigger','Others'
]

export interface UFile { name: string; size: number; type: string; dataUrl: string }

export interface SummaryRow { male: string; female: string; total: string }
export interface SkillRow { skillSet: string; male: string; female: string; total: string }
export interface WorkerLog { id: string; name: string; soDo: string; gender: string; role: string; dob: string; aadhaar: string; address: string; village: string; mandal: string; district: string; doe: string; contact: string }
export interface VacancyLog { id: string; role: string; ageLimit: string; qualification: string; exp: string; vacancies: string; salary: string }

export interface SkillTrainingSubmission {
  id: string; projectName: string; reportingMonth: string; projectNumber: string; projectTitle: string; manager: string; customer: string; boq: string; boqDesc: string; createdDate: string
  employment: { total: SummaryRow; local: SummaryRow }
  localTypes: { highlySkilled: SummaryRow; skilled: SummaryRow; semiSkilled: SummaryRow; unskilled: SummaryRow }
  skillSets: SkillRow[]
  employedDetails: { records: WorkerLog[]; doc: UFile | null }
  trainedDetails: { records: WorkerLog[]; doc: UFile | null }
  vacancies: { staff: VacancyLog[]; workers: VacancyLog[] }
  status: 'Draft' | 'Submitted' | 'Returned' | 'Approved'
  submittedAt?: string
}

export function loadSkillTrainingSubmissions(): SkillTrainingSubmission[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
export function saveSkillTrainingSubmissions(data: SkillTrainingSubmission[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function emptySum(): SummaryRow { return { male: '', female: '', total: '' } }

function initData(): Omit<SkillTrainingSubmission, 'id' | 'projectName' | 'reportingMonth' | 'projectNumber' | 'projectTitle' | 'manager' | 'customer' | 'boq' | 'boqDesc' | 'createdDate' | 'status' | 'submittedAt'> {
  return {
    employment: { total: emptySum(), local: emptySum() },
    localTypes: { highlySkilled: emptySum(), skilled: emptySum(), semiSkilled: emptySum(), unskilled: emptySum() },
    skillSets: SKILL_SETS.map(s => ({ skillSet: s, male: '', female: '', total: '' })),
    employedDetails: { records: [], doc: null },
    trainedDetails: { records: [], doc: null },
    vacancies: { staff: [], workers: [] }
  }
}

function FileUploader({ files, onAdd, onRemove, accept, multiple = true }: { files: UFile[], onAdd: (fs: UFile[]) => void, onRemove: (idx: number) => void, accept?: string, multiple?: boolean }) {
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
          <input ref={ref} type="file" multiple={multiple} accept={accept} className="hidden" onChange={handleChange} />
        </div>
      )}
    </div>
  )
}

export default function SkillTrainingFormDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const [step, setStep] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [reportMonth, setReportMonth] = useState(MONTHS[new Date().getMonth()])
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString())
  const [data, setData] = useState(initData())
  const project = AMARAVATI_PROJECTS.find(p => p.id === selectedProjectId)

  const handleSave = (isDraft: boolean) => {
    if (!project) { toast.error('Select a project first'); return }
    const sub: SkillTrainingSubmission = {
      id: `sk-${Date.now()}`, projectName: project.name, reportingMonth: `${reportMonth} ${reportYear}`,
      projectNumber: project.id, projectTitle: project.name, manager: project.manager, customer: project.customer,
      boq: 'BOQ-4599-22', boqDesc: 'Standard Phase 1 Construction', createdDate: new Date().toISOString().split('T')[0],
      ...data, status: isDraft ? 'Draft' : 'Submitted', submittedAt: isDraft ? undefined : new Date().toISOString()
    }
    const all = loadSkillTrainingSubmissions(); all.unshift(sub); saveSkillTrainingSubmissions(all)
    toast.success(isDraft ? 'Draft Saved' : 'Successfully Submitted')
    onSaved(); onOpenChange(false)
  }

  const renderSumRow = (obj: any, key: string, label: string) => (
    <tr key={key}>
      <td className="p-2 border-b font-medium">{label}</td>
      <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={obj[key].male} onChange={e => { const v=e.target.value; setData(d => ({ ...d, [obj===data.employment?'employment':'localTypes']: { ...obj, [key]: { ...obj[key], male: v, total: String(Number(v||0)+Number(obj[key].female||0)) } } })) }} /></td>
      <td className="p-2 border-b"><Input type="number" className="h-8 text-xs w-24" value={obj[key].female} onChange={e => { const v=e.target.value; setData(d => ({ ...d, [obj===data.employment?'employment':'localTypes']: { ...obj, [key]: { ...obj[key], female: v, total: String(Number(v||0)+Number(obj[key].male||0)) } } })) }} /></td>
      <td className="p-2 border-b font-bold bg-slate-50 text-center">{obj[key].total}</td>
    </tr>
  )

  const addWorker = (type: 'employedDetails'|'trainedDetails') => setData(d => ({ ...d, [type]: { ...d[type], records: [...d[type].records, { id: Date.now().toString(), name: '', soDo: '', gender: '', role: '', dob: '', aadhaar: '', address: '', village: '', mandal: '', district: '', doe: '', contact: '' }] } }))
  const rmWorker = (type: 'employedDetails'|'trainedDetails', i: number) => setData(d => ({ ...d, [type]: { ...d[type], records: d[type].records.filter((_, idx) => idx !== i) } }))

  const addVac = (type: 'staff'|'workers') => setData(d => ({ ...d, vacancies: { ...d.vacancies, [type]: [...d.vacancies[type], { id: Date.now().toString(), role: '', ageLimit: '', qualification: '', exp: '', vacancies: '', salary: '' }] } }))
  const rmVac = (type: 'staff'|'workers', i: number) => setData(d => ({ ...d, vacancies: { ...d.vacancies, [type]: d.vacancies[type].filter((_, idx) => idx !== i) } }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] xl:w-[1200px] max-w-[1300px] h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50">
        <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b">
          <div>
            <DialogTitle className="text-xl font-bold text-slate-800">Skill Training & Employment</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">Monthly report on worker employment, skills, and vacancies.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="secondary" className="gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200" onClick={() => handleSave(true)}><Save className="h-4 w-4" /> Save Draft</Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 lg:w-64 shrink-0 bg-slate-100/50 border-r flex flex-col p-3 lg:p-4 gap-1.5 lg:gap-2 overflow-y-auto">
            {STEPS.map((t, i) => (
              <button key={i} onClick={() => setStep(i)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left", step === i ? "bg-[#0d9488] text-white" : "text-slate-600 hover:bg-slate-200/50")}>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0", step === i ? "bg-white/20" : (step > i ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"))}>
                  {step > i ? <CheckCircle2 className="h-4 w-4" /> : (i + 1)}
                </div>{t}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              
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
                    <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">A. Employment Details of Workers</h3>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-xs min-w-[400px]">
                        <thead className="bg-muted/40"><tr><th className="p-2 text-left">Category</th><th className="p-2 text-left">Male</th><th className="p-2 text-left">Female</th><th className="p-2 text-left">Total</th></tr></thead>
                        <tbody>{renderSumRow(data.employment, 'total', 'Total Workers Employed')}{renderSumRow(data.employment, 'local', 'Local Workers Employed')}</tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">B. Type of Local Workers Employed</h3>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-xs min-w-[400px]">
                        <thead className="bg-muted/40"><tr><th className="p-2 text-left">Category</th><th className="p-2 text-left">Male</th><th className="p-2 text-left">Female</th><th className="p-2 text-left">Total</th></tr></thead>
                        <tbody>
                          {renderSumRow(data.localTypes, 'highlySkilled', 'Highly Skilled')}
                          {renderSumRow(data.localTypes, 'skilled', 'Skilled')}
                          {renderSumRow(data.localTypes, 'semiSkilled', 'Semi Skilled')}
                          {renderSumRow(data.localTypes, 'unskilled', 'Unskilled')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">C. Skill-set-wise Local Workers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {data.skillSets.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded bg-slate-50/50">
                        <span className="text-xs font-semibold w-40 truncate" title={s.skillSet}>{s.skillSet}{s.skillSet==='Others'?' — Specify':''}</span>
                        <div className="flex gap-2">
                          <Input type="number" placeholder="M" className="h-7 text-xs w-14" value={s.male} onChange={e => { const n=[...data.skillSets]; n[i].male=e.target.value; n[i].total=String(Number(e.target.value||0)+Number(n[i].female||0)); setData({...data, skillSets:n})}} />
                          <Input type="number" placeholder="F" className="h-7 text-xs w-14" value={s.female} onChange={e => { const n=[...data.skillSets]; n[i].female=e.target.value; n[i].total=String(Number(e.target.value||0)+Number(n[i].male||0)); setData({...data, skillSets:n})}} />
                          <div className="h-7 w-12 flex items-center justify-center font-bold text-xs bg-slate-200 rounded">{s.total || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {['employedDetails','trainedDetails'].map((key) => {
                    const isEmp = key === 'employedDetails'
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                          <h3 className="text-sm font-bold text-[#0d9488]">{isEmp ? 'D. Details of Local Workers Employed' : 'E. Local Workers Trained & Employed'}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Upload Details:</span>
                            <FileUploader multiple={false} files={(data as any)[key].doc ? [(data as any)[key].doc] : []} onAdd={f => setData(d => ({ ...d, [key]: { ...(d as any)[key], doc: f[0] } }))} onRemove={() => setData(d => ({ ...d, [key]: { ...(d as any)[key], doc: null } }))} />
                          </div>
                        </div>
                        <div className="border rounded-md overflow-x-auto mb-2">
                          <table className="w-full text-xs min-w-[850px]">
                            <thead className="bg-muted/40">
                              <tr>
                                {['S.No','Name','S/o / D/o','Gender','Role','DOB','Aadhaar','Address','Village','Mandal','District','DOE','Contact',''].map((h, i) => <th key={i} className="p-2 text-left font-semibold border-b whitespace-nowrap">{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {(data as any)[key].records.map((r: WorkerLog, i: number) => (
                                <tr key={r.id}>
                                  <td className="p-2 border-b text-center">{i+1}</td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-24" value={r.name} onChange={e => { const n=[...(data as any)[key].records]; n[i].name=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-24" value={r.soDo} onChange={e => { const n=[...(data as any)[key].records]; n[i].soDo=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b">
                                    <Select value={r.gender} onValueChange={v => { const n=[...(data as any)[key].records]; n[i].gender=v; setData({...data, [key]:{...(data as any)[key], records:n}})}}>
                                      <SelectTrigger className="h-7 text-[10px] w-16 px-1"><SelectValue/></SelectTrigger>
                                      <SelectContent><SelectItem value="M">M</SelectItem><SelectItem value="F">F</SelectItem></SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.role} onChange={e => { const n=[...(data as any)[key].records]; n[i].role=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input type="date" className="h-7 text-[10px] w-24" value={r.dob} onChange={e => { const n=[...(data as any)[key].records]; n[i].dob=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-24" value={r.aadhaar} onChange={e => { const n=[...(data as any)[key].records]; n[i].aadhaar=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-24" value={r.address} onChange={e => { const n=[...(data as any)[key].records]; n[i].address=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.village} onChange={e => { const n=[...(data as any)[key].records]; n[i].village=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.mandal} onChange={e => { const n=[...(data as any)[key].records]; n[i].mandal=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-20" value={r.district} onChange={e => { const n=[...(data as any)[key].records]; n[i].district=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input type="date" className="h-7 text-[10px] w-24" value={r.doe} onChange={e => { const n=[...(data as any)[key].records]; n[i].doe=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Input className="h-7 text-[10px] w-24" value={r.contact} onChange={e => { const n=[...(data as any)[key].records]; n[i].contact=e.target.value; setData({...data, [key]:{...(data as any)[key], records:n}})}} /></td>
                                  <td className="p-1 border-b"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => rmWorker(key as any, i)}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => addWorker(key as any)} className="h-7 text-xs border-dashed"><Plus className="h-3 w-3 mr-1"/> Add Worker Record</Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {['staff','workers'].map((key) => (
                    <div key={key}>
                      <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">{key === 'staff' ? 'F. Staff Vacancies' : 'G. Workers Vacancies'}</h3>
                      <div className="border rounded-md overflow-x-auto mb-2">
                        <table className="w-full text-xs min-w-[700px]">
                          <thead className="bg-muted/40">
                            <tr>{['S.No','Job Role','Age Limit','Qualification','Experience','No. of Vacancies','Salary Range',''].map((h, i) => <th key={i} className="p-2 text-left font-semibold border-b whitespace-nowrap">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {(data.vacancies as any)[key].map((v: VacancyLog, i: number) => (
                              <tr key={v.id}>
                                <td className="p-2 border-b text-center">{i+1}</td>
                                <td className="p-1 border-b"><Input className="h-8 text-xs" value={v.role} onChange={e => { const n=[...(data.vacancies as any)[key]]; n[i].role=e.target.value; setData({...data, vacancies:{...data.vacancies, [key]:n}})}} /></td>
                                <td className="p-1 border-b"><Input className="h-8 text-xs" value={v.ageLimit} onChange={e => { const n=[...(data.vacancies as any)[key]]; n[i].ageLimit=e.target.value; setData({...data, vacancies:{...data.vacancies, [key]:n}})}} /></td>
                                <td className="p-1 border-b"><Input className="h-8 text-xs" value={v.qualification} onChange={e => { const n=[...(data.vacancies as any)[key]]; n[i].qualification=e.target.value; setData({...data, vacancies:{...data.vacancies, [key]:n}})}} /></td>
                                <td className="p-1 border-b"><Input className="h-8 text-xs" value={v.exp} onChange={e => { const n=[...(data.vacancies as any)[key]]; n[i].exp=e.target.value; setData({...data, vacancies:{...data.vacancies, [key]:n}})}} /></td>
                                <td className="p-1 border-b"><Input type="number" className="h-8 text-xs" value={v.vacancies} onChange={e => { const n=[...(data.vacancies as any)[key]]; n[i].vacancies=e.target.value; setData({...data, vacancies:{...data.vacancies, [key]:n}})}} /></td>
                                <td className="p-1 border-b"><Input className="h-8 text-xs" value={v.salary} onChange={e => { const n=[...(data.vacancies as any)[key]]; n[i].salary=e.target.value; setData({...data, vacancies:{...data.vacancies, [key]:n}})}} /></td>
                                <td className="p-1 border-b"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => rmVac(key as any, i)}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => addVac(key as any)} className="h-7 text-xs border-dashed"><Plus className="h-3 w-3 mr-1"/> Add Vacancy</Button>
                    </div>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50 text-center">
                    <ClipboardList className="h-12 w-12 text-[#0d9488] mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Submit?</h3>
                    <p className="text-sm text-slate-500 max-w-md">You are about to submit the Skill Training & Employment report.</p>
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

        <div className="shrink-0 px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="gap-2"><ChevronLeft className="h-4 w-4" /> Previous</Button>
          <div className="flex gap-1.5">{STEPS.map((_, i) => <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", step === i ? "w-8 bg-[#0d9488]" : "w-2 bg-slate-200")} />)}</div>
          <Button onClick={step === STEPS.length - 1 ? () => handleSave(false) : () => setStep(s => Math.min(STEPS.length - 1, s + 1))} className={cn("gap-2 text-white", step === STEPS.length - 1 ? "bg-[#0d9488] hover:bg-[#0f766e]" : "bg-slate-800 hover:bg-slate-700")}>
            {step === STEPS.length - 1 ? 'Submit' : 'Next Step'} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
