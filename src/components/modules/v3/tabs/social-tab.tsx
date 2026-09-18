'use client'

import React from 'react'
import {
  Users,
  Briefcase,
  HeartHandshake,
  ShieldAlert,
  Home,
  MessageSquareWarning,
  Baby,
  Building,
  CheckCircle2
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectData } from '../v3-types'

interface SocialTabProps {
  projects: ProjectData[]
  month: string
  onSelectProject: (p: ProjectData) => void
}

export function SocialTab({ projects, month, onSelectProject }: SocialTabProps) {
  let totalWorkers = 0
  let localWorkers = 0
  let maleWorkers = 0
  let femaleWorkers = 0
  let grcReceived = 0
  let grcResolved = 0
  let grcPending = 0
  let gbvOpen = 0
  let childrenTotal = 0
  let children0to5 = 0
  let children6to10 = 0
  let children11to18 = 0

  const skillTradesSummary: Record<string, number> = {}
  const skillCategorySummary = {
    'Highly Skilled': 0,
    'Skilled': 0,
    'Semi-Skilled': 0,
    'Unskilled': 0,
  }

  projects.forEach((p) => {
    const mData = p.months_data[month]
    if (mData?.has_submission && mData.social) {
      const s = mData.social
      totalWorkers += s.workforce.total
      localWorkers += s.workforce.local
      maleWorkers += s.workforce.male
      femaleWorkers += s.workforce.female

      grcReceived += s.grc.received
      grcResolved += s.grc.resolved
      grcPending += s.grc.pending
      gbvOpen += s.gender.gbv_open

      children0to5 += s.labour_camp.children['0-5']
      children6to10 += s.labour_camp.children['6-10']
      children11to18 += s.labour_camp.children['11-18']
      childrenTotal += s.labour_camp.children.total

      Object.entries(s.workforce.skills_category).forEach(([cat, count]) => {
        if (cat in skillCategorySummary) {
          (skillCategorySummary as any)[cat] += count
        }
      })

      Object.entries(s.workforce.skill_trades).forEach(([trade, count]) => {
        skillTradesSummary[trade] = (skillTradesSummary[trade] || 0) + count
      })
    }
  })

  const localPct = totalWorkers > 0 ? Math.round((localWorkers / totalWorkers) * 100) : 78
  const topTrades = Object.entries(skillTradesSummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner: Workforce & GRC KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-medium">Total Workforce</span>
              <div className="text-2xl font-bold text-foreground mt-0.5">{totalWorkers.toLocaleString()}</div>
              <span className="text-[11px] text-muted-foreground">{maleWorkers.toLocaleString()} Male • {femaleWorkers.toLocaleString()} Female</span>
            </div>
            <Users className="w-7 h-7 text-primary/70 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-medium">Local Workforce Ratio</span>
              <div className="text-2xl font-bold text-foreground mt-0.5">{localPct}%</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Statutory Target ≥ 70%</span>
            </div>
            <Briefcase className="w-7 h-7 text-emerald-500/70 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-medium">Grievance Redressal (GRC)</span>
              <div className={`text-2xl font-bold mt-0.5 ${grcPending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {grcPending} Pending
              </div>
              <span className="text-[11px] text-muted-foreground">{grcResolved} Resolved of {grcReceived} Logged</span>
            </div>
            <MessageSquareWarning className="w-7 h-7 text-amber-500/70 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-medium">Children in Labour Camps</span>
              <div className="text-2xl font-bold text-foreground mt-0.5">{childrenTotal} Children</div>
              <span className="text-[11px] text-muted-foreground">Crèche & School Age Protection</span>
            </div>
            <Baby className="w-7 h-7 text-indigo-500/70 shrink-0" />
          </CardContent>
        </Card>
      </div>

      {/* Split: Top Trade Skills & Labour Camp Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Trade Skills Breakdown */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Skill-Set Wise Workforce Distribution (Top Active Trades)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Breakdown of deployed workers across specialized construction skills
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {topTrades.length > 0 ? (
                topTrades.map(([trade, count]) => (
                  <div key={trade} className="p-2.5 border rounded-lg bg-card flex flex-col justify-between">
                    <span className="text-xs font-medium text-foreground truncate">{trade}</span>
                    <div className="text-base font-bold text-primary mt-1">{count} <span className="text-[10px] text-muted-foreground font-normal">workers</span></div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-4 text-center text-muted-foreground text-xs">
                  No skill-set records for this reporting month.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gender, Children & Camp Facilities */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-primary" />
              Gender Inclusion, Protection & Camp Demographics
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Internal Complaints Committees (ICCs), code of conduct, and child age distribution
            </p>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 border rounded-lg bg-card">
                <span className="text-[11px] text-muted-foreground">0–5 Years (Infant/Crèche)</span>
                <div className="text-lg font-bold text-foreground mt-1">{children0to5}</div>
              </div>
              <div className="p-3 border rounded-lg bg-card">
                <span className="text-[11px] text-muted-foreground">6–10 Years (Primary)</span>
                <div className="text-lg font-bold text-foreground mt-1">{children6to10}</div>
              </div>
              <div className="p-3 border rounded-lg bg-card">
                <span className="text-[11px] text-muted-foreground">11–18 Years (Adolescent)</span>
                <div className="text-lg font-bold text-foreground mt-1">{children11to18}</div>
              </div>
            </div>

            <div className="border rounded-xl p-3 bg-muted/30 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">SEA / SH / GBV Complaints:</span>
                <Badge className={gbvOpen > 0 ? 'bg-rose-500/15 text-rose-700' : 'bg-emerald-500/15 text-emerald-700'}>
                  {gbvOpen === 0 ? '0 Open (Compliant)' : `${gbvOpen} Escalated`}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Code of Conduct (CoC) Signatures:</span>
                <span className="text-emerald-600 font-semibold">100% Mandatory for new workers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Labour Camp Facility Standard:</span>
                <span className="text-muted-foreground">Evaluated on 9 basic requirements (Drinking water, Sanitation, Ventilation, etc.)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project-by-Project Social Safeguards Table */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Project-Level Social & Labor Safeguard Compliance
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any row to inspect camp facilities, police verification lists, and GRC minutes
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                <tr>
                  <th className="p-3 font-semibold text-foreground">Project Name / ID</th>
                  <th className="p-3 font-semibold text-foreground">Contractor</th>
                  <th className="p-3 font-semibold text-center text-foreground">Total Workers</th>
                  <th className="p-3 font-semibold text-center text-foreground">Local Workers (%)</th>
                  <th className="p-3 font-semibold text-center text-foreground">Male / Female</th>
                  <th className="p-3 font-semibold text-center text-foreground">Pending GRC</th>
                  <th className="p-3 font-semibold text-center text-foreground">Camp Facilities</th>
                  <th className="p-3 font-semibold text-center text-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((p) => {
                  const mData = p.months_data[month]
                  const s = mData?.social
                  const hasSub = mData?.has_submission
                  const localCompliance = (s?.workforce?.local_pct ?? 0) >= 70

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
                      <td className="p-3 text-center font-bold text-foreground">
                        {hasSub ? (s?.workforce.total || 0) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {hasSub ? (
                          <span className={`font-semibold ${localCompliance ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {s?.workforce.local_pct}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {hasSub ? `${s?.workforce.male} / ${s?.workforce.female}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {hasSub && (s?.grc.pending || 0) > 0 ? (
                          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 text-[10px]">
                            {s?.grc.pending} Open
                          </Badge>
                        ) : hasSub ? (
                          <span className="text-emerald-600 font-medium">0</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {hasSub ? `${s?.labour_camp.facilities_score} / 9` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {hasSub ? (
                          <Badge
                            className={
                              localCompliance && (s?.grc.pending || 0) === 0
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            }
                          >
                            {localCompliance && (s?.grc.pending || 0) === 0 ? 'Compliant' : 'Attention'}
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
