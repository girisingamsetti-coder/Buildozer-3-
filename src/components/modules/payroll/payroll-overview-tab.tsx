'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { PayrollOverviewKPIs } from '@/types/payroll'

interface PayrollOverviewTabProps {
  period: string
  onNavigateTab: (tabId: string) => void
}

function formatLakhs(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function PayrollOverviewTab({
  period,
  onNavigateTab,
}: PayrollOverviewTabProps) {
  const { data: kpiResp, isLoading } = useQuery<{ data: PayrollOverviewKPIs }>({
    queryKey: ['payroll-overview', period],
    queryFn: () => fetch(`/api/payroll/overview?period=${period}`).then(r => r.json()),
  })

  const kpis = kpiResp?.data

  if (isLoading || !kpis) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ====== Section 7: 8 KPI Cards ====== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Workers */}
        <Card className="hover:border-teal-500/50 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Workers</span>
              <Users className="h-4 w-4 text-[#0d9488]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">{kpis.totalWorkers}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Active registered workers</p>
          </CardContent>
        </Card>

        {/* 2. Salary Recorded */}
        <Card className="hover:border-teal-500/50 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Salary Recorded</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {kpis.salaryRecorded} <span className="text-xs text-muted-foreground font-normal">/ {kpis.totalWorkers}</span>
              </span>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-none text-[11px]">
                {kpis.salaryRecordedPct}%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">External payouts logged</p>
          </CardContent>
        </Card>

        {/* 3. Salary Pending */}
        <Card className="hover:border-teal-500/50 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Salary Pending</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {kpis.salaryPending}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting disbursement logs</p>
          </CardContent>
        </Card>

        {/* 4. Total Salary Amount */}
        <Card className="hover:border-teal-500/50 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Salary Amount</span>
              <IndianRupee className="h-4 w-4 text-[#0d9488]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {formatLakhs(kpis.totalSalaryAmount)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Net external payouts</p>
          </CardContent>
        </Card>

        {/* 5. EPF Deposit Recorded */}
        <Card className="hover:border-teal-500/50 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">EPF Deposit Recorded</span>
              <Landmark className="h-4 w-4 text-teal-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-teal-700 dark:text-teal-300">
                {kpis.epfRecorded} <span className="text-xs text-muted-foreground font-normal">/ {kpis.totalWorkers}</span>
              </span>
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-none text-[11px]">
                {kpis.epfRecordedPct}%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Challan deposits tracked</p>
          </CardContent>
        </Card>

        {/* 6. EPF Pending */}
        <Card className="hover:border-teal-500/50 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">EPF Pending</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
                {kpis.epfPending}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending deposit challans</p>
          </CardContent>
        </Card>

        {/* 7. EPF Amount */}
        <Card className="hover:border-teal-500/50 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">EPF Amount</span>
              <IndianRupee className="h-4 w-4 text-teal-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {formatLakhs(kpis.totalEpfAmount)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total statutory EPF</p>
          </CardContent>
        </Card>

        {/* 8. Compliance */}
        <Card className="hover:border-teal-500/50 transition-colors bg-gradient-to-br from-teal-500/5 via-card to-card border-teal-200 dark:border-teal-900">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium font-semibold text-[#0d9488]">Overall Compliance</span>
              <ShieldCheck className="h-4 w-4 text-[#0d9488]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0d9488]">
                {kpis.compliancePct}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Weighted statutory score</p>
          </CardContent>
        </Card>
      </div>

      {/* ====== Section 8: Monthly Compliance Status & Section 9: Requires Attention ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Compliance Status */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[#0d9488]" />
                Monthly Compliance Status
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono">
                {period}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Salary Payment Records</span>
                <span className="font-mono">{kpis.complianceStatus.salaryRecordsPct}%</span>
              </div>
              <Progress value={kpis.complianceStatus.salaryRecordsPct} className="h-2 bg-muted" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Salary Verification</span>
                <span className="font-mono">{kpis.complianceStatus.salaryVerificationPct}%</span>
              </div>
              <Progress value={kpis.complianceStatus.salaryVerificationPct} className="h-2 bg-muted" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>EPF Records</span>
                <span className="font-mono">{kpis.complianceStatus.epfRecordsPct}%</span>
              </div>
              <Progress value={kpis.complianceStatus.epfRecordsPct} className="h-2 bg-muted" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>ECR Filing</span>
                <span className="font-mono">{kpis.complianceStatus.ecrFilingPct}%</span>
              </div>
              <Progress value={kpis.complianceStatus.ecrFilingPct} className="h-2 bg-muted" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>EPF Deposit</span>
                <span className="font-mono">{kpis.complianceStatus.epfDepositPct}%</span>
              </div>
              <Progress value={kpis.complianceStatus.epfDepositPct} className="h-2 bg-muted" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Timely EPF Deposit</span>
                <span className="font-mono">{kpis.complianceStatus.timelyDepositPct}%</span>
              </div>
              <Progress value={kpis.complianceStatus.timelyDepositPct} className="h-2 bg-muted" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Supporting Documents</span>
                <span className="font-mono">{kpis.complianceStatus.supportingDocsPct}%</span>
              </div>
              <Progress value={kpis.complianceStatus.supportingDocsPct} className="h-2 bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Requires Attention */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Requires Attention
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#0d9488] h-7"
                onClick={() => onNavigateTab('exceptions')}
              >
                View All Exceptions <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {kpis.requiresAttention.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                All payroll and statutory records are currently compliant.
              </div>
            ) : (
              kpis.requiresAttention.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateTab(item.linkTab)}
                  className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-600 shrink-0">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium group-hover:text-[#0d9488] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Click to inspect and resolve</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.severity === 'Critical'
                        ? 'border-red-300 text-red-700 bg-red-50/50'
                        : item.severity === 'High'
                        ? 'border-amber-300 text-amber-700 bg-amber-50/50'
                        : 'border-slate-300 text-slate-700'
                    }
                  >
                    {item.severity}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ====== Sections 32 & 33: Monthly History & Timeliness Trend ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Compliance History */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0d9488]" />
              Historical Monthly Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              {kpis.monthlyHistory.map((m) => (
                <div key={m.month} className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                  <span className="text-muted-foreground text-[11px] block">{m.month}</span>
                  <span className="text-base font-bold text-[#0d9488] block">{m.compliancePct}%</span>
                  <span className="text-[10px] text-muted-foreground block font-mono">Compliant</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeliness Trend */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0d9488]" />
              EPF Deposit Timeliness Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            {kpis.monthlyHistory.map((m) => (
              <div key={m.month} className="flex items-center justify-between p-1.5 border-b last:border-none">
                <span className="font-medium text-muted-foreground w-20">{m.month}</span>
                <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end font-mono text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{m.timelyPct}% Timely</span>
                  <span className="text-amber-600 font-semibold">{m.latePct}% Late</span>
                  <span className="text-red-500 font-semibold">{m.pendingPct}% Pending</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
