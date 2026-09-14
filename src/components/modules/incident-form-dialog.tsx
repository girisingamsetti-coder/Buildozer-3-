'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Info } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavStore } from '@/stores/nav-store'

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
        className="w-[96vw] sm:!max-w-[800px] max-h-[90vh] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
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

  // Basic Information
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reportedBy, setReportedBy] = useState('')
  const [dateTimeReported, setDateTimeReported] = useState('')
  const [project, setProject] = useState('')
  const [packageContract, setPackageContract] = useState('')
  const [locationOnSite, setLocationOnSite] = useState('')
  const [contractorId, setContractorId] = useState('')
  const [siteId, setSiteId] = useState('') // Just in case it's needed for DB relation
  const [subcontractor, setSubcontractor] = useState('')
  const [briefIncidentTitle, setBriefIncidentTitle] = useState('')
  const [description, setDescription] = useState('')

  // Type classification (multiselect fallback to CSV for incidentType string)
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
      toast.success('Incident logged successfully')
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
      if (data?.data?.id) {
        setPage('incident-detail', { id: data.data.id })
      }
    },
    onError: () => toast.error('Failed to log incident'),
  })

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleFinalSubmit = () => {
    if (!date || !description || selectedTypes.length === 0) {
      toast.error('Failed to Create')
      return
    }

    const body: Record<string, unknown> = {
      date,
      time: time || null,
      reportedBy: reportedBy || null,
      dateTimeReported: dateTimeReported || null,
      project: project || null,
      packageContract: packageContract || null,
      locationOnSite: locationOnSite || null,
      contractorId: contractorId || null,
      siteId: siteId || null,
      description,
      briefIncidentTitle: briefIncidentTitle || null,
      incidentType: selectedTypes.join(', '), // primary field fallback
      isAnyoneInjured,
      isOngoing,
      immediateActionRequired,
      authoritiesContacted,
      partB: {
        // Carry forward to Part B
        incidentTypes: JSON.stringify(selectedTypes),
        subContractor: subcontractor || null,
      }
    }
    createMutation.mutate(body)
  }

  return (
    <>
      <DialogHeader className="px-5 py-4 border-b shrink-0 bg-muted/20">
        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Part A — Initial Incident Log
        </DialogTitle>
        <DialogDescription className="text-sm">
          Quickly record that an incident has occurred. This basic information will be carried forward to Part B (Initial Incident Report).
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto px-5 py-6">
        <div className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-base border-b pb-2">A1. Basic Incident Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date of Incident</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
              <div className="space-y-2"><Label>Reported By</Label><Input value={reportedBy} onChange={e => setReportedBy(e.target.value)} /></div>
              <div className="space-y-2"><Label>Date/Time Reported</Label><Input type="datetime-local" value={dateTimeReported} onChange={e => setDateTimeReported(e.target.value)} /></div>
              <div className="space-y-2"><Label>Project</Label><Input value={project} onChange={e => setProject(e.target.value)} /></div>
              <div className="space-y-2"><Label>Package/Contract</Label><Input value={packageContract} onChange={e => setPackageContract(e.target.value)} /></div>
              <div className="space-y-2"><Label>Location/Site</Label><Input value={locationOnSite} onChange={e => setLocationOnSite(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Full Name of Main Contractor</Label>
                <Select value={contractorId} onValueChange={setContractorId}>
                  <SelectTrigger><SelectValue placeholder="Select Contractor" /></SelectTrigger>
                  <SelectContent>
                    {contractors?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Full Name of Subcontractor</Label><Input value={subcontractor} onChange={e => setSubcontractor(e.target.value)} /></div>
            </div>
            <div className="pt-2 space-y-4">
              <div className="space-y-2"><Label>Brief Incident Title</Label><Input value={briefIncidentTitle} onChange={e => setBriefIncidentTitle(e.target.value)} placeholder="Short title for quick identification" /></div>
              <div className="space-y-2"><Label>Brief Initial Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What is the incident? (Will be carried over to Part B)" /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base border-b pb-2">A2. Initial Incident Classification</h3>
            <p className="text-sm text-muted-foreground">Please check all that apply (this will carry forward to Part B).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {INCIDENT_TYPES.map(type => (
                <div key={type} className="flex items-start gap-2">
                  <Checkbox 
                    id={`type-${type}`} 
                    checked={selectedTypes.includes(type)} 
                    onCheckedChange={() => toggleType(type)} 
                  />
                  <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer leading-tight pt-0.5">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base border-b pb-2">A3. Initial Situation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label>Is anyone injured?</Label>
                <RadioGroup
                  value={isAnyoneInjured ? 'yes' : 'no'}
                  onValueChange={(v) => setIsAnyoneInjured(v === 'yes')}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="inj-yes" />
                    <Label htmlFor="inj-yes" className="cursor-pointer font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="inj-no" />
                    <Label htmlFor="inj-no" className="cursor-pointer font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Is the incident ongoing?</Label>
                <RadioGroup
                  value={isOngoing ? 'yes' : 'no'}
                  onValueChange={(v) => setIsOngoing(v === 'yes')}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="ong-yes" />
                    <Label htmlFor="ong-yes" className="cursor-pointer font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="ong-no" />
                    <Label htmlFor="ong-no" className="cursor-pointer font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Is immediate action required?</Label>
                <RadioGroup
                  value={immediateActionRequired ? 'yes' : 'no'}
                  onValueChange={(v) => setImmediateActionRequired(v === 'yes')}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="imm-yes" />
                    <Label htmlFor="imm-yes" className="cursor-pointer font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="imm-no" />
                    <Label htmlFor="imm-no" className="cursor-pointer font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Have emergency services/authorities been contacted?</Label>
                <RadioGroup
                  value={authoritiesContacted ? 'yes' : 'no'}
                  onValueChange={(v) => setAuthoritiesContacted(v === 'yes')}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="auth-yes" />
                    <Label htmlFor="auth-yes" className="cursor-pointer font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="auth-no" />
                    <Label htmlFor="auth-no" className="cursor-pointer font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="shrink-0 border-t bg-background/95 backdrop-blur px-5 py-4 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
          onClick={handleFinalSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Logging...' : 'Log Incident (Part A)'}
        </Button>
      </div>
    </>
  )
}
