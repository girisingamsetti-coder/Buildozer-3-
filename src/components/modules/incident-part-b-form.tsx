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
import { format } from 'date-fns'

interface IncidentPartBFormProps {
  incidentId?: string
  initialData?: any
  status?: string
  onDataChange?: (data: any) => void
  hideActions?: boolean
}

export function IncidentPartBForm({ incidentId, initialData, status, onDataChange, hideActions }: IncidentPartBFormProps) {
  const queryClient = useQueryClient()
  const isReadOnly = status === 'Submitted'
  
  const [formData, setFormData] = useState({
    dateOfIncident: initialData?.dateOfIncident ? format(new Date(initialData.dateOfIncident), 'yyyy-MM-dd') : '',
    timeOfIncident: initialData?.timeOfIncident || '',
    dateReportedToPIU: initialData?.dateReportedToPIU ? format(new Date(initialData.dateReportedToPIU), 'yyyy-MM-dd') : '',
    dateReportedToWB: initialData?.dateReportedToWB ? format(new Date(initialData.dateReportedToWB), 'yyyy-MM-dd') : '',
    reportedToPIUBy: initialData?.reportedToPIUBy || '',
    reportedToWBBy: initialData?.reportedToWBBy || '',
    notificationType: initialData?.notificationType || '',
    mainContractor: initialData?.mainContractor || '',
    subContractor: initialData?.subContractor || '',
    
    incidentTypes: initialData?.incidentTypes ? JSON.parse(initialData.incidentTypes) : [],
    otherIncidentType: initialData?.otherIncidentType || '',
    
    descriptionWhat: initialData?.descriptionWhat || '',
    descriptionConditions: initialData?.descriptionConditions || '',
    factsContested: initialData?.factsContested || '',
    conflictingVersionsDesc: initialData?.conflictingVersionsDesc || '',
    isOngoing: initialData?.isOngoing || '',
    authoritiesInformed: initialData?.authoritiesInformed || false,
    authorityDetails: initialData?.authorityDetails || '',
    
    containmentActions: initialData?.containmentActions ? JSON.parse(initialData.containmentActions) : [],
    worksSuspended: initialData?.worksSuspended || false,
    suspensionContractor: initialData?.suspensionContractor || '',
    suspensionDocument: initialData?.suspensionDocument || '',
    
    supportProvided: initialData?.supportProvided || ''
  })

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData)
    }
  }, [formData, onDataChange])

  const mutation = useMutation({
    mutationFn: async (payload: { isSubmit: boolean; data: any }) => {
      // Serialize arrays
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

  const handleCheckboxArray = (field: 'incidentTypes' | 'containmentActions', value: string, checked: boolean) => {
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

  const handleSave = (isSubmit: boolean) => {
    mutation.mutate({ isSubmit, data: formData })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>B1. Basic Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date of Incident</Label>
            <Input type="date" value={formData.dateOfIncident} onChange={e => handleChange('dateOfIncident', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <Label>Time of Incident</Label>
            <Input type="time" value={formData.timeOfIncident} onChange={e => handleChange('timeOfIncident', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <Label>Date Reported to PIU</Label>
            <Input type="date" value={formData.dateReportedToPIU} onChange={e => handleChange('dateReportedToPIU', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <Label>Date Reported to WB</Label>
            <Input type="date" value={formData.dateReportedToWB} onChange={e => handleChange('dateReportedToWB', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <Label>Reported to PIU by</Label>
            <Input value={formData.reportedToPIUBy} onChange={e => handleChange('reportedToPIUBy', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <Label>Reported to WB by</Label>
            <Input value={formData.reportedToWBBy} onChange={e => handleChange('reportedToWBBy', e.target.value)} disabled={isReadOnly} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>B2. Incident Type</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['Fatality', 'Lost Time Injury', 'Medical Treatment Injury', 'First Aid', 'Near Miss', 'Environmental', 'Property Damage', 'Other'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={`type-${type}`} 
                  checked={formData.incidentTypes.includes(type)}
                  onCheckedChange={(c) => handleCheckboxArray('incidentTypes', type, c as boolean)}
                  disabled={isReadOnly}
                />
                <Label htmlFor={`type-${type}`}>{type}</Label>
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
        <CardHeader><CardTitle>B3. Description of Incident</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What happened?</Label>
            <Textarea value={formData.descriptionWhat} onChange={e => handleChange('descriptionWhat', e.target.value)} disabled={isReadOnly} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Conditions at the time of incident</Label>
            <Textarea value={formData.descriptionConditions} onChange={e => handleChange('descriptionConditions', e.target.value)} disabled={isReadOnly} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Are facts contested? If yes, provide details</Label>
            <Textarea value={formData.factsContested} onChange={e => handleChange('factsContested', e.target.value)} disabled={isReadOnly} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>B4. Containment Actions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['Area Secured', 'First Aid Administered', 'Medical Evacuation', 'Work Suspended', 'Other'].map(action => (
              <div key={action} className="flex items-center space-x-2">
                <Checkbox 
                  id={`action-${action}`} 
                  checked={formData.containmentActions.includes(action)}
                  onCheckedChange={(c) => handleCheckboxArray('containmentActions', action, c as boolean)}
                  disabled={isReadOnly}
                />
                <Label htmlFor={`action-${action}`}>{action}</Label>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="worksSuspended" checked={formData.worksSuspended} onCheckedChange={(c) => handleChange('worksSuspended', c)} disabled={isReadOnly} />
            <Label htmlFor="worksSuspended">Have works been suspended?</Label>
          </div>
          {formData.worksSuspended && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
               <div className="space-y-2">
                 <Label>Suspended Contractor</Label>
                 <Input value={formData.suspensionContractor} onChange={e => handleChange('suspensionContractor', e.target.value)} disabled={isReadOnly} />
               </div>
               <div className="space-y-2">
                 <Label>Suspension Document Ref</Label>
                 <Input value={formData.suspensionDocument} onChange={e => handleChange('suspensionDocument', e.target.value)} disabled={isReadOnly} />
               </div>
             </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>B5. Support Provided</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Details of support provided to affected persons</Label>
            <Textarea value={formData.supportProvided} onChange={e => handleChange('supportProvided', e.target.value)} disabled={isReadOnly} rows={3} />
          </div>
        </CardContent>
        {!isReadOnly && !hideActions && (
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={mutation.isPending}>Save as Draft</Button>
            <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white" onClick={() => handleSave(true)} disabled={mutation.isPending}>Submit Part B</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
