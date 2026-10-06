'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Shield, FileText, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavStore } from '@/stores/nav-store'
import { cn } from '@/lib/utils'

interface ContractorOption {
  id: string
  name: string
}

interface SiteOption {
  id: string
  name: string
}

const INCIDENT_TYPES = [
  'Fatality',
  'Lost Time Injury',
  'Displacement Without Due Process',
  'Child Labor',
  'Acts of Violence/Protest',
  'Disease Outbreaks',
  'Forced Labor',
  'Unexpected Impacts on heritage resources',
  'Unexpected impacts on biodiversity resources',
  'Environmental pollution incident',
  'Dam failure',
  'Other',
]

export default function IncidentFormDialog() {
  const open = useNavStore((s) => s.incidentFormDialogOpen)
  const closeIncidentForm = useNavStore((s) => s.closeIncidentForm)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) closeIncidentForm()
      }}
    >
      <DialogContent
        className="w-[96vw] sm:!max-w-[800px] max-h-[92vh] h-[86vh] flex flex-col p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {open && <IncidentPartAForm onClose={closeIncidentForm} />}
      </DialogContent>
    </Dialog>
  )
}

function IncidentPartAForm({ onClose }: { onClose: () => void }) {
  const setPage = useNavStore((s) => s.setPage)
  const queryClient = useQueryClient()

  // Wizard step: 1 (Basic Info), 2 (Classification), 3 (Initial Situation & Actions)
  const [step, setStep] = useState(1)

  // Basic Information
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('')
  const [reportedBy, setReportedBy] = useState('')
  const [dateTimeReported, setDateTimeReported] = useState('')
  const [project, setProject] = useState('')
  const [packageContract, setPackageContract] = useState('')
  const [locationOnSite, setLocationOnSite] = useState('')
  const [contractorId, setContractorId] = useState('')
  const [siteId, setSiteId] = useState('')
  const [subcontractor, setSubcontractor] = useState('')
  const [briefIncidentTitle, setBriefIncidentTitle] = useState('')
  const [description, setDescription] = useState('')

  // Type classification
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  // Initial Situation
  const [isAnyoneInjured, setIsAnyoneInjured] = useState(false)
  const [isOngoing, setIsOngoing] = useState(false)
  const [immediateActionRequired, setImmediateActionRequired] = useState(false)
  const [authoritiesContacted, setAuthoritiesContacted] = useState(false)

  const { data: contractors } = useQuery<ContractorOption[]>({
    queryKey: ['contractors'],
    queryFn: () => fetch('/api/contractors').then((r) => r.json()),
  })
  const { data: sites } = useQuery<SiteOption[]>({
    queryKey: ['sites'],
    queryFn: () => fetch('/api/sites').then((r) => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      toast.success('Incident logged successfully! Opening Part B Wizard...')
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
      if (data?.data?.id) {
        setPage('incident-detail', { id: data.data.id, tab: 'partB' })
      }
    },
    onError: () => toast.error('Failed to log incident'),
  })

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  // Handle final submission without any mandatory restrictions
  const handleFinalSubmit = () => {
    const effectiveDate = date || new Date().toISOString().slice(0, 10)
    const effectiveDescription = description.trim() || briefIncidentTitle.trim() || 'Incident logged'
    const effectiveTypes = selectedTypes.length > 0 ? selectedTypes : ['Other']

    const body: Record<string, unknown> = {
      date: effectiveDate,
      time: time || null,
      reportedBy: reportedBy || null,
      dateTimeReported: dateTimeReported || null,
      project: project || null,
      packageContract: packageContract || null,
      locationOnSite: locationOnSite || null,
      contractorId: contractorId || null,
      siteId: siteId || null,
      description: effectiveDescription,
      briefIncidentTitle: briefIncidentTitle || null,
      incidentType: effectiveTypes.join(', '),
      isAnyoneInjured,
      isOngoing,
      immediateActionRequired,
      authoritiesContacted,
      partB: {
        incidentTypes: JSON.stringify(effectiveTypes),
        subContractor: subcontractor || null,
      }
    }
    createMutation.mutate(body)
  }

  return (
    <>
      <DialogHeader className="px-5 py-3 border-b shrink-0 bg-[#F1E1CE]/50 dark:bg-stone-900/80">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold font-display flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-[#8B2A2A]" />
            Log New Incident
          </DialogTitle>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--maroon-700,#8B2A2A)] text-white font-body">
            Step {step} of 3
          </span>
        </div>
        <DialogDescription className="text-xs font-body text-stone-600 dark:text-stone-400 mt-1">
          {step === 1 && 'Step 1: Enter basic incident information. No fields are mandatory — fill what you know and proceed.'}
          {step === 2 && 'Step 2: Classify the incident type(s). Select any applicable categories or proceed.'}
          {step === 3 && 'Step 3: Review initial situation and emergency measures before advancing to the next wizard.'}
        </DialogDescription>
      </DialogHeader>

      {/* Wizard Step Navigation Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-stone-50 dark:bg-stone-900/40 border-b border-border text-xs font-body shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium",
              step === 1
                ? "bg-[var(--maroon-700,#8B2A2A)] text-white shadow-xs font-semibold"
                : "bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#F1E1CE]"
            )}
          >
            <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold", step === 1 ? "bg-white/25 text-white" : "bg-stone-300 dark:bg-stone-700")}>1</span>
            <span>1. Basic Info</span>
          </button>
          <span className="text-stone-400">→</span>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium",
              step === 2
                ? "bg-[var(--maroon-700,#8B2A2A)] text-white shadow-xs font-semibold"
                : "bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#F1E1CE]"
            )}
          >
            <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold", step === 2 ? "bg-white/25 text-white" : "bg-stone-300 dark:bg-stone-700")}>2</span>
            <span>2. Classification</span>
          </button>
          <span className="text-stone-400">→</span>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium",
              step === 3
                ? "bg-[var(--maroon-700,#8B2A2A)] text-white shadow-xs font-semibold"
                : "bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#F1E1CE]"
            )}
          >
            <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold", step === 3 ? "bg-white/25 text-white" : "bg-stone-300 dark:bg-stone-700")}>3</span>
            <span>3. Situation & Actions</span>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>Optional / Non-blocking</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto px-5 py-5 font-body">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-base font-display text-foreground">A1. Basic Incident Information</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All fields are optional. Fill any details or click Next to continue.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Date of Incident</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Reported By</Label><Input placeholder="Name of reporter" value={reportedBy} onChange={e => setReportedBy(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Date/Time Reported</Label><Input type="datetime-local" value={dateTimeReported} onChange={e => setDateTimeReported(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Project</Label><Input placeholder="Project name / sector" value={project} onChange={e => setProject(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Package / Contract</Label><Input placeholder="e.g. PKG-02 Roadworks" value={packageContract} onChange={e => setPackageContract(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Location on Site</Label><Input placeholder="Specific site zone or landmark" value={locationOnSite} onChange={e => setLocationOnSite(e.target.value)} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name of Main Contractor</Label>
                <Select value={contractorId} onValueChange={setContractorId}>
                  <SelectTrigger><SelectValue placeholder="Select Contractor (Optional)" /></SelectTrigger>
                  <SelectContent>
                    {contractors?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2"><Label className="text-xs">Full Name of Subcontractor</Label><Input placeholder="Subcontractor name if applicable" value={subcontractor} onChange={e => setSubcontractor(e.target.value)} /></div>
            </div>
            <div className="pt-2 space-y-3">
              <div className="space-y-1.5"><Label className="text-xs">Brief Incident Title</Label><Input value={briefIncidentTitle} onChange={e => setBriefIncidentTitle(e.target.value)} placeholder="Short title for quick identification" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Brief Initial Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What occurred? (Carried over to Part B)" /></div>
            </div>
          </div>
        )}

        {/* Step 2: Incident Classification */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-base font-display text-foreground">A2. Initial Incident Classification</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Select applicable incident classification categories (or click Next to proceed with default).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {INCIDENT_TYPES.map(type => {
                const isSelected = selectedTypes.includes(type)
                return (
                  <div
                    key={type}
                    onClick={() => toggleType(type)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "border-[var(--maroon-700,#8B2A2A)] bg-[#F1E1CE]/40 dark:bg-[var(--maroon-700,#8B2A2A)]/15"
                        : "border-border hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    )}
                  >
                    <Checkbox 
                      id={`type-${type}`} 
                      checked={isSelected} 
                      onCheckedChange={() => toggleType(type)}
                      className="mt-0.5 pointer-events-none"
                    />
                    <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer leading-tight pt-0.5 select-none flex-1 text-sm">{type}</Label>
                  </div>
                )
              })}
            </div>
            {selectedTypes.length > 0 && (
              <div className="p-3 bg-[#F1E1CE]/30 dark:bg-stone-900 rounded-lg flex items-center gap-2 text-xs">
                <span className="font-semibold text-[var(--maroon-700,#8B2A2A)]">{selectedTypes.length} category selected:</span>
                <span className="text-muted-foreground">{selectedTypes.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Initial Situation & Emergency Actions */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-base font-display text-foreground">A3. Initial Situation & Emergency Measures</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Confirm situation flags. Clicking Next will finalize Part A and proceed directly to Part B wizard.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <Label className="text-xs font-semibold">Is anyone injured?</Label>
                <RadioGroup
                  value={isAnyoneInjured ? 'yes' : 'no'}
                  onValueChange={(v) => setIsAnyoneInjured(v === 'yes')}
                  className="flex items-center gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="inj-yes" />
                    <Label htmlFor="inj-yes" className="cursor-pointer text-xs">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="inj-no" />
                    <Label htmlFor="inj-no" className="cursor-pointer text-xs">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <Label className="text-xs font-semibold">Is the incident ongoing?</Label>
                <RadioGroup
                  value={isOngoing ? 'yes' : 'no'}
                  onValueChange={(v) => setIsOngoing(v === 'yes')}
                  className="flex items-center gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="ong-yes" />
                    <Label htmlFor="ong-yes" className="cursor-pointer text-xs">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="ong-no" />
                    <Label htmlFor="ong-no" className="cursor-pointer text-xs">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <Label className="text-xs font-semibold">Is immediate action required?</Label>
                <RadioGroup
                  value={immediateActionRequired ? 'yes' : 'no'}
                  onValueChange={(v) => setImmediateActionRequired(v === 'yes')}
                  className="flex items-center gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="imm-yes" />
                    <Label htmlFor="imm-yes" className="cursor-pointer text-xs">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="imm-no" />
                    <Label htmlFor="imm-no" className="cursor-pointer text-xs">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <Label className="text-xs font-semibold">Emergency services / authorities contacted?</Label>
                <RadioGroup
                  value={authoritiesContacted ? 'yes' : 'no'}
                  onValueChange={(v) => setAuthoritiesContacted(v === 'yes')}
                  className="flex items-center gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="auth-yes" />
                    <Label htmlFor="auth-yes" className="cursor-pointer text-xs">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="auth-no" />
                    <Label htmlFor="auth-no" className="cursor-pointer text-xs">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Incident Summary Card */}
            <div className="p-3.5 rounded-xl border border-[#E2CEB7] bg-[#F1E1CE]/30 dark:bg-stone-900/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[var(--maroon-700,#8B2A2A)]">
                <FileText className="h-4 w-4" />
                <span>Next Wizard Preview: Part B (Initial Incident Report)</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400">
                Clicking <strong>Next</strong> will register the Part A incident log and automatically open the Part B report wizard with your information carried forward.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="shrink-0 border-t bg-background px-5 py-3.5 flex items-center justify-between font-body">
        <div>
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {step < 3 ? (
            <Button
              type="button"
              className="bg-[var(--maroon-700,#8B2A2A)] hover:bg-[var(--maroon-800,#742222)] text-white gap-1.5 px-5"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-[var(--maroon-700,#8B2A2A)] hover:bg-[var(--maroon-800,#742222)] text-white gap-1.5 px-6"
              onClick={handleFinalSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Logging Incident...' : (
                <>
                  Next: Part B Wizard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
