'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  User,
  Building2,
  Calendar,
  CreditCard,
  FileCheck,
  History,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { SalaryPaymentItem } from '@/types/payroll'
import { useAuthStore } from '@/stores/auth-store'

interface SalaryDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: SalaryPaymentItem | null
  onEdit?: (record: SalaryPaymentItem) => void
}

export default function SalaryDetailDialog({
  open,
  onOpenChange,
  record,
  onEdit,
}: SalaryDetailDialogProps) {
  const queryClient = useQueryClient()
  const { userName, role } = useAuthStore()
  const canVerify = role === 'ADMIN' || role === 'PMC' || role === 'HR_COORDINATOR'

  const [verificationRemarks, setVerificationRemarks] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const verifyMutation = useMutation({
    mutationFn: async ({ status, remarks }: { status: string; remarks: string }) => {
      const res = await fetch('/api/payroll/salary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: record?.id,
          verificationStatus: status,
          verificationRemarks: remarks,
          verifiedBy: userName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update verification')
      return data
    },
    onSuccess: (_, variables) => {
      toast.success(`Record marked as ${variables.status}`)
      queryClient.invalidateQueries({ queryKey: ['payroll-salary'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-overview'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-compliance'] })
      setIsVerifying(false)
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // Audit trail
  const { data: auditResp } = useQuery<{ data: any[] }>({
    queryKey: ['salary-audit', record?.id],
    queryFn: () => fetch(`/api/payroll/salary/audit?recordId=${record!.id}`).then(r => r.json()),
    enabled: !!record?.id && open,
  })
  const auditLogs = auditResp?.data ?? []

  if (!record) return null

  const worker = record.worker

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300">Paid</Badge>
      case 'Partially Paid':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300">Partially Paid</Badge>
      case 'On Hold':
        return <Badge variant="outline" className="text-slate-600 dark:text-slate-400">On Hold</Badge>
      case 'Disputed':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Disputed</Badge>
      case 'Failed / Returned':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300">Failed / Returned</Badge>
      default:
        return <Badge variant="secondary">Not Recorded</Badge>
    }
  }

  const getVerificationBadge = (vStatus: string) => {
    switch (vStatus) {
      case 'Verified':
        return <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-300 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      case 'Verification Not Required':
        return <Badge variant="outline">Not Required</Badge>
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Pending Verification</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <div>
              <DialogTitle className="text-lg flex items-center gap-2">
                <span>Salary Payment Record</span>
                {getStatusBadge(record.paymentStatus)}
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Period: <span className="font-mono font-semibold text-foreground">{record.period}</span> &middot; Employee No: <span className="font-mono font-semibold text-foreground">{worker.employeeNumber}</span>
              </DialogDescription>
            </div>
            <div>{getVerificationBadge(record.verificationStatus)}</div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Section 1: Worker Information */}
          <div className="rounded-lg border p-3 bg-card space-y-2">
            <h4 className="text-xs font-bold text-[#0d9488] flex items-center gap-1.5 uppercase tracking-wider">
              <User className="h-3.5 w-3.5" /> Worker Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Full Name:</span>
                <span className="font-semibold">{worker.fullName || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Employee No:</span>
                <span className="font-mono font-medium">{worker.employeeNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Designation:</span>
                <span>{worker.designation?.name || 'Worker'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Site / Zone:</span>
                <span>{worker.site?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Labour Camp:</span>
                <span>{worker.labourCamp?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Contractor:</span>
                <span className="font-medium">{worker.contractor?.name || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Payroll Information */}
          <div className="rounded-lg border p-3 bg-card space-y-2">
            <h4 className="text-xs font-bold text-[#0d9488] flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" /> Payroll Computation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[11px]">Payable Days:</span>
                <span className="font-bold text-sm">{record.payableDays} days</span>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[11px]">Gross Salary:</span>
                <span className="font-bold text-sm">₹{record.grossSalary.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground block text-[11px]">Deductions:</span>
                <span className="font-bold text-sm text-red-600">₹{record.deductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-medium">Net Salary:</span>
                <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  ₹{record.netSalary.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: External Payment Information */}
          <div className="rounded-lg border p-3 bg-card space-y-2">
            <h4 className="text-xs font-bold text-[#0d9488] flex items-center gap-1.5 uppercase tracking-wider">
              <CreditCard className="h-3.5 w-3.5" /> External Payment Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Payment Date:</span>
                <span className="font-medium">
                  {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Disbursed'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Payment Mode:</span>
                <span>{record.paymentMode || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">External Ref / UTR:</span>
                <span className="font-mono font-medium">{record.externalReference || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Payment Source:</span>
                <span>{record.paymentSource || 'Contractor'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Bank:</span>
                <span>{record.bankName || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Account Last 4:</span>
                <span className="font-mono">{record.accountLast4 ? `XXXX-XXXX-${record.accountLast4}` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Proof & Verification */}
          <div className="rounded-lg border p-3 bg-card space-y-2">
            <h4 className="text-xs font-bold text-[#0d9488] flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" /> Proof & Verification Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded border flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Payment Proof:</span>
                  {record.proofDocumentName ? (
                    <span className="font-mono text-xs text-foreground font-medium truncate block max-w-[200px]">
                      {record.proofDocumentName}
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" /> Proof Missing
                    </span>
                  )}
                </div>
                {record.proofDocumentName && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info('Proof document opened in viewer')}>
                    <Download className="h-3 w-3 mr-1" /> View
                  </Button>
                )}
              </div>

              <div className="p-2.5 rounded border">
                <span className="text-muted-foreground block text-[11px]">Verification Status:</span>
                <div className="font-medium">
                  {record.verificationStatus === 'Verified' ? (
                    <span className="text-teal-700 dark:text-teal-400">
                      Verified by {record.verifiedBy || 'Admin'} on {record.verifiedAt ? new Date(record.verifiedAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Pending Auditor Verification</span>
                  )}
                </div>
                {record.verificationRemarks && (
                  <p className="text-[11px] text-muted-foreground mt-1 italic">"{record.verificationRemarks}"</p>
                )}
              </div>
            </div>

            {/* Remarks */}
            {record.remarks && (
              <div className="text-xs pt-1">
                <span className="text-muted-foreground block text-[11px]">Remarks:</span>
                <p className="text-foreground mt-0.5">{record.remarks}</p>
              </div>
            )}
          </div>

          {/* Section 5: Audit History */}
          {auditLogs.length > 0 && (
            <div className="rounded-lg border p-3 bg-card space-y-2">
              <h4 className="text-xs font-bold text-[#0d9488] flex items-center gap-1.5 uppercase tracking-wider">
                <History className="h-3.5 w-3.5" /> Change History
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {auditLogs.map((log: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] py-1 border-b last:border-b-0">
                    <Clock className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground">{log.userName}</span>
                      <span className="text-muted-foreground"> &middot; {log.action?.replace(/_/g, ' ')}</span>
                      {log.field && (
                        <span className="text-muted-foreground"> &middot; {log.field}: </span>
                      )}
                      {log.oldValue && <span className="text-red-500 line-through">{log.oldValue}</span>}
                      {log.newValue && <span className="text-teal-600"> → {log.newValue}</span>}
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Actions Form */}
          {canVerify && isVerifying && (
            <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3 space-y-3">
              <h5 className="text-xs font-bold text-[#0d9488]">Audit & Verification Decision</h5>
              <div className="space-y-1.5">
                <Label htmlFor="vRemarks" className="text-xs">Audit Remarks / Notes</Label>
                <Textarea
                  id="vRemarks"
                  placeholder="e.g. Verified against bank UTR settlement report"
                  value={verificationRemarks}
                  onChange={e => setVerificationRemarks(e.target.value)}
                  className="h-14 text-xs resize-none bg-background"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsVerifying(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => verifyMutation.mutate({ status: 'Rejected', remarks: verificationRemarks })}
                  disabled={verifyMutation.isPending}
                >
                  Reject Record
                </Button>
                <Button
                  size="sm"
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
                  onClick={() => verifyMutation.mutate({ status: 'Verified', remarks: verificationRemarks })}
                  disabled={verifyMutation.isPending}
                >
                  Mark as Verified
                </Button>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              {canVerify && !isVerifying && record.verificationStatus !== 'Verified' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#0d9488] text-[#0d9488] hover:bg-teal-50"
                  onClick={() => setIsVerifying(true)}
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                  Verify Record
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    onEdit(record)
                  }}
                >
                  Edit Record
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
