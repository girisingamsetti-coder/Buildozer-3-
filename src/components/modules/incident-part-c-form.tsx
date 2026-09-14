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
import { Trash2, Plus, Upload } from 'lucide-react'
import { format } from 'date-fns'

interface IncidentPartCFormProps {
  incidentId?: string
  initialData?: any
  status?: string
  onDataChange?: (data: any) => void
  hideActions?: boolean
}

const C3A_IMMEDIATE_CAUSES = [
  'Caught in or between objects',
  'Struck by falling objects',
  'Stepping on, striking against, or struck by objects',
  'Drowning',
  'Chemical, biochemical, material exposure',
  'Falls, trips, slips',
  'Fire & explosion',
  'Electrocution',
  'Homicide',
  'Medical Issue',
  'Suicide',
  'Others',
  'Project Vehicle Work Travel',
  'Non-project Vehicle Work Travel',
  'Project Vehicle Commuting',
  'Non-project Vehicle Commuting',
  'Vehicle Traffic Accident (Members of Public Only)',
]

const C3B_COMPENSATION_TYPES = [
  'Contractor Direct',
  'Contractor Insurance',
  'Workman’s Compensation/National Insurance',
  'Court Determined Judicial Process',
  'Other',
  'No Compensation Required',
]

const EditedBadge = ({ original }: { original?: string }) => (
  <span 
    className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-2 border border-amber-200 font-medium shrink-0 cursor-help"
    title={original ? `Original:\n${original}` : 'Edited from initial log'}
  >
    Edited
  </span>
)

