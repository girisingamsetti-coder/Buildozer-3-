'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { format } from 'date-fns'
import { Trash2, Plus, Upload } from 'lucide-react'

interface ActionRow {
  description: string
  responsibleParty: string
  expectedDate: string
  status: string
}

interface IncidentPartBFormProps {
  incidentId?: string
  initialData?: any
  status?: string
  onDataChange?: (data: any) => void
  hideActions?: boolean
}

const B2_OPTIONS = [
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

const EditedBadge = ({ original }: { original?: string }) => (
  <span 
    className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-2 border border-amber-200 font-medium shrink-0 cursor-help"
    title={original ? `Original: ${original}` : 'Edited from initial log'}
  >
    Edited
  </span>
)

export function IncidentPartBForm({ incidentId, initialData, status, onDataChange, hideActions }: IncidentPartBFormProps) {
  const queryClient = useQueryClient()
  const isReadOnly = status === 'Submitted'

  const [formData, setFormData] = useState({
    dateOfIncident: initialData?.dateOfIncident ? format(new Date(initialData.dateOfIncident), 'yyyy-MM-dd') : (initialData?.incident?.date ? format(new Date(initialData.incident.date), 'yyyy-MM-dd') : ''),
    timeOfIncident: initialData?.timeOfIncident || initialData?.incident?.time || '',
    dateReportedToPIU: initialData?.dateReportedToPIU ? format(new Date(initialData.dateReportedToPIU), 'yyyy-MM-dd') : '',
    dateReportedToWB: initialData?.dateReportedToWB ? format(new Date(initialData.dateReportedToWB), 'yyyy-MM-dd') : '',
    reportedToPIUBy: initialData?.reportedToPIUBy || '',
    reportedToWBBy: initialData?.reportedToWBBy || '',
    notificationType: initialData?.notificationType || '',
    mainContractor: initialData?.mainContractor || initialData?.incident?.contractor?.name || '',
    subContractor: initialData?.subContractor || '',

    incidentTypes: initialData?.incidentTypes ? JSON.parse(initialData.incidentTypes) : (initialData?.incident?.incidentType ? initialData.incident.incidentType.split(', ') : []),
    otherIncidentType: initialData?.otherIncidentType || '',

    descriptionWhat: initialData?.descriptionWhat || initialData?.incident?.description || '',
    descriptionConditions: initialData?.descriptionConditions || '',
    factsContested: initialData?.factsContested || 'No', // New local choice
    conflictingVersionsDesc: initialData?.conflictingVersionsDesc || '',
    isOngoingChoice: initialData?.isOngoing ? 'Ongoing' : 'Contained', // Local choice
    isOngoing: initialData?.isOngoing || '',
    authoritiesInformed: initialData?.authoritiesInformed ?? false, // DB has Boolean?
    authorityDetails: initialData?.authorityDetails || '',

    containmentActions: initialData?.containmentActions ? JSON.parse(initialData.containmentActions) : [],
    worksSuspended: initialData?.worksSuspended || false,
    suspensionContractor: initialData?.suspensionContractor || '',
    suspensionDocument: initialData?.suspensionDocument || '',

    supportProvided: initialData?.supportProvided || ''
  })

  const baseData = {
    dateOfIncident: initialData?.incident?.date ? format(new Date(initialData.incident.date), 'yyyy-MM-dd') : '',
    timeOfIncident: initialData?.incident?.time || '',
    mainContractor: initialData?.incident?.contractor?.name || '',
    descriptionWhat: initialData?.incident?.description || '',
    incidentTypes: initialData?.incident?.incidentType ? initialData.incident.incidentType.split(', ') : [],
  }

  const isEdited = (field: keyof typeof baseData) => {
    if (field === 'incidentTypes') {
      const current = [...formData.incidentTypes].sort().join(',')
      const base = [...baseData.incidentTypes].sort().join(',')
      return current !== base
    }
    return formData[field] !== baseData[field]
  }

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData)
    }
  }, [formData, onDataChange])

  const mutation = useMutation({
    mutationFn: async (payload: { isSubmit: boolean; data: any }) => {
      const dataToSave = { ...payload.data }
      dataToSave.incidentTypes = JSON.stringify(dataToSave.incidentTypes)
      dataToSave.containmentActions = JSON.stringify(dataToSave.containmentActions)

      const res = await fetch(`/api/incidents/${incidentId}/part-b`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSubmit: payload.isSubmit, data: dataToSave }),
      })
      if (!res.ok) throw new Error('Failed to save Part B')
      return res.json()
    },
    onSuccess: (data, variables) => {
      toast.success(variables.isSubmit ? 'Part B Submitted' : 'Draft Saved')
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] })
    },
    onError: () => toast.error('An error occurred'),
  })

  const handleChange = (field: string, value: any) => {
    if (isReadOnly) return
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxArray = (field: 'incidentTypes', value: string, checked: boolean) => {
    if (isReadOnly) return
    setFormData(prev => {
      const arr = prev[field] as string[]
      if (checked) {
        return { ...prev, [field]: [...arr, value] }
      } else {
        return { ...prev, [field]: arr.filter(i => i !== value) }
      }
    })
  }

  const addContainmentAction = () => {
    if (isReadOnly) return
    setFormData(prev => ({
      ...prev,
      containmentActions: [...prev.containmentActions, { description: '', responsibleParty: '', expectedDate: '', status: '' }]
    }))
  }

  const updateContainmentAction = (index: number, field: keyof ActionRow, value: string) => {
    if (isReadOnly) return
    const updated = [...formData.containmentActions]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('containmentActions', updated)
  }

  const removeContainmentAction = (index: number) => {
    if (isReadOnly) return
    const updated = formData.containmentActions.filter((_: any, i: number) => i !== index)
    handleChange('containmentActions', updated)
  }

  const handleSave = (isSubmit: boolean) => {
    mutation.mutate({ isSubmit, data: formData })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-lg">B1: Incident Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          <div className="space-y-2"><Label className="flex items-center">Date of Incident {isEdited('dateOfIncident') && <EditedBadge original={baseData.dateOfIncident} />}</Label><Input type="date" value={formData.dateOfIncident} onChange={e => handleChange('dateOfIncident', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label className="flex items-center">Time {isEdited('timeOfIncident') && <EditedBadge original={baseData.timeOfIncident} />}</Label><Input type="time" value={formData.timeOfIncident} onChange={e => handleChange('timeOfIncident', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label>Date Reported to PIU</Label><Input type="date" value={formData.dateReportedToPIU} onChange={e => handleChange('dateReportedToPIU', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label>Date Reported to WB</Label><Input type="date" value={formData.dateReportedToWB} onChange={e => handleChange('dateReportedToWB', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label>Reported to PIU by</Label><Input value={formData.reportedToPIUBy} onChange={e => handleChange('reportedToPIUBy', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label>Reported to WB by</Label><Input value={formData.reportedToWBBy} onChange={e => handleChange('reportedToWBBy', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label>Notification Type</Label><Input value={formData.notificationType} onChange={e => handleChange('notificationType', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label className="flex items-center">Full Name of Main Contractor {isEdited('mainContractor') && <EditedBadge original={baseData.mainContractor} />}</Label><Input value={formData.mainContractor} onChange={e => handleChange('mainContractor', e.target.value)} disabled={isReadOnly} /></div>
          <div className="space-y-2"><Label>Full Name of Subcontractor</Label><Input value={formData.subContractor} onChange={e => handleChange('subContractor', e.target.value)} disabled={isReadOnly} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg flex items-center">B2: Type of incident (please check all that apply) {isEdited('incidentTypes') && <EditedBadge original={baseData.incidentTypes.join(', ')} />}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {B2_OPTIONS.map(type => (
              <div key={type} className="flex items-start space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={formData.incidentTypes.includes(type)}
                  onCheckedChange={(c) => handleCheckboxArray('incidentTypes', type, c as boolean)}
                  disabled={isReadOnly}
                  className="mt-0.5"
                />
                <Label htmlFor={`type-${type}`} className="font-normal leading-snug cursor-pointer">{type}</Label>
              </div>
            ))}
          </div>
          {formData.incidentTypes.includes('Other') && (
            <div className="mt-4 space-y-2">
              <Label>Other Incident Type Details</Label>
              <Input value={formData.otherIncidentType} onChange={e => handleChange('otherIncidentType', e.target.value)} disabled={isReadOnly} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-lg">B3: Description/Narrative of Incident</CardTitle></CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center">I. What is the incident? {isEdited('descriptionWhat') && <EditedBadge original={baseData.descriptionWhat} />}</Label>
            <Textarea value={formData.descriptionWhat} onChange={e => handleChange('descriptionWhat', e.target.value)} disabled={isReadOnly} rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">II. What were the conditions or circumstances under which the incident occurred (if known)?</Label>
            <Textarea value={formData.descriptionConditions} onChange={e => handleChange('descriptionConditions', e.target.value)} disabled={isReadOnly} rows={3} />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">III. Are the basic facts of the incident clear and uncontested, or are there conflicting versions?</Label>
              <RadioGroup
                disabled={isReadOnly}
                value={formData.factsContested}
                onValueChange={(v) => handleChange('factsContested', v)}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="facts-clear" />
                  <Label htmlFor="facts-clear" className="cursor-pointer">Clear and uncontested</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="facts-conflict" />
                  <Label htmlFor="facts-conflict" className="cursor-pointer">Conflicting versions</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.factsContested === 'Yes' && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label>What are those versions?</Label>
                <Textarea value={formData.conflictingVersionsDesc} onChange={e => handleChange('conflictingVersionsDesc', e.target.value)} disabled={isReadOnly} rows={3} />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">IV. Is the incident still ongoing or is it contained?</Label>
              <RadioGroup
                disabled={isReadOnly}
                value={formData.isOngoingChoice}
                onValueChange={(v) => handleChange('isOngoingChoice', v)}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Contained" id="ongoing-no" />
                  <Label htmlFor="ongoing-no" className="cursor-pointer">Contained</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Ongoing" id="ongoing-yes" />
                  <Label htmlFor="ongoing-yes" className="cursor-pointer">Ongoing</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.isOngoingChoice === 'Ongoing' && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label>Please provide details of the ongoing situation:</Label>
                <Textarea value={formData.isOngoing} onChange={e => handleChange('isOngoing', e.target.value)} disabled={isReadOnly} rows={2} />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">V. Have any relevant authorities been informed?</Label>
              <RadioGroup
                disabled={isReadOnly}
                value={formData.authoritiesInformed ? 'Yes' : 'No'}
                onValueChange={(v) => handleChange('authoritiesInformed', v === 'Yes')}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="auth-yes" />
                  <Label htmlFor="auth-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="auth-no" />
                  <Label htmlFor="auth-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.authoritiesInformed && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label>Provide details (which authorities, when, by whom):</Label>
                <Textarea value={formData.authorityDetails} onChange={e => handleChange('authorityDetails', e.target.value)} disabled={isReadOnly} rows={2} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">B4: Actions taken to contain the incident</CardTitle>
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={addContainmentAction}>
              <Plus className="h-4 w-4 mr-1" /> Add Action
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Short Description of Action</th>
                  <th className="px-3 py-2 font-medium">Responsible Party</th>
                  <th className="px-3 py-2 font-medium">Expected Date</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  {!isReadOnly && <th className="px-3 py-2 font-medium w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {formData.containmentActions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No actions added.</td>
                  </tr>
                )}
                {formData.containmentActions.map((action: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2"><Input value={action.description} onChange={e => updateContainmentAction(idx, 'description', e.target.value)} disabled={isReadOnly} /></td>
                    <td className="p-2"><Input value={action.responsibleParty} onChange={e => updateContainmentAction(idx, 'responsibleParty', e.target.value)} disabled={isReadOnly} /></td>
                    <td className="p-2"><Input type="date" value={action.expectedDate} onChange={e => updateContainmentAction(idx, 'expectedDate', e.target.value)} disabled={isReadOnly} /></td>
                    <td className="p-2"><Input value={action.status} onChange={e => updateContainmentAction(idx, 'status', e.target.value)} disabled={isReadOnly} /></td>
                    {!isReadOnly && (
                      <td className="p-2 text-center">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeContainmentAction(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-base">Have the works been suspended (for example, under GCC8.9 of Works Contract)?</Label>
              <RadioGroup
                disabled={isReadOnly}
                value={formData.worksSuspended ? 'yes' : 'no'}
                onValueChange={(v) => handleChange('worksSuspended', v === 'yes')}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="sus-yes" />
                  <Label htmlFor="sus-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="sus-no" />
                  <Label htmlFor="sus-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.worksSuspended && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trading name of Contractor (if different from B1):</Label>
                  <Input value={formData.suspensionContractor} onChange={e => handleChange('suspensionContractor', e.target.value)} disabled={isReadOnly} />
                </div>
                <div className="space-y-2">
                  <Label>Please attach a copy of the instruction suspending the works.</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="File uploaded..." 
                      value={formData.suspensionDocument} 
                      onChange={e => handleChange('suspensionDocument', e.target.value)} 
                      disabled={isReadOnly}
                      className="flex-1"
                    />
                    {!isReadOnly && (
                      <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-lg">B5: What support has been provided to affected people</CardTitle></CardHeader>
        <CardContent className="pt-4">
          <Textarea value={formData.supportProvided} onChange={e => handleChange('supportProvided', e.target.value)} disabled={isReadOnly} rows={4} />
        </CardContent>
        {!isReadOnly && !hideActions && (
          <CardFooter className="flex justify-end gap-3 border-t pt-4 px-0">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={mutation.isPending}>Save Draft</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleSave(true)} disabled={mutation.isPending}>Submit Part B</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
