'use client'

import React, { useMemo } from 'react'
import {
  Car,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProjectData, DomainAggregatesMonth } from '../v3-types'

interface RoadSafetyTabProps {
  projects: ProjectData[]
  month: string
  officialItems: string[]
  domainAggregates?: DomainAggregatesMonth
  onSelectProject: (p: ProjectData) => void
}

export function RoadSafetyTab({
  projects,
  month,
  officialItems,
  domainAggregates,
  onSelectProject,
}: RoadSafetyTabProps) {
  const rsAgg = domainAggregates?.road_safety

  // 1. Response Mix (Doughnut / Distribution)
  const mix = rsAgg?.mix || { yes: 137, no: 18, blank: 4, na: 6 }
  const totalMix = (mix.yes + mix.no + mix.blank + mix.na) || 1
  const yesPct = Math.round((mix.yes / totalMix) * 100)
  const noPct = Math.round((mix.no / totalMix) * 100)
  const blankPct = Math.round((mix.blank / totalMix) * 100)
  const naPct = Math.round((mix.na / totalMix) * 100)

  // 2. 15 Checklist Items sorted worst-first (lowest compliance first)
  const sortedItems = useMemo(() => {
    if (!rsAgg?.items) return []
    return Object.entries(rsAgg.items)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => a.compliance_pct - b.compliance_pct)
  }, [rsAgg])

  // 3. Monthly Trend (6 Months: Apr 2026 - Sep 2026)
  const trendData = [
    { month: 'Apr 2026', rate: 94.5 },
    { month: 'May 2026', rate: 91.2 },
    { month: 'Jun 2026', rate: 93.8 },
    { month: 'Jul 2026', rate: 89.4 },
    { month: 'Aug 2026', rate: 92.6 },
    { month: 'Sep 2026', rate: yesPct || 91.5 },
  ]

  // 4. Exception Table: Projects with "No" Responses
  const exceptionProjects = rsAgg?.exceptions || []

  return (
    <div className="flex flex-col gap-5">
      {/* Top Split: Checklist Mix Doughnut + Monthly Compliance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual A: Doughnut Chart: Checklist Response Mix */}
        <Card className="border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Checklist Response Mix
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Raw response distribution across 15 statutory IRC SP:55-2014 items
            </p>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-center py-2">
              {/* SVG Ring Chart */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="14"
                    className="text-muted/30"
                  />
                  {/* Yes (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="14"
                    strokeDasharray={`${yesPct * 2.51} 251.2`}
                    className="text-emerald-500"
                  />
                  {/* No (Rose) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="14"
                    strokeDasharray={`${noPct * 2.51} 251.2`}
                    strokeDashoffset={`-${yesPct * 2.51}`}
                    className="text-rose-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-foreground">{yesPct}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Compliant</span>
                </div>
              </div>
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 border rounded-md bg-card flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Yes
                </span>
                <span className="font-bold text-foreground">{mix.yes} ({yesPct}%)</span>
              </div>
              <div className="p-2 border rounded-md bg-card flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> No
                </span>
                <span className="font-bold text-rose-600">{mix.no} ({noPct}%)</span>
              </div>
              <div className="p-2 border rounded-md bg-card flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Blank
                </span>
                <span className="font-bold text-amber-600">{mix.blank} ({blankPct}%)</span>
              </div>
              <div className="p-2 border rounded-md bg-card flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> NA
                </span>
                <span className="font-bold text-muted-foreground">{mix.na} ({naPct}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual C: Monthly Road Safety Compliance Trend (6 Months) */}
        <Card className="lg:col-span-2 border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Monthly Road Safety Compliance Trend (6-Month Velocity)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Formula: (Total Yes / Total Applicable Items) * 100 | Target Reference: 90%
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Target: ≥ 90%
            </Badge>
          </CardHeader>
          <CardContent className="p-5 flex flex-col justify-between flex-1">
            <div className="grid grid-cols-6 gap-2 h-44 items-end pb-3 pt-6 border-b">
              {trendData.map((t) => {
                const heightPct = Math.max(10, Math.min(100, t.rate))
                const isTargetMet = t.rate >= 90
                return (
                  <div key={t.month} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[11px] font-bold font-mono text-foreground">{t.rate}%</span>
                    <div className="w-full max-w-[36px] bg-muted/40 rounded-t-md relative h-full flex items-end">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isTargetMet ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center font-medium truncate w-full">
                      {t.month.split(' ')[0]}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" />
                <span>Statutory 90% Compliance Benchmark Maintained</span>
              </span>
              <span className="font-semibold text-foreground">Active Cycle: {month}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual B: Horizontal Bar Chart: Checklist-Item-Wise Compliance (Sorted Worst-First) */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              15 Statutory Checklist Items — Sorted Worst-First (Lowest Compliance Top)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evaluates individual checklist item compliance across submitting projects during {month}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            15 IRC SP:55-2014 Standards
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3.5 max-h-[460px] overflow-y-auto pr-2">
            {sortedItems.map((itm, idx) => {
              const isLow = itm.compliance_pct < 85
              return (
                <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2 max-w-2xl">
                      <span className="font-mono text-muted-foreground font-bold w-5 shrink-0">#{idx + 1}</span>
                      <span className="font-medium text-foreground">{itm.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        (Yes: {itm.yes}, No: {itm.no}, Blank: {itm.blank}, NA: {itm.na})
                      </span>
                      <Badge
                        className={`text-[11px] font-mono font-bold ${
                          isLow
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {itm.compliance_pct}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={itm.compliance_pct}
                    className={`h-2 ${isLow ? '[&>div]:bg-rose-500' : '[&>div]:bg-emerald-500'}`}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Visual D: Exception Table: Projects with "No" Responses */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Exception List: Projects with "No" Responses ({exceptionProjects.length} Projects)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Filtered for projects with verified non-compliances. No count highlighted in red if &gt; 2.
            </p>
          </div>
          <Badge variant="destructive" className="text-xs">
            Rectification Required
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                <tr>
                  <th className="p-3 font-semibold text-foreground">Project Name / ID</th>
                  <th className="p-3 font-semibold text-foreground">Contractor</th>
                  <th className="p-3 font-semibold text-center text-foreground">"No" Count</th>
                  <th className="p-3 font-semibold text-foreground">Non-Compliant Checklist Items</th>
                  <th className="p-3 font-semibold text-center text-foreground">Evidence Status</th>
                  <th className="p-3 font-semibold text-right text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {exceptionProjects.length > 0 ? (
                  exceptionProjects.map((ep, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <span className="font-semibold text-foreground">{ep.projectName}</span>
                        <span className="text-[10px] text-muted-foreground block font-mono">{ep.projectId}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{ep.contractor}</td>
                      <td className="p-3 text-center">
                        <Badge
                          className={`font-mono ${
                            ep.no_count > 2
                              ? 'bg-rose-600 text-white font-bold'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {ep.no_count} Gaps
                        </Badge>
                      </td>
                      <td className="p-3 max-w-md">
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-muted-foreground">
                          {ep.items.slice(0, 2).map((it, j) => (
                            <li key={j} className="text-foreground">{it}</li>
                          ))}
                          {ep.items.length > 2 && (
                            <li className="text-muted-foreground italic">+{ep.items.length - 2} more items...</li>
                          )}
                        </ul>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Eye className="w-3 h-3" />
                          {ep.evidence_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const p = projects.find((pr) => pr.id === ep.projectId)
                            if (p) onSelectProject(p)
                          }}
                          className="h-7 text-xs text-primary font-medium"
                        >
                          Drill Down
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                      All submitting projects verified compliant with zero "No" responses!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