export function IncidentPartCForm({ incidentId, initialData, status, onDataChange, hideActions }: IncidentPartCFormProps) {
  const queryClient = useQueryClient()
  const isReadOnly = status === 'Submitted'

  // Generate base defaults from incident data
  const baseC1_i = initialData?.incident ? `Location: ${initialData.incident.location || 'N/A'}\nDate: ${initialData.incident.date ? format(new Date(initialData.incident.date), 'yyyy-MM-dd') : 'N/A'}\nTime: ${initialData.incident.time || 'N/A'}` : ''
  const baseC1_ii = initialData?.incident ? `Contractor: ${initialData.incident.contractor?.name || 'N/A'}` : ''
  const baseC1_iii = initialData?.incident?.partB?.descriptionWhat || initialData?.incident?.description || ''

  const [formData, setFormData] = useState({
    // C1
    c1_i: initialData?.c1_i || baseC1_i,
    c1_ii: initialData?.c1_ii || baseC1_ii,
    c1_iii: initialData?.c1_iii || baseC1_iii,
    c1_iv: initialData?.c1_iv || '', // keeping for backward compatibility if needed
    expectedProcedures: initialData?.expectedProcedures || '',
    proceduresFollowed: initialData?.proceduresFollowed || '',
    proceduresFollowedDesc: initialData?.proceduresFollowedDesc || '',

    c1_v: initialData?.c1_v || '',
    workOrganizationInfluence: initialData?.workOrganizationInfluence || '',
    workOrganizationDetails: initialData?.workOrganizationDetails || '',

    c1_vi: initialData?.c1_vi || '',
    trainingAdequate: initialData?.trainingAdequate || '',
    trainingDetails: initialData?.trainingDetails || '',
    c1_vii_viii: initialData?.c1_vii_viii || '',

    // C2
    correctiveActions: initialData?.correctiveActions ? JSON.parse(initialData.correctiveActions) : [],

    // C3a
    immediateCauses: initialData?.immediateCauses ? JSON.parse(initialData.immediateCauses) : [],
    affectedPersons: initialData?.affectedPersons ? JSON.parse(initialData.affectedPersons) : [],

    // C3b
    compensationTypes: initialData?.compensationTypes ? JSON.parse(initialData.compensationTypes) : [],
    compensationRecords: initialData?.compensationRecords ? JSON.parse(initialData.compensationRecords) : [],

    // C4
    supplementaryNarrative: initialData?.supplementaryNarrative || '',
    annexures: initialData?.annexures ? JSON.parse(initialData.annexures) : [],
  })

  // We determine if C3a is visible based on the incident type carried over
  const incidentTypes = initialData?.incident?.partB?.incidentTypes 
    ? JSON.parse(initialData.incident.partB.incidentTypes) 
    : (initialData?.incident?.incidentType ? [initialData.incident.incidentType] : [])
  const showC3a = incidentTypes.includes('Fatality') || incidentTypes.includes('Lost Time Injury')

  const baseData = {
    c1_i: baseC1_i,
    c1_ii: baseC1_ii,
    c1_iii: baseC1_iii,
  }

  const isEdited = (field: keyof typeof baseData) => {
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
      dataToSave.correctiveActions = JSON.stringify(dataToSave.correctiveActions)
      dataToSave.immediateCauses = JSON.stringify(dataToSave.immediateCauses)
      dataToSave.affectedPersons = JSON.stringify(dataToSave.affectedPersons)
      dataToSave.compensationTypes = JSON.stringify(dataToSave.compensationTypes)
      dataToSave.compensationRecords = JSON.stringify(dataToSave.compensationRecords)
      dataToSave.annexures = JSON.stringify(dataToSave.annexures)

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

  const handleCheckboxArray = (field: 'immediateCauses' | 'compensationTypes', value: string, checked: boolean) => {
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

  const handleArrayAction = (field: 'correctiveActions' | 'affectedPersons' | 'compensationRecords' | 'annexures', action: 'add' | 'update' | 'remove', index: number = -1, subField: string = '', value: string = '') => {
    if (isReadOnly) return
    setFormData(prev => {
      const arr = [...(prev[field] as any[])]
      if (action === 'add') {
        if (field === 'correctiveActions') arr.push({ action: '', responsibleParty: '', expectedDate: '' })
        if (field === 'affectedPersons') arr.push({ name: '', ageDob: '', date: '', gender: '', nationality: '', cause: '', type: '' })
        if (field === 'compensationRecords') arr.push({ name: '', type: '', amount: '', responsibleParty: '' })
        if (field === 'annexures') arr.push({ name: '', url: '' })
      } else if (action === 'update' && index > -1) {
        arr[index] = { ...arr[index], [subField]: value }
      } else if (action === 'remove' && index > -1) {
        arr.splice(index, 1)
      }
      return { ...prev, [field]: arr }
    })
  }

  const handleSave = (isSubmit: boolean) => {
    mutation.mutate({ isSubmit, data: formData })
  }

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-lg">C1: Investigation Findings</CardTitle></CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center">I. where and when the incident took place {isEdited('c1_i') && <EditedBadge original={baseData.c1_i} />}</Label>
            <Textarea value={formData.c1_i} onChange={e => handleChange('c1_i', e.target.value)} disabled={isReadOnly} rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center">II. who was involved, and how many people/households were affected {isEdited('c1_ii') && <EditedBadge original={baseData.c1_ii} />}</Label>
            <Textarea value={formData.c1_ii} onChange={e => handleChange('c1_ii', e.target.value)} disabled={isReadOnly} rows={2} />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center">III. what happened and what conditions and actions influenced the incident {isEdited('c1_iii') && <EditedBadge original={baseData.c1_iii} />}</Label>
            <Textarea value={formData.c1_iii} onChange={e => handleChange('c1_iii', e.target.value)} disabled={isReadOnly} rows={4} />
          </div>
          <div className="space-y-4">
            <Label className="text-base font-semibold">IV. what were the expected working procedures and were they followed</Label>
            <div className="space-y-2">
              <Label>What were the expected working procedures?</Label>
              <Textarea value={formData.expectedProcedures} onChange={e => handleChange('expectedProcedures', e.target.value)} disabled={isReadOnly} rows={2} />
            </div>
            <div className="space-y-2 pt-2 border-t">
              <Label>Were they followed?</Label>
              <RadioGroup
                disabled={isReadOnly}
                value={formData.proceduresFollowed}
                onValueChange={(v) => handleChange('proceduresFollowed', v)}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="proc-yes" />
                  <Label htmlFor="proc-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="proc-no" />
                  <Label htmlFor="proc-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.proceduresFollowed === 'No' && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label>If no, provide details:</Label>
                <Textarea value={formData.proceduresFollowedDesc} onChange={e => handleChange('proceduresFollowedDesc', e.target.value)} disabled={isReadOnly} rows={2} />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">V. did the organization or arrangement of the work influence the incident</Label>
              <RadioGroup
                disabled={isReadOnly}
                value={formData.workOrganizationInfluence}
                onValueChange={(v) => handleChange('workOrganizationInfluence', v)}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="org-yes" />
                  <Label htmlFor="org-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="org-no" />
                  <Label htmlFor="org-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.workOrganizationInfluence === 'Yes' && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label>Provide details:</Label>
                <Textarea value={formData.workOrganizationDetails} onChange={e => handleChange('workOrganizationDetails', e.target.value)} disabled={isReadOnly} rows={2} />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">VI. were there adequate training/competent persons for the job, and was necessary and suitable equipment available</Label>
              <RadioGroup
                disabled={isReadOnly}
                value={formData.trainingAdequate}
                onValueChange={(v) => handleChange('trainingAdequate', v)}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="train-yes" />
                  <Label htmlFor="train-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="train-no" />
                  <Label htmlFor="train-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.trainingAdequate === 'No' && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label>If no, what was missing/inadequate?</Label>
                <Textarea value={formData.trainingDetails} onChange={e => handleChange('trainingDetails', e.target.value)} disabled={isReadOnly} rows={2} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">VII./VIII. what were the underlying causes; where there any absent risk control measures or any system failures</Label>
            <Textarea value={formData.c1_vii_viii} onChange={e => handleChange('c1_vii_viii', e.target.value)} disabled={isReadOnly} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">C2: Corrective Actions from the investigation to be implemented (To be fully described in Corrective Action Plan)</CardTitle>
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={() => handleArrayAction('correctiveActions', 'add')}>
              <Plus className="h-4 w-4 mr-1" /> Add Action
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium">Responsible Party</th>
                  <th className="px-3 py-2 font-medium">Expected Date</th>
                  {!isReadOnly && <th className="px-3 py-2 font-medium w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {formData.correctiveActions.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No corrective actions added.</td></tr>
                )}
                {formData.correctiveActions.map((action: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2"><Input value={action.action} onChange={e => handleArrayAction('correctiveActions', 'update', idx, 'action', e.target.value)} disabled={isReadOnly} /></td>
                    <td className="p-2"><Input value={action.responsibleParty} onChange={e => handleArrayAction('correctiveActions', 'update', idx, 'responsibleParty', e.target.value)} disabled={isReadOnly} /></td>
                    <td className="p-2"><Input type="date" value={action.expectedDate} onChange={e => handleArrayAction('correctiveActions', 'update', idx, 'expectedDate', e.target.value)} disabled={isReadOnly} /></td>
                    {!isReadOnly && (
                      <td className="p-2 text-center">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleArrayAction('correctiveActions', 'remove', idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showC3a && (
        <Card>
          <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-lg">C3a: Fatality/Lost time Injury information</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Immediate cause of fatality/injury for worker or member of the public (please check all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {C3A_IMMEDIATE_CAUSES.map(cause => (
                  <div key={cause} className="flex items-start space-x-2">
                    <Checkbox
                      id={`cause-${cause}`}
                      checked={formData.immediateCauses.includes(cause)}
                      onCheckedChange={(c) => handleCheckboxArray('immediateCauses', cause, c as boolean)}
                      disabled={isReadOnly}
                      className="mt-0.5"
                    />
                    <Label htmlFor={`cause-${cause}`} className="font-normal leading-snug cursor-pointer">{cause}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Affected Persons</Label>
                {!isReadOnly && (
                  <Button variant="outline" size="sm" onClick={() => handleArrayAction('affectedPersons', 'add')}>
                    <Plus className="h-4 w-4 mr-1" /> Add Person
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Age/DOB</th>
                      <th className="px-3 py-2 font-medium">Date of Death/Injury</th>
                      <th className="px-3 py-2 font-medium">Gender</th>
                      <th className="px-3 py-2 font-medium">Nationality</th>
                      <th className="px-3 py-2 font-medium">Cause of Fatality/Injury</th>
                      <th className="px-3 py-2 font-medium">Worker (Employer)/Public</th>
                      {!isReadOnly && <th className="px-3 py-2 font-medium w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.affectedPersons.length === 0 && (
                      <tr><td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">No persons added.</td></tr>
                    )}
                    {formData.affectedPersons.map((p: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="p-1"><Input value={p.name} onChange={e => handleArrayAction('affectedPersons', 'update', idx, 'name', e.target.value)} disabled={isReadOnly} /></td>
                        <td className="p-1"><Input value={p.ageDob} onChange={e => handleArrayAction('affectedPersons', 'update', idx, 'ageDob', e.target.value)} disabled={isReadOnly} /></td>
                        <td className="p-1"><Input type="date" value={p.date} onChange={e => handleArrayAction('affectedPersons', 'update', idx, 'date', e.target.value)} disabled={isReadOnly} /></td>
                        <td className="p-1"><Input value={p.gender} onChange={e => handleArrayAction('affectedPersons', 'update', idx, 'gender', e.target.value)} disabled={isReadOnly} /></td>
                        <td className="p-1"><Input value={p.nationality} onChange={e => handleArrayAction('affectedPersons', 'update', idx, 'nationality', e.target.value)} disabled={isReadOnly} /></td>
                        <td className="p-1"><Input value={p.cause} onChange={e => handleArrayAction('affectedPersons', 'update', idx, 'cause', e.target.value)} disabled={isReadOnly} /></td>
                        <td className="p-1"><Input value={p.type} onChange={e => handleArrayAction('affectedPersons', 'update', idx, 'type', e.target.value)} disabled={isReadOnly} /></td>
                        {!isReadOnly && (
                          <td className="p-1 text-center">
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-8 w-8" onClick={() => handleArrayAction('affectedPersons', 'remove', idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-lg">C3b: Financial Support/Compensation Types (To be fully described in Corrective Action Plan)</CardTitle></CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {C3B_COMPENSATION_TYPES.map(type => (
              <div key={type} className="flex items-start space-x-2">
                <Checkbox
                  id={`comp-${type}`}
                  checked={formData.compensationTypes.includes(type)}
                  onCheckedChange={(c) => handleCheckboxArray('compensationTypes', type, c as boolean)}
                  disabled={isReadOnly}
                  className="mt-0.5"
                />
                <Label htmlFor={`comp-${type}`} className="font-normal leading-snug cursor-pointer">{type}</Label>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Compensation Details</Label>
              {!isReadOnly && (
                <Button variant="outline" size="sm" onClick={() => handleArrayAction('compensationRecords', 'add')}>
                  <Plus className="h-4 w-4 mr-1" /> Add Record
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Compensation Type</th>
                    <th className="px-3 py-2 font-medium">Amount (US$)</th>
                    <th className="px-3 py-2 font-medium">Responsible Party</th>
                    {!isReadOnly && <th className="px-3 py-2 font-medium w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {formData.compensationRecords.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No compensation records added.</td></tr>
                  )}
                  {formData.compensationRecords.map((r: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2"><Input value={r.name} onChange={e => handleArrayAction('compensationRecords', 'update', idx, 'name', e.target.value)} disabled={isReadOnly} /></td>
                      <td className="p-2"><Input value={r.type} onChange={e => handleArrayAction('compensationRecords', 'update', idx, 'type', e.target.value)} disabled={isReadOnly} /></td>
                      <td className="p-2"><Input type="number" value={r.amount} onChange={e => handleArrayAction('compensationRecords', 'update', idx, 'amount', e.target.value)} disabled={isReadOnly} /></td>
                      <td className="p-2"><Input value={r.responsibleParty} onChange={e => handleArrayAction('compensationRecords', 'update', idx, 'responsibleParty', e.target.value)} disabled={isReadOnly} /></td>
                      {!isReadOnly && (
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleArrayAction('compensationRecords', 'remove', idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-lg">C4: Supplementary Narrative</CardTitle></CardHeader>
        <CardContent className="space-y-6 pt-4">
          <Textarea value={formData.supplementaryNarrative} onChange={e => handleChange('supplementaryNarrative', e.target.value)} disabled={isReadOnly} rows={4} placeholder="Additional details, summary of annexures..." />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Annexures / Supporting Documents</Label>
              {!isReadOnly && (
                <Button variant="outline" size="sm" onClick={() => handleArrayAction('annexures', 'add')}>
                  <Plus className="h-4 w-4 mr-1" /> Add Document
                </Button>
              )}
            </div>
            {formData.annexures.length === 0 && (
              <p className="text-sm text-muted-foreground">No documents attached.</p>
            )}
            <div className="space-y-2">
              {formData.annexures.map((doc: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input placeholder="Document Name / Type (e.g. Witness Statement)" value={doc.name} onChange={e => handleArrayAction('annexures', 'update', idx, 'name', e.target.value)} disabled={isReadOnly} className="flex-1" />
                  <Input placeholder="File uploaded..." value={doc.url} onChange={e => handleArrayAction('annexures', 'update', idx, 'url', e.target.value)} disabled={isReadOnly} className="flex-1" />
                  {!isReadOnly && (
                    <Button variant="outline" size="icon" className="shrink-0"><Upload className="h-4 w-4" /></Button>
                  )}
                  {!isReadOnly && (
                    <Button variant="ghost" size="icon" className="shrink-0 text-red-500 hover:text-red-700" onClick={() => handleArrayAction('annexures', 'remove', idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        {!isReadOnly && !hideActions && (
          <CardFooter className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={mutation.isPending}>Save Draft</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleSave(true)} disabled={mutation.isPending}>Submit Part C</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
