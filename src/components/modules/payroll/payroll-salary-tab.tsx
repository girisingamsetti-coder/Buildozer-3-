'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Filter,
  X,
  Eye,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Pencil,
  FileText,
  Clock,
  Download,
  CheckSquare,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableExportButton, ExportColumn } from '@/components/ui/table-export-button'
import { SalaryPaymentItem } from '@/types/payroll'
import RecordPaymentDialog from './record-payment-dialog'
import SalaryDetailDialog from './salary-detail-dialog'
import { useAuthStore } from '@/stores/auth-store'

interface PayrollSalaryTabProps {
  period: string
}

export default function PayrollSalaryTab({ period }: PayrollSalaryTabProps) {
  const queryClient = useQueryClient()
  const { role, userName } = useAuthStore()
  const canEdit = role === 'ADMIN' || role === 'HR_COORDINATOR' || role === 'PMC'

  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [search, setSearch] = useState('')
  const [contractorId, setContractorId] = useState('all')
  const [siteId, setSiteId] = useState('all')
  const [labourCampId, setLabourCampId] = useState('all')
  const [designationId, setDesignationId] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [paymentMode, setPaymentMode] = useState('all')
  const [verificationStatus, setVerificationStatus] = useState('all')

  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [editTargetRecord, setEditTargetRecord] = useState<SalaryPaymentItem | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<SalaryPaymentItem | null>(null)

  // Fetch filter dropdown options
  const { data: contractors = [] } = useQuery<any[]>({
    queryKey: ['contractors'],
    queryFn: () => fetch('/api/contractors').then(r => r.json()),
  })
  const { data: sites = [] } = useQuery<any[]>({
    queryKey: ['sites'],
    queryFn: () => fetch('/api/sites').then(r => r.json()),
  })
  const { data: labourCamps = [] } = useQuery<any[]>({
    queryKey: ['labour-camps'],
    queryFn: () => fetch('/api/labour-camps').then(r => r.json()),
  })
  const { data: designations = [] } = useQuery<any[]>({
    queryKey: ['designations'],
    queryFn: () => fetch('/api/designations').then(r => r.json()),
  })

  // Build query params
  const params = new URLSearchParams({
    period,
    page: page.toString(),
    limit: limit.toString(),
  })
  if (search) params.set('search', search)
  if (contractorId !== 'all') params.set('contractorId', contractorId)
  if (siteId !== 'all') params.set('siteId', siteId)
  if (labourCampId !== 'all') params.set('labourCampId', labourCampId)
  if (designationId !== 'all') params.set('designationId', designationId)
  if (paymentStatus !== 'all') params.set('paymentStatus', paymentStatus)
  if (paymentMode !== 'all') params.set('paymentMode', paymentMode)
  if (verificationStatus !== 'all') params.set('verificationStatus', verificationStatus)

  const { data: resp, isLoading } = useQuery<{ data: SalaryPaymentItem[]; total: number; page: number; limit: number }>({
    queryKey: ['payroll-salary', period, page, search, contractorId, siteId, designationId, paymentStatus, paymentMode, verificationStatus],
    queryFn: () => fetch(`/api/payroll/salary?${params}`).then(r => r.json()),
  })

  const records = resp?.data ?? []
  const total = resp?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const handleClearFilters = () => {
    setSearch('')
    setContractorId('all')
    setSiteId('all')
    setLabourCampId('all')
    setDesignationId('all')
    setPaymentStatus('all')
    setPaymentMode('all')
    setVerificationStatus('all')
    setPage(1)
  }

  // Bulk Verify — marks all Pending Verification records for this period as Verified
  const bulkVerifyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/payroll/salary/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, userName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bulk verify failed')
      return data
    },
    onSuccess: (data) => {
      toast.success(`${data.count ?? 'All'} records marked as Verified`)
      queryClient.invalidateQueries({ queryKey: ['payroll-salary'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-overview'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-compliance'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const exportColumns: ExportColumn<SalaryPaymentItem>[] = [
    { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
    { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName || '' },
    { key: 'desig', header: 'Designation', accessor: r => r.worker.designation?.name || '' },
    { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name || '' },
    { key: 'site', header: 'Site / Zone', accessor: r => r.worker.site?.name || '' },
    { key: 'period', header: 'Period', accessor: r => r.period },
    { key: 'days', header: 'Payable Days', accessor: r => r.payableDays },
    { key: 'gross', header: 'Gross Salary', accessor: r => r.grossSalary },
    { key: 'deductions', header: 'Deductions', accessor: r => r.deductions },
    { key: 'net', header: 'Net Salary', accessor: r => r.netSalary },
    { key: 'status', header: 'Payment Status', accessor: r => r.paymentStatus },
    { key: 'date', header: 'Payment Date', accessor: r => r.paymentDate ? r.paymentDate.split('T')[0] : '—' },
    { key: 'mode', header: 'Payment Mode', accessor: r => r.paymentMode || '—' },
    { key: 'ref', header: 'External Reference', accessor: r => r.externalReference || '—' },
    { key: 'bank', header: 'Bank Name', accessor: r => r.bankName || '—' },
    { key: 'acct', header: 'Account Last 4', accessor: r => r.accountLast4 || '—' },
    { key: 'verif', header: 'Verification', accessor: r => r.verificationStatus },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 font-medium text-[11px]">Paid</Badge>
      case 'Partially Paid':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 font-medium text-[11px]">Partially Paid</Badge>
      case 'On Hold':
        return <Badge variant="outline" className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">On Hold</Badge>
      case 'Disputed':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-medium text-[11px]">Disputed</Badge>
      case 'Failed / Returned':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 font-medium text-[11px]">Failed / Returned</Badge>
      default:
        return <Badge variant="secondary" className="font-medium text-[11px]">Not Recorded</Badge>
    }
  }

  const getVerificationBadge = (vStatus: string) => {
    switch (vStatus) {
      case 'Verified':
        return <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold"><AlertCircle className="h-3.5 w-3.5" /> Rejected</span>
      case 'Verification Not Required':
        return <span className="text-muted-foreground text-xs">Not Required</span>
      default:
        return <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium"><Clock className="h-3 w-3" /> Pending</span>
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Salary Payment Register</h2>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Loading records...' : `${total} worker payment records for ${period}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TableExportButton
            rows={records}
            columns={exportColumns}
            filename={`salary_payments_${period}`}
            variant="outline"
            size="sm"
          />
          {canEdit && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300"
                onClick={() => bulkVerifyMutation.mutate()}
                disabled={bulkVerifyMutation.isPending}
                title="Verify all pending salary records for this period"
              >
                {bulkVerifyMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <CheckSquare className="h-3.5 w-3.5 mr-1.5" />}
                Bulk Verify
              </Button>
              <Button
                size="sm"
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
                onClick={() => {
                  setEditTargetRecord(null)
                  setRecordModalOpen(true)
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Record Payment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="py-0">
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search worker, employee no, UTR..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <Select value={contractorId} onValueChange={v => { setContractorId(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Contractor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Contractors</SelectItem>
                {contractors.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={siteId} onValueChange={v => { setSiteId(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Site / Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Sites</SelectItem>
                {sites.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={designationId} onValueChange={v => { setDesignationId(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Designations</SelectItem>
                {designations.map(d => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={labourCampId} onValueChange={v => { setLabourCampId(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                <SelectValue placeholder="Camp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Camps</SelectItem>
                {labourCamps.map((c: any) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentStatus} onValueChange={v => { setPaymentStatus(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="Paid" className="text-xs">Paid</SelectItem>
                <SelectItem value="Not Recorded" className="text-xs">Not Recorded</SelectItem>
                <SelectItem value="Partially Paid" className="text-xs">Partially Paid</SelectItem>
                <SelectItem value="On Hold" className="text-xs">On Hold</SelectItem>
                <SelectItem value="Disputed" className="text-xs">Disputed</SelectItem>
                <SelectItem value="Failed / Returned" className="text-xs">Failed / Returned</SelectItem>
                <SelectItem value="Unknown" className="text-xs">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMode} onValueChange={v => { setPaymentMode(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Modes</SelectItem>
                <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                <SelectItem value="NEFT/RTGS" className="text-xs">NEFT/RTGS</SelectItem>
                <SelectItem value="Cheque" className="text-xs">Cheque</SelectItem>
                <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                <SelectItem value="UPI" className="text-xs">UPI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationStatus} onValueChange={v => { setVerificationStatus(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Verification</SelectItem>
                <SelectItem value="Verified" className="text-xs">Verified</SelectItem>
                <SelectItem value="Pending Verification" className="text-xs">Pending</SelectItem>
                <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {(search || contractorId !== 'all' || siteId !== 'all' || labourCampId !== 'all' || designationId !== 'all' || paymentStatus !== 'all' || paymentMode !== 'all' || verificationStatus !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-full text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={handleClearFilters}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Salary Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs">
                <TableHead className="w-12 text-center">S.No.</TableHead>
                <TableHead className="w-28">Employee No.</TableHead>
                <TableHead className="min-w-[140px]">Worker</TableHead>
                <TableHead className="min-w-[100px]">Designation</TableHead>
                <TableHead className="min-w-[100px]">Site / Zone</TableHead>
                <TableHead className="min-w-[90px]">Camp</TableHead>
                <TableHead className="w-20">Period</TableHead>
                <TableHead className="w-16 text-center">Days</TableHead>
                <TableHead className="text-right w-24">Gross</TableHead>
                <TableHead className="text-right w-20">Ded.</TableHead>
                <TableHead className="text-right w-24">Net Salary</TableHead>
                <TableHead className="w-24">Payment Date</TableHead>
                <TableHead className="w-24">Mode</TableHead>
                <TableHead className="min-w-[110px]">Reference / UTR</TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
                <TableHead className="w-16 text-center">Proof</TableHead>
                <TableHead className="w-24 text-center">Verification</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={18} className="h-10">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={18} className="h-48 text-center text-muted-foreground text-xs">
                    No salary payment records found for {period} matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r, idx) => (
                  <TableRow
                    key={r.id}
                    className="text-xs hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedRecord(r)
                      setDetailModalOpen(true)
                    }}
                  >
                    <TableCell className="text-center text-muted-foreground font-mono">
                      {(page - 1) * limit + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono font-medium">{r.worker.employeeNumber}</TableCell>
                    <TableCell className="font-semibold text-foreground">{r.worker.fullName || '—'}</TableCell>
                    <TableCell>{r.worker.designation?.name || 'Worker'}</TableCell>
                    <TableCell>{r.worker.site?.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.worker.labourCamp?.name || '—'}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{r.period}</TableCell>
                    <TableCell className="text-center font-mono">{r.payableDays}</TableCell>
                    <TableCell className="text-right font-mono">₹{r.grossSalary.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">₹{r.deductions.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{r.netSalary.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.paymentMode || '—'}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">
                      {r.externalReference || '—'}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(r.paymentStatus)}</TableCell>
                    <TableCell className="text-center">
                      {r.proofDocumentName ? (
                        <span title={r.proofDocumentName} className="text-emerald-600 inline-block font-mono">✓</span>
                      ) : (
                        <span className="text-amber-500 inline-block font-mono">✕</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {getVerificationBadge(r.verificationStatus)}
                    </TableCell>
                    <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setSelectedRecord(r)
                            setDetailModalOpen(true)
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditTargetRecord(r)
                              setRecordModalOpen(true)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {records.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} records
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="font-mono px-2">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={recordModalOpen}
        onOpenChange={setRecordModalOpen}
        period={period}
        editRecord={editTargetRecord}
      />

      {/* Detail Dialog */}
      <SalaryDetailDialog
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        record={selectedRecord}
        onEdit={(rec) => {
          setEditTargetRecord(rec)
          setRecordModalOpen(true)
        }}
      />
    </div>
  )
}
