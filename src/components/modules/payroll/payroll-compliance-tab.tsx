'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheck,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableExportButton, ExportColumn } from '@/components/ui/table-export-button'
import {
  WorkerComplianceItem,
  ContractorComplianceItem,
  SiteComplianceItem,
} from '@/types/payroll'

interface PayrollComplianceTabProps {
  period: string
}

export default function PayrollComplianceTab({ period }: PayrollComplianceTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'contractor' | 'site' | 'worker'>('contractor')
  const [workerSearch, setWorkerSearch] = useState('')

  const { data: resp, isLoading } = useQuery<{
    data: {
      period: string
      workerMatrix: WorkerComplianceItem[]
      contractorCompliance: ContractorComplianceItem[]
      siteCompliance: SiteComplianceItem[]
    }
  }>({
    queryKey: ['payroll-compliance', period],
    queryFn: () => fetch(`/api/payroll/compliance?period=${period}`).then(r => r.json()),
  })

  const comp = resp?.data
  const workerMatrix = comp?.workerMatrix ?? []
  const contractorCompliance = comp?.contractorCompliance ?? []
  const siteCompliance = comp?.siteCompliance ?? []

  const filteredWorkers = workerMatrix.filter(w => {
    if (!workerSearch) return true
    const q = workerSearch.toLowerCase()
    return (
      w.workerName.toLowerCase().includes(q) ||
      w.employeeNumber.toLowerCase().includes(q) ||
      w.contractor.toLowerCase().includes(q) ||
      w.site.toLowerCase().includes(q)
    )
  })

  const contractorExportCols: ExportColumn<ContractorComplianceItem>[] = [
    { key: 'name', header: 'Contractor', accessor: c => c.contractorName },
    { key: 'workers', header: 'Workers', accessor: c => c.workerCount },
    { key: 'salary', header: 'Salary Records %', accessor: c => `${c.salaryRecordsPct}%` },
    { key: 'salVerif', header: 'Salary Verification %', accessor: c => `${c.salaryVerificationPct}%` },
    { key: 'epf', header: 'EPF Records %', accessor: c => `${c.epfRecordsPct}%` },
    { key: 'ecr', header: 'ECR Filing %', accessor: c => `${c.ecrFilingPct}%` },
    { key: 'deposit', header: 'EPF Deposit %', accessor: c => `${c.epfDepositPct}%` },
    { key: 'timely', header: 'Timely Deposit %', accessor: c => `${c.timelyDepositPct}%` },
    { key: 'overall', header: 'Overall Compliance %', accessor: c => `${c.overallCompliancePct}%` },
  ]

  const siteExportCols: ExportColumn<SiteComplianceItem>[] = [
    { key: 'name', header: 'Site / Zone', accessor: s => s.siteName },
    { key: 'workers', header: 'Workers', accessor: s => s.workerCount },
    { key: 'salary', header: 'Salary Compliance %', accessor: s => `${s.salaryCompliancePct}%` },
    { key: 'epf', header: 'EPF Compliance %', accessor: s => `${s.epfCompliancePct}%` },
    { key: 'timely', header: 'Timely Deposit %', accessor: s => `${s.timelyDepositPct}%` },
    { key: 'doc', header: 'Document Compliance %', accessor: s => `${s.documentCompliancePct}%` },
    { key: 'overall', header: 'Overall Compliance %', accessor: s => `${s.overallCompliancePct}%` },
  ]

  const workerExportCols: ExportColumn<WorkerComplianceItem>[] = [
    { key: 'empNo', header: 'Employee No', accessor: w => w.employeeNumber },
    { key: 'name', header: 'Worker Name', accessor: w => w.workerName },
    { key: 'site', header: 'Site / Zone', accessor: w => w.site },
    { key: 'contractor', header: 'Contractor', accessor: w => w.contractor },
    { key: 'salary', header: 'Salary Status', accessor: w => w.salaryStatus },
    { key: 'salVerif', header: 'Salary Verified', accessor: w => w.salaryVerified ? 'Yes' : 'No' },
    { key: 'epf', header: 'EPF Status', accessor: w => w.epfStatus },
    { key: 'ecr', header: 'ECR Status', accessor: w => w.ecrStatus },
    { key: 'deposit', header: 'Deposit Status', accessor: w => w.depositStatus },
    { key: 'timely', header: 'Timeliness', accessor: w => w.timeliness },
    { key: 'docs', header: 'Documents Available', accessor: w => w.hasDocuments ? 'Yes' : 'No' },
    { key: 'overall', header: 'Overall Compliance', accessor: w => w.overallCompliance },
  ]

  const getOverallBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-medium text-[11px]">Compliant</Badge>
      case 'Attention':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none font-medium text-[11px]">Attention</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none font-medium text-[11px]">Non-Compliant</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Consolidated Statutory Compliance</h2>
          <p className="text-xs text-muted-foreground">
            Contractor, Site, and Worker-level statutory tracking for {period}.
          </p>
        </div>

        <Tabs value={activeSubTab} onValueChange={(v: any) => setActiveSubTab(v)} className="shrink-0">
          <TabsList className="h-8 p-1">
            <TabsTrigger value="contractor" className="text-xs gap-1.5 h-6">
              <Building2 className="h-3 w-3" /> Contractor
            </TabsTrigger>
            <TabsTrigger value="site" className="text-xs gap-1.5 h-6">
              <MapPin className="h-3 w-3" /> Site / Zone
            </TabsTrigger>
            <TabsTrigger value="worker" className="text-xs gap-1.5 h-6">
              <Users className="h-3 w-3" /> Worker Matrix
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 1. Contractor Compliance Tab (Section 26) */}
      {activeSubTab === 'contractor' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <TableExportButton
              rows={contractorCompliance}
              columns={contractorExportCols}
              filename={`contractor_compliance_${period}`}
              variant="outline"
              size="sm"
            />
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="min-w-[140px]">Contractor</TableHead>
                    <TableHead className="text-center w-20">Workers</TableHead>
                    <TableHead className="text-center w-28">Salary Records</TableHead>
                    <TableHead className="text-center w-28">Salary Verified</TableHead>
                    <TableHead className="text-center w-28">EPF Records</TableHead>
                    <TableHead className="text-center w-24">ECR Filing</TableHead>
                    <TableHead className="text-center w-28">EPF Deposit</TableHead>
                    <TableHead className="text-center w-28">Timely Deposit</TableHead>
                    <TableHead className="text-center w-28">Overall Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractorCompliance.map((c) => (
                    <TableRow key={c.contractorId} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-bold">{c.contractorName}</TableCell>
                      <TableCell className="text-center font-mono">{c.workerCount}</TableCell>
                      <TableCell className="text-center font-mono">{c.salaryRecordsPct}%</TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">{c.salaryVerificationPct}%</TableCell>
                      <TableCell className="text-center font-mono">{c.epfRecordsPct}%</TableCell>
                      <TableCell className="text-center font-mono">{c.ecrFilingPct}%</TableCell>
                      <TableCell className="text-center font-mono">{c.epfDepositPct}%</TableCell>
                      <TableCell className="text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{c.timelyDepositPct}%</TableCell>
                      <TableCell className="text-center font-mono font-bold text-[#0d9488]">
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200">
                          {c.overallCompliancePct}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Site-wise Compliance Tab (Section 27) */}
      {activeSubTab === 'site' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <TableExportButton
              rows={siteCompliance}
              columns={siteExportCols}
              filename={`site_compliance_${period}`}
              variant="outline"
              size="sm"
            />
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="min-w-[140px]">Site / Location</TableHead>
                    <TableHead className="text-center w-20">Workers</TableHead>
                    <TableHead className="text-center w-32">Salary Compliance</TableHead>
                    <TableHead className="text-center w-32">EPF Compliance</TableHead>
                    <TableHead className="text-center w-32">Timely Deposit</TableHead>
                    <TableHead className="text-center w-32">Document Proof</TableHead>
                    <TableHead className="text-center w-28">Overall Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siteCompliance.map((s) => (
                    <TableRow key={s.siteId} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-bold">{s.siteName}</TableCell>
                      <TableCell className="text-center font-mono">{s.workerCount}</TableCell>
                      <TableCell className="text-center font-mono">{s.salaryCompliancePct}%</TableCell>
                      <TableCell className="text-center font-mono">{s.epfCompliancePct}%</TableCell>
                      <TableCell className="text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{s.timelyDepositPct}%</TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">{s.documentCompliancePct}%</TableCell>
                      <TableCell className="text-center font-mono font-bold text-[#0d9488]">
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200">
                          {s.overallCompliancePct}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* 3. Worker-Level Compliance Matrix (Section 25) */}
      {activeSubTab === 'worker' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search worker by name, employee no, site..."
                value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <TableExportButton
              rows={filteredWorkers}
              columns={workerExportCols}
              filename={`worker_compliance_matrix_${period}`}
              variant="outline"
              size="sm"
            />
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="w-12 text-center">S.No.</TableHead>
                    <TableHead className="w-28">Employee No.</TableHead>
                    <TableHead className="min-w-[130px]">Worker</TableHead>
                    <TableHead className="min-w-[100px]">Site / Zone</TableHead>
                    <TableHead className="min-w-[100px]">Contractor</TableHead>
                    <TableHead className="text-center w-20">Salary</TableHead>
                    <TableHead className="text-center w-16">Verified</TableHead>
                    <TableHead className="text-center w-16">EPF</TableHead>
                    <TableHead className="text-center w-16">ECR</TableHead>
                    <TableHead className="text-center w-16">Deposit</TableHead>
                    <TableHead className="text-center w-20">Timely</TableHead>
                    <TableHead className="text-center w-16">Docs</TableHead>
                    <TableHead className="text-center w-28">Overall Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkers.map((w, idx) => (
                    <TableRow key={w.workerId} className="text-xs hover:bg-muted/30">
                      <TableCell className="text-center font-mono text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-mono font-medium">{w.employeeNumber}</TableCell>
                      <TableCell className="font-semibold text-foreground">{w.workerName}</TableCell>
                      <TableCell>{w.site}</TableCell>
                      <TableCell className="text-muted-foreground">{w.contractor}</TableCell>
                      <TableCell className="text-center font-mono font-bold">
                        {w.salaryStatus === 'Paid' ? <span className="text-emerald-600">✓</span> : <span className="text-red-500">✕</span>}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {w.salaryVerified ? <span className="text-emerald-600">✓</span> : <span className="text-amber-500">✕</span>}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {w.epfStatus === 'Recorded' ? <span className="text-emerald-600">✓</span> : <span className="text-red-500">✕</span>}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {w.ecrStatus === 'Filed' ? <span className="text-emerald-600">✓</span> : <span className="text-amber-500">✕</span>}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {w.depositStatus === 'Deposited' ? <span className="text-emerald-600">✓</span> : <span className="text-red-500">✕</span>}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {w.timeliness === 'On Time' ? <span className="text-emerald-600">✓</span> : <span className="text-amber-500">⚠</span>}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {w.hasDocuments ? <span className="text-emerald-600">✓</span> : <span className="text-amber-500">✕</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {getOverallBadge(w.overallCompliance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
