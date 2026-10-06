'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, AlertTriangle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
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

export default function IncidentFormView() {
  const goBack = useNavStore((s) => s.goBack)
  const setPage = useNavStore((s) => s.setPage)
  const queryClient = useQueryClient()

  // Wizard Step: 1, 2, 3
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
      if (data?.data?.id) {
        setPage('incident-detail', { id: data.data.id, tab: 'partB' })
      } else {
        goBack()
      }
    },
    onError: () => toast.error('Failed to log incident'),
  })

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  // Handle submit with zero mandatory validation
  const handleSubmit = () => {
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
    <div className="space-y-6 max-w-3xl min-w-0 pb-6 font-body">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <h1 className="text-xl font-bold tracking-tight font-display">Log New Incident</h1>
      </div>

      <Card>
        <CardHeader className="bg-[#F1E1CE]/40 dark:bg-stone-900/60 pb-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 font-display">
              <AlertTriangle className="h-5 w-5 text-[#8B2A2A]" />
              Part A — Initial Incident Log
            </CardTitle>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--maroon-700,#8B2A2A)] text-white">
              Step {step} of 3
            </span>
          </div>
          <CardDescription className="text-xs">
            {step === 1 && 'Step 1: Basic incident information. No mandatory fields — click Next whenever ready.'}
            {step === 2 && 'Step 2: Incident classification categories.'}
            {step === 3 && 'Step 3: Initial situation flags and review before opening the Part B wizard.'}
          </CardDescription>

          {/* Stepper pills */}
          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                step === 1 ? "bg-[var(--maroon-700,#8B2A2A)] text-white font-semibold" : "bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>1. Basic Info</span>
            </button>
            <span className="text-stone-400">→</span>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                step === 2 ? "bg-[var(--maroon-700,#8B2A2A)] text-white font-semibold" : "bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>2. Classification</span>
            </button>
            <span className="text-stone-400">→</span>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                step === 3 ? "bg-[var(--maroon-700,#8B2A2A)] text-white font-semibold" : "bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
              <span>3. Situation & Actions</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-base font-display">A1. Basic Incident Information</h3>
                <p className="text-xs text-muted-foreground">All fields are optional.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">Date of Incident</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Reported By</Label><Input placeholder="Name of reporter" value={reportedBy} onChange={e => setReportedBy(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Date/Time Reported</Label><Input type="datetime-local" value={dateTimeReported} onChange={e => setDateTimeReported(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Project</Label><Input placeholder="Project name" value={project} onChange={e => setProject(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Package/Contract</Label><Input placeholder="Package reference" value={packageContract} onChange={e => setPackageContract(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Location/Site</Label><Input placeholder="Site location" value={locationOnSite} onChange={e => setLocationOnSite(e.target.value)} /></div>
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
                <div className="space-y-1.5 md:col-span-2"><Label className="text-xs">Full Name of Subcontractor</Label><Input placeholder="Subcontractor name" value={subcontractor} onChange={e => setSubcontractor(e.target.value)} /></div>
              </div>
              <div className="pt-2 space-y-3">
                <div className="space-y-1.5"><Label className="text-xs">Brief Incident Title</Label><Input value={briefIncidentTitle} onChange={e => setBriefIncidentTitle(e.target.value)} placeholder="Short title for identification" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Brief Initial Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What occurred? (Carried over to Part B)" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-base font-display">A2. Initial Incident Classification</h3>
                <p className="text-xs text-muted-foreground">Select applicable categories or click Next to proceed.</p>
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
                        id={`type-view-${type}`} 
                        checked={isSelected} 
                        onCheckedChange={() => toggleType(type)}
                        className="mt-0.5 pointer-events-none"
                      />
                      <Label htmlFor={`type-view-${type}`} className="font-normal cursor-pointer leading-tight pt-0.5 select-none flex-1 text-sm">{type}</Label>
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

          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-base font-display">A3. Initial Situation & Actions</h3>
                <p className="text-xs text-muted-foreground">Confirm situation parameters and proceed to Part B wizard.</p>
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
                      <RadioGroupItem value="yes" id="inj-view-yes" />
                      <Label htmlFor="inj-view-yes" className="cursor-pointer text-xs">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="inj-view-no" />
                      <Label htmlFor="inj-view-no" className="cursor-pointer text-xs">No</Label>
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
                      <RadioGroupItem value="yes" id="ong-view-yes" />
                      <Label htmlFor="ong-view-yes" className="cursor-pointer text-xs">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="ong-view-no" />
                      <Label htmlFor="ong-view-no" className="cursor-pointer text-xs">No</Label>
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
                      <RadioGroupItem value="yes" id="imm-view-yes" />
                      <Label htmlFor="imm-view-yes" className="cursor-pointer text-xs">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="imm-view-no" />
                      <Label htmlFor="imm-view-no" className="cursor-pointer text-xs">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                  <Label className="text-xs font-semibold">Emergency services contacted?</Label>
                  <RadioGroup
                    value={authoritiesContacted ? 'yes' : 'no'}
                    onValueChange={(v) => setAuthoritiesContacted(v === 'yes')}
                    className="flex items-center gap-4 pt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="auth-view-yes" />
                      <Label htmlFor="auth-view-yes" className="cursor-pointer text-xs">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="auth-view-no" />
                      <Label htmlFor="auth-view-no" className="cursor-pointer text-xs">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2CEB7] bg-[#F1E1CE]/30 dark:bg-stone-900/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-[var(--maroon-700,#8B2A2A)]">
                  <FileText className="h-4 w-4" />
                  <span>Next Wizard Preview: Part B (Initial Incident Report)</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400">
                  Clicking <strong>Next</strong> will register Part A and immediately transition to the Part B report wizard.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
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
              <Button type="button" variant="outline" onClick={goBack}>
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
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Logging Incident...' : (
                  <>
                    Next: Part B Wizard
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
