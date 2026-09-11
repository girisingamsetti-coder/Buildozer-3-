'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2, ChevronRight, ChevronLeft, Upload, X, FileText,
  Save, Send, ClipboardList, Plus, Trash2, Info, AlertTriangle,
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
const STEPS = ['Project & Setup','Statutory Compliance','Air Quality','Noise','Water & Wastewater','Soil, Muck & Trees','Waste & Training','Observations & Review']
const EVM_STORAGE_KEY = 'evm-submissions'

const EC_ROWS = ['Quarry – Gravel', 'Quarry – Stone', 'Sand Reach']
const CTE_CTO_ROWS = ['RMC Plant','Hot Mix Plant','WMM Plant','Crusher','Quarry – Gravel','Quarry – Stone','Sand Reach','STP']
const PERMISSION_ROWS = [
  'SGWB permission for extraction of groundwater for domestic usage',
  'PESO approval for DG set and fuel storage',
  'APWALTA permission for tree felling',
  'Submission of compliance reports to the clearances & consents obtained by the Contractor',
  'Submission of Annual Environmental Statement (Form V) to APPCB',
  'Blasting',
]
const AIR_LOCATIONS = ['AAQ1','AAQ2','AAQ3','AAQ4','AAQ5','AAQ6']
const AIR_MEASURE_ROWS = ['Labour Camp','Construction Site','Haulage Routes','Nearest Settlement Areas','Material Storage Yards','Vehicular Emissions','DG Stack Emissions','Vehicular Movement','RMC Plant','PPEs','Hot Mix Plant']
const NOISE_LOCATIONS = ['N1','N2','N3','DG Set']
const NOISE_MEASURE_ROWS = ['DG Sets','Construction Sites','Construction Vehicles','Equipment and Machinery','Sensitive Locations – Schools, Hospitals, Places of Worship','PPEs','Settlements','Labour Camps']
const WATER_ROWS = ['Construction & Associated Facilities','Domestic Requirements – Labour Camp / Project Site Office','Dust Suppression by Water Sprinkling']
const WW_SOURCE_ROWS = ['Labour Camps','Site Office','RMC Plant','Construction Site Runoffs','Kitchen','Mobile Toilets','Hot Mix Plant','WMM Plant']
const WW_TREATMENT_ROWS = ['Total Wastewater Generated','Total Wastewater Treated','Total Wastewater Reused','Total Sludge Generated','Total Sludge Disposed']
const SOIL_LOCATIONS = ['S1','S2','S3','S4','S5']
const MUCK_ROWS = ['Total Muck Generated','Muck Stored','Disposed Muck']
const MUCK_DISPOSAL_ROWS = ['Filling of Low-Lying Areas','Raise of Site Levels','Unutilized Muck']
const PERSONNEL_ROLES = ['Project Manager','Grievance Manager','OHS Manager','Environmental Engineer','Social & Labour Manager']
const WASTE_CATEGORIES = [
  { type: 'Food & Kitchen Waste', unit: 'Kg' },
  { type: 'Hazardous Waste – Used Lubricating Oil', unit: 'Liters' },
  { type: 'Hazardous Waste – Chemical & Admixture Barrels', unit: 'Nos.' },
  { type: 'Hazardous Waste – Grease Barrels', unit: 'Nos.' },
  { type: 'Hazardous Waste – Empty Paint/Solvent Tins', unit: 'Nos.' },
  { type: 'Hazardous Waste – Air Filters', unit: 'Nos.' },
  { type: 'Hazardous Waste – Oil Filters', unit: 'Nos.' },
  { type: 'Biomedical Waste', unit: 'Kg' },
  { type: 'C&D Waste', unit: 'Cum' },
  { type: 'Battery Waste – Used Lead-Acid Batteries', unit: 'Nos.' },
  { type: 'Recyclable Waste – Plastics', unit: 'Kg' },
  { type: 'Recyclable Waste – HDPE Cement Bags', unit: 'Nos.' },
  { type: 'Recyclable Waste – HDPE Bentonite Bags', unit: 'Nos.' },
  { type: 'E-Waste', unit: 'Kg' },
  { type: 'Other Waste', unit: 'Kg' },
]

// ==================== TYPES ====================

export interface UFile { name: string; size: number; type: string; dataUrl: string }
export type CompStatus = 'Yes' | 'No' | 'NA' | 'Applied' | null

export interface CompEntry { status: CompStatus; remarks: string; photos: UFile[]; reports: UFile[] }
export interface MeasureEntry { measures: string; photos: UFile[]; reports: UFile[]; remarks: string }
export interface QtyEntry { quantity: string; cumulative: string; sources: string; photos: UFile[]; reports: UFile[]; remarks: string }
export interface AirMonitor { locationName: string; gps: string; pm10: string; pm25: string; so2: string; nox: string; co: string; photos: UFile[]; report: UFile | null; remarks: string }
export interface NoiseMonitor { locationName: string; gps: string; leq: string; lmax: string; lmin: string; lday: string; lnight: string; photos: UFile[]; report: UFile | null; remarks: string }
export interface SoilMonitor { locationName: string; gps: string; ph: string; ec: string; oc: string; nitrogen: string; phosphorus: string; other: string; photos: UFile[]; report: UFile | null; remarks: string }
export interface Personnel { designation: string; name: string; contact: string; photo: UFile | null }
export interface WasteEntry { type: string; unit: string; status: CompStatus; remarksIfNo: string; qtyGen: string; qtyDisp: string; cumGen: string; cumDisp: string; disposalLoc: string; photos: UFile[]; mou: UFile[]; remarks: string }
export interface TrainingRecord { id: string; date: string; topic: string; skilledM: string; skilledF: string; semiM: string; semiF: string; unskilledM: string; unskilledF: string; photos: UFile[]; reports: UFile[]; attendance: UFile | null; remarks: string }
export interface ObsMetric { pmc: string; pgmc: string; other: string; otherSpec: string }

export interface EVMSubmission {
  id: string; projectName: string; reportingMonth: string
  projectNumber: string; projectTitle: string; manager: string; customer: string; boq: string; boqDesc: string; createdDate: string
  personnel: Personnel[]
  statutory: { ec: Record<string, CompEntry>; cte: Record<string, CompEntry>; cto: Record<string, CompEntry>; permissions: Record<string, CompEntry> }
  air: { monitoring: AirMonitor[]; moefcc: UFile | null; measures: Record<string, MeasureEntry> }
  noise: { monitoring: NoiseMonitor[]; measures: Record<string, MeasureEntry> }
  water: { consumption: Record<string, QtyEntry>; waterBodies: string; wbPhotos: UFile[]; dwReport: UFile | null; dwLocation: string; dwDate: string; dwRemarks: string }
  wastewater: { sources: Record<string, QtyEntry>; treatment: Record<string, QtyEntry>; qualityReport: UFile | null; treatmentSystem: string; reusePhotos: UFile[]; protectionMeasures: string; protectionPhotos: UFile[] }
  soil: { monitoring: SoilMonitor[]; management: Record<string, QtyEntry>; erosionConstruction: { details: string; photos: UFile[] }; erosionRoad: { details: string; photos: UFile[] }; erosionFlood: { details: string; photos: UFile[] } }
  muck: { quantities: Record<string, QtyEntry>; disposal: Record<string, QtyEntry> }
  trees: { identified: string; tocut: string; transplant: string; cumcut: string; cumtransplant: string; photos: UFile[]; reports: UFile[]; permits: UFile[]; remarks: string }
  waste: WasteEntry[]
  training: TrainingRecord[]
  observations: { given: ObsMetric; complied: ObsMetric; letters: ObsMetric; ncs: ObsMetric; complianceFile: UFile | null }
  status: 'Draft' | 'Submitted' | 'Pending PM Certification' | 'Pending PMC' | 'Pending PgMC' | 'Pending ESMU' | 'Returned' | 'Approved'
  submittedAt?: string
}

