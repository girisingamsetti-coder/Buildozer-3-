'use client'

import React from 'react'
import {
  HardHat,
  Flame,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectData } from '../v3-types'

interface OhsTabProps {
  projects: ProjectData[]
  month: string
  onSelectProject: (p: ProjectData) => void
}

export function OhsTab({ projects, month, onSelectProject }: OhsTabProps) {
  let inductionYes = 0
  let tbtYes = 0
  let hiraYes = 0
  let fireSafetyYes = 0
  let waterYes = 0
  let committeeYes = 0
  let totalSubmitted = 0
  let totalAuditsCount = 0

  projects.forEach((p) => {
    const mData = p.months_data[month]
    if (mData?.has_submission && mData.ohs) {
      totalSubmitted++
      const o = mData.ohs
      if (o.daily_induction === 'Yes') inductionYes++
      if (o.tbt === 'Yes') tbtYes++
      if (o.method_statement === 'Yes') hiraYes++
      if (o.fire_safety === 'Yes') fireSafetyYes++
      if (o.drinking_water === 'Yes') waterYes++
      if (o.committee_meeting === 'Yes') committeeYes++
      totalAuditsCount += o.audits_conducted.length
    }
  })

  const calcRate = (num: number) => totalSubmitted > 0 ? Math.round((num / totalSubmitted) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* OHS Frequency Key Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Daily Inductions</span>
            <div className="text-xl font-bold text-foreground mt-1">{calcRate(inductionYes)}%</div>
            <span className="text-[10px] text-muted-foreground">{inductionYes} Projects Passed</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Tool Box Talks (TBT)</span>
            <div className="text-xl font-bold text-foreground mt-1">{calcRate(tbtYes)}%</div>
            <span className="text-[10px] text-muted-foreground">{tbtYes} Projects Conducted</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Approved HIRA / SOP</span>
            <div className="text-xl font-bold text-foreground mt-1">{calcRate(hiraYes)}%</div>
            <span className="text-[10px] text-muted-foreground">{hiraYes} Method Statements</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Fire Fighting Systems</span>
            <div className="text-xl font-bold text-foreground mt-1">{calcRate(fireSafetyYes)}%</div>
            <span className="text-[10px] text-muted-foreground">{fireSafetyYes} In-Place & In-Use</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Drinking Water</span>
            <div className="text-xl font-bold text-foreground mt-1">{calcRate(waterYes)}%</div>
            <span className="text-[10px] text-muted-foreground">{waterYes} Camps Verified</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">OHS Committee</span>
            <div className="text-xl font-bold text-foreground mt-1">{calcRate(committeeYes)}%</div>
            <span className="text-[10px] text-muted-foreground">{committeeYes} Meetings Held</span>
          </CardContent>
        </Card>
      </div>

      {/* Project-wise OHS Inspections & Audits Table */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <HardHat className="w-4 h-4 text-primary" />
              Occupational Health & Safety Status per Project ({month})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily toolbox talks, work method statements, safety inspections, and third-party audit compliance
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {totalAuditsCount} Third-Party Audits Conducted
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                <tr>
                  <th className="p-3 font-semibold text-foreground">Project Name / ID</th>
                  <th className="p-3 font-semibold text-foreground">Contractor</th>
                  <th className="p-3 font-semibold text-center text-foreground">Daily Induction</th>
                  <th className="p-3 font-semibold text-center text-foreground">TBT Talks</th>
                  <th className="p-3 font-semibold text-center text-foreground">HIRA Method Statement</th>
                  <th className="p-3 font-semibold text-center text-foreground">Fire Safety</th>
                  <th className="p-3 font-semibold text-center text-foreground">Drinking Water</th>
                  <th className="p-3 font-semibold text-center text-foreground">Audits Logged</th>
                  <th className="p-3 font-semibold text-center text-foreground">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((p) => {
                  const mData = p.months_data[month]
                  const ohs = mData?.ohs
                  const hasSub = mData?.has_submission

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectProject(p)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{p.id}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{p.contractor}</td>
                      <td className="p-3 text-center">
                        {renderFlag(hasSub ? ohs?.daily_induction : 'Missing')}
                      </td>
                      <td className="p-3 text-center">
                        {renderFlag(hasSub ? ohs?.tbt : 'Missing')}
                      </td>
                      <td className="p-3 text-center">
                        {renderFlag(hasSub ? ohs?.method_statement : 'Missing')}
                      </td>
                      <td className="p-3 text-center">
                        {renderFlag(hasSub ? ohs?.fire_safety : 'Missing')}
                      </td>
                      <td className="p-3 text-center">
                        {renderFlag(hasSub ? ohs?.drinking_water : 'Missing')}
                      </td>
                      <td className="p-3 text-center">
                        {ohs?.audits_conducted && ohs.audits_conducted.length > 0 ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                            {ohs.audits_conducted.length} Audits
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {hasSub ? (
                          <Badge
                            className={
                              (ohs?.compliance_pct ?? 0) >= 80
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            }
                          >
                            {ohs?.compliance_pct}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Missing
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function renderFlag(val: string | undefined) {
  if (val === 'Yes') {
    return <span className="text-emerald-600 font-bold">Yes</span>
  }
  if (val === 'No') {
    return <span className="text-rose-600 font-bold">No</span>
  }
  return <span className="text-muted-foreground text-[10px]">Missing</span>
}
