'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
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
  Landmark,
  Clock,
  AlertTriangle,
  Download,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { EPFRecordItem, ECRItem } from '@/types/payroll'
import RecordEPFDialog from './record-epf-dialog'
import { useAuthStore } from '@/stores/auth-store'

interface PayrollEPFTabProps {
  period: string
}

function formatLakhs(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function PayrollEPFTab({ period }: PayrollEPFTabProps) {
  const { role } = useAuthStore()
  const canEdit = role === 'ADMIN' || role === 'HR_COORDINATOR' || role === 'PMC'

  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [search, setSearch] = useState('')
  const [contractorId, setContractorId] = useState('all')
  const [siteId, setSiteId] = useState('all')
  const [ecrStatus, setEcrStatus] = useState('all')
  const [timelinessStatus, setTimelinessStatus] = useState('all')
  const [verificationStatus, setVerificationStatus] = useState('all')

  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [editTargetRecord, setEditTargetRecord] = useState<EPFRecordItem | null>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Fetch filter dropdown options
  const { data: contractors = [] } = useQuery<any[]>({
    queryKey: ['contractors'],
    queryFn: () => fetch('/api/contractors').then(r => r.json()),
  })
  const { data: sites = [] } = useQuery<any[]>({
    queryKey: ['sites'],
    queryFn: () => fetch('/api/sites').then(r => r.json()),
  })

  // Fetch ECR records
  const { data: ecrResp } = useQuery<{ data: ECRItem[] }>({
    queryKey: ['payroll-ecr', period],
    queryFn: () => fetch(`/api/payroll/ecr?period=${period}`).then(r => r.json()),
  })
  const ecrList = ecrResp?.data ?? []

  // Build query params
  const params = new URLSearchParams({
    period,
    page: page.toString(),
    limit: limit.toString(),
  })
  if (search) params.set('search', search)
  if (contractorId !== 'all') params.set('contractorId', contractorId)
  if (siteId !== 'all') params.set('siteId', siteId)
  if (ecrStatus !== 'all') params.set('ecrStatus', ecrStatus)
  if (timelinessStatus !== 'all') params.set('timelinessStatus', timelinessStatus)
  if (verificationStatus !== 'all') params.set('verificationStatus', verificationStatus)

  const { data: resp, isLoading } = useQuery<{
    data: EPFRecordItem[]
    total: number
    page: number
    limit: number
    kpis: {
      applicableWorkers: number
      uanAvailable: number
      uanMissing: number
      contributionRecorded: number
      ecrFiled: number
      depositRecorded: number
      depositPending: number
      totalAmount: number
      timelyDeposits: number
      lateDeposits: number
    }
  }>({
    queryKey: ['payroll-epf', period, page, search, contractorId, siteId, ecrStatus, timelinessStatus, verificationStatus],
    queryFn: () => fetch(`/api/payroll/epf?${params}`).then(r => r.json()),
  })

  const records = resp?.data ?? []
  const total = resp?.total ?? 0
  const kpis = resp?.kpis
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const handleClearFilters = () => {
    setSearch('')
    setContractorId('all')
    setSiteId('all')
    setEcrStatus('all')
    setTimelinessStatus('all')
    setVerificationStatus('all')
    setPage(1)
  }

  const exportColumns: ExportColumn<EPFRecordItem>[] = [
    { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
    { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName || '' },
    { key: 'uan', header: 'UAN', accessor: r => r.uan || '' },
    { key: 'site', header: 'Site / Zone', accessor: r => r.worker.site?.name || '' },
    { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name || '' },
    { key: 'wage', header: 'EPF Wage', accessor: r => r.epfWage },
    { key: 'empContrib', header: 'Employee (12%)', accessor: r => r.employeeContribution },
    { key: 'empyrContrib', header: 'Employer (3.67%)', accessor: r => r.employerContribution },
    { key: 'total', header: 'Total Contribution', accessor: r => r.totalContribution },
    { key: 'ecr', header: 'ECR Status', accessor: r => r.ecrStatus },
    { key: 'ecrRef', header: 'ECR Reference', accessor: r => r.ecrReference || '' },
    { key: 'challan', header: 'Challan No', accessor: r => r.challanNumber || '' },
    { key: 'depositDate', header: 'Deposit Date', accessor: r => r.depositDate ? r.depositDate.split('T')[0] : '—' },
    { key: 'due', header: 'Due Date', accessor: r => r.dueDate ? r.dueDate.split('T')[0] : '—' },
    { key: 'timeliness', header: 'Timeliness', accessor: r => r.timelinessStatus },
    { key: 'verif', header: 'Verification', accessor: r => r.verificationStatus },
  ]

  const getTimelinessBadge = (status: string, daysDiff: number | null) => {
    switch (status) {
      case 'On Time':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-none text-[10px]">On Time</Badge>
      case 'Late':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-none text-[10px]">{daysDiff ? `${daysDiff}d Late` : 'Late'}</Badge>
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-none text-[10px]">Overdue</Badge>
      default:
        return <Badge variant="secondary" className="text-[10px]">Pending</Badge>
    }
  }

  return (
    <div className="space-y-5">
      {/* Title & Actions */}
      {mounted && document.getElementById('payroll-tab-actions-left') && createPortal(
        <TableExportButton
          rows={records}
          columns={exportColumns}
          filename={`epf_records_${period}`}
          variant="outline"
          size="sm"
        />,
        document.getElementById('payroll-tab-actions-left')!
      )}
      {mounted && document.getElementById('payroll-tab-actions-right') && createPortal(
        <>
          {canEdit && (
            <Button
              size="sm"
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
              onClick={() => {
                setEditTargetRecord(null)
                setRecordModalOpen(true)
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Record EPF Deposit
            </Button>
          )}
        </>,
        document.getElementById('payroll-tab-actions-right')!
      )}

      {/* EPF KPI Cards (Section 18) */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <Card className="p-3">
            <span className="text-[11px] text-muted-foreground block">EPF Applicable</span>
            <span className="text-xl font-bold text-foreground">{kpis.applicableWorkers}</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Workers covered</span>
          </Card>

          <Card className="p-3">
            <span className="text-[11px] text-muted-foreground block">UAN Status</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.uanAvailable}</span>
              <span className="text-xs text-red-500 font-medium">({kpis.uanMissing} missing)</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Portal linked</span>
          </Card>

          <Card className="p-3">
            <span className="text-[11px] text-muted-foreground block">ECR Filed</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-teal-700 dark:text-teal-300">{kpis.ecrFiled}</span>
              <span className="text-xs text-muted-foreground">/ {kpis.applicableWorkers}</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Filing verified</span>
          </Card>

          <Card className="p-3">
            <span className="text-[11px] text-muted-foreground block">Deposits Tracked</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.depositRecorded}</span>
              <span className="text-xs text-amber-500 font-medium">({kpis.depositPending} pending)</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">TRRN challans</span>
          </Card>

          <Card className="p-3">
            <span className="text-[11px] text-muted-foreground block">Timeliness</span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.timelyDeposits}</span>
              <span className="text-xs text-amber-600">({kpis.lateDeposits} late)</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Due date 15th</span>
          </Card>

          <Card className="p-3">
            <span className="text-[11px] text-muted-foreground block">Total EPF Amount</span>
            <span className="text-xl font-bold text-teal-700 dark:text-teal-300">{formatLakhs(kpis.totalAmount)}</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">{period} period</span>
          </Card>
        </div>
      )}

      {/* ECR Tracking Section (Section 23) */}
      {ecrList.length > 0 && (
        <Card>
          <CardHeader className="py-2.5 px-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#0d9488] flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5" /> Contractor ECR & TRRN Challan Summary
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">EPFO Portal Submissions</Badge>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[11px] bg-muted/40">
                  <TableHead className="py-1.5">Contractor</TableHead>
                  <TableHead className="py-1.5 text-center">Workers</TableHead>
                  <TableHead className="py-1.5">ECR Reference</TableHead>
                  <TableHead className="py-1.5">Filing Date</TableHead>
                  <TableHead className="py-1.5">Challan / TRRN</TableHead>
                  <TableHead className="py-1.5">Deposit Date</TableHead>
                  <TableHead className="py-1.5 text-right">Amount</TableHead>
                  <TableHead className="py-1.5 text-center">Status</TableHead>
                  <TableHead className="py-1.5 text-center">Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ecrList.map((ecr) => (
                  <TableRow key={ecr.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="font-semibold py-2">{ecr.contractorName || 'Contractor'}</TableCell>
                    <TableCell className="text-center font-mono py-2">{ecr.workerCount}</TableCell>
                    <TableCell className="font-mono text-[11px] py-2">{ecr.ecrReference}</TableCell>
                    <TableCell className="text-muted-foreground py-2 font-mono">
                      {ecr.filingDate ? new Date(ecr.filingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] py-2">{ecr.challanNumber || '—'}</TableCell>
                    <TableCell className="text-muted-foreground py-2 font-mono">
                      {ecr.depositDate ? new Date(ecr.depositDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium py-2">₹{ecr.totalAmount.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-center py-2">
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 text-[10px]">
                        {ecr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <span className="text-emerald-600 font-mono text-xs">✓ Available</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="py-0">
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search worker, employee no, UAN, Challan..."
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

            <Select value={ecrStatus} onValueChange={v => { setEcrStatus(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                <SelectValue placeholder="ECR Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All ECR</SelectItem>
                <SelectItem value="Filed" className="text-xs">Filed</SelectItem>
                <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timelinessStatus} onValueChange={v => { setTimelinessStatus(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                <SelectValue placeholder="Timeliness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Timeliness</SelectItem>
                <SelectItem value="On Time" className="text-xs">On Time</SelectItem>
                <SelectItem value="Late" className="text-xs">Late</SelectItem>
                <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                <SelectItem value="Overdue" className="text-xs">Overdue</SelectItem>
              </SelectContent>
            </Select>

            {(search || contractorId !== 'all' || siteId !== 'all' || ecrStatus !== 'all' || timelinessStatus !== 'all') && (
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

      {/* Main EPF Table (Section 19 & 20) */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs">
                <TableHead className="w-12 text-center">S.No.</TableHead>
                <TableHead className="w-28">Employee No.</TableHead>
                <TableHead className="min-w-[130px]">Worker</TableHead>
                <TableHead className="min-w-[110px]">UAN</TableHead>
                <TableHead className="min-w-[100px]">Site / Zone</TableHead>
                <TableHead className="min-w-[90px]">Camp</TableHead>
                <TableHead className="min-w-[100px]">Contractor</TableHead>
                <TableHead className="text-right w-24">EPF Wage</TableHead>
                <TableHead className="text-right w-20">Emp (12%)</TableHead>
                <TableHead className="text-right w-20">Empyr</TableHead>
                <TableHead className="text-right w-24">Total</TableHead>
                <TableHead className="w-24 text-center">ECR</TableHead>
                <TableHead className="w-24">ECR Filed</TableHead>
                <TableHead className="min-w-[100px]">Challan</TableHead>
                <TableHead className="w-24">Challan Date</TableHead>
                <TableHead className="w-24">Deposit Date</TableHead>
                <TableHead className="w-24">Due Date</TableHead>
                <TableHead className="w-24 text-center">Timeliness</TableHead>
                <TableHead className="w-16 text-center">Proof</TableHead>
                <TableHead className="w-24 text-center">Verification</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={21} className="h-10">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={21} className="h-48 text-center text-muted-foreground text-xs">
                    No EPF contribution records found for {period}.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r, idx) => (
                  <TableRow key={r.id} className="text-xs hover:bg-muted/40 transition-colors">
                    <TableCell className="text-center text-muted-foreground font-mono">
                      {(page - 1) * limit + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono font-medium">{r.worker.employeeNumber}</TableCell>
                    <TableCell className="font-semibold text-foreground">{r.worker.fullName || '—'}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {r.uan ? r.uan : <span className="text-red-500 font-semibold text-[11px]">Missing</span>}
                    </TableCell>
                    <TableCell>{r.worker.site?.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-[11px]">{r.worker.labourCamp?.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.worker.contractor?.name || '—'}</TableCell>
                    <TableCell className="text-right font-mono">₹{r.epfWage.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">₹{r.employeeContribution.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">₹{r.employerContribution.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-teal-700 dark:text-teal-300">
                      ₹{r.totalContribution.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={r.ecrStatus === 'Filed' ? 'border-teal-300 text-teal-700' : 'text-amber-600'}>
                        {r.ecrStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {r.ecrFilingDate ? new Date(r.ecrFilingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground truncate max-w-[100px]">
                      {r.challanNumber || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {r.challanDate ? new Date(r.challanDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {r.depositDate ? new Date(r.depositDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {getTimelinessBadge(r.timelinessStatus, r.daysDifference)}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {r.proofDocumentName ? <span className="text-emerald-600">✓</span> : <span className="text-amber-500">✕</span>}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {r.verificationStatus === 'Verified' ? (
                        <span className="text-teal-700 dark:text-teal-300 text-xs font-semibold">Verified</span>
                      ) : (
                        <span className="text-amber-600 text-xs">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
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

      {/* Record EPF Dialog */}
      <RecordEPFDialog
        open={recordModalOpen}
        onOpenChange={setRecordModalOpen}
        period={period}
        editRecord={editTargetRecord}
      />
    </div>
  )
}