// ==================== STORAGE ====================

export function loadEVMSubmissions(): EVMSubmission[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(EVM_STORAGE_KEY) || '[]') } catch { return [] }
}
export function saveEVMSubmissions(data: EVMSubmission[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(EVM_STORAGE_KEY, JSON.stringify(data))
}

// ==================== HELPERS ====================

function emptyComp(): CompEntry { return { status: null, remarks: '', photos: [], reports: [] } }
function emptyMeasure(): MeasureEntry { return { measures: '', photos: [], reports: [], remarks: '' } }
function emptyQty(): QtyEntry { return { quantity: '', cumulative: '', sources: '', photos: [], reports: [], remarks: '' } }
function emptyAirMon(): AirMonitor { return { locationName: '', gps: '', pm10: '', pm25: '', so2: '', nox: '', co: '', photos: [], report: null, remarks: '' } }
function emptyNoiseMon(): NoiseMonitor { return { locationName: '', gps: '', leq: '', lmax: '', lmin: '', lday: '', lnight: '', photos: [], report: null, remarks: '' } }
function emptySoilMon(): SoilMonitor { return { locationName: '', gps: '', ph: '', ec: '', oc: '', nitrogen: '', phosphorus: '', other: '', photos: [], report: null, remarks: '' } }
function emptyObs(): ObsMetric { return { pmc: '', pgmc: '', other: '', otherSpec: '' } }

function initEVMData(): Omit<EVMSubmission, 'id' | 'projectName' | 'reportingMonth' | 'projectNumber' | 'projectTitle' | 'manager' | 'customer' | 'boq' | 'boqDesc' | 'createdDate' | 'status' | 'submittedAt'> {
  return {
    personnel: PERSONNEL_ROLES.map(d => ({ designation: d, name: '', contact: '', photo: null })),
    statutory: {
      ec: Object.fromEntries(EC_ROWS.map(r => [r, emptyComp()])),
      cte: Object.fromEntries(CTE_CTO_ROWS.map(r => [r, emptyComp()])),
      cto: Object.fromEntries(CTE_CTO_ROWS.map(r => [r, emptyComp()])),
      permissions: Object.fromEntries(PERMISSION_ROWS.map(r => [r, emptyComp()])),
    },
    air: {
      monitoring: AIR_LOCATIONS.map(() => emptyAirMon()),
      moefcc: null,
      measures: Object.fromEntries(AIR_MEASURE_ROWS.map(r => [r, emptyMeasure()])),
    },
    noise: {
      monitoring: NOISE_LOCATIONS.map(() => emptyNoiseMon()),
      measures: Object.fromEntries(NOISE_MEASURE_ROWS.map(r => [r, emptyMeasure()])),
    },
    water: {
      consumption: Object.fromEntries(WATER_ROWS.map(r => [r, emptyQty()])),
      waterBodies: '', wbPhotos: [], dwReport: null, dwLocation: '', dwDate: '', dwRemarks: '',
    },
    wastewater: {
      sources: Object.fromEntries(WW_SOURCE_ROWS.map(r => [r, emptyQty()])),
      treatment: Object.fromEntries(WW_TREATMENT_ROWS.map(r => [r, emptyQty()])),
      qualityReport: null, treatmentSystem: '', reusePhotos: [], protectionMeasures: '', protectionPhotos: [],
    },
    soil: {
      monitoring: SOIL_LOCATIONS.map(() => emptySoilMon()),
      management: { 'Topsoil preserved (≤30cm)': emptyQty(), 'Topsoil used for greenery': emptyQty() },
      erosionConstruction: { details: '', photos: [] },
      erosionRoad: { details: '', photos: [] },
      erosionFlood: { details: '', photos: [] },
    },
    muck: {
      quantities: Object.fromEntries(MUCK_ROWS.map(r => [r, emptyQty()])),
      disposal: Object.fromEntries(MUCK_DISPOSAL_ROWS.map(r => [r, emptyQty()])),
    },
    trees: { identified: '', tocut: '', transplant: '', cumcut: '', cumtransplant: '', photos: [], reports: [], permits: [], remarks: '' },
    waste: WASTE_CATEGORIES.map(c => ({ type: c.type, unit: c.unit, status: null, remarksIfNo: '', qtyGen: '', qtyDisp: '', cumGen: '', cumDisp: '', disposalLoc: '', photos: [], mou: [], remarks: '' })),
    training: [],
    observations: { given: emptyObs(), complied: emptyObs(), letters: emptyObs(), ncs: emptyObs(), complianceFile: null },
  }
}

// ==================== FILE UPLOAD ====================

function FileBtn({ files, onAdd, onRemove, label = 'Upload', single = false }: { files: UFile[]; onAdd: (f: UFile) => void; onRemove: (i: number) => void; label?: string; single?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    if (f.size > 10 * 1024 * 1024) { toast.error('Max 10 MB'); return }
    const r = new FileReader(); r.onload = () => onAdd({ name: f.name, size: f.size, type: f.type, dataUrl: r.result as string }); r.readAsDataURL(f); e.target.value = ''
  }
  return (
    <div className="space-y-1">
      <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xls,.xlsx" onChange={handleFile} />
      {(!single || files.length === 0) && (
        <Button type="button" variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={() => ref.current?.click()}>
          <Upload className="h-2.5 w-2.5" />{label}
        </Button>
      )}
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-1 text-[9px] bg-muted/40 rounded px-1.5 py-0.5 max-w-[120px]">
          <FileText className="h-2.5 w-2.5 text-[#0d9488] shrink-0" />
          <span className="truncate flex-1">{f.name}</span>
          <button type="button" onClick={() => onRemove(i)} className="text-red-400 shrink-0"><X className="h-2 w-2" /></button>
        </div>
      ))}
    </div>
  )
}

// ==================== COMPLIANCE TABLE ====================

