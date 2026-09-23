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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LabelList,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { AttentionCard } from '../attention-card';
import { ProjectData, DomainAggregatesMonth, AttentionItem } from '../v3-types'

interface OhsTabProps {
  projects: ProjectData[]
  month: string
  domainAggregates?: DomainAggregatesMonth
  onSelectProject: (p: ProjectData) => void
  attentionItems: AttentionItem[];
}

export function OhsTab({ projects, month, domainAggregates, onSelectProject,
  attentionItems,
}: OhsTabProps) {
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

  const incidentsReportedByMonth = [
    { month: 'Jan 26', incident: 0, firstAid: 2, nearMiss: 2, other: 0, total: 4 },
    { month: 'Feb 26', incident: 0, firstAid: 3, nearMiss: 9, other: 2, total: 14 },
    { month: 'Mar 26', incident: 1, firstAid: 7, nearMiss: 8, other: 3, total: 19 },
    { month: 'Apr 26', incident: 0, firstAid: 9, nearMiss: 20, other: 5, total: 34 },
    { month: 'May 26', incident: 0, firstAid: 9, nearMiss: 16, other: 1, total: 26 },
    { month: 'Jun 26', incident: 1, firstAid: 7, nearMiss: 17, other: 1, total: 26 },
    { month: 'Jul 26', incident: 0, firstAid: 5, nearMiss: 17, other: 1, total: 23 },
    { month: 'Aug 26', incident: 0, firstAid: 0, nearMiss: 1, other: 1, total: 2 },
    { month: 'Sep 26', incident: 0, firstAid: 0, nearMiss: 0, other: 0, total: 0 }
  ]

  const incidentTypesData = [
    { name: 'Incident / accident', value: 2, color: '#991b1b', pct: '1%' },
    { name: 'First-aid case', value: 42, color: '#d97706', pct: '28%' },
    { name: 'Near miss', value: 90, color: '#8b5cf6', pct: '61%' },
    { name: 'Other', value: 14, color: '#2563eb', pct: '9%' },
  ]

  const topIncidentProjects = [
    { name: 'Tower 1 and 2 - Structure', count: 7 },
    { name: "Bungalows for Hon'ble Ministers & Hon'ble Judges", count: 6 },
    { name: 'E6 Road', count: 6 },
    { name: 'E8 Road', count: 6 },
    { name: 'N8 Road', count: 6 },
    { name: 'Zone - 5D', count: 6 },
    { name: 'E4 Road', count: 5 },
    { name: "Hon'ble MLAs and MLCs and AIS Officers - Housing", count: 5 },
    { name: 'N12 Road', count: 5 },
    { name: 'Zone - 2A', count: 5 },
  ]

  const complianceTrendData = [
    { month: 'Jan 26', compliance: 71 },
    { month: 'Feb 26', compliance: 70 },
    { month: 'Mar 26', compliance: 73 },
    { month: 'Apr 26', compliance: 73 },
    { month: 'May 26', compliance: 74 },
    { month: 'Jun 26', compliance: 80 },
    { month: 'Jul 26', compliance: 79 },
    { month: 'Aug 26', compliance: 75 },
    { month: 'Sep 26', compliance: 74 }
  ]

  const lowestComplianceProjects = [
    { name: 'Zone - 9', pct: 26 },
    { name: 'N18 Road', pct: 35 },
    { name: 'Zone - 5C', pct: 35 },
    { name: 'E10 Road', pct: 50 },
    { name: 'E11 Road', pct: 50 },
    { name: 'E13 Road - Extn. upto NH-16', pct: 50 },
    { name: 'E15 Road - Extn. upto NH-16', pct: 50 },
    { name: 'Zone - 9A', pct: 50 },
    { name: 'E7 Road', pct: 55 },
    { name: 'N6 Utilities', pct: 55 }
  ]

  const trainingsConductedData = [
    { name: 'Job specific trainings-Monthly', count: 234 },
    { name: 'Personnel Protective Equipments-Monthly', count: 145 },
    { name: 'Others', count: 130 },
    { name: 'Health & Hygenic conditions-Monthly', count: 120 },
    { name: 'Defensive driving-Quarterly', count: 96 },
    { name: 'Workers well being and mental health - Monthly', count: 95 },
    { name: 'Behaviour Based Safety-Yearly', count: 69 },
    { name: 'Emergency response plan & Mock drill-Quarterly', count: 69 },
    { name: 'Heat stress-Half yearly', count: 68 },
    { name: 'Fire prevention & control-Quarterly', count: 63 },
    { name: 'Lifting operators & riggers-Quarterly', count: 61 },
    { name: 'Permit to work-Quarterly', count: 59 },
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

  // Computed High-Level Stat Metrics
  const totalAuditsConducted = Object.values(audits).reduce((acc, a) => acc + (a.conducted || 0), 0)
  const totalTrainingSessions = trainingsConductedData.reduce((acc, t) => acc + (t.count || 0), 0)
  const totalTrainingAttendance = Object.values(trainings).reduce((acc, t) => acc + (t.attendance || 0), 0)
  const nearMissCount = incidentTypesData.find(i => i.name.toLowerCase().includes('near'))?.value || 90
  const avgGroupCompliance = Math.round(
    Object.values(groups).reduce((acc, g) => acc + g.pct, 0) / Math.max(1, Object.keys(groups).length)
  )
  const policyYesCount = Object.values(policies).reduce((acc, p) => acc + p.yes, 0)
  const policyTotalCount = Object.values(policies).reduce((acc, p) => acc + (p.yes + p.no), 0)
  const policyPct = policyTotalCount > 0 ? Math.round((policyYesCount / policyTotalCount) * 100) : 94

  return (
    <div className="flex flex-col gap-3">
      {/* OHS Top KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 hover:border-primary/40 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">OHS Compliance</span>
              <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </div>
            <div className="text-lg font-black text-foreground mt-0.5">{avgGroupCompliance}%</div>
            <span className="text-[10px] text-muted-foreground">8 Statutory Groups</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 hover:border-primary/40 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Trainings</span>
              <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </div>
            <div className="text-lg font-black text-foreground mt-0.5">{totalTrainingSessions.toLocaleString()}</div>
            <span className="text-[10px] text-muted-foreground">{totalTrainingAttendance.toLocaleString()} Attendance</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 hover:border-primary/40 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Audits Conducted</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <div className="text-lg font-black text-foreground mt-0.5">{totalAuditsConducted}</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">4 Periodic Streams</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 hover:border-primary/40 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Policy Availability</span>
              <FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            </div>
            <div className="text-lg font-black text-foreground mt-0.5">{policyPct}%</div>
            <span className="text-[10px] text-muted-foreground">6 Mandatory Plans</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 hover:border-primary/40 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Fatalities / LTI</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            </div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">0 LTI</div>
            <span className="text-[10px] text-muted-foreground">Zero Harm Target</span>
          </CardContent>
        </Card>

        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 hover:border-primary/40 transition-colors">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Near Misses</span>
              <Activity className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            </div>
            <div className="text-lg font-black text-foreground mt-0.5">{nearMissCount}</div>
            <span className="text-[10px] text-muted-foreground">100% CAPA Logged</span>
          </CardContent>
        </Card>
      </div>

      
      {/* Combined Requested Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
{/* Visual E: Horizontal Bar Chart: OHS Policies & Plans Availability */}
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
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

{/* Card 1: Checklist compliance by month */}
          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Checklist compliance by month
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share of Yes among all checklist answers in each month's reports.
              </p>
            </CardHeader>
            <CardContent className="p-4 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTrendData} margin={{ top: 25, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip formatter={(val: any) => [`${val}%`, 'Compliance']} contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
                  <Area
                    type="monotone"
                    dataKey="compliance"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#complianceGradient)"
                    dot={{ stroke: '#16a34a', strokeWidth: 2, fill: '#ffffff', r: 4 }}
                    activeDot={{ stroke: '#16a34a', strokeWidth: 2, fill: '#ffffff', r: 6 }}
                  >
                    <LabelList
                      dataKey="compliance"
                      position="top"
                      offset={10}
                      fill="#334155"
                      fontSize={11}
                      fontWeight={600}
                      formatter={(v: any) => `${v}%`}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

{/* Projects reporting the most incidents */}
          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 flex flex-col">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Projects reporting the most incidents
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a project to focus on it.
              </p>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between gap-1.5">
              {topIncidentProjects.map((p, idx) => {
                const maxVal = 7;
                const pct = (p.count / maxVal) * 100;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      const matched = projects.find(proj =>
                        proj.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 10))
                      );
                      if (matched) onSelectProject(matched);
                    }}
                    className="flex items-center gap-2.5 text-xs py-1 px-1.5 rounded-md cursor-pointer hover:bg-muted/30 group transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] flex items-center justify-center font-medium shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </span>
                        <span className="font-bold text-foreground font-mono ml-2 shrink-0">
                          {p.count}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-[#0d5c50] rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

      </div>


      {/* Combined Requested Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
{/* Visual A: Horizontal Bar Chart: Compliance by OHS Requirement Group */}
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <HardHat className="w-4 h-4 text-primary" />
              Compliance by Statutory OHS Requirement Group
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Formula: (Total Yes / Total Applicable in Group) * 100 | Green (&ge;90%), Amber (70-89%), Red (&lt;70%)
            </p>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3 max-h-[280px] overflow-y-auto custom-scrollbar">
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

{/* Card 2: Projects with the lowest checklist compliance */}
          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 flex flex-col">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Projects with the lowest checklist compliance
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share of Yes in each project's latest answers. Select a project to see its gaps.
              </p>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between gap-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
              {lowestComplianceProjects.map((p, idx) => {
                const isRed = p.pct < 40;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      const matched = projects.find(proj =>
                        proj.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 8))
                      );
                      if (matched) onSelectProject(matched);
                    }}
                    className="flex items-center gap-2.5 text-xs py-1 px-1.5 rounded-md cursor-pointer hover:bg-muted/30 group transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] flex items-center justify-center font-medium shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </span>
                        <span className="font-bold text-foreground font-mono ml-2 shrink-0">
                          {p.pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          style={{ width: `${p.pct}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${isRed ? 'bg-[#dc2626]' : 'bg-[#d97706]'}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

{/* Card 3: Trainings conducted */}
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground">
              Trainings conducted
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Number of monthly reports that ticked each training.
            </p>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-2 max-h-[280px] overflow-y-auto custom-scrollbar">
            {trainingsConductedData.map((t, idx) => (
              <div key={idx} className="flex items-center gap-4 text-xs py-1 px-1.5 hover:bg-muted/30 rounded-md transition-colors">
                <span className="w-56 sm:w-72 md:w-80 font-medium text-foreground truncate shrink-0" title={t.name}>
                  {t.name}
                </span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    style={{ width: `${(t.count / 234) * 100}%` }}
                    className="h-full bg-[#0d5c50] rounded-full transition-all duration-300"
                  />
                </div>
                <span className="font-bold text-foreground font-mono w-9 text-right shrink-0">
                  {t.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

{/* Top Split: Visual A (Compliance by OHS Group) */}
      <div className="grid grid-cols-1 gap-3">
        
              </div>

      {/* Compliance Trend and Training Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3 px-1">
          <h3 className="font-bold text-foreground text-lg">Compliance trend and training</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
                  </div>

              </div>

      {/* Middle Split: Visual B (OHS Audits Table) + Visual C (Trainings per Frequency Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Visual B: Table: OHS Audits Conducted This Month */}
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
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
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
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

      {/* Incidents Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3 px-1">
          <h3 className="font-bold text-foreground text-lg">Incidents</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            The form records one incident type per report, so these count reports, not individual incidents.
          </p>
        </div>

        
        
      {/* Combined Requested Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
{/* Incidents reported by month Chart Card */}
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
          <CardHeader className="p-4 pb-2 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground">
              Incidents reported by month
            </CardTitle>
            <div className="flex flex-wrap items-center gap-5 mt-2 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b]" /> Incident / accident
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" /> First-aid case
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" /> Near miss
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" /> Other
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsReportedByMonth} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
                <Bar dataKey="incident" stackId="a" fill="#991b1b" maxBarSize={38} />
                <Bar dataKey="firstAid" stackId="a" fill="#d97706" maxBarSize={38} />
                <Bar dataKey="nearMiss" stackId="a" fill="#8b5cf6" maxBarSize={38} />
                <Bar dataKey="other" stackId="a" fill="#2563eb" maxBarSize={38} radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="total"
                    position="top"
                    offset={8}
                    fill="#334155"
                    fontSize={11}
                    fontWeight={700}
                    formatter={(v: any) => (v > 0 ? v : '')}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

{/* Incident types */}
          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 flex flex-col">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Incident types
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="w-52 h-52 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incidentTypesData}
                      innerRadius="72%"
                      outerRadius="98%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {incidentTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100">148</span>
                  <span className="text-xs text-muted-foreground mt-0.5">reports</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1 max-w-[240px]">
                {incidentTypesData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <span className="font-bold text-foreground font-mono">{item.value}</span>
                      <span className="text-muted-foreground w-8 font-mono">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

{/* Visual D: Table: Near Miss / Incident Report */}
        <Card className="border shadow-xs rounded-xl shadow-sm border-border/40">
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

{/* Middle Split: Incident types */}
        <div className="grid grid-cols-1 gap-3">
          
                  </div>

              </div>

</div>
  )
}
