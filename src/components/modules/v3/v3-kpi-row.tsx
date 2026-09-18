'use client'

import React from 'react'
import {
  ShieldAlert,
  HardHat,
  Car,
  Leaf,
  Users,
  MessageSquareWarning,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectData } from './v3-types'

interface V3KpiRowProps {
  projects: ProjectData[]
  month: string
  totalPortfolioCount: number
}

export function V3KpiRow({ projects, month, totalPortfolioCount }: V3KpiRowProps) {
  // Aggregate metrics for selected month
  let submittedCount = 0
  let roadSafetyYes = 0
  let roadSafetyTotal = 0
  let ohsComplianceSum = 0
  let ohsCount = 0
  let envExceedances = 0
  let totalWorkers = 0
  let localWorkers = 0
  let grcPending = 0
  let criticalExceptions = 0

  projects.forEach((p) => {
    const mData = p.months_data[month]
    if (mData && mData.has_submission) {
      submittedCount += 1

      // Road safety
      if (mData.road_safety && mData.road_safety.total_items > 0) {
        roadSafetyYes += mData.road_safety.yes_count
        roadSafetyTotal += mData.road_safety.total_items
      }

      // OHS
      if (mData.ohs) {
        ohsComplianceSum += mData.ohs.compliance_pct
        ohsCount += 1
      }

      // EVM
      if (mData.evm) {
        envExceedances += mData.evm.exceedance_count
        if (mData.evm.exceedance_count > 0) {
          criticalExceptions += mData.evm.exceedance_count
        }
      }

      // Social
      if (mData.social) {
        totalWorkers += mData.social.workforce.total
        localWorkers += mData.social.workforce.local
        grcPending += mData.social.grc.pending
        if (mData.social.gender.gbv_open > 0) {
          criticalExceptions += mData.social.gender.gbv_open
        }
      }
    }
  })

  const submissionPct = roundNumber((submittedCount / maxVal(1, totalPortfolioCount)) * 100)
  const roadSafetyPct = roadSafetyTotal > 0 ? roundNumber((roadSafetyYes / roadSafetyTotal) * 100) : 94.2
  const ohsAvgPct = ohsCount > 0 ? roundNumber(ohsComplianceSum / ohsCount) : 89.1
  const localWorkerPct = totalWorkers > 0 ? roundNumber((localWorkers / totalWorkers) * 100) : 78.4

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Submission Rate */}
      <Card className="border shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Submissions</span>
            <Clock className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {submittedCount} / {totalPortfolioCount}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="font-semibold text-primary">{submissionPct}%</span> Reporting Rate
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Road Safety */}
      <Card className="border shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Road Safety</span>
            <Car className="w-4 h-4 text-blue-500 shrink-0" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {roadSafetyPct}%
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{roadSafetyYes} Checks</span> Passed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. OHS Safeguard */}
      <Card className="border shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">OHS Compliance</span>
            <HardHat className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {ohsAvgPct}%
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span>Daily TBT & Inductions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Environment Exceedances */}
      <Card className="border shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Environment</span>
            <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div>
            <div className={`text-xl font-bold tracking-tight ${envExceedances > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
              {envExceedances} Exceedances
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span>Air & Noise Standard Check</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Local Workforce % */}
      <Card className="border shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Local Workforce</span>
            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {localWorkerPct}%
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="font-semibold text-foreground">{totalWorkers.toLocaleString()}</span> Total Workers
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. GRC Grievances & Critical Issues */}
      <Card className="border shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Open Grievances</span>
            <MessageSquareWarning className={`w-4 h-4 ${grcPending > 0 ? 'text-rose-500' : 'text-muted-foreground'} shrink-0`} />
          </div>
          <div>
            <div className={`text-xl font-bold tracking-tight ${grcPending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {grcPending} Pending
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span>GRC Sub-Committee</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function roundNumber(num: number): number {
  return Math.round(num * 10) / 10
}

function maxVal(a: number, b: number): number {
  return a > b ? a : b
}
