'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertTriangle, FileText, User, MapPin, Calendar, Activity, Hospital, ShieldCheck, Skull, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useNavStore } from '@/stores/nav-store'
import { useAuthStore, rolePermissions } from '@/stores/auth-store'
import { StatusBadge } from '@/components/shared/status-badge'
import PhotoUploader from '@/components/shared/photo-uploader'
import { format, isPast, parseISO } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IncidentPartBForm } from './incident-part-b-form'
import { IncidentPartCForm } from './incident-part-c-form'

// ---------- types ----------
interface IncidentWorker {
  id: string
  workerId: string | null
  workerName: string | null
  injuryDesc: string | null
  worker?: { id: string; fullName: string; employeeNumber: string }
}

interface FollowUp {
  id: string
  action: string
  dueDate: string | null
  responsiblePerson: string | null
  completed: boolean
  completedAt: string | null
  remarks: string | null
  createdAt: string
}

interface IncidentDetail {
  id: string
  incidentNumber: string
  incidentType: string
  date: string
  time: string | null
  locationOnSite: string | null
  description: string
  rootCause: string | null
  immediateAction: string | null
  firstResponder: string | null
  hospitalReferred: string | null
  severity: string
  status: string
  project: string | null
  packageContract: string | null
  reportedBy: string | null
  dateTimeReported: string | null
  briefIncidentTitle: string | null
  isAnyoneInjured: boolean
  isOngoing: boolean
  immediateActionRequired: boolean
  authoritiesContacted: boolean
  isDeath: boolean
  policeFIRReference: string | null
  employerNotifiedAt: string | null
  compensationStatus: string | null
  familyNotified: boolean
  closureStatus: string | null
  photos: string | null
  contractor: { id: string; name: string } | null
  site: { id: string; name: string } | null
  workers: IncidentWorker[]
  followUps: FollowUp[]
  partBStatus: string
  partCStatus: string
  partB?: any
  partC?: any
  annexures?: any[]
}

const typeLabels: Record<string, string> = {
  FireInjury: 'Fire Injury',
  MinorInjury: 'Minor Injury',
  MajorFatalInjury: 'Major/Fatal Injury',
  Death: 'Death',
}

const typeBadgeClass: Record<string, string> = {
  FireInjury: 'bg-red-100 text-red-800 border-red-200',
  MinorInjury: 'bg-amber-100 text-amber-800 border-amber-200',
  MajorFatalInjury: 'bg-red-100 text-red-800 border-red-300',
  Death: 'bg-red-900 text-white border-red-800',
}

const severityClass: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-amber-100 text-amber-800 border-amber-200',
  Critical: 'bg-red-100 text-red-800 border-red-300',
}

