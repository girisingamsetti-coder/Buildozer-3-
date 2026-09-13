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
import { Loader2, Upload, Receipt, FileText, CheckCircle2 } from 'lucide-react'
import { SalaryPaymentItem } from '@/types/payroll'
import { useAuthStore } from '@/stores/auth-store'

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period: string
  editRecord?: SalaryPaymentItem | null
  onSuccess?: () => void
}

const PAYMENT_MODES = ['Bank Transfer', 'NEFT/RTGS', 'Cheque', 'Cash', 'UPI', 'Other']
const PAYMENT_SOURCES = ['Employer', 'Contractor', 'External Payroll System', 'Bank', 'Manual Record', 'Other']
const PAYMENT_STATUSES = ['Paid', 'Partially Paid', 'On Hold', 'Not Recorded', 'Disputed', 'Failed / Returned']

export default function RecordPaymentDialog({
  open,
  onOpenChange,
  period,
  editRecord,
  onSuccess,
}: RecordPaymentDialogProps) {
  const queryClient = useQueryClient()
  const userName = useAuthStore(s => s.userName)

  const [workerId, setWorkerId] = useState('')
  const [payableDays, setPayableDays] = useState(26)
  const [grossSalary, setGrossSalary] = useState(20000)
  const [deductions, setDeductions] = useState(2000)
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentMode, setPaymentMode] = useState('Bank Transfer')
  const [externalReference, setExternalReference] = useState('')
  const [paymentSource, setPaymentSource] = useState('Contractor')
  const [bankName, setBankName] = useState('State Bank of India')
  const [accountLast4, setAccountLast4] = useState('')
  const [proofFileName, setProofFileName] = useState('')
  const [remarks, setRemarks] = useState('')

  // Fetch workers list for selector
  const { data: workersResp } = useQuery<{ data: any[] }>({
    queryKey: ['workers-all-active'],
    queryFn: () => fetch('/api/workers?limit=250&status=active').then(r => r.json()),
    enabled: open,
  })
  const workers = workersResp?.data ?? []

  // Pre-fill when editing
   
  useEffect(() => {
    if (editRecord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkerId(editRecord.workerId)
      setPayableDays(editRecord.payableDays)
      setGrossSalary(editRecord.grossSalary)
      setDeductions(editRecord.deductions)
      setPaymentStatus(editRecord.paymentStatus)
      setPaymentDate(editRecord.paymentDate ? editRecord.paymentDate.split('T')[0] : '')
      setPaymentMode(editRecord.paymentMode || 'Bank Transfer')
      setExternalReference(editRecord.externalReference || '')
      setPaymentSource(editRecord.paymentSource || 'Contractor')
      setBankName(editRecord.bankName || '')
      setAccountLast4(editRecord.accountLast4 || '')
      setProofFileName(editRecord.proofDocumentName || '')
      setRemarks(editRecord.remarks || '')
    } else {
      setWorkerId('')
      setPayableDays(26)
      setGrossSalary(20000)
      setDeductions(2000)
      setPaymentStatus('Paid')
      setPaymentDate(new Date().toISOString().split('T')[0])
      setPaymentMode('Bank Transfer')
      setExternalReference('')
      setPaymentSource('Contractor')
      setBankName('State Bank of India')
      setAccountLast4('')
      setProofFileName('')
      setRemarks('')
    }
  }, [editRecord, open])

  const selectedWorker = useMemo(() => {
    return workers.find(w => w.id === workerId)
  }, [workers, workerId])

  const netSalary = Math.max(0, grossSalary - deductions)

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/payroll/salary', {
        method: editRecord ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save record')
      return data
    },
    onSuccess: () => {
      toast.success(editRecord ? 'Salary record updated' : 'External salary payment record saved')
      queryClient.invalidateQueries({ queryKey: ['payroll-salary'] })
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
      payableDays: Number(payableDays),
      grossSalary: Number(grossSalary),
      deductions: Number(deductions),
      netSalary,
      paymentStatus,
      paymentDate: paymentDate || null,
      paymentMode,
      externalReference: externalReference.trim() || null,
      paymentSource,
      bankName: bankName.trim() || null,
      accountLast4: accountLast4.trim() ? accountLast4.trim().slice(-4) : null,
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
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{editRecord ? 'Edit Salary Payment Record' : 'Record External Payment'}</DialogTitle>
              <DialogDescription className="text-xs">
                Record an externally completed salary disbursement. This application does not initiate funds transfer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Worker Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="worker" className="text-xs font-semibold">Worker <span className="text-red-500">*</span></Label>
              <Select
                value={workerId}
                onValueChange={(val) => {
                  setWorkerId(val)
                  const w = workers.find(x => x.id === val)
                  if (w && !editRecord) {
                    if (w.designation?.name === 'Supervisor') setGrossSalary(34000)
                    else if (w.designation?.name === 'Electrician') setGrossSalary(26000)
                    else if (w.designation?.name === 'Mason') setGrossSalary(24500)
                    else setGrossSalary(18700)
                  }
                }}
                disabled={Boolean(editRecord)}
              >
                <SelectTrigger id="worker" className="text-xs">
                  <SelectValue placeholder="Select worker..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id} className="text-xs">
                      {w.fullName} ({w.employeeNumber}) — {w.designation?.name || 'Worker'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payroll Period</Label>
              <Input value={period} readOnly className="bg-muted text-xs font-mono" />
            </div>
          </div>

          {selectedWorker && (
            <div className="rounded-lg bg-muted/40 p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 border">
              <div>
                <span className="text-muted-foreground block text-[11px]">Designation:</span>
                <span className="font-medium">{selectedWorker.designation?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Contractor:</span>
                <span className="font-medium">{selectedWorker.contractor?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Site / Zone:</span>
                <span className="font-medium">{selectedWorker.site?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">UAN:</span>
                <span className="font-mono">{selectedWorker.uanNumber || 'Not available'}</span>
              </div>
            </div>
          )}

          {/* Wage Calculations */}
          <div className="rounded-lg border p-3 space-y-3 bg-card">
            <h4 className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">Salary Computation</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="payableDays" className="text-xs">Payable Days</Label>
                <Input
                  id="payableDays"
                  type="number"
                  min="0"
                  max="31"
                  value={payableDays}
                  onChange={e => setPayableDays(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="grossSalary" className="text-xs">Gross Salary (₹)</Label>
                <Input
                  id="grossSalary"
                  type="number"
                  value={grossSalary}
                  onChange={e => setGrossSalary(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="deductions" className="text-xs">Deductions (₹)</Label>
                <Input
                  id="deductions"
                  type="number"
                  value={deductions}
                  onChange={e => setDeductions(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Net Salary (₹)</Label>
                <div className="h-8 px-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  ₹{netSalary.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* External Payment Details */}
          <div className="rounded-lg border p-3 space-y-3 bg-card">
            <h4 className="text-xs font-bold text-[#0d9488] uppercase tracking-wider">External Disbursement Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="paymentStatus" className="text-xs">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="paymentStatus" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map(s => (
                      <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="paymentDate" className="text-xs">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="paymentMode" className="text-xs">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger id="paymentMode" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map(m => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="extRef" className="text-xs">External Reference / UTR</Label>
                <Input
                  id="extRef"
                  placeholder="e.g. UTR202609051234"
                  value={externalReference}
                  onChange={e => setExternalReference(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="paymentSource" className="text-xs">Payment Source</Label>
                <Select value={paymentSource} onValueChange={setPaymentSource}>
                  <SelectTrigger id="paymentSource" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_SOURCES.map(src => (
                      <SelectItem key={src} value={src} className="text-xs">{src}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bankName" className="text-xs">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g. SBI, HDFC"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="accountLast4" className="text-xs">Account Last 4 Digits (Masked)</Label>
                <Input
                  id="accountLast4"
                  placeholder="XXXX (Only last 4 digits)"
                  maxLength={4}
                  value={accountLast4}
                  onChange={e => setAccountLast4(e.target.value.replace(/\D/g, ''))}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Proof Document</Label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Upload Proof</span>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.xlsx" onChange={handleFileUpload} />
                  </label>
                  {proofFileName ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      {proofFileName}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file attached</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <Label htmlFor="remarks" className="text-xs">Remarks / Notes</Label>
            <Textarea
              id="remarks"
              placeholder="e.g. Salary credited as per attendance register and contractor wage sheet"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="h-16 text-xs resize-none"
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
