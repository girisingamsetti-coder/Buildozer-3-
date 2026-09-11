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
  'Setup & GBV Details',
  'GBV Awareness Training',
  'Key Gaps',
  'Review & Submit'
]
const STORAGE_KEY = 'gender-submissions'

export interface UFile { name: string; size: number; type: string; dataUrl: string }

export interface GbvDetail { id: string; date: string; time: string; location: string; nature: string; status: string; doc: UFile | null }
export interface Training { id: string; topic: string; date: string; trainedBy: string; participants: string; doc: UFile | null }
export interface Gap { id: string; gap: string; rec: string; responsible: string; targetDate: string; status: string }

export interface GenderSubmission {
  id: string; projectName: string; reportingMonth: string; projectNumber: string; projectTitle: string; manager: string; customer: string; boq: string; boqDesc: string; createdDate: string
  gbvInstances: 'Yes' | 'No' | ''
  gbvDetails: GbvDetail[]
  trainings: Training[]
  gaps: Gap[]
  status: 'Draft' | 'Submitted' | 'Returned' | 'Approved'
  submittedAt?: string
}

export function loadGenderSubmissions(): GenderSubmission[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
export function saveGenderSubmissions(data: GenderSubmission[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function initData(): Omit<GenderSubmission, 'id' | 'projectName' | 'reportingMonth' | 'projectNumber' | 'projectTitle' | 'manager' | 'customer' | 'boq' | 'boqDesc' | 'createdDate' | 'status' | 'submittedAt'> {
  return {
    gbvInstances: '',
    gbvDetails: [],
    trainings: [],
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
      <div className="border rounded-md overflow-x-auto"><table className="w-full text-xs min-w-[550px]"><thead className="bg-muted/40"><tr>{headers.map((h, i) => <th key={i} className="p-2 text-left font-semibold border-b whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
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

export default function GenderFormDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const [step, setStep] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [reportMonth, setReportMonth] = useState(MONTHS[new Date().getMonth()])
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString())
  const [data, setData] = useState(initData())
  const project = AMARAVATI_PROJECTS.find(p => p.id === selectedProjectId)

  const handleSave = (isDraft: boolean) => {
    if (!project) { toast.error('Select a project first'); return }
    const sub: GenderSubmission = {
      id: `gen-${Date.now()}`, projectName: project.name, reportingMonth: `${reportMonth} ${reportYear}`,
      projectNumber: project.id, projectTitle: project.name, manager: project.manager, customer: project.customer,
      boq: 'BOQ-4599-22', boqDesc: 'Standard Phase 1 Construction', createdDate: new Date().toISOString().split('T')[0],
      ...data, status: isDraft ? 'Draft' : 'Submitted', submittedAt: isDraft ? undefined : new Date().toISOString()
    }
    const all = loadGenderSubmissions(); all.unshift(sub); saveGenderSubmissions(all)
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
            Gender & GBV Compliance
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 sm:px-8 py-4 border-b shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto">
            <StepProgress current={step} steps={STEPS} />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 px-7 sm:px-8 py-6">
            <div className="max-w-4xl mx-auto space-y-8">
              
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
                    <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">A. GBV Details</h3>
                    <div className="mb-6 space-y-2">
                      <Label>Any Instances of Gender-Based Violence (GBV)?</Label>
                      <Select value={data.gbvInstances} onValueChange={v => setData({...data, gbvInstances: v as any})}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Yes / No" /></SelectTrigger>
                        <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                      </Select>
                    </div>
                    {data.gbvInstances === 'Yes' && (
                      <TableWrapper headers={['Date','Time','Location','Nature of Incident','Status of Incident','Upload','']} onAdd={() => setData(d => ({ ...d, gbvDetails: [...d.gbvDetails, { id: Date.now().toString(), date:'', time:'', location:'', nature:'', status:'', doc:null }] }))} addLabel="Add Incident">
                        {data.gbvDetails.map((g, i) => (
                          <tr key={g.id}>
                            <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-28" value={g.date} onChange={e => { const n=[...data.gbvDetails]; n[i].date=e.target.value; setData({...data, gbvDetails:n})}} /></td>
                            <td className="p-1 border-b"><Input type="time" className="h-8 text-xs w-24" value={g.time} onChange={e => { const n=[...data.gbvDetails]; n[i].time=e.target.value; setData({...data, gbvDetails:n})}} /></td>
                            <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={g.location} onChange={e => { const n=[...data.gbvDetails]; n[i].location=e.target.value; setData({...data, gbvDetails:n})}} /></td>
                            <td className="p-1 border-b">
                              <Select value={g.nature} onValueChange={v => { const n=[...data.gbvDetails]; n[i].nature=v; setData({...data, gbvDetails:n})}}>
                                <SelectTrigger className="h-8 text-xs w-28"><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="Physical">Physical</SelectItem><SelectItem value="Mental">Mental</SelectItem><SelectItem value="Sexual">Sexual</SelectItem></SelectContent>
                              </Select>
                            </td>
                            <td className="p-1 border-b">
                              <Select value={g.status} onValueChange={v => { const n=[...data.gbvDetails]; n[i].status=v; setData({...data, gbvDetails:n})}}>
                                <SelectTrigger className="h-8 text-xs w-48"><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="Reported to Police">Reported to Police</SelectItem><SelectItem value="Referred to GBV Service Provider">Referred to GBV Service Provider</SelectItem></SelectContent>
                              </Select>
                            </td>
                            <td className="p-1 border-b min-w-[120px]"><FileUploader multiple={false} files={g.doc ? [g.doc] : []} onAdd={fl => { const n=[...data.gbvDetails]; n[i].doc=fl[0]; setData({...data, gbvDetails:n})}} onRemove={() => { const n=[...data.gbvDetails]; n[i].doc=null; setData({...data, gbvDetails:n})}} /></td>
                            <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, gbvDetails: d.gbvDetails.filter((_, idx) => idx !== i) }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                          </tr>
                        ))}
                      </TableWrapper>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">B. GBV Awareness Training</h3>
                  <TableWrapper headers={['S.No','Topic','Date','Trained By','Participants','Upload','']} onAdd={() => setData(d => ({ ...d, trainings: [...d.trainings, { id: Date.now().toString(), topic:'', date:'', trainedBy:'', participants:'', doc:null }] }))} addLabel="Add Training">
                    {data.trainings.map((t, i) => (
                      <tr key={t.id}>
                        <td className="p-2 border-b text-center">{i+1}</td>
                        <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={t.topic} onChange={e => { const n=[...data.trainings]; n[i].topic=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-28" value={t.date} onChange={e => { const n=[...data.trainings]; n[i].date=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={t.trainedBy} onChange={e => { const n=[...data.trainings]; n[i].trainedBy=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-1 border-b"><Input type="number" className="h-8 text-xs w-24" value={t.participants} onChange={e => { const n=[...data.trainings]; n[i].participants=e.target.value; setData({...data, trainings:n})}} /></td>
                        <td className="p-1 border-b min-w-[120px]"><FileUploader multiple={false} files={t.doc ? [t.doc] : []} onAdd={fl => { const n=[...data.trainings]; n[i].doc=fl[0]; setData({...data, trainings:n})}} onRemove={() => { const n=[...data.trainings]; n[i].doc=null; setData({...data, trainings:n})}} /></td>
                        <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, trainings: d.trainings.filter((_, idx) => idx !== i) }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                      </tr>
                    ))}
                  </TableWrapper>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-bold text-[#0d9488] mb-4 pb-2 border-b">C. Key Gaps & Corrective Actions</h3>
                  <TableWrapper headers={['Gap Identified','Recommendation','Responsible','Target Date','Status','']} onAdd={() => setData(d => ({ ...d, gaps: [...d.gaps, { id: Date.now().toString(), gap:'', rec:'', responsible:'', targetDate:'', status:'' }] }))}>
                    {data.gaps.map((g, i) => (
                      <tr key={g.id}>
                        <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={g.gap} onChange={e => { const n=[...data.gaps]; n[i].gap=e.target.value; setData({...data, gaps:n})}} /></td>
                        <td className="p-1 border-b"><Input className="h-8 text-xs w-32" value={g.rec} onChange={e => { const n=[...data.gaps]; n[i].rec=e.target.value; setData({...data, gaps:n})}} /></td>
                        <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={g.responsible} onChange={e => { const n=[...data.gaps]; n[i].responsible=e.target.value; setData({...data, gaps:n})}} /></td>
                        <td className="p-1 border-b"><Input type="date" className="h-8 text-xs w-28" value={g.targetDate} onChange={e => { const n=[...data.gaps]; n[i].targetDate=e.target.value; setData({...data, gaps:n})}} /></td>
                        <td className="p-1 border-b"><Input className="h-8 text-xs w-24" value={g.status} onChange={e => { const n=[...data.gaps]; n[i].status=e.target.value; setData({...data, gaps:n})}} /></td>
                        <td className="p-1 border-b w-8"><Button variant="ghost" size="icon" onClick={() => setData(d => ({ ...d, gaps: d.gaps.filter((_, idx) => idx !== i) }))}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
                      </tr>
                    ))}
                  </TableWrapper>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50 text-center">
                    <ClipboardList className="h-12 w-12 text-[#0d9488] mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Submit?</h3>
                    <p className="text-sm text-slate-500 max-w-md">You are about to submit the Gender & GBV Compliance report.</p>
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
