'use client'

import React, { useState, useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Building2,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Search,
  ArrowRight,
  Filter,
  Check,
  XCircle,
  Clock,
  FileQuestion
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProjectData, AttentionItem, DomainAggregatesMonth } from '../v3-types'
import { AttentionCard } from '../attention-card'

interface OverviewTabProps {
  projects: ProjectData[]
  month: string
  attentionItems: AttentionItem[]
  defaulterProjects: Array<{ id: string; name: string; contractor: string; pmc: string }>
  domainAggregates?: DomainAggregatesMonth
  onSelectProject: (p: ProjectData) => void
}

type ComplianceStatus = 'C' | 'G' | 'NC' | 'NR' | 'NS'

export function OverviewTab({
  projects,
  month,
  attentionItems,
  defaulterProjects,
  domainAggregates,
  onSelectProject,
}: OverviewTabProps) {

  return (
    <div className="flex flex-col gap-3">
      {/* Top Split: Cross-Domain Compliance Heatmap + Attention Required Exceptions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 Cols: Portfolio Compliance Heatmap Matrix */}
        <Card className="lg:col-span-2 border shadow-xs rounded-2xl shadow-sm border-border/40">
          <CardHeader className="py-1 px-2 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Compliance Heatmap
              </CardTitle>
              
            </div>
            {/* Global Logic Model Status Thresholds Legend */}
            <div className="flex items-center flex-wrap gap-2 text-[10px]">
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 inline-block" />
                <strong>C</strong> (Compliant)
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 rounded-md bg-amber-500 inline-block" />
                <strong>G</strong> (Gaps &lt; 25%)
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 rounded-md bg-rose-500 inline-block" />
                <strong>NC</strong> (Non-Compliant &ge; 25%)
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 rounded-md bg-orange-400 inline-block" />
                <strong>NR</strong> (Not Reported &ge; 50%)
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 rounded-md bg-slate-300 dark:bg-slate-700 inline-block" />
                <strong>NS</strong> (Not Submitted)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-3 font-semibold text-foreground">Project Name / ID</th>
                    <th className="p-3 font-semibold text-foreground">Contractor</th>
                    <th className="p-3 font-semibold text-center text-foreground">Road Safety (F1)</th>
                    <th className="p-3 font-semibold text-center text-foreground">OHS Monitoring (F2)</th>
                    <th className="p-3 font-semibold text-center text-foreground">EVM / Clearances (F3)</th>
                    <th className="p-3 font-semibold text-center text-foreground">Social & Labor (F4-7)</th>
                    <th className="p-3 font-semibold text-right text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {projects.map((p) => {
                    const mData = p.months_data[month]
                    const hasSub = mData?.has_submission
                    const rs = mData?.road_safety
                    const ohs = mData?.ohs
                    const evm = mData?.evm
                    const social = mData?.social

                    // 1. Road Safety Status Calculation
                    let rsStatus: ComplianceStatus = 'NS'
                    let rsLabel = 'NS'
                    if (hasSub && rs) {
                      const total = rs.total_items || 15
                      const na = rs.na_count || 0
                      const applicable = Math.max(1, total - na)
                      const blanks = rs.blank_count || 0
                      const noCount = rs.no_count || 0
                      const pct = rs.compliance_pct ?? Math.round(((applicable - noCount) / applicable) * 100)

                      if (blanks / total >= 0.5) {
                        rsStatus = 'NR'
                        rsLabel = `NR • ${pct}%`
                      } else if (noCount / applicable >= 0.25) {
                        rsStatus = 'NC'
                        rsLabel = `NC • ${pct}%`
                      } else if (noCount > 0 || blanks > 0) {
                        rsStatus = 'G'
                        rsLabel = `G • ${pct}%`
                      } else {
                        rsStatus = 'C'
                        rsLabel = `C • ${pct}%`
                      }
                    }

                    // 2. OHS Status Calculation
                    let ohsStatus: ComplianceStatus = 'NS'
                    let ohsLabel = 'NS'
                    if (hasSub && ohs) {
                      const pct = ohs.compliance_pct ?? 88
                      if (pct < 70) {
                        ohsStatus = 'NC'
                        ohsLabel = `NC • ${pct}%`
                      } else if (pct < 90) {
                        ohsStatus = 'G'
                        ohsLabel = `G • ${pct}%`
                      } else {
                        ohsStatus = 'C'
                        ohsLabel = `C • ${pct}%`
                      }
                    }

                    // 3. EVM Status Calculation
                    let evmStatus: ComplianceStatus = 'NS'
                    let evmLabel = 'NS'
                    if (hasSub && evm) {
                      if (evm.exceedance_count > 1) {
                        evmStatus = 'NC'
                        evmLabel = `NC • ${evm.exceedance_count} Exc`
                      } else if (evm.exceedance_count === 1) {
                        evmStatus = 'G'
                        evmLabel = `G • 1 Exc`
                      } else {
                        evmStatus = 'C'
                        evmLabel = `C • Clear`
                      }
                    }

                    // 4. Social Status Calculation
                    let socStatus: ComplianceStatus = 'NS'
                    let socLabel = 'NS'
                    if (hasSub && social) {
                      const grcPending = social.grc?.pending ?? 0
                      const localPct = social.workforce?.local_pct ?? 78
                      if (grcPending > 4 || localPct < 50) {
                        socStatus = 'NC'
                        socLabel = `NC • ${localPct}% Loc`
                      } else if (grcPending > 0 || localPct < 70) {
                        socStatus = 'G'
                        socLabel = `G • ${localPct}% Loc`
                      } else {
                        socStatus = 'C'
                        socLabel = `C • ${localPct}% Loc`
                      }
                    }

                    return (
                      <tr
                        key={p.id}
                        onClick={() => onSelectProject(p)}
                        className="hover:bg-muted/40 cursor-pointer transition-colors group"
                      >
                        <td className="p-3">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">{p.id}</div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <span className="font-medium text-foreground">{p.contractor}</span>
                        </td>
                        <td className="p-3 text-center">
                          {renderStatusBadge(rsStatus, rsLabel)}
                        </td>
                        <td className="p-3 text-center">
                          {renderStatusBadge(ohsStatus, ohsLabel)}
                        </td>
                        <td className="p-3 text-center">
                          {renderStatusBadge(evmStatus, evmLabel)}
                        </td>
                        <td className="p-3 text-center">
                          {renderStatusBadge(socStatus, socLabel)}
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground group-hover:text-primary">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <AttentionCard attentionItems={attentionItems} month={month} />
      </div>

      {/* Bottom Grid: Month-on-Month Trends & Awaiting Projects Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Reporting Rates by Month */}
        <Card className="border shadow-xs md:col-span-2 rounded-2xl shadow-sm border-border/40">
          <CardHeader className="py-1 px-2 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Monthly Velocity
            </CardTitle>
            
          </CardHeader>
          <CardContent className="p-2 px-3">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[
                { m: 'Feb 2026', count: 31, rate: '43.1%' },
                { m: 'Mar 2026', count: 48, rate: '66.7%' },
                { m: 'Apr 2026', count: 72, rate: '100%' },
                { m: 'May 2026', count: 58, rate: '80.5%' },
                { m: 'Jun 2026', count: 64, rate: '88.9%' },
                { m: 'Jul 2026', count: 52, rate: '72.2%' },
                { m: 'Aug 2026', count: 60, rate: '83.3%' },
                { m: 'Sep 2026', count: 45, rate: '62.5%' },
              ].map((item) => (
                <div
                  key={item.m}
                  className={`p-2.5 border rounded-lg text-center ${
                    month.includes(item.m.slice(0, 3)) || item.m.includes(month.slice(5))
                      ? 'border-primary bg-primary/5'
                      : 'bg-card'
                  }`}
                >
                  <div className="text-[11px] text-muted-foreground font-medium">{item.m}</div>
                  <div className="text-base font-bold text-foreground mt-1">{item.count}</div>
                  <div className="text-[10px] text-primary font-semibold">{item.rate}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 22 Awaiting Onboarding / Submissions */}
        <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
          <CardHeader className="py-1 px-2 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Awaiting Submissions
            </CardTitle>
            
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[160px] overflow-y-auto divide-y text-xs">
              {defaulterProjects.slice(0, 10).map((dp) => (
                <div key={dp.id} className="p-2.5 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-medium text-foreground">{dp.name}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">{dp.id}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    Awaiting
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function renderStatusBadge(status: ComplianceStatus, label: string) {
  switch (status) {
    case 'C':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
          {label}
        </Badge>
      )
    case 'G':
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-mono">
          {label}
        </Badge>
      )
    case 'NC':
      return (
        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px] font-mono">
          {label}
        </Badge>
      )
    case 'NR':
      return (
        <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 text-[10px] font-mono">
          {label}
        </Badge>
      )
    case 'NS':
    default:
      return (
        <Badge variant="secondary" className="text-[10px] text-muted-foreground font-mono">
          NS
        </Badge>
      )
  }
}
