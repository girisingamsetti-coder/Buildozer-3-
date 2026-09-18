'use client'

import React from 'react'
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
  ArrowRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectData, AttentionItem } from '../v3-types'

interface OverviewTabProps {
  projects: ProjectData[]
  month: string
  attentionItems: AttentionItem[]
  defaulterProjects: Array<{ id: string; name: string; contractor: string; pmc: string }>
  onSelectProject: (p: ProjectData) => void
}

export function OverviewTab({
  projects,
  month,
  attentionItems,
  defaulterProjects,
  onSelectProject,
}: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Top Split: Cross-Domain Compliance Heatmap + Attention Required Exceptions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Portfolio Compliance Heatmap Matrix */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Portfolio E&S Compliance Heatmap ({projects.length} Active Projects)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluated against statutory thresholds for {month}. Click any project to drill down into auditable evidence.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Compliant</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> Needs Attention</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" /> Violation</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-700 inline-block" /> Missing</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-3 font-semibold text-foreground">Project Name / ID</th>
                    <th className="p-3 font-semibold text-foreground">Contractor</th>
                    <th className="p-3 font-semibold text-center text-foreground">Road Safety</th>
                    <th className="p-3 font-semibold text-center text-foreground">OHS</th>
                    <th className="p-3 font-semibold text-center text-foreground">Environment</th>
                    <th className="p-3 font-semibold text-center text-foreground">Social & Labor</th>
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

                    // Compliance states
                    const rsState = !hasSub ? 'missing' : (rs?.compliance_pct !== null && (rs?.compliance_pct ?? 0) >= 90) ? 'ok' : 'warn'
                    const ohsState = !hasSub ? 'missing' : ((ohs?.compliance_pct ?? 0) >= 80) ? 'ok' : 'warn'
                    const evmState = !hasSub ? 'missing' : (evm?.exceedance_count === 0) ? 'ok' : 'crit'
                    const socialState = !hasSub ? 'missing' : ((social?.grc?.pending ?? 0) === 0 && (social?.workforce?.local_pct ?? 0) >= 70) ? 'ok' : 'warn'

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
                          {renderStatusBadge(rsState, rs?.compliance_pct !== null ? `${rs?.compliance_pct}%` : 'NA')}
                        </td>
                        <td className="p-3 text-center">
                          {renderStatusBadge(ohsState, `${ohs?.compliance_pct ?? 0}%`)}
                        </td>
                        <td className="p-3 text-center">
                          {renderStatusBadge(evmState, evm?.exceedance_count ? `${evm.exceedance_count} Exc` : 'Clear')}
                        </td>
                        <td className="p-3 text-center">
                          {renderStatusBadge(socialState, `${social?.workforce?.local_pct ?? 0}% Loc`)}
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

        {/* Right 1 Col: Attention Required / Exception Feed */}
        <Card className="border shadow-xs flex flex-col">
          <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Attention Required ({attentionItems.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Prioritized compliance gaps and statutory alerts
              </p>
            </div>
            <Badge variant="destructive" className="text-[11px] px-2">
              Action Needed
            </Badge>
          </CardHeader>
          <CardContent className="p-3 flex-1 overflow-y-auto max-h-[460px] divide-y divide-border/60">
            {attentionItems.length > 0 ? (
              attentionItems.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">{item.projectName}</span>
                    <Badge
                      className={`text-[10px] px-1.5 py-0 shrink-0 ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.domain}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {item.issue}
                  </p>
                  <div className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5">
                    <span>Action:</span>
                    <span className="text-foreground">{item.action}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs my-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No critical compliance exceptions for this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Month-on-Month Trends & Awaiting Projects Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Reporting Rates by Month */}
        <Card className="border shadow-xs md:col-span-2">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Monthly Compliance Velocity (Feb 2026 – Sep 2026)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Form submission volume and portfolio reporting health over time
            </p>
          </CardHeader>
          <CardContent className="p-4">
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
                <div key={item.m} className={`p-2.5 border rounded-lg text-center ${item.m.includes(month.slice(5)) ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                  <div className="text-[11px] text-muted-foreground font-medium">{item.m}</div>
                  <div className="text-base font-bold text-foreground mt-1">{item.count}</div>
                  <div className="text-[10px] text-primary font-semibold">{item.rate}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 22 Awaiting Onboarding / Submissions */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Awaiting Initial Submissions ({defaulterProjects.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Packages awaiting initial E&S monthly submissions
            </p>
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

function renderStatusBadge(state: 'ok' | 'warn' | 'crit' | 'missing', label: string) {
  if (state === 'ok') {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
        {label}
      </Badge>
    )
  }
  if (state === 'warn') {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
        {label}
      </Badge>
    )
  }
  if (state === 'crit') {
    return (
      <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px]">
        {label}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-[10px] text-muted-foreground">
      Missing
    </Badge>
  )
}