// ---------- main ----------
export default function IncidentDetailView() {
  const pageParams = useNavStore((s) => s.pageParams)
  const goBack = useNavStore((s) => s.goBack)
  const role = useAuthStore((s) => s.role)
  const perms = rolePermissions[role]
  const queryClient = useQueryClient()
  const id = pageParams.id

  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [followUpAction, setFollowUpAction] = useState('')
  const [followUpPerson, setFollowUpPerson] = useState('')
  const [followUpDue, setFollowUpDue] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const { data, isLoading } = useQuery<{ data: IncidentDetail }>({ queryKey: ['incident', id], queryFn: () => fetch(`/api/incidents/${id}?t=${Date.now()}`).then((r) => r.json()), enabled: !!id })
  const incident = data?.data

  // Compute photos from server data
  const serverPhotos = (() => {
    if (!incident?.photos) return [] as string[]
    try { return JSON.parse(incident.photos) as string[] } catch { return [] as string[] }
  })()

  // Local photos state for immediate UI feedback during upload
  const [localPhotos, setLocalPhotos] = useState<string[] | null>(null)

  // Use local photos if available (during upload), otherwise server photos
  const photos = localPhotos ?? serverPhotos

  const photosMutation = useMutation({
    mutationFn: (newPhotos: string[]) =>
      fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: newPhotos.length > 0 ? JSON.stringify(newPhotos) : null }),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast.success('Photos updated')
      setLocalPhotos(null)
      queryClient.invalidateQueries({ queryKey: ['incident', id] })
    },
    onError: () => toast.error('Failed to update photos'),
  })

  const handlePhotosChange = (newPhotos: string[]) => {
    setLocalPhotos(newPhotos)
    photosMutation.mutate(newPhotos)
  }

  const followUpMutation = useMutation({
    mutationFn: (body: { action: string; responsiblePerson: string; dueDate: string }) =>
      fetch(`/api/incidents/${id}/followups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast.success('Follow-up added')
      queryClient.invalidateQueries({ queryKey: ['incident', id] })
      setFollowUpAction(''); setFollowUpPerson(''); setFollowUpDue(''); setShowFollowUpForm(false)
    },
    onError: () => toast.error('Failed to add follow-up'),
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      fetch(`/api/incidents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then((r) => r.json()),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['incident', id] })
      setNewStatus('')
    },
    onError: () => toast.error('Failed to update status'),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-48" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      </div>
    )
  }

  if (!incident) {
    return <div className="text-center py-20 text-muted-foreground">Incident not found</div>
  }

  const infoItems = [
    { label: 'Type', value: incident.incidentType, icon: AlertTriangle, badge: typeBadgeClass[incident.incidentType] },
    { label: 'Date', value: format(new Date(incident.date), 'dd MMM yyyy'), icon: Calendar },
    { label: 'Time', value: incident.time || '—', icon: Clock },
    { label: 'Location', value: incident.locationOnSite || '—', icon: MapPin },
    { label: 'Project', value: incident.project || '—', icon: FileText },
    { label: 'Package/Contract', value: incident.packageContract || '—', icon: FileText },
    { label: 'Reported By', value: incident.reportedBy || '—', icon: User },
    { label: 'Date/Time Reported', value: incident.dateTimeReported ? format(new Date(incident.dateTimeReported), 'dd MMM yyyy HH:mm') : '—', icon: Clock },
  ]

  const deathChecklist = [
    { label: 'FIR Reference', value: incident.policeFIRReference, done: !!incident.policeFIRReference },
    { label: 'Employer Notified', value: incident.employerNotifiedAt ? format(parseISO(incident.employerNotifiedAt), 'dd MMM yyyy HH:mm') : null, done: !!incident.employerNotifiedAt },
    { label: 'Compensation Status', value: incident.compensationStatus, done: incident.compensationStatus === 'Completed' },
    { label: 'Family Notified', value: incident.familyNotified ? 'Yes' : 'No', done: incident.familyNotified },
    { label: 'Closure Status', value: incident.closureStatus, done: incident.closureStatus === 'Complete' },
  ]

  return (
    <div className="h-full flex flex-col min-h-0 gap-6 overflow-hidden pb-4">
      {/* ====== Header ====== */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={goBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight font-mono">{incident.incidentNumber}</h1>
          <Badge variant="outline" className={typeBadgeClass[incident.incidentType] || ''}>
            {typeLabels[incident.incidentType] || incident.incidentType}
          </Badge>
          <Badge variant="outline" className={severityClass[incident.severity] || ''}>
            {incident.severity}
          </Badge>
          <StatusBadge status={incident.status} size="md" />
          {incident.isDeath && (
            <Badge className="bg-red-900 text-white border-red-800">
              <Skull className="h-3 w-3 mr-1" /> DEATH CASE
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList className="flex w-full overflow-x-auto justify-start shrink-0 h-auto mb-6 bg-transparent p-0 gap-2">
          <TabsTrigger value="overview" className="flex-1 h-10 px-4 gap-2 !border !border-slate-300 !bg-white !text-black !font-bold !rounded-md !shadow-sm data-[state=inactive]:shadow-[0_3px_0_0_#cbd5e1] !transform-none hover:!bg-slate-50 data-[state=active]:!border-[#0d9488] transition-all">
            Overview
          </TabsTrigger>
          <TabsTrigger value="partB" className="flex-1 h-10 px-4 gap-2 !border !border-slate-300 !bg-white !text-black !font-bold !rounded-md !shadow-sm data-[state=inactive]:shadow-[0_3px_0_0_#cbd5e1] !transform-none hover:!bg-slate-50 data-[state=active]:!border-[#0d9488] transition-all">
            Part B
            {incident.partBStatus === 'Submitted' && <CheckCircle2 className="h-3.5 w-3.5 ml-1.5 text-emerald-600" />}
          </TabsTrigger>
          <TabsTrigger value="partC" className="flex-1 h-10 px-4 gap-2 !border !border-slate-300 !bg-white !text-black !font-bold !rounded-md !shadow-sm data-[state=inactive]:shadow-[0_3px_0_0_#cbd5e1] !transform-none hover:!bg-slate-50 data-[state=active]:!border-[#0d9488] transition-all">
            Part C
            {incident.partCStatus === 'Submitted' && <CheckCircle2 className="h-3.5 w-3.5 ml-1.5 text-emerald-600" />}
          </TabsTrigger>
          <TabsTrigger value="annexures" className="flex-1 h-10 px-4 gap-2 !border !border-slate-300 !bg-white !text-black !font-bold !rounded-md !shadow-sm data-[state=inactive]:shadow-[0_3px_0_0_#cbd5e1] !transform-none hover:!bg-slate-50 data-[state=active]:!border-[#0d9488] transition-all">
            Annexures
            {incident.annexures && incident.annexures.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{incident.annexures.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6 min-h-0">
      {/* ====== Incident Info ====== */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> Incident Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.badge ? (
                  <Badge variant="outline" className={item.badge}>{typeLabels[item.value] || item.value}</Badge>
                ) : (
                  <p className="text-sm font-medium mt-0.5">{item.value}</p>
                )}
              </div>
            </div>
          ))}
          <Separator className="sm:col-span-2" />
          <div className="sm:col-span-2 space-y-3">
            {incident.briefIncidentTitle && <div><p className="text-xs text-muted-foreground mb-1">Brief Title</p><p className="text-sm font-medium">{incident.briefIncidentTitle}</p></div>}
            <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm whitespace-pre-wrap">{incident.description}</p></div>
          </div>
          
          <Separator className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <h4 className="text-sm font-semibold mb-3">Initial Situation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${incident.isAnyoneInjured ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {incident.isAnyoneInjured ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <p className="text-sm">Is anyone injured? <span className="font-semibold">{incident.isAnyoneInjured ? 'Yes' : 'No'}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${incident.isOngoing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {incident.isOngoing ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <p className="text-sm">Is incident ongoing? <span className="font-semibold">{incident.isOngoing ? 'Yes' : 'No'}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${incident.immediateActionRequired ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {incident.immediateActionRequired ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <p className="text-sm">Immediate action required? <span className="font-semibold">{incident.immediateActionRequired ? 'Yes' : 'No'}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${incident.authoritiesContacted ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-sm">Authorities contacted? <span className="font-semibold">{incident.authoritiesContacted ? 'Yes' : 'No'}</span></p>
              </div>
            </div>
          </div>

          <div><p className="text-xs text-muted-foreground">First Responder</p><p className="text-sm font-medium mt-0.5">{incident.firstResponder || '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Hospital Referred</p><p className="text-sm font-medium mt-0.5">{incident.hospitalReferred || '—'}</p></div>
          {(incident.contractor || incident.site) && (
            <>
              {incident.contractor && <div><p className="text-xs text-muted-foreground">Contractor</p><p className="text-sm font-medium mt-0.5">{incident.contractor.name}</p></div>}
              {incident.site && <div><p className="text-xs text-muted-foreground">Site</p><p className="text-sm font-medium mt-0.5">{incident.site.name}</p></div>}
            </>
          )}
        </CardContent>
      </Card>

      {/* ====== Workers Involved ====== */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-teal-600" /> Workers Involved ({incident.workers.length})</CardTitle></CardHeader>
        <CardContent>
          {incident.workers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workers listed for this incident</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {incident.workers.map((w) => (
                <div key={w.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="rounded-full p-2 bg-teal-50 shrink-0">
                    <User className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{w.worker?.fullName || w.workerName || 'Unknown'}</p>
                    {w.worker?.employeeNumber && <p className="text-xs text-muted-foreground">{w.worker.employeeNumber}</p>}
                    {w.injuryDesc && <p className="text-sm text-muted-foreground mt-1">{w.injuryDesc}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====== Evidence Photos ====== */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Camera className="h-4 w-4 text-teal-600" /> Evidence Photos</CardTitle></CardHeader>
        <CardContent>
          <PhotoUploader
            photos={photos}
            onPhotosChange={handlePhotosChange}
            maxPhotos={5}
            label="Evidence"
            disabled={!perms.canEdit || photosMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* ====== Death Workflow ====== */}
      {incident.isDeath && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <Skull className="h-4 w-4" /> Death Case — Mandatory Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deathChecklist.map((item, idx) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 shrink-0 ${item.done ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.done ? 'Done' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.value || 'Not recorded'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== Follow-up Actions ====== */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-teal-600" /> Follow-up Actions ({incident.followUps.length})</CardTitle>
            {perms.canEdit && !showFollowUpForm && (
              <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white" onClick={() => setShowFollowUpForm(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Follow-up
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFollowUpForm && (
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <div>
                <Label className="text-xs">Action *</Label>
                <Textarea className="mt-1" rows={2} value={followUpAction} onChange={(e) => setFollowUpAction(e.target.value)} placeholder="Describe the follow-up action..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Responsible Person</Label>
                  <Input className="mt-1" value={followUpPerson} onChange={(e) => setFollowUpPerson(e.target.value)} placeholder="Name" />
                </div>
                <div>
                  <Label className="text-xs">Due Date</Label>
                  <Input type="date" className="mt-1" value={followUpDue} onChange={(e) => setFollowUpDue(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white" disabled={!followUpAction || followUpMutation.isPending} onClick={() => followUpMutation.mutate({ action: followUpAction, responsiblePerson: followUpPerson, dueDate: followUpDue })}>
                  {followUpMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowFollowUpForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {incident.followUps.length === 0 && !showFollowUpForm ? (
            <p className="text-sm text-muted-foreground">No follow-up actions yet</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {incident.followUps.map((fu) => {
                const overdue = fu.dueDate && !fu.completed && isPast(parseISO(fu.dueDate))
                return (
                  <div key={fu.id} className={`flex items-start gap-3 p-3 rounded-lg border ${fu.completed ? 'bg-emerald-50/50 border-emerald-100' : overdue ? 'bg-red-50/50 border-red-100' : 'bg-muted/30'}`}>
                    <div className="mt-0.5 shrink-0">
                      {fu.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Clock className={`h-5 w-5 ${overdue ? 'text-red-500' : 'text-amber-500'}`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${fu.completed ? 'line-through text-muted-foreground' : ''}`}>{fu.action}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {fu.responsiblePerson && <span>👤 {fu.responsiblePerson}</span>}
                        {fu.dueDate && (
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            📅 {format(parseISO(fu.dueDate), 'dd MMM yyyy')}
                            {overdue && ' (Overdue)'}
                          </span>
                        )}
                        {fu.completedAt && <span>✅ {format(parseISO(fu.completedAt), 'dd MMM yyyy')}</span>}
                      </div>
                      {fu.remarks && <p className="text-xs text-muted-foreground mt-1">{fu.remarks}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====== Update Status ====== */}
      {perms.canEdit && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600" /> Update Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Change status to..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Investigation Pending">Investigation Pending</SelectItem>
                  <SelectItem value="Investigation In Progress">Investigation In Progress</SelectItem>
                  <SelectItem value="UnderInvestigation">Under Investigation</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white" disabled={!newStatus || statusMutation.isPending} onClick={() => statusMutation.mutate(newStatus)}>
                {statusMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </TabsContent>

      <TabsContent value="partB" className="flex-1 overflow-y-auto pr-2 pb-6 min-h-0">
        <IncidentPartBForm 
          incidentId={id} 
          initialData={incident.partB || {}} 
          status={incident.partBStatus} 
        />
      </TabsContent>

      <TabsContent value="partC" className="flex-1 overflow-y-auto pr-2 pb-6 min-h-0">
        <IncidentPartCForm 
          incidentId={id} 
          initialData={incident.partC || {}} 
          status={incident.partCStatus} 
        />
      </TabsContent>

      <TabsContent value="annexures" className="flex-1 overflow-y-auto pr-2 pb-6 min-h-0">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Annexures list and upload will go here</p>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  )
}