function ComplianceTable({ title, question, rows, data, onChange }: {
  title: string; question: string; rows: string[]
  data: Record<string, CompEntry>
  onChange: (row: string, partial: Partial<CompEntry>) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{title}</p>
      <p className="text-[10px] text-muted-foreground italic">{question}</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[700px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Item</th>
              <th className="text-left px-3 py-2 font-semibold w-28">Status</th>
              <th className="text-left px-3 py-2 font-semibold w-40">Remarks</th>
              <th className="text-left px-3 py-2 font-semibold w-28">Photos</th>
              <th className="text-left px-3 py-2 font-semibold w-28">Reports</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const entry = data[row] || emptyComp()
              return (
                <tr key={row} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                  <td className="px-3 py-2">{row}</td>
                  <td className="px-3 py-2">
                    <Select value={entry.status || ''} onValueChange={v => onChange(row, { status: v as CompStatus || null })}>
                      <SelectTrigger className="h-7 text-xs w-24"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{(['Yes','No','NA','Applied'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      className={cn('h-7 text-xs', (entry.status === 'No' || entry.status === 'NA') ? 'border-red-300' : '')}
                      placeholder={(entry.status === 'No' || entry.status === 'NA') ? 'Required *' : 'Optional'}
                      value={entry.remarks}
                      onChange={e => onChange(row, { remarks: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <FileBtn files={entry.photos} onAdd={f => onChange(row, { photos: [...entry.photos, f] })} onRemove={i => onChange(row, { photos: entry.photos.filter((_, fi) => fi !== i) })} label="Photos" />
                  </td>
                  <td className="px-3 py-2">
                    <FileBtn files={entry.reports} onAdd={f => onChange(row, { reports: [...entry.reports, f] })} onRemove={i => onChange(row, { reports: entry.reports.filter((_, fi) => fi !== i) })} label="Reports" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== MEASURE TABLE ====================

function MeasureTable({ title, rows, data, onChange }: { title: string; rows: string[]; data: Record<string, MeasureEntry>; onChange: (row: string, p: Partial<MeasureEntry>) => void }) {
  return (
    <div className="space-y-2 mt-4">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{title}</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[600px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Location / Source</th>
              <th className="text-left px-3 py-2 font-semibold">Measures / Details</th>
              <th className="text-left px-3 py-2 font-semibold w-28">Photos</th>
              <th className="text-left px-3 py-2 font-semibold w-28">Reports</th>
              <th className="text-left px-3 py-2 font-semibold w-36">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const e = data[row] || emptyMeasure()
              return (
                <tr key={row} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                  <td className="px-3 py-2 font-medium">{row}</td>
                  <td className="px-3 py-2"><Textarea className="text-xs min-h-[40px] resize-none" value={e.measures} onChange={x => onChange(row, { measures: x.target.value })} placeholder="Describe measures..." /></td>
                  <td className="px-3 py-2"><FileBtn files={e.photos} onAdd={f => onChange(row, { photos: [...e.photos, f] })} onRemove={i => onChange(row, { photos: e.photos.filter((_, fi) => fi !== i) })} label="Photos" /></td>
                  <td className="px-3 py-2"><FileBtn files={e.reports} onAdd={f => onChange(row, { reports: [...e.reports, f] })} onRemove={i => onChange(row, { reports: e.reports.filter((_, fi) => fi !== i) })} label="Reports" /></td>
                  <td className="px-3 py-2"><Input className="h-7 text-xs" value={e.remarks} onChange={x => onChange(row, { remarks: x.target.value })} placeholder="Remarks" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== QUANTITY TABLE ====================

function QuantityTable({ title, rows, data, onChange, showSources = true }: { title: string; rows: string[]; data: Record<string, QtyEntry>; onChange: (row: string, p: Partial<QtyEntry>) => void; showSources?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{title}</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[700px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Item</th>
              <th className="px-3 py-2 font-semibold w-28 text-center">Qty (m³/month)</th>
              <th className="px-3 py-2 font-semibold w-28 text-center">Cumulative (m³)</th>
              {showSources && <th className="text-left px-3 py-2 font-semibold w-28">Sources</th>}
              <th className="text-left px-3 py-2 font-semibold w-24">Photos</th>
              <th className="text-left px-3 py-2 font-semibold w-24">Reports</th>
              <th className="text-left px-3 py-2 font-semibold w-32">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const e = data[row] || emptyQty()
              return (
                <tr key={row} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                  <td className="px-3 py-2 font-medium">{row}</td>
                  <td className="px-3 py-2"><Input className="h-7 text-xs text-center" type="number" min="0" value={e.quantity} onChange={x => onChange(row, { quantity: x.target.value })} placeholder="0" /></td>
                  <td className="px-3 py-2"><Input className="h-7 text-xs text-center bg-muted/30" type="number" min="0" value={e.cumulative} onChange={x => onChange(row, { cumulative: x.target.value })} placeholder="0" /></td>
                  {showSources && <td className="px-3 py-2"><Input className="h-7 text-xs" value={e.sources} onChange={x => onChange(row, { sources: x.target.value })} placeholder="Source" /></td>}
                  <td className="px-3 py-2"><FileBtn files={e.photos} onAdd={f => onChange(row, { photos: [...e.photos, f] })} onRemove={i => onChange(row, { photos: e.photos.filter((_, fi) => fi !== i) })} label="Photos" /></td>
                  <td className="px-3 py-2"><FileBtn files={e.reports} onAdd={f => onChange(row, { reports: [...e.reports, f] })} onRemove={i => onChange(row, { reports: e.reports.filter((_, fi) => fi !== i) })} label="Reports" /></td>
                  <td className="px-3 py-2"><Input className="h-7 text-xs" value={e.remarks} onChange={x => onChange(row, { remarks: x.target.value })} placeholder="Remarks" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== STEP PROGRESS ====================

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-4">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-0.5 flex-1">
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all',
              i < current ? 'bg-[#0d9488] border-[#0d9488] text-white' :
              i === current ? 'border-[#0d9488] text-[#0d9488] bg-white dark:bg-slate-900' :
              'border-slate-300 text-slate-400 bg-white dark:bg-slate-900')}>
              {i < current ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
            </div>
            <span className={cn('text-[8px] text-center leading-tight hidden sm:block max-w-[60px]', i === current ? 'text-[#0d9488] font-semibold' : 'text-muted-foreground')}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1 mx-0.5 mb-3', i < current ? 'bg-[#0d9488]' : 'bg-slate-200')} />}
        </div>
      ))}
    </div>
  )
}

// ==================== SECTION HEADING ====================

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-[#0d9488]/30 pb-2 mb-4">
      <p className="text-sm font-bold text-[#0d9488]">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ==================== STEP 1: PROJECT & SETUP ====================

type S1Props = { projectName: string; setProjectName: (v: string) => void; month: string; setMonth: (v: string) => void; year: string; setYear: (v: string) => void; personnel: Personnel[]; setPersonnel: (p: Personnel[]) => void }

function Step1({ projectName, setProjectName, month, setMonth, year, setYear, personnel, setPersonnel }: S1Props) {
  const proj = AMARAVATI_PROJECTS.find(p => p.name === projectName)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      <SectionHeading title="General Information" />

      {/* Project + Month + Year */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Project *</Label>
          <Select value={projectName} onValueChange={setProjectName}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>{AMARAVATI_PROJECTS.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Reporting Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Auto-filled info */}
      {proj && (
        <Card className="bg-[#0d9488]/5 border-[#0d9488]/20">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-[#0d9488] uppercase tracking-wider mb-2">Project Information (Auto-filled)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              {[['Customer', proj.customer],['Project No.', proj.number],['Title', proj.title],['Manager', proj.manager],['BOQ', proj.boq],['BOQ Desc', proj.boqDesc],['Location', proj.name],['Created', new Date().toLocaleDateString('en-IN')]].map(([l,v]) => (
                <div key={l}><p className="text-muted-foreground">{l}</p><p className="font-semibold">{v}</p></div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
        <CardContent className="p-3 space-y-2">
          <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5"><Info className="h-3.5 w-3.5" />Monthly Compliance Workflow</p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {[['Contractor','Submit C-ESMP compliance report (certified by PM) by 20th of every month'],['PMC','Verify Contractor report & submit to PgMC by 22nd'],['PgMC','Review, certify, recommend improvements & submit to ESMU by 27th'],['APCRDA & ADCL','Verify PgMC-certified report by 30th']].map(([role, desc]) => (
              <div key={role} className="bg-white/70 dark:bg-slate-800/50 rounded p-2">
                <p className="font-bold text-amber-800 dark:text-amber-400">{role}</p>
                <p className="text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
            <p className="font-semibold text-amber-700">Evidence Requirements:</p>
            <p>• All photographs must contain GPS coordinates and timestamp</p>
            <p>• Reports must contain adequate documentary and photographic evidence</p>
            <p>• Cumulative figures = sum of all previous reporting periods + current period</p>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Rules */}
      <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-2"><AlertTriangle className="h-3.5 w-3.5" />Form Rejection Rules</p>
          <div className="text-[10px] text-red-700 dark:text-red-400 space-y-0.5">
            {['Data gaps observed for more than 20% of total queries','Form filled by an unauthorised person','Supporting evidence not certified by the Project Manager','Fabricated documents or data identified','Uploaded documents not relevant to the respective queries'].map((r, i) => (
              <p key={i}>• {r}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personnel */}
      <div>
        <SectionHeading title="Project Key Personnel (Contractor)" />
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="text-xs w-full min-w-[500px]">
            <thead className="bg-[#0d9488]/10">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Designation</th>
                <th className="text-left px-3 py-2 font-semibold w-36">Name</th>
                <th className="text-left px-3 py-2 font-semibold w-36">Contact</th>
                <th className="text-left px-3 py-2 font-semibold w-28">Photograph</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((p, i) => (
                <tr key={p.designation} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                  <td className="px-3 py-2 font-medium">{p.designation}</td>
                  <td className="px-3 py-2"><Input className="h-7 text-xs" value={p.name} onChange={e => { const updated = [...personnel]; updated[i] = { ...p, name: e.target.value }; setPersonnel(updated) }} placeholder="Full Name" /></td>
                  <td className="px-3 py-2"><Input className="h-7 text-xs" value={p.contact} onChange={e => { const updated = [...personnel]; updated[i] = { ...p, contact: e.target.value }; setPersonnel(updated) }} placeholder="Phone / Email" /></td>
                  <td className="px-3 py-2">
                    <FileBtn
                      files={p.photo ? [p.photo] : []}
                      onAdd={f => { const updated = [...personnel]; updated[i] = { ...p, photo: f }; setPersonnel(updated) }}
                      onRemove={() => { const updated = [...personnel]; updated[i] = { ...p, photo: null }; setPersonnel(updated) }}
                      label="Photo" single
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== STEP 2: STATUTORY COMPLIANCE ====================

type StatData = EVMSubmission['statutory']
function Step2({ data, onChange }: { data: StatData; onChange: (s: StatData) => void }) {
  const upd = (sec: keyof StatData, row: string, p: Partial<CompEntry>) =>
    onChange({ ...data, [sec]: { ...data[sec], [row]: { ...data[sec][row], ...p } } })
  return (
    <div className="space-y-6">
      <SectionHeading title="Section 1 — Statutory Compliance Tracking" />
      <ComplianceTable title="6.1 Environmental Clearance (EC) – Quarry" question="Does the quarry site from which material is procured have Environmental Clearance (EC)?" rows={EC_ROWS} data={data.ec} onChange={(r, p) => upd('ec', r, p)} />
      <ComplianceTable title="6.2 Consent to Establish (CTE)" question="Do the following plants/quarry areas established or from which materials are procured have valid Consent to Establish (CTE)?" rows={CTE_CTO_ROWS} data={data.cte} onChange={(r, p) => upd('cte', r, p)} />
      <ComplianceTable title="6.3 Consent to Operate (CTO)" question="Do the following plants/quarry areas operated or from which materials are procured have valid Consent to Operate (CTO)?" rows={CTE_CTO_ROWS} data={data.cto} onChange={(r, p) => upd('cto', r, p)} />
      <ComplianceTable title="6.4 Permissions / Approvals" question="Status of required permissions and approvals:" rows={PERMISSION_ROWS} data={data.permissions} onChange={(r, p) => upd('permissions', r, p)} />
    </div>
  )
}

// ==================== STEP 3: AIR QUALITY ====================

type AirData = EVMSubmission['air']
function Step3({ data, onChange }: { data: AirData; onChange: (a: AirData) => void }) {
  const updMon = (i: number, p: Partial<AirMonitor>) => {
    const m = [...data.monitoring]; m[i] = { ...m[i], ...p }; onChange({ ...data, monitoring: m })
  }
  const updMeasure = (row: string, p: Partial<MeasureEntry>) =>
    onChange({ ...data, measures: { ...data.measures, [row]: { ...data.measures[row], ...p } } })

  return (
    <div className="space-y-6">
      <SectionHeading title="Section 2 — Air Quality" />
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">7.1 Air Quality Monitoring</p>
      <p className="text-[10px] text-muted-foreground">Reference limits: PM10 ≤100 µg/m³ | PM2.5 ≤60 µg/m³ | SO2 ≤80 µg/m³ | NOx ≤80 µg/m³ | CO ≤2 mg/m³ (8h)</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[900px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="text-left px-2 py-2 font-semibold w-14">ID</th>
              <th className="text-left px-2 py-2 font-semibold w-28">Location Name</th>
              <th className="text-left px-2 py-2 font-semibold w-28">GPS</th>
              <th className="text-center px-2 py-2 font-semibold w-16">PM10</th>
              <th className="text-center px-2 py-2 font-semibold w-16">PM2.5</th>
              <th className="text-center px-2 py-2 font-semibold w-16">SO2</th>
              <th className="text-center px-2 py-2 font-semibold w-16">NOx</th>
              <th className="text-center px-2 py-2 font-semibold w-16">CO</th>
              <th className="text-left px-2 py-2 font-semibold w-20">Photos</th>
              <th className="text-left px-2 py-2 font-semibold w-20">Report</th>
              <th className="text-left px-2 py-2 font-semibold w-28">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {AIR_LOCATIONS.map((loc, i) => {
              const e = data.monitoring[i]
              return (
                <tr key={loc} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                  <td className="px-2 py-2 font-bold text-[#0d9488]">{loc}</td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.locationName} onChange={x => updMon(i, { locationName: x.target.value })} placeholder="Name" /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.gps} onChange={x => updMon(i, { gps: x.target.value })} placeholder="lat, lng" /></td>
                  {(['pm10','pm25','so2','nox','co'] as const).map(k => (
                    <td key={k} className="px-2 py-2"><Input className="h-7 text-xs text-center" type="number" min="0" value={e[k]} onChange={x => updMon(i, { [k]: x.target.value })} placeholder="—" /></td>
                  ))}
                  <td className="px-2 py-2"><FileBtn files={e.photos} onAdd={f => updMon(i, { photos: [...e.photos, f] })} onRemove={j => updMon(i, { photos: e.photos.filter((_,fi) => fi!==j) })} label="Photos" /></td>
                  <td className="px-2 py-2"><FileBtn files={e.report ? [e.report] : []} onAdd={f => updMon(i, { report: f })} onRemove={() => updMon(i, { report: null })} label="Report" single /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.remarks} onChange={x => updMon(i, { remarks: x.target.value })} placeholder="Remarks" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3">
        <Label className="text-xs font-semibold shrink-0">MOEFCC & NABL Accreditation Upload:</Label>
        <FileBtn files={data.moefcc ? [data.moefcc] : []} onAdd={f => onChange({ ...data, moefcc: f })} onRemove={() => onChange({ ...data, moefcc: null })} label="Upload Accreditation" single />
      </div>
      <MeasureTable title="7.2 Air Pollution Preventive & Control Measures" rows={AIR_MEASURE_ROWS} data={data.measures} onChange={updMeasure} />
    </div>
  )
}

// ==================== STEP 4: NOISE ====================

type NoiseData = EVMSubmission['noise']
function Step4({ data, onChange }: { data: NoiseData; onChange: (n: NoiseData) => void }) {
  const updMon = (i: number, p: Partial<NoiseMonitor>) => {
    const m = [...data.monitoring]; m[i] = { ...m[i], ...p }; onChange({ ...data, monitoring: m })
  }
  const updMeasure = (row: string, p: Partial<MeasureEntry>) =>
    onChange({ ...data, measures: { ...data.measures, [row]: { ...data.measures[row], ...p } } })

  return (
    <div className="space-y-6">
      <SectionHeading title="Section 3 — Noise" />
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">8.1 Noise Monitoring</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[900px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="text-left px-2 py-2 font-semibold w-14">ID</th>
              <th className="text-left px-2 py-2 font-semibold w-28">Location Name</th>
              <th className="text-left px-2 py-2 font-semibold w-28">GPS</th>
              <th className="text-center px-2 py-2 font-semibold w-14">Leq (dB)</th>
              <th className="text-center px-2 py-2 font-semibold w-14">Lmax</th>
              <th className="text-center px-2 py-2 font-semibold w-14">Lmin</th>
              <th className="text-center px-2 py-2 font-semibold w-14">L Day</th>
              <th className="text-center px-2 py-2 font-semibold w-16">L Night</th>
              <th className="text-left px-2 py-2 font-semibold w-20">Photos</th>
              <th className="text-left px-2 py-2 font-semibold w-20">Report</th>
              <th className="text-left px-2 py-2 font-semibold w-28">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {NOISE_LOCATIONS.map((loc, i) => {
              const e = data.monitoring[i]
              return (
                <tr key={loc} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                  <td className="px-2 py-2 font-bold text-[#0d9488]">{loc}</td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.locationName} onChange={x => updMon(i, { locationName: x.target.value })} placeholder="Name" /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.gps} onChange={x => updMon(i, { gps: x.target.value })} placeholder="lat, lng" /></td>
                  {(['leq','lmax','lmin','lday','lnight'] as const).map(k => (
                    <td key={k} className="px-2 py-2"><Input className="h-7 text-xs text-center" type="number" min="0" value={e[k]} onChange={x => updMon(i, { [k]: x.target.value })} placeholder="—" /></td>
                  ))}
                  <td className="px-2 py-2"><FileBtn files={e.photos} onAdd={f => updMon(i, { photos: [...e.photos, f] })} onRemove={j => updMon(i, { photos: e.photos.filter((_,fi) => fi!==j) })} label="Photos" /></td>
                  <td className="px-2 py-2"><FileBtn files={e.report ? [e.report] : []} onAdd={f => updMon(i, { report: f })} onRemove={() => updMon(i, { report: null })} label="Report" single /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.remarks} onChange={x => updMon(i, { remarks: x.target.value })} placeholder="Remarks" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <MeasureTable title="8.2 Noise Preventive & Control Measures" rows={NOISE_MEASURE_ROWS} data={data.measures} onChange={updMeasure} />
    </div>
  )
}

// ==================== STEP 5: WATER & WASTEWATER ====================

type WaterData = EVMSubmission['water']
type WWData = EVMSubmission['wastewater']
function Step5({ water, setWater, ww, setWW }: { water: WaterData; setWater: (w: WaterData) => void; ww: WWData; setWW: (w: WWData) => void }) {
  const updW = (row: string, p: Partial<QtyEntry>) => setWater({ ...water, consumption: { ...water.consumption, [row]: { ...water.consumption[row], ...p } } })
  const updWWS = (row: string, p: Partial<QtyEntry>) => setWW({ ...ww, sources: { ...ww.sources, [row]: { ...ww.sources[row], ...p } } })
  const updWWT = (row: string, p: Partial<QtyEntry>) => setWW({ ...ww, treatment: { ...ww.treatment, [row]: { ...ww.treatment[row], ...p } } })

  return (
    <div className="space-y-6">
      <SectionHeading title="Section 4 — Water" />
      <QuantityTable title="9.1 Total Water Consumption & Sources" rows={WATER_ROWS} data={water.consumption} onChange={updW} />
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">9.2 Water Bodies (within 500m radius, as per CESMP / IS 2296)</p>
        <Textarea className="text-sm min-h-[70px]" placeholder="Name, location, distance, GPS, details of water bodies within 500m..." value={water.waterBodies} onChange={e => setWater({ ...water, waterBodies: e.target.value })} />
        <FileBtn files={water.wbPhotos} onAdd={f => setWater({ ...water, wbPhotos: [...water.wbPhotos, f] })} onRemove={i => setWater({ ...water, wbPhotos: water.wbPhotos.filter((_, fi) => fi !== i) })} label="Upload Photos" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">9.3 Drinking Water Quality Report (as per IS 10500)</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1"><Label className="text-[10px]">Sampling Location</Label><Input className="h-8 text-xs" value={water.dwLocation} onChange={e => setWater({ ...water, dwLocation: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-[10px]">Date</Label><Input className="h-8 text-xs" type="date" value={water.dwDate} onChange={e => setWater({ ...water, dwDate: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-[10px]">Remarks</Label><Input className="h-8 text-xs" value={water.dwRemarks} onChange={e => setWater({ ...water, dwRemarks: e.target.value })} /></div>
        </div>
        <FileBtn files={water.dwReport ? [water.dwReport] : []} onAdd={f => setWater({ ...water, dwReport: f })} onRemove={() => setWater({ ...water, dwReport: null })} label="Upload DW Quality Report" single />
      </div>

      <div className="border-t pt-4">
        <SectionHeading title="Section 5 — Wastewater" />
        <QuantityTable title="10.1 Sources of Wastewater" rows={WW_SOURCE_ROWS} data={ww.sources} onChange={updWWS} showSources={false} />
        <div className="mt-4"><QuantityTable title="10.2 Wastewater Treatment" rows={WW_TREATMENT_ROWS} data={ww.treatment} onChange={updWWT} showSources={false} /></div>
        <div className="mt-4 space-y-3">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">10.3 Wastewater Quality & Reuse</p>
          <div className="flex items-center gap-3">
            <Label className="text-[10px] shrink-0">Treated Wastewater Quality Report (MOEFCC & NABL):</Label>
            <FileBtn files={ww.qualityReport ? [ww.qualityReport] : []} onAdd={f => setWW({ ...ww, qualityReport: f })} onRemove={() => setWW({ ...ww, qualityReport: null })} label="Upload Report" single />
          </div>
          <div className="space-y-1"><Label className="text-[10px]">Wastewater Treatment System Description</Label><Textarea className="text-xs min-h-[60px]" value={ww.treatmentSystem} onChange={e => setWW({ ...ww, treatmentSystem: e.target.value })} placeholder="Describe the treatment system..." /></div>
          <div className="space-y-1">
            <Label className="text-[10px]">Wastewater Reuse Evidence (Photos with coordinates)</Label>
            <FileBtn files={ww.reusePhotos} onAdd={f => setWW({ ...ww, reusePhotos: [...ww.reusePhotos, f] })} onRemove={i => setWW({ ...ww, reusePhotos: ww.reusePhotos.filter((_, fi) => fi !== i) })} label="Upload Evidence" />
          </div>
          <div className="space-y-1"><Label className="text-[10px]">Measures for Protection of Water Bodies</Label><Textarea className="text-xs min-h-[50px]" value={ww.protectionMeasures} onChange={e => setWW({ ...ww, protectionMeasures: e.target.value })} placeholder="Describe measures..." /></div>
          <FileBtn files={ww.protectionPhotos} onAdd={f => setWW({ ...ww, protectionPhotos: [...ww.protectionPhotos, f] })} onRemove={i => setWW({ ...ww, protectionPhotos: ww.protectionPhotos.filter((_, fi) => fi !== i) })} label="Upload Photos" />
        </div>
      </div>
    </div>
  )
}

// ==================== STEP 6: SOIL, MUCK & TREES ====================

type SoilData = EVMSubmission['soil']
type MuckData = EVMSubmission['muck']
type TreeData = EVMSubmission['trees']
function Step6({ soil, setSoil, muck, setMuck, trees, setTrees }: { soil: SoilData; setSoil: (s: SoilData) => void; muck: MuckData; setMuck: (m: MuckData) => void; trees: TreeData; setTrees: (t: TreeData) => void }) {
  const updSoilMon = (i: number, p: Partial<SoilMonitor>) => { const m = [...soil.monitoring]; m[i] = { ...m[i], ...p }; setSoil({ ...soil, monitoring: m }) }
  const updSoilMgmt = (row: string, p: Partial<QtyEntry>) => setSoil({ ...soil, management: { ...soil.management, [row]: { ...soil.management[row], ...p } } })
  const updMuck = (row: string, p: Partial<QtyEntry>) => setMuck({ ...muck, quantities: { ...muck.quantities, [row]: { ...muck.quantities[row], ...p } } })
  const updMuckDisp = (row: string, p: Partial<QtyEntry>) => setMuck({ ...muck, disposal: { ...muck.disposal, [row]: { ...muck.disposal[row], ...p } } })

  return (
    <div className="space-y-6">
      <SectionHeading title="Section 6 — Soil" />
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">11.1 Soil Quality Monitoring</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[900px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="px-2 py-2 font-semibold w-10">ID</th>
              <th className="px-2 py-2 font-semibold w-28">Location</th>
              <th className="px-2 py-2 font-semibold w-24">GPS</th>
              <th className="px-2 py-2 font-semibold w-12 text-center">pH</th>
              <th className="px-2 py-2 font-semibold w-16 text-center">EC (mS/cm)</th>
              <th className="px-2 py-2 font-semibold w-12 text-center">OC %</th>
              <th className="px-2 py-2 font-semibold w-14 text-center">N (mg/kg)</th>
              <th className="px-2 py-2 font-semibold w-14 text-center">P (mg/kg)</th>
              <th className="px-2 py-2 font-semibold w-24">Other</th>
              <th className="px-2 py-2 font-semibold w-20">Photos</th>
              <th className="px-2 py-2 font-semibold w-20">Report</th>
              <th className="px-2 py-2 font-semibold w-24">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {SOIL_LOCATIONS.map((loc, i) => {
              const e = soil.monitoring[i]
              return (
                <tr key={loc} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                  <td className="px-2 py-2 font-bold text-[#0d9488]">{loc}</td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.locationName} onChange={x => updSoilMon(i, { locationName: x.target.value })} /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.gps} onChange={x => updSoilMon(i, { gps: x.target.value })} placeholder="lat, lng" /></td>
                  {(['ph','ec','oc','nitrogen','phosphorus'] as const).map(k => (
                    <td key={k} className="px-2 py-2"><Input className="h-7 text-xs text-center" type="number" min="0" value={e[k]} onChange={x => updSoilMon(i, { [k]: x.target.value })} placeholder="—" /></td>
                  ))}
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.other} onChange={x => updSoilMon(i, { other: x.target.value })} placeholder="Other params" /></td>
                  <td className="px-2 py-2"><FileBtn files={e.photos} onAdd={f => updSoilMon(i, { photos: [...e.photos, f] })} onRemove={j => updSoilMon(i, { photos: e.photos.filter((_,fi) => fi!==j) })} label="Photos" /></td>
                  <td className="px-2 py-2"><FileBtn files={e.report ? [e.report] : []} onAdd={f => updSoilMon(i, { report: f })} onRemove={() => updSoilMon(i, { report: null })} label="Report" single /></td>
                  <td className="px-2 py-2"><Input className="h-7 text-xs" value={e.remarks} onChange={x => updSoilMon(i, { remarks: x.target.value })} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <QuantityTable title="11.2 Soil Management" rows={Object.keys(soil.management)} data={soil.management} onChange={updSoilMgmt} showSources={false} />

      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">11.3 Erosion Control Measures</p>
        {[
          { key: 'erosionConstruction' as const, label: 'Construction Site' },
          { key: 'erosionRoad' as const, label: 'Road Works (along embankments)' },
          { key: 'erosionFlood' as const, label: 'Flood Mitigation Works (along embankments)' },
        ].map(({ key, label }) => (
          <Card key={key} className="border-slate-200">
            <CardContent className="p-3 space-y-2">
              <p className="text-[10px] font-semibold">{label}</p>
              <Textarea className="text-xs min-h-[60px]" placeholder="Details of erosion control measures..." value={soil[key].details} onChange={e => setSoil({ ...soil, [key]: { ...soil[key], details: e.target.value } })} />
              <FileBtn files={soil[key].photos} onAdd={f => setSoil({ ...soil, [key]: { ...soil[key], photos: [...soil[key].photos, f] } })} onRemove={i => setSoil({ ...soil, [key]: { ...soil[key], photos: soil[key].photos.filter((_,fi) => fi!==i) } })} label="GPS-tagged Photos" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-t pt-4">
        <SectionHeading title="Muck Management" />
        <QuantityTable title="12.1 Muck Quantities" rows={MUCK_ROWS} data={muck.quantities} onChange={updMuck} showSources={false} />
        <div className="mt-4"><QuantityTable title="12.2 Muck Disposal" rows={MUCK_DISPOSAL_ROWS} data={muck.disposal} onChange={updMuckDisp} showSources={false} /></div>
      </div>

      <div className="border-t pt-4">
        <SectionHeading title="Tree Management" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            ['Trees identified on site', 'identified'],['Trees to be cut', 'tocut'],['Trees for transplantation', 'transplant'],
            ['Cumulative trees cut', 'cumcut'],['Cumulative trees transplanted', 'cumtransplant'],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-[10px]">{label}</Label>
              <Input className="h-8 text-xs" type="number" min="0" value={(trees as any)[key]} onChange={e => setTrees({ ...trees, [key]: e.target.value })} placeholder="0" />
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div><Label className="text-[10px]">Photos</Label><FileBtn files={trees.photos} onAdd={f => setTrees({ ...trees, photos: [...trees.photos, f] })} onRemove={i => setTrees({ ...trees, photos: trees.photos.filter((_,fi) => fi!==i) })} label="Photos" /></div>
          <div><Label className="text-[10px]">Reports</Label><FileBtn files={trees.reports} onAdd={f => setTrees({ ...trees, reports: [...trees.reports, f] })} onRemove={i => setTrees({ ...trees, reports: trees.reports.filter((_,fi) => fi!==i) })} label="Reports" /></div>
          <div><Label className="text-[10px]">AP WALTA Permits</Label><FileBtn files={trees.permits} onAdd={f => setTrees({ ...trees, permits: [...trees.permits, f] })} onRemove={i => setTrees({ ...trees, permits: trees.permits.filter((_,fi) => fi!==i) })} label="Permits" /></div>
        </div>
        <div className="mt-2 space-y-1"><Label className="text-[10px]">Remarks</Label><Textarea className="text-xs min-h-[50px]" value={trees.remarks} onChange={e => setTrees({ ...trees, remarks: e.target.value })} /></div>
      </div>
    </div>
  )
}

// ==================== STEP 7: WASTE & TRAINING ====================

function Step7({ waste, setWaste, training, setTraining }: { waste: WasteEntry[]; setWaste: (w: WasteEntry[]) => void; training: TrainingRecord[]; setTraining: (t: TrainingRecord[]) => void }) {
  const updWaste = (i: number, p: Partial<WasteEntry>) => { const u = [...waste]; u[i] = { ...u[i], ...p }; setWaste(u) }
  const addTraining = () => setTraining([...training, { id: `tr-${Date.now()}`, date: '', topic: '', skilledM: '', skilledF: '', semiM: '', semiF: '', unskilledM: '', unskilledF: '', photos: [], reports: [], attendance: null, remarks: '' }])
  const updTraining = (id: string, p: Partial<TrainingRecord>) => setTraining(training.map(t => t.id === id ? { ...t, ...p } : t))
  const calcTotal = (r: TrainingRecord) => [r.skilledM, r.skilledF, r.semiM, r.semiF, r.unskilledM, r.unskilledF].reduce((a, v) => a + (parseInt(v) || 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeading title="Section 7 — Solid Waste Management" />
      <p className="text-[10px] text-muted-foreground">All 15 waste categories. Cumulative = previous cumulative + current month quantity. No negative values.</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[1100px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="text-left px-2 py-2 font-semibold min-w-[180px]">Waste Type</th>
              <th className="px-2 py-2 font-semibold w-10">Unit</th>
              <th className="px-2 py-2 font-semibold w-20">Status</th>
              <th className="text-left px-2 py-2 font-semibold w-28">Remarks if No/NA</th>
              <th className="px-2 py-2 font-semibold w-20 text-center">Qty Generated</th>
              <th className="px-2 py-2 font-semibold w-20 text-center">Qty Disposed</th>
              <th className="px-2 py-2 font-semibold w-20 text-center">Cum. Generated</th>
              <th className="px-2 py-2 font-semibold w-20 text-center">Cum. Disposed</th>
              <th className="text-left px-2 py-2 font-semibold w-28">Disposal Location</th>
              <th className="px-2 py-2 font-semibold w-20">Photos</th>
              <th className="px-2 py-2 font-semibold w-20">MoU / Tie-up</th>
              <th className="text-left px-2 py-2 font-semibold w-24">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {waste.map((w, i) => (
              <tr key={w.type} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-muted/20'}>
                <td className="px-2 py-2 font-medium text-[10px]">{w.type}</td>
                <td className="px-2 py-2 text-muted-foreground text-center">{w.unit}</td>
                <td className="px-2 py-2">
                  <Select value={w.status || ''} onValueChange={v => updWaste(i, { status: v as CompStatus || null })}>
                    <SelectTrigger className="h-6 text-[10px] w-16"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{(['Yes','No','NA','Applied'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-2">
                  {(w.status === 'No' || w.status === 'NA') && <Input className="h-6 text-[10px] border-red-300" placeholder="Required *" value={w.remarksIfNo} onChange={e => updWaste(i, { remarksIfNo: e.target.value })} />}
                </td>
                <td className="px-2 py-2"><Input className="h-6 text-[10px] text-center" type="number" min="0" value={w.qtyGen} onChange={e => updWaste(i, { qtyGen: e.target.value })} placeholder="0" /></td>
                <td className="px-2 py-2"><Input className="h-6 text-[10px] text-center" type="number" min="0" value={w.qtyDisp} onChange={e => updWaste(i, { qtyDisp: e.target.value })} placeholder="0" /></td>
                <td className="px-2 py-2"><Input className="h-6 text-[10px] text-center bg-muted/30" type="number" min="0" value={w.cumGen} onChange={e => updWaste(i, { cumGen: e.target.value })} placeholder="0" /></td>
                <td className="px-2 py-2"><Input className="h-6 text-[10px] text-center bg-muted/30" type="number" min="0" value={w.cumDisp} onChange={e => updWaste(i, { cumDisp: e.target.value })} placeholder="0" /></td>
                <td className="px-2 py-2"><Input className="h-6 text-[10px]" value={w.disposalLoc} onChange={e => updWaste(i, { disposalLoc: e.target.value })} placeholder="Agency & location" /></td>
                <td className="px-2 py-2"><FileBtn files={w.photos} onAdd={f => updWaste(i, { photos: [...w.photos, f] })} onRemove={j => updWaste(i, { photos: w.photos.filter((_,fi) => fi!==j) })} label="Photos" /></td>
                <td className="px-2 py-2"><FileBtn files={w.mou} onAdd={f => updWaste(i, { mou: [...w.mou, f] })} onRemove={j => updWaste(i, { mou: w.mou.filter((_,fi) => fi!==j) })} label="MoU" /></td>
                <td className="px-2 py-2"><Input className="h-6 text-[10px]" value={w.remarks} onChange={e => updWaste(i, { remarks: e.target.value })} placeholder="Remarks" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t pt-4">
        <SectionHeading title="Section 8 — Environmental Awareness & Training" />
        <Button type="button" size="sm" variant="outline" className="gap-1.5 mb-3" onClick={addTraining}><Plus className="h-3.5 w-3.5" />Add Training Record</Button>
        {training.length === 0 && <p className="text-xs text-muted-foreground">No training records added yet.</p>}
        {training.map((t, idx) => (
          <Card key={t.id} className="mb-3 border-slate-200">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#0d9488]">Training Record #{idx + 1}</p>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400" onClick={() => setTraining(training.filter(r => r.id !== t.id))}><Trash2 className="h-3 w-3" /></Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="space-y-1"><Label className="text-[10px]">Date</Label><Input className="h-7 text-xs" type="date" value={t.date} onChange={e => updTraining(t.id, { date: e.target.value })} /></div>
                <div className="space-y-1 col-span-2"><Label className="text-[10px]">Topic</Label><Input className="h-7 text-xs" value={t.topic} onChange={e => updTraining(t.id, { topic: e.target.value })} placeholder="Training topic" /></div>
              </div>
              <div className="overflow-x-auto">
                <table className="text-[10px] w-full min-w-[500px]">
                  <thead className="bg-muted/40"><tr>
                    <th className="px-2 py-1"></th>
                    <th className="px-2 py-1 text-center">Skilled M</th><th className="px-2 py-1 text-center">Skilled F</th>
                    <th className="px-2 py-1 text-center">Semi-Skilled M</th><th className="px-2 py-1 text-center">Semi-Skilled F</th>
                    <th className="px-2 py-1 text-center">Unskilled M</th><th className="px-2 py-1 text-center">Unskilled F</th>
                    <th className="px-2 py-1 text-center font-bold">Total</th>
                  </tr></thead>
                  <tbody><tr>
                    <td className="px-2 py-1 font-medium">Participants</td>
                    {(['skilledM','skilledF','semiM','semiF','unskilledM','unskilledF'] as const).map(k => (
                      <td key={k} className="px-2 py-1"><Input className="h-6 text-[10px] text-center w-14" type="number" min="0" value={t[k]} onChange={e => updTraining(t.id, { [k]: e.target.value })} placeholder="0" /></td>
                    ))}
                    <td className="px-2 py-1 text-center font-bold text-[#0d9488]">{calcTotal(t)}</td>
                  </tr></tbody>
                </table>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div><Label className="text-[10px]">Photos</Label><FileBtn files={t.photos} onAdd={f => updTraining(t.id, { photos: [...t.photos, f] })} onRemove={i => updTraining(t.id, { photos: t.photos.filter((_,fi) => fi!==i) })} label="Photos" /></div>
                <div><Label className="text-[10px]">Reports</Label><FileBtn files={t.reports} onAdd={f => updTraining(t.id, { reports: [...t.reports, f] })} onRemove={i => updTraining(t.id, { reports: t.reports.filter((_,fi) => fi!==i) })} label="Reports" /></div>
                <div><Label className="text-[10px]">Attendance Sheet</Label><FileBtn files={t.attendance ? [t.attendance] : []} onAdd={f => updTraining(t.id, { attendance: f })} onRemove={() => updTraining(t.id, { attendance: null })} label="Attendance" single /></div>
              </div>
              <div className="space-y-1"><Label className="text-[10px]">Remarks</Label><Input className="h-7 text-xs" value={t.remarks} onChange={e => updTraining(t.id, { remarks: e.target.value })} /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ==================== STEP 8: OBSERVATIONS & REVIEW ====================

type ObsData = EVMSubmission['observations']
function ObsMetricRow({ label, value, onChange }: { label: string; value: ObsMetric; onChange: (p: Partial<ObsMetric>) => void }) {
  return (
    <tr className="border-b">
      <td className="px-3 py-2 text-xs font-medium">{label}</td>
      <td className="px-2 py-2"><Input className="h-7 text-xs text-center w-16" type="number" min="0" value={value.pmc} onChange={e => onChange({ pmc: e.target.value })} placeholder="0" /></td>
      <td className="px-2 py-2"><Input className="h-7 text-xs text-center w-16" type="number" min="0" value={value.pgmc} onChange={e => onChange({ pgmc: e.target.value })} placeholder="0" /></td>
      <td className="px-2 py-2"><Input className="h-7 text-xs text-center w-16" type="number" min="0" value={value.other} onChange={e => onChange({ other: e.target.value })} placeholder="0" /></td>
      <td className="px-2 py-2"><Input className="h-7 text-xs w-24" value={value.otherSpec} onChange={e => onChange({ otherSpec: e.target.value })} placeholder="Specify..." /></td>
    </tr>
  )
}

function Step8({ obs, setObs, projectName, month, year, training, waste }: { obs: ObsData; setObs: (o: ObsData) => void; projectName: string; month: string; year: string; training: TrainingRecord[]; waste: WasteEntry[] }) {
  const updObs = (key: keyof Omit<ObsData, 'complianceFile'>, p: Partial<ObsMetric>) =>
    setObs({ ...obs, [key]: { ...obs[key], ...p } })

  const totalTrainees = training.reduce((a, t) => a + [t.skilledM,t.skilledF,t.semiM,t.semiF,t.unskilledM,t.unskilledF].reduce((s,v) => s+(parseInt(v)||0), 0), 0)
  const totalWasteGen = waste.reduce((a, w) => a + (parseFloat(w.qtyGen) || 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeading title="Section 9 — Site Observations & Non-Conformances" />
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="text-xs w-full min-w-[500px]">
          <thead className="bg-[#0d9488]/10">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Metric</th>
              <th className="px-2 py-2 font-semibold w-20 text-center">PMC</th>
              <th className="px-2 py-2 font-semibold w-20 text-center">PgMC</th>
              <th className="px-2 py-2 font-semibold w-20 text-center">Other</th>
              <th className="px-2 py-2 font-semibold w-28 text-left">Specify Other</th>
            </tr>
          </thead>
          <tbody>
            <ObsMetricRow label="Total Site Observations Given" value={obs.given} onChange={p => updObs('given', p)} />
            <ObsMetricRow label="Total Site Observations Complied" value={obs.complied} onChange={p => updObs('complied', p)} />
            <ObsMetricRow label="Total Letters Issued" value={obs.letters} onChange={p => updObs('letters', p)} />
            <ObsMetricRow label="Non-Conformities (NCs)" value={obs.ncs} onChange={p => updObs('ncs', p)} />
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3">
        <Label className="text-xs font-semibold shrink-0">Upload Compliance File:</Label>
        <FileBtn files={obs.complianceFile ? [obs.complianceFile] : []} onAdd={f => setObs({ ...obs, complianceFile: f })} onRemove={() => setObs({ ...obs, complianceFile: null })} label="Upload File" single />
      </div>

      {/* Summary */}
      <div className="border-t pt-4">
        <SectionHeading title="Review Summary" subtitle="Summary of this month's EVM report before submission" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Project', value: projectName || '—' },
            { label: 'Reporting Month', value: month && year ? `${month} ${year}` : '—' },
            { label: 'Training Sessions', value: String(training.length) },
            { label: 'Total Trainees', value: String(totalTrainees) },
            { label: 'Total Waste Generated', value: `${totalWasteGen.toFixed(1)} units` },
            { label: 'Observations Given (PMC)', value: obs.given.pmc || '0' },
            { label: 'NCs (PMC)', value: obs.ncs.pmc || '0' },
            { label: 'NCs (PgMC)', value: obs.ncs.pgmc || '0' },
          ].map(({ label, value }) => (
            <Card key={label} className="border-slate-200">
              <CardContent className="p-2">
                <p className="text-[9px] text-muted-foreground">{label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN DIALOG ====================

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}

export default function EVMFormDialog({ open, onOpenChange, onSaved }: Props) {
  const [step, setStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()])
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [d, setD] = useState(() => initEVMData())

  const upd = useCallback(<K extends keyof typeof d>(key: K, val: (typeof d)[K]) => setD(prev => ({ ...prev, [key]: val })), [])

  const buildSubmission = (status: EVMSubmission['status']): EVMSubmission => {
    const proj = AMARAVATI_PROJECTS.find(p => p.name === projectName)
    return {
      id: `evm-${Date.now()}`, projectName, reportingMonth: `${month} ${year}`,
      projectNumber: proj?.number || '', projectTitle: proj?.title || '',
      manager: proj?.manager || '', customer: proj?.customer || '',
      boq: proj?.boq || '', boqDesc: proj?.boqDesc || '',
      createdDate: new Date().toLocaleDateString('en-IN'),
      status, submittedAt: status === 'Submitted' ? new Date().toISOString() : undefined,
      ...d,
    }
  }

  const handleSaveDraft = () => {
    const subs = loadEVMSubmissions()
    saveEVMSubmissions([buildSubmission('Draft'), ...subs])
    toast.success('Saved as Draft'); onSaved(); onOpenChange(false)
  }

  const handleSubmit = () => {
    const hasData = !!projectName || d.training.length > 0 || d.waste.some(w => w.qtyGen)
      || Object.values(d.statutory.ec).some(e => e.status)
    if (!hasData) { toast.error('Failed to Create'); return }
    const subs = loadEVMSubmissions()
    saveEVMSubmissions([buildSubmission('Submitted'), ...subs])
    toast.success('Successfully Submitted'); onSaved(); onOpenChange(false)
  }

  const next = () => setStep(s => Math.min(s + 1, 7))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:!max-w-[1100px] h-[90vh] max-h-[750px] rounded-2xl flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-950">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#0d9488] text-white">
              <ClipboardList className="h-3.5 w-3.5" />
            </span>
            EVM — Environmental Compliance Monitoring Form
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 sm:px-8 py-4 border-b shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto">
            <StepProgress current={step} />
          </div>
        </div>

        <div className="flex-1 min-w-0 overflow-y-auto px-7 sm:px-8 py-6">
          {step === 0 && <Step1 projectName={projectName} setProjectName={setProjectName} month={month} setMonth={setMonth} year={year} setYear={setYear} personnel={d.personnel} setPersonnel={v => upd('personnel', v)} />}
          {step === 1 && <Step2 data={d.statutory} onChange={v => upd('statutory', v)} />}
          {step === 2 && <Step3 data={d.air} onChange={v => upd('air', v)} />}
          {step === 3 && <Step4 data={d.noise} onChange={v => upd('noise', v)} />}
          {step === 4 && <Step5 water={d.water} setWater={v => upd('water', v)} ww={d.wastewater} setWW={v => upd('wastewater', v)} />}
          {step === 5 && <Step6 soil={d.soil} setSoil={v => upd('soil', v)} muck={d.muck} setMuck={v => upd('muck', v)} trees={d.trees} setTrees={v => upd('trees', v)} />}
          {step === 6 && <Step7 waste={d.waste} setWaste={v => upd('waste', v)} training={d.training} setTraining={v => upd('training', v)} />}
          {step === 7 && <Step8 obs={d.observations} setObs={v => upd('observations', v)} projectName={projectName} month={month} year={year} training={d.training} waste={d.waste} />}
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
              {step === 7 ? (
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
