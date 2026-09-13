'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Upload, Landmark, CheckCircle2 } from 'lucide-react'
import { EPFRecordItem } from '@/types/payroll'
import { useAuthStore } from '@/stores/auth-store'

interface RecordEPFDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period: string
  editRecord?: EPFRecordItem | null
  onSuccess?: () => void
}

export default function RecordEPFDialog({
  open,
  onOpenChange,
  period,
  editRecord,
  onSuccess,
}: RecordEPFDialogProps) {
  const queryClient = useQueryClient()
  const userName = useAuthStore(s => s.userName)

  const [workerId, setWorkerId] = useState('')
  const [uan, setUan] = useState('')
  const [epfWage, setEpfWage] = useState(15000)
  const [employeeContrib, setEmployeeContrib] = useState(1800)
  const [employerContrib, setEmployerContrib] = useState(550)
  const [epsContrib, setEpsContrib] = useState(1250)
  const [edliContrib, setEdliContrib] = useState(75)
  const [ecrReference, setEcrReference] = useState('')
  const [ecrFilingDate, setEcrFilingDate] = useState('')
  const [challanNumber, setChallanNumber] = useState('')
  const [challanDate, setChallanDate] = useState('')
  const [depositDate, setDepositDate] = useState('')
  const [externalReference, setExternalReference] = useState('')
  const [proofFileName, setProofFileName] = useState('')
  const [remarks, setRemarks] = useState('')

  // Workers list
  const { data: workersResp } = useQuery<{ data: any[] }>({
    queryKey: ['workers-all-active'],
    queryFn: () => fetch('/api/workers?limit=250&status=active').then(r => r.json()),
    enabled: open,
  })
  const workers = workersResp?.data ?? []

  // Recalculate contributions on wage change
  const handleWageChange = (val: number) => {
    setEpfWage(val)
    setEmployeeContrib(Math.round(val * 0.12))
    setEmployerContrib(Math.round(val * 0.0367))
    setEpsContrib(Math.round(val * 0.0833))
    setEdliContrib(Math.round(val * 0.005))
  }

   
  useEffect(() => {
    if (editRecord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkerId(editRecord.workerId)
      setUan(editRecord.uan || '')
      setEpfWage(editRecord.epfWage)
      setEmployeeContrib(editRecord.employeeContribution)
      setEmployerContrib(editRecord.employerContribution)
      setEpsContrib(editRecord.epsContribution)
      setEdliContrib(editRecord.edliContribution)
      setEcrReference(editRecord.ecrReference || '')
      setEcrFilingDate(editRecord.ecrFilingDate ? editRecord.ecrFilingDate.split('T')[0] : '')
      setChallanNumber(editRecord.challanNumber || '')
      setChallanDate(editRecord.challanDate ? editRecord.challanDate.split('T')[0] : '')
      setDepositDate(editRecord.depositDate ? editRecord.depositDate.split('T')[0] : '')
      setExternalReference(editRecord.externalReference || '')
      setProofFileName(editRecord.proofDocumentName || '')
      setRemarks(editRecord.remarks || '')
    } else {
      setWorkerId('')
      setUan('')
      handleWageChange(15000)
      setEcrReference(`ECR${period.replace('-', '')}001`)
      setEcrFilingDate(`${period}-12`)
      setChallanNumber(`CHL${period.replace('-', '')}889`)
      setChallanDate(`${period}-13`)
      setDepositDate(`${period}-14`)
      setExternalReference('')
      setProofFileName('')
      setRemarks('')
    }
  }, [editRecord, open, period])

  const totalContrib = employeeContrib + employerContrib + epsContrib + edliContrib

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/payroll/epf', {
        method: editRecord ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save EPF record')
      return data
    },
    onSuccess: () => {
      toast.success(editRecord ? 'EPF record updated' : 'External EPF deposit record saved')
      queryClient.invalidateQueries({ queryKey: ['payroll-epf'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-overview'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-compliance'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-exceptions'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!workerId) {
      toast.error('Please select a worker')
      return
    }

    mutation.mutate({
      id: editRecord?.id,
      workerId,
      period,
      uan: uan.trim() || null,
      epfApplicable: true,
      epfWage: Number(epfWage),
      employeeContribution: Number(employeeContrib),
      employerContribution: Number(employerContrib),
      epsContribution: Number(epsContrib),
      edliContribution: Number(edliContrib),
      totalContribution: Number(totalContrib),
      ecrReference: ecrReference.trim() || null,
      ecrFilingDate: ecrFilingDate || null,
      challanNumber: challanNumber.trim() || null,
      challanDate: challanDate || null,
      depositDate: depositDate || null,
      externalReference: externalReference.trim() || null,
      proofDocumentName: proofFileName || null,
      proofDocumentUrl: proofFileName ? `/upload/payroll/${period}/${proofFileName}` : null,
      remarks: remarks.trim() || null,
      userName,
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFileName(file.name)
      toast.success(`Attached ${file.name}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-[#0d9488]">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{editRecord ? 'Edit EPF Record' : 'Record External EPF Deposit'}</DialogTitle>
              <DialogDescription className="text-xs">
                Record an externally completed statutory EPF contribution, ECR filing, or Challan deposit.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Worker & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="epfWorker" className="text-xs font-semibold">Worker <span className="text-red-500">*</span></Label>
              <Select
                value={workerId}
                onValueChange={(val) => {
                  setWorkerId(val)
                  const w = workers.find(x => x.id === val)
                  if (w && w.uanNumber) setUan(w.uanNumber)
                }}
                disabled={Boolean(editRecord)}
              >
                <SelectTrigger id="epfWorker" className="text-xs">
                  <SelectValue placeholder="Select worker..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id} className="text-xs">
                      {w.fullName} ({w.employeeNumber}) — {w.contractor?.name || 'Worker'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uanInput" className="text-xs font-semibold">Universal Account Number (UAN)</Label>
              <Input
                id="uanInput"
                placeholder="12-digit UAN"
                value={uan}
                onChange={e => setUan(e.target.value.replace(/\D/g, '').slice(0, 12))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Statutory Contribution Breakdown */}
          <div className="rounded-lg border p-3 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">Contribution Breakdown</h4>
              <span className="text-[11px] text-muted-foreground">Standard Statutory Ratios (Configurable)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="epfWage" className="text-xs">EPF Wage (₹)</Label>
                <Input
                  id="epfWage"
                  type="number"
                  value={epfWage}
                  onChange={e => handleWageChange(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="empContrib" className="text-xs">Employee EPF (12%)</Label>
                <Input
                  id="empContrib"
                  type="number"
                  value={employeeContrib}
                  onChange={e => setEmployeeContrib(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="empyrContrib" className="text-xs">Employer EPF (3.67%)</Label>
                <Input
                  id="empyrContrib"
                  type="number"
                  value={employerContrib}
                  onChange={e => setEmployerContrib(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="epsContrib" className="text-xs">Employer EPS (8.33%)</Label>
                <Input
                  id="epsContrib"
                  type="number"
                  value={epsContrib}
                  onChange={e => setEpsContrib(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edliContrib" className="text-xs">EDLI (0.5%)</Label>
                <Input
                  id="edliContrib"
                  type="number"
                  value={edliContrib}
                  onChange={e => setEdliContrib(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0d9488]">Total Contribution</Label>
                <div className="h-8 px-3 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center font-bold text-xs text-[#0d9488]">
                  ₹{totalContrib.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* ECR & Challan Details */}
          <div className="rounded-lg border p-3 space-y-3 bg-card">
            <h4 className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">ECR Filing & Challan Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ecrRef" className="text-xs">ECR Reference</Label>
                <Input
                  id="ecrRef"
                  placeholder="e.g. ECR202609001"
                  value={ecrReference}
                  onChange={e => setEcrReference(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ecrDate" className="text-xs">ECR Filing Date</Label>
                <Input
                  id="ecrDate"
                  type="date"
                  value={ecrFilingDate}
                  onChange={e => setEcrFilingDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="challanNo" className="text-xs">Challan / TRRN Number</Label>
                <Input
                  id="challanNo"
                  placeholder="e.g. TRRN1234567"
                  value={challanNumber}
                  onChange={e => setChallanNumber(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="challanDate" className="text-xs">Challan Date</Label>
                <Input
                  id="challanDate"
                  type="date"
                  value={challanDate}
                  onChange={e => setChallanDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="depDate" className="text-xs">Actual Deposit Date</Label>
                <Input
                  id="depDate"
                  type="date"
                  value={depositDate}
                  onChange={e => setDepositDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="extRef" className="text-xs">Bank UTR / Ref No.</Label>
                <Input
                  id="extRef"
                  placeholder="e.g. EPFUTR20260914"
                  value={externalReference}
                  onChange={e => setExternalReference(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Deposit Proof / Cyber Receipt</Label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Upload Challan Receipt</span>
                  <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
                </label>
                {proofFileName ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    {proofFileName}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No document attached</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="epfRemarks" className="text-xs">Remarks</Label>
            <Textarea
              id="epfRemarks"
              placeholder="e.g. Verified against EPFO portal challan download"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="h-14 text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
