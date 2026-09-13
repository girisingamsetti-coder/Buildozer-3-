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

interface IncidentPartCFormProps {
  incidentId?: string
  initialData?: any
  status?: string
  onDataChange?: (data: any) => void
  hideActions?: boolean
}

export function IncidentPartCForm({ incidentId, initialData, status, onDataChange, hideActions }: IncidentPartCFormProps) {
  const queryClient = useQueryClient()
  const isReadOnly = status === 'Submitted'
  
  const [formData, setFormData] = useState({
    locationSite: initialData?.locationSite || '',
    chainage: initialData?.chainage || '',
    nearbyLandmark: initialData?.nearbyLandmark || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    mandalArea: initialData?.mandalArea || '',
    projectLocation: initialData?.projectLocation || '',
    contractor: initialData?.contractor || '',
    
    whoWasInvolvedDesc: initialData?.whoWasInvolvedDesc || '',
    workersInvolved: initialData?.workersInvolved || 0,
    peopleAffected: initialData?.peopleAffected || 0,
    householdsAffected: initialData?.householdsAffected || 0,
    publicAffected: initialData?.publicAffected || 0,
    
    whatHappenedDesc: initialData?.whatHappenedDesc || '',
    ppeAdequate: initialData?.ppeAdequate || '',
    ppeDetails: initialData?.ppeDetails || '',
    
    expectedProcedures: initialData?.expectedProcedures || '',
    proceduresFollowed: initialData?.proceduresFollowed || '',
    proceduresFollowedDesc: initialData?.proceduresFollowedDesc || '',
    
    workOrganizationInfluence: initialData?.workOrganizationInfluence || '',
    workOrganizationDetails: initialData?.workOrganizationDetails || '',
    
    trainingAdequate: initialData?.trainingAdequate || '',
    trainingDetails: initialData?.trainingDetails || '',
    
    underlyingCausesDesc: initialData?.underlyingCausesDesc || '',
    underlyingCauseCategories: initialData?.underlyingCauseCategories ? JSON.parse(initialData.underlyingCauseCategories) : [],
    
    correctiveActions: initialData?.correctiveActions ? JSON.parse(initialData.correctiveActions) : [],
    
    immediateCauses: initialData?.immediateCauses ? JSON.parse(initialData.immediateCauses) : [],
    otherImmediateCause: initialData?.otherImmediateCause || '',
    affectedPersons: initialData?.affectedPersons ? JSON.parse(initialData.affectedPersons) : [],
    
    compensationTypes: initialData?.compensationTypes ? JSON.parse(initialData.compensationTypes) : [],
    otherCompensationType: initialData?.otherCompensationType || '',
    compensationRecords: initialData?.compensationRecords ? JSON.parse(initialData.compensationRecords) : [],
    
    supplementaryNarrative: initialData?.supplementaryNarrative || ''
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
      dataToSave.underlyingCauseCategories = JSON.stringify(dataToSave.underlyingCauseCategories)
      dataToSave.correctiveActions = JSON.stringify(dataToSave.correctiveActions)
      dataToSave.immediateCauses = JSON.stringify(dataToSave.immediateCauses)
      dataToSave.affectedPersons = JSON.stringify(dataToSave.affectedPersons)
      dataToSave.compensationTypes = JSON.stringify(dataToSave.compensationTypes)
      dataToSave.compensationRecords = JSON.stringify(dataToSave.compensationRecords)
      
      const res = await fetch(`/api/incidents/${incidentId}/part-c`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSubmit: payload.isSubmit, data: dataToSave }),
      })
      if (!res.ok) throw new Error('Failed to save Part C')
      return res.json()
    },
    onSuccess: (data, variables) => {
      toast.success(variables.isSubmit ? 'Part C Submitted' : 'Draft Saved')
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] })
    },
    onError: () => toast.error('An error occurred'),
  })

  const handleChange = (field: string, value: any) => {
    if (isReadOnly) return
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxArray = (field: string, value: string, checked: boolean) => {
    if (isReadOnly) return
    setFormData(prev => {
      const arr = prev[field as keyof typeof prev] as string[]
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
        <CardHeader><CardTitle>C1. Investigation Information</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm">I. Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Site</Label><Input value={formData.locationSite} onChange={e => handleChange('locationSite', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Chainage / KM / Section</Label><Input value={formData.chainage} onChange={e => handleChange('chainage', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Nearby Landmark</Label><Input value={formData.nearbyLandmark} onChange={e => handleChange('nearbyLandmark', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Latitude</Label><Input value={formData.latitude} onChange={e => handleChange('latitude', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Longitude</Label><Input value={formData.longitude} onChange={e => handleChange('longitude', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Mandal Area</Label><Input value={formData.mandalArea} onChange={e => handleChange('mandalArea', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Project Location</Label><Input value={formData.projectLocation} onChange={e => handleChange('projectLocation', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Contractor</Label><Input value={formData.contractor} onChange={e => handleChange('contractor', e.target.value)} disabled={isReadOnly} /></div>
            </div>
          </div>
          
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm">II. Who was involved</h3>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.whoWasInvolvedDesc} onChange={e => handleChange('whoWasInvolvedDesc', e.target.value)} disabled={isReadOnly} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Workers Affected</Label><Input type="number" value={formData.workersInvolved} onChange={e => handleChange('workersInvolved', parseInt(e.target.value) || 0)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>People Affected</Label><Input type="number" value={formData.peopleAffected} onChange={e => handleChange('peopleAffected', parseInt(e.target.value) || 0)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Households Affected</Label><Input type="number" value={formData.householdsAffected} onChange={e => handleChange('householdsAffected', parseInt(e.target.value) || 0)} disabled={isReadOnly} /></div>
              <div className="space-y-2"><Label>Public Affected</Label><Input type="number" value={formData.publicAffected} onChange={e => handleChange('publicAffected', parseInt(e.target.value) || 0)} disabled={isReadOnly} /></div>
            </div>
          </div>

          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm">III. What happened</h3>
            <div className="space-y-2">
              <Label>Detailed description</Label>
              <Textarea value={formData.whatHappenedDesc} onChange={e => handleChange('whatHappenedDesc', e.target.value)} disabled={isReadOnly} rows={4} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">VII. Underlying Causes</h3>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.underlyingCausesDesc} onChange={e => handleChange('underlyingCausesDesc', e.target.value)} disabled={isReadOnly} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {['Design', 'Equipment', 'Training', 'Supervision', 'Procedures', 'Work Environment', 'Other'].map(cause => (
                <div key={cause} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`cause-${cause}`} 
                    checked={formData.underlyingCauseCategories.includes(cause)}
                    onCheckedChange={(c) => handleCheckboxArray('underlyingCauseCategories', cause, c as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor={`cause-${cause}`}>{cause}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>C4. Supplementary Narrative</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={formData.supplementaryNarrative} onChange={e => handleChange('supplementaryNarrative', e.target.value)} disabled={isReadOnly} rows={4} placeholder="Any additional information..." />
        </CardContent>
        {!isReadOnly && !hideActions && (
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={mutation.isPending}>Save as Draft</Button>
            <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white" onClick={() => handleSave(true)} disabled={mutation.isPending}>Submit Part C</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
