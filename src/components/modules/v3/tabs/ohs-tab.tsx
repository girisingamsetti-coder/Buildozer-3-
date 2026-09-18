'use client'

import React from 'react'
import {
  HardHat,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  GraduationCap,
  Activity,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProjectData, DomainAggregatesMonth } from '../v3-types'

interface OhsTabProps {
  projects: ProjectData[]
  month: string
  domainAggregates?: DomainAggregatesMonth
  onSelectProject: (p: ProjectData) => void
}

export function OhsTab({ projects, month, domainAggregates, onSelectProject }: OhsTabProps) {
  const ohsAgg = domainAggregates?.ohs

  // Visual A: OHS Requirement Groups
  const groups = ohsAgg?.groups || {
    'Daily Monitoring': { yes: 82, no: 10, applicable: 92, pct: 89.1 },
    'Weekly Reporting': { yes: 78, no: 12, applicable: 90, pct: 86.7 },
    'Monthly Monitoring': { yes: 41, no: 5, applicable: 46, pct: 89.1 },
    'Trainings': { yes: 340, no: 32, applicable: 372, pct: 91.4 },
    'OHS Inspections': { yes: 165, no: 20, applicable: 185, pct: 89.2 },
    'OHS Audits': { yes: 148, no: 36, applicable: 184, pct: 80.4 },
    'HIRA & SOP': { yes: 42, no: 4, applicable: 46, pct: 91.3 },
    'OHS Policies': { yes: 245, no: 31, applicable: 276, pct: 88.8 }
  }

  // Visual B: 4 Specific Audits
  const audits = ohsAgg?.audits || {
    'Safety & Security Audit (Monthly)': { conducted: 38, no: 4, pending_ns: 4 },
    'Internal OHS Audit (Half-Yearly 3rd Party)': { conducted: 34, no: 6, pending_ns: 6 },
    'OHS (MSAS) Audit (Quarterly)': { conducted: 40, no: 2, pending_ns: 4 },
    'Electrical Safety Audit (Monthly)': { conducted: 36, no: 5, pending_ns: 5 }
  }

  // Visual C: 10 Training Types with Frequencies
  const trainings = ohsAgg?.trainings || {
    'Induction Training (Daily)': { freq: 'Daily', conducted: 46, attendance: 1250 },
    'Tool Box Talks (Daily)': { freq: 'Daily', conducted: 46, attendance: 2480 },
    'Fire Prevention & Fighting': { freq: 'Monthly', conducted: 42, attendance: 680 },
    'First Aid & Emergency Response': { freq: 'Monthly', conducted: 44, attendance: 710 },
    'Working at Height / Scaffolding': { freq: 'Monthly', conducted: 40, attendance: 520 },
    'Electrical Safety Training': { freq: 'Monthly', conducted: 38, attendance: 430 },
    'Lifting & Rigging Operations': { freq: 'Quarterly', conducted: 35, attendance: 380 },
    'Confined Space Entry': { freq: 'Quarterly', conducted: 32, attendance: 290 },
    'Defensive Driving / Traffic': { freq: 'Half-Yearly', conducted: 28, attendance: 340 },
    'STD / HIV / Pandemic Awareness': { freq: 'Yearly', conducted: 30, attendance: 450 }
  }

  // Visual D: Near Miss / Incident Reports
  const incidents = ohsAgg?.incidents || [
    { project: 'Zone - 9A', type: 'Near Miss', description: 'Rebar stack shift during crane slewing', status: 'CAPA Closed', rca: 'Rigging sling tension imbalance rectified' },
    { project: 'N9 Road', type: 'First Aid Treatment', description: 'Minor finger laceration handling formwork', status: 'CAPA Closed', rca: 'Cut-resistant gloves issued & mandatory TBT' },
    { project: 'Flood Works - KV', type: 'Near Miss', description: 'Excavator bucket touched overhead utility barricade', status: 'CAPA Open', rca: 'Banksman re-assigned, height barrier erected' }
  ]

  // Visual E: 6 OHS Policies & Plans Availability
  const policies = ohsAgg?.policies || {
    'OHS Policy Displayed': { yes: 44, no: 2 },
    'Approved OHS Plan Available': { yes: 42, no: 4 },
    'Emergency Response Plan (ERP)': { yes: 43, no: 3 },
    'Heat Stress Management Plan': { yes: 45, no: 1 },
    'Monsoon Preparedness Plan': { yes: 44, no: 2 },
    'Lifting Tools Third-Party Inspection': { yes: 41, no: 5 }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Top Split: Visual A (Compliance by OHS Group) + Visual E (Policies & Plans Availability) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Visual A: Horizontal Bar Chart: Compliance by OHS Requirement Group */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <HardHat className="w-4 h-4 text-primary" />
              Compliance by Statutory OHS Requirement Group
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Formula: (Total Yes / Total Applicable in Group) * 100 | Green (&ge;90%), Amber (70-89%), Red (&lt;70%)
            </p>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {Object.entries(groups).map(([gname, gdata]) => {
              const color =
                gdata.pct >= 90 ? 'bg-emerald-500' : gdata.pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              return (
                <div key={gname} className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{gname}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[11px] text-muted-foreground">
                        ({gdata.yes}/{gdata.applicable} passed)
                      </span>
                      <Badge
                        className={`text-[10px] font-bold ${
                          gdata.pct >= 90
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : gdata.pct >= 70
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {gdata.pct}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.max(5, gdata.pct))}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Visual E: Horizontal Bar Chart: OHS Policies & Plans Availability */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              OHS Policies & Plans Availability
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evaluation of 6 mandatory statutory plans across projects | Alert if No &gt; 3 (Red)
            </p>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {Object.entries(policies).map(([pname, pdata]) => {
              const total = pdata.yes + pdata.no || 46
              const yesPct = Math.round((pdata.yes / total) * 100)
              const isAlert = pdata.no > 3
              return (
                <div key={pname} className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{pname}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-600 font-bold">{pdata.yes} Yes</span>
                      <span className="text-muted-foreground">•</span>
                      <span className={pdata.no > 3 ? 'text-rose-600 font-bold' : 'text-amber-600 font-medium'}>
                        {pdata.no} No
                      </span>
                      <Badge
                        className={`text-[10px] ${
                          isAlert
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {yesPct}% Available
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${yesPct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Middle Split: Visual B (OHS Audits Table) + Visual C (Trainings per Frequency Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Visual B: Table: OHS Audits Conducted This Month */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                OHS Audits Conducted This Month
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                4 mandatory audits | "No" count turns Red if &gt; 4
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Statutory Periodic Audits
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 border-b">
                <tr>
                  <th className="p-3 font-semibold text-foreground">Audit Name</th>
                  <th className="p-3 font-semibold text-center text-foreground">Conducted (Yes)</th>
                  <th className="p-3 font-semibold text-center text-foreground">Reported "No"</th>
                  <th className="p-3 font-semibold text-center text-foreground">Pending / NS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(audits).map(([aname, adata], idx) => {
                  const isRedNo = adata.no > 4
                  return (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{aname}</td>
                      <td className="p-3 text-center font-bold text-emerald-600 font-mono">
                        {adata.conducted}
                      </td>
                      <td className="p-3 text-center font-mono">
                        <Badge
                          className={`text-[10px] ${
                            isRedNo
                              ? 'bg-rose-600 text-white font-bold'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {adata.no}
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-muted-foreground font-mono">
                        {adata.pending_ns}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Visual C: Table: Trainings Conducted (per frequency) */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Trainings Conducted (per Frequency)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                10 training types | Aggregated sessions and worker attendance
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              10 Training Modules
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[260px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-2.5 font-semibold text-foreground">Training Module</th>
                    <th className="p-2.5 font-semibold text-foreground">Frequency</th>
                    <th className="p-2.5 font-semibold text-center text-foreground">Projects Conducted</th>
                    <th className="p-2.5 font-semibold text-right text-foreground">Total Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Object.entries(trainings).map(([tname, tdata], idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-medium text-foreground">{tname}</td>
                      <td className="p-2.5">
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {tdata.freq}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center font-semibold text-emerald-600 font-mono">
                        {tdata.conducted}
                      </td>
                      <td className="p-2.5 text-right font-bold text-foreground font-mono">
                        {tdata.attendance.toLocaleString()} workers
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual D: Table: Near Miss / Incident Report */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Near Miss / Incident Report Log ({incidents.length} Incidents)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Incident classification, CAPA open/closed tracking, and root cause analysis
            </p>
          </div>
          <Badge variant="destructive" className="text-xs">
            Zero Harm Policy
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b">
              <tr>
                <th className="p-3 font-semibold text-foreground">Project</th>
                <th className="p-3 font-semibold text-foreground">Incident Type</th>
                <th className="p-3 font-semibold text-foreground">Description</th>
                <th className="p-3 font-semibold text-center text-foreground">CAPA Status</th>
                <th className="p-3 font-semibold text-foreground">Root Cause Analysis (RCA)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {incidents.map((inc, i) => {
                const isLti = inc.type.includes('LTI') || inc.type.includes('Accident')
                const isOpen = inc.status.includes('Open')
                return (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-foreground">{inc.project}</td>
                    <td className="p-3">
                      <Badge
                        className={`text-[10px] ${
                          isLti
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {inc.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground max-w-sm">{inc.description}</td>
                    <td className="p-3 text-center">
                      <Badge
                        className={`text-[10px] ${
                          isOpen
                            ? 'bg-amber-500 text-white font-semibold animate-pulse'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {inc.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-foreground italic text-[11px]">{inc.rca}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
