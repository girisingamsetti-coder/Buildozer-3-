'use client'

import React, { useState } from 'react'
import {
  Users,
  Briefcase,
  HeartHandshake,
  ShieldAlert,
  Home,
  AlertTriangle,
  Building,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  GraduationCap,
  Scale,
  ShieldCheck,
  Eye,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AttentionCard } from '../attention-card';
import { ProjectData, DomainAggregatesMonth, AttentionItem, V3CompliancePayload } from '../v3-types'

interface SocialTabProps {
  projects: ProjectData[]
  month: string
  domainAggregates?: DomainAggregatesMonth
  metadata?: V3CompliancePayload['metadata']
  onSelectProject: (p: ProjectData) => void
  attentionItems: AttentionItem[];
}

export function SocialTab({
  projects,
  month,
  domainAggregates,
  metadata,
  onSelectProject,
  attentionItems,
}: SocialTabProps) {
  const [subTab, setSubTab] = useState<'safeguard' | 'skills' | 'labour' | 'gender'>('safeguard')

  const socAgg = domainAggregates?.social_safeguard
  const sklAgg = domainAggregates?.skill_training
  const labAgg = domainAggregates?.labour_law
  const genAgg = domainAggregates?.gender

  // 1. Social Safeguard (Form 4) Data
  const staff = socAgg?.staff || {
    'Environmental Manager': { filled: 42, vacant: 6 },
    'Social & Labour Manager': { filled: 40, vacant: 8 },
    'OHS Manager / Expert': { filled: 45, vacant: 3 },
    'Safety Officers / Marshals': { filled: 46, vacant: 2 },
    'Community Liaison Officer': { filled: 39, vacant: 9 },
  }

  const pmcVisitsTrend = metadata?.pmc_inspection_trend || [
    { month: 'Apr 2026', env: 65, social: 60, ohs: 74 },
    { month: 'May 2026', env: 58, social: 52, ohs: 68 },
    { month: 'Jun 2026', env: 62, social: 56, ohs: 70 },
    { month: 'Jul 2026', env: 60, social: 55, ohs: 69 },
    { month: 'Aug 2026', env: 63, social: 57, ohs: 71 },
    { month: 'Sep 2026', env: 64, social: 58, ohs: 72 },
  ]

  const obsTrend = metadata?.observation_trend || [
    { month: 'Apr 2026', raised: 28, closed: 22, cumulative_pending: 6 },
    { month: 'May 2026', raised: 32, closed: 30, cumulative_pending: 8 },
    { month: 'Jun 2026', raised: 30, closed: 28, cumulative_pending: 10 },
    { month: 'Jul 2026', raised: 26, closed: 25, cumulative_pending: 11 },
    { month: 'Aug 2026', raised: 35, closed: 33, cumulative_pending: 13 },
    { month: 'Sep 2026', raised: 34, closed: 36, cumulative_pending: 11 },
  ]

  const grcTrend = metadata?.grc_trend || [
    { month: 'Apr 2026', received: 12, resolved: 10, cumulative_pending: 2 },
    { month: 'May 2026', received: 15, resolved: 14, cumulative_pending: 3 },
    { month: 'Jun 2026', received: 18, resolved: 17, cumulative_pending: 4 },
    { month: 'Jul 2026', received: 14, resolved: 15, cumulative_pending: 3 },
    { month: 'Aug 2026', received: 16, resolved: 15, cumulative_pending: 4 },
    { month: 'Sep 2026', received: 14, resolved: 13, cumulative_pending: 5 },
  ]

  const influx = socAgg?.influx_camps || {
    camps_count: 18,
    migrant_workers: 8450,
    new_workers: 420,
    police_verified_pct: 92.5,
    medical_coverage_pct: 88.0,
    programs_conducted: 26,
  }

  // 2. Skill Training & Employment (Form 5) Data
  const skillKpis = sklAgg?.kpis || {
    total_workers: 18450,
    local_pct: 78.4,
    female_pct: 14.2,
    trained_pct: 84.5,
    trained_employed_pct: 79.2,
  }

  const localTypes = sklAgg?.local_types || {
    'Highly Skilled': 1280,
    'Skilled': 5420,
    'Semi-Skilled': 4360,
    'Unskilled': 3400,
  }
  const totalLocalWorkers = Object.values(localTypes).reduce((a, b) => a + b, 0) || 14460

  const workforceTrend = metadata?.workforce_trend || [
    { month: 'Apr 2026', total: 14800, local: 11500, female: 2100 },
    { month: 'May 2026', total: 15650, local: 12200, female: 2250 },
    { month: 'Jun 2026', total: 16920, local: 13200, female: 2400 },
    { month: 'Jul 2026', total: 17400, local: 13650, female: 2480 },
    { month: 'Aug 2026', total: 18100, local: 14200, female: 2560 },
    { month: 'Sep 2026', total: 18450, local: 14460, female: 2620 },
  ]

  const skillTrades = sklAgg?.skill_trades || {}
  const sortedSkillTrades = Object.entries(skillTrades).sort((a, b) => b[1] - a[1])
  const maxSkillTradeCount = sortedSkillTrades[0]?.[1] || 2500

  // 3. Labour Law Compliance (Form 6) Data
  const licenses = labAgg?.licenses || {
    'BOCW Registration (Building & Other Construction Workers)': { valid: 42, expiring: 4, expired: 0 },
    'CLRA Contract Labour License (Form XII)': { valid: 45, expiring: 2, expired: 0 },
    'ISMW Inter-State Migrant Workmen Act': { valid: 38, expiring: 3, expired: 1 },
    'EPF Provident Fund Establishment Code': { valid: 48, expiring: 0, expired: 0 },
    'ESIC / WC Employees Compensation Insurance': { valid: 46, expiring: 1, expired: 0 },
    'Motor Transport Workers Act (Vehicles)': { valid: 39, expiring: 2, expired: 0 },
    'Labour Camp Habitation Approval': { valid: 41, expiring: 3, expired: 0 },
  }

  const campFacilities = labAgg?.facilities || {
    'Hygienic Canteen / Dining Area': { yes_pct: 88, no: 4 },
    'Separate Rest Rooms & Shelters': { yes_pct: 92, no: 3 },
    'Crèches with Female Attendant': { yes_pct: 82, no: 6 },
    'Internal Complaints Committee (ICC)': { yes_pct: 95, no: 2 },
    'Clean Drinking Water Supply (RO/Treated)': { yes_pct: 98, no: 1 },
    'Sufficient Sanitary Latrines': { yes_pct: 90, no: 3 },
    'Adequate Washing & Bathing Cubicles': { yes_pct: 89, no: 4 },
    'Ventilated Living Quarters & Bedding': { yes_pct: 86, no: 5 },
    'First Aid Station & Dedicated Vehicle': { yes_pct: 94, no: 2 },
  }

  const sourceOfLabour = labAgg?.source_of_labour || {
    'Main Contractor Direct': 34,
    'Sub-Contractors (Form XII)': 52,
    'Independent Piece-Rate': 10,
    'Other Specialized Supply': 4,
  }

  const profileOrigin = labAgg?.profile_origin || {
    'Local (AP State)': 74,
    'Other States': 26,
    'Other Countries': 0,
  }

  const profileAge = labAgg?.profile_age || {
    '14-18 (Adolescent Risk)': 0,
    '18-25': 32,
    '25-50': 58,
    'Above 50': 10,
  }

  const statutoryRegisters = labAgg?.registers || {
    'Form XII (Sub-Contractor Register)': { yes: 45, missing: 3 },
    'Form A (Employee Master Register)': { yes: 44, missing: 4 },
    'Wages Register': { yes: 46, missing: 2 },
    'Attendance Register': { yes: 47, missing: 1 },
    'Overtime Register': { yes: 43, missing: 5 },
    'Loan & Advance Recovery Register': { yes: 42, missing: 6 },
    'Wage Slip Issuance Proof': { yes: 45, missing: 3 },
    'Workers Registration Acknowledgement': { yes: 46, missing: 2 },
  }

  // 4. Gender (Form 7) Data
  const genderFocal = genAgg?.focal_icc || {
    focal_deployed: 46,
    icc_constituted: 47,
    icc_meetings_held: 18,
    icc_members_trained: 142,
    coc_signed_pct: 98.5,
  }

  const seaShStatus = genAgg?.sea_sh_status || [
    { period: 'During Month', registered: 0, resolved: 0, pending: 0 },
    { period: 'Cumulative (Project Lifetime)', registered: 1, resolved: 1, pending: 0 },
  ]

  const genderFacilities = genAgg?.facilities || {
    'Separate Female Accommodation': { yes_pct: 94, no: 2 },
    'Female Toilets with Locks & Lighting': { yes_pct: 96, no: 1 },
    'Enclosed Bathing Cubicles': { yes_pct: 92, no: 3 },
    'Crèche Facility at Site / Camp': { yes_pct: 88, no: 4 },
    'Sanitary Napkin Vending / Dispensers': { yes_pct: 85, no: 5 },
    'Safe Sanitary Disposal / Incinerator': { yes_pct: 82, no: 6 },
    'Breastfeeding / Nursing Room': { yes_pct: 80, no: 7 },
    'Adequate Night Lighting in Camp Paths': { yes_pct: 98, no: 1 },
    '24/7 Security Guard at Female Camp': { yes_pct: 95, no: 2 },
    'CCTV Coverage at Entry & Common Areas': { yes_pct: 90, no: 3 },
    'Display of Women Helplines (112, 1098)': { yes_pct: 96, no: 1 },
    'Safe Transport Arrangements for Late Shift': { yes_pct: 92, no: 3 },
  }

  const childrenData = genAgg?.children || [
    { category: 'Boys (0–5 yrs)', newly_added: 3, remaining: 8, left: 1, total: 10 },
    { category: 'Girls (0–5 yrs)', newly_added: 4, remaining: 9, left: 2, total: 11 },
    { category: 'Boys (6–10 yrs)', newly_added: 2, remaining: 12, left: 1, total: 13 },
    { category: 'Girls (6–10 yrs)', newly_added: 3, remaining: 11, left: 0, total: 14 },
    { category: 'Boys (11–18 yrs)', newly_added: 1, remaining: 6, left: 1, total: 6 },
    { category: 'Girls (11–18 yrs)', newly_added: 2, remaining: 7, left: 1, total: 8 },
  ]

  const womenEmployed = genAgg?.women_employed || [
    { skill: 'Highly Skilled', local_ap: 28, migrant: 2 },
    { skill: 'Skilled', local_ap: 145, migrant: 24 },
    { skill: 'Semi-Skilled', local_ap: 320, migrant: 68 },
    { skill: 'Unskilled', local_ap: 680, migrant: 195 },
  ]

  const capacityBuilding = genAgg?.capacity_building || [
    { program: 'GBV / SEA / SH Prevention & Awareness', participants: 840 },
    { program: 'POSH Act 2013 Internal Committee Induction', participants: 210 },
    { program: 'Worker Code of Conduct (CoC) Sensitization', participants: 1250 },
    { program: 'Female Hygiene, Health & Nutrition Camp', participants: 620 },
    { program: 'Financial Literacy & Bank Account Opening', participants: 480 },
    { program: 'Safety in Construction for Female Workers', participants: 740 },
    { program: 'Adolescent Safety & Child Protection Drive', participants: 310 },
  ]

  const capacityBuildingDetailed = [
    {
      title: 'Training on Code of Conduct to all project workers',
      men: 8474,
      women: 364,
      total: 8838,
      displayTotal: '8,838',
    },
    {
      title: 'Sensitization Training on GBV SEA/SH for E&S Specialist, Engineers etc .,',
      men: 3200,
      women: 665,
      total: 3865,
      displayTotal: '3,865',
    },
    {
      title: 'Training to IC Committee members on POSH Act, SEA/SH',
      men: 1700,
      women: 444,
      total: 2144,
      displayTotal: '2,144',
    },
    {
      title: 'Gender Sensitization Training on GBV, SEA/SH for VOs, GCs',
      men: 850,
      women: 504,
      total: 1354,
      displayTotal: '1,354',
    },
    {
      title: 'Community Awareness program on GBV for SHGs, Stakeholders, PAPs, La...',
      men: 30,
      women: 135,
      total: 165,
      displayTotal: '165',
    },
  ]

  const womenEmployedDetailed = [
    { skill: 'Highly\nskilled', local: 10, migrant: 10, total: 20, displayTotal: '20' },
    { skill: 'Skilled', local: 400, migrant: 137, total: 537, displayTotal: '537' },
    { skill: 'Semi-skilled', local: 30, migrant: 151, total: 181, displayTotal: '181' },
    { skill: 'Unskilled', local: 770, migrant: 555, total: 1325, displayTotal: '1,325' },
  ]

  const childrenByAgeDetailed = [
    { age: '0–5 years', boys: 38, girls: 37, max: 38 },
    { age: '6–10 years', boys: 16, girls: 21, max: 21 },
    { age: '11–18 years', boys: 7, girls: 14, max: 14 },
  ]

  const cocSigningByMonth = [
    { month: 'Jan 26', newLabourers: 82, signed: 129, peak: '129' },
    { month: 'Feb 26', newLabourers: 934, signed: 1219, peak: '1,219' },
    { month: 'Mar 26', newLabourers: 1542, signed: 1418, peak: '1,542' },
    { month: 'Apr 26', newLabourers: 1165, signed: 2093, peak: '2,093' },
    { month: 'May 26', newLabourers: 1361, signed: 1342, peak: '1,361' },
    { month: 'Jun 26', newLabourers: 1379, signed: 1072, peak: '1,379' },
    { month: 'Jul 26', newLabourers: 2344, signed: 2344, peak: '2,344' },
    { month: 'Aug 26', newLabourers: 1983, signed: 1912, peak: '1,983' },
  ]

  const staffingCocData = [
    {
      title: 'Social & labour managers deployed',
      subtitle: '54 of required 59',
      pct: 92,
      color: '#15803d',
    },
    {
      title: 'New joiners who signed the CoC',
      subtitle: '11,538 of new staff & labourers 11,296',
      pct: 102,
      color: '#15803d',
    },
    {
      title: 'Projects with an ICC',
      subtitle: '53 of projects 56',
      pct: 95,
      color: '#15803d',
    },
    {
      title: 'Women among ICC members trained',
      subtitle: '122 of trained members 288',
      pct: 42,
      color: '#0d5c50',
    },
  ]

  const genderFacilitiesDetailed = [
    { name: 'Accommodation', yes: 49, total: 50, no: 1, pct: 98 },
    { name: 'Toilets', yes: 46, total: 50, no: 4, pct: 92 },
    { name: 'Bathroom', yes: 46, total: 50, no: 4, pct: 92 },
    { name: 'Kitchen', yes: 38, total: 46, no: 8, pct: 83 },
    { name: 'Breast feeding Room', yes: 17, total: 47, no: 30, pct: 36 },
    { name: 'Bed & Cot', yes: 34, total: 47, no: 13, pct: 72 },
    { name: 'Creche', yes: 39, total: 50, no: 11, pct: 78 },
    { name: 'LPG Gas', yes: 29, total: 51, no: 22, pct: 57 },
    { name: 'Safe Drinking Water', yes: 50, total: 51, no: 1, pct: 98 },
    { name: 'Sanitary Napkin', yes: 18, total: 49, no: 31, pct: 37 },
    { name: 'Privacy in Health Checkup clinic', yes: 45, total: 52, no: 7, pct: 87 },
    { name: 'Separate Nurse deployed', yes: 35, total: 55, no: 20, pct: 64 },
  ]

  const iecMaterialDetailed = [
    { name: 'GBV/SEA/SH at labor camp', yes: 52, total: 56, no: 4, pct: 93 },
    { name: 'COC at labor camp', yes: 48, total: 55, no: 7, pct: 87 },
    { name: 'ICC members list at labor camp', yes: 51, total: 55, no: 4, pct: 93 },
    { name: 'GBV providers list at labor camp', yes: 11, total: 19, no: 8, pct: 58 },
    { name: 'GBV/SEA/SH at office', yes: 50, total: 51, no: 1, pct: 98 },
    { name: 'COC at office', yes: 49, total: 51, no: 2, pct: 96 },
    { name: 'ICC members list at office', yes: 49, total: 51, no: 2, pct: 96 },
    { name: 'GBV providers list at office', yes: 10, total: 16, no: 6, pct: 63 },
    { name: 'GBV Service providers list at labor camp', yes: 50, total: 53, no: 3, pct: 94 },
    { name: 'GBV Service providers list at office', yes: 47, total: 49, no: 2, pct: 96 },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-Tabs Selector Header for the 4 Social Domain Forms */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card border rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 text-[11px] font-semibold">
              Social Domain Portfolio Forms (4 Forms)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Cycle: {month}</span>
          </div>
          <h2 className="text-base font-bold text-foreground mt-0.5">
            Social Safeguards, Workforce Skills, Labour Law & Gender Governance
          </h2>
        </div>

        <Tabs value={subTab} onValueChange={(v: any) => setSubTab(v)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 h-9 p-1 bg-muted/60 border text-xs">
            <TabsTrigger value="safeguard" className="text-[11px] font-semibold px-2.5">
              Social MPR (Form 4)
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-[11px] font-semibold px-2.5">
              Skill & Training (Form 5)
            </TabsTrigger>
            <TabsTrigger value="labour" className="text-[11px] font-semibold px-2.5">
              Labour Law (Form 6)
            </TabsTrigger>
            <TabsTrigger value="gender" className="text-[11px] font-semibold px-2.5">
              Gender & SEA (Form 7)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* 1. FORM 4: SOCIAL SAFEGUARD FORM (MPR) */}
      {/* ========================================================================= */}
      {subTab === 'safeguard' && (
        <div className="flex flex-col gap-3">
          {/* Visual E: Key-Value (KV) Card: Labour Influx & Camps */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Active Camps</span>
                <div className="text-xl font-black text-foreground mt-0.5">{influx.camps_count}</div>
                <span className="text-[10px] text-muted-foreground">Regulated & Habited</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Migrant Workers</span>
                <div className="text-xl font-black text-foreground mt-0.5">{influx.migrant_workers.toLocaleString()}</div>
                <span className="text-[10px] text-muted-foreground">Inter-state pool</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">New Workers</span>
                <div className="text-xl font-black text-primary mt-0.5">{influx.new_workers.toLocaleString()}</div>
                <span className="text-[10px] text-muted-foreground">Inducted this month</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Police Verification</span>
                <div className="text-xl font-black text-emerald-600 mt-0.5">{influx.police_verified_pct}%</div>
                <span className="text-[10px] text-emerald-600/80 font-medium">Clearance Verified</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Medical Covered</span>
                <div className="text-xl font-black text-emerald-600 mt-0.5">{influx.medical_coverage_pct}%</div>
                <span className="text-[10px] text-muted-foreground">Health checkup done</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Programs Held</span>
                <div className="text-xl font-black text-foreground mt-0.5">{influx.programs_conducted}</div>
                <span className="text-[10px] text-muted-foreground">Community & health</span>
              </CardContent>
            </Card>
          </div>

          {/* Top Row: Visual A (E&S Staff Deployment H-Bar) + Visual C (Observations Stacked Bar + Line) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Visual A: Horizontal Bar Chart: Deployment of E&S Staff */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Deployment of Statutory E&S Staff
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    5 statutory positions. Threshold rule: Amber alert if Vacant &gt; 6, Green otherwise.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  5 Roles Monitored
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3.5">
                {Object.entries(staff).map(([role, val], idx) => {
                  const total = val.filled + val.vacant || 48
                  const filledPct = Math.round((val.filled / total) * 100)
                  const isAmber = val.vacant > 6
                  return (
                    <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{role}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono">
                            {val.filled} Filled • <strong className={isAmber ? 'text-amber-600' : 'text-foreground'}>{val.vacant} Vacant</strong>
                          </span>
                          <Badge
                            className={`text-[10px] font-mono ${
                              isAmber
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {isAmber ? 'Attention (Vacant > 6)' : 'Compliant'}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden flex">
                        <div style={{ width: `${filledPct}%` }} className="bg-emerald-500 h-full" />
                        <div style={{ width: `${100 - filledPct}%` }} className={isAmber ? 'bg-amber-500' : 'bg-muted-foreground/30'} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Visual C: Stacked Bar + Line Chart: Observations (Raised vs Closed vs Pending) */}
            <Card className="border shadow-xs flex flex-col justify-between rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Site Observations: Raised, Closed & Cumulative Pending
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stacked Bars = Raised (Amber) + Closed (Green) | Metric = Cumulative Pending (Threshold: &gt;12 triggers Attention)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Pending: {obsTrend[obsTrend.length - 1]?.cumulative_pending}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col justify-between flex-1">
                <div className="grid grid-cols-6 gap-3 h-44 items-end pb-3 border-b">
                  {obsTrend.map((o) => {
                    const totalBar = o.raised + o.closed || 1
                    const raisedPct = Math.round((o.raised / totalBar) * 100)
                    const closedPct = Math.round((o.closed / totalBar) * 100)
                    const isPendingHigh = o.cumulative_pending > 12

                    return (
                      <div key={o.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className={`text-[10px] font-bold font-mono ${isPendingHigh ? 'text-rose-600' : 'text-primary'}`}>
                          P:{o.cumulative_pending}
                        </span>
                        <div className="w-full max-w-[34px] bg-muted/30 rounded-t-md relative h-32 flex flex-col justify-end overflow-hidden">
                          {/* Raised (Amber) */}
                          <div style={{ height: `${raisedPct * 0.7}%` }} className="w-full bg-amber-500" />
                          {/* Closed (Green) */}
                          <div style={{ height: `${closedPct * 0.7}%` }} className="w-full bg-emerald-500" />
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center font-medium">
                          {o.month.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Raised (Amber)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Closed (Green)
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-foreground">
                    Rule 5: Attention triggered if Cumulative Pending &gt; 12
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Visual B (Monthly Site Inspections by PMC) + Visual D (GRC Grievance Redressal Grouped Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Visual B: Grouped Bar Chart: Monthly Site Inspections by PMC */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    Monthly Site Inspections by PMC Managers (6 Months)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Visits conducted by PMC Environmental, Social & OHS Managers across all packages
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  6-Month Velocity
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col justify-between">
                <div className="grid grid-cols-6 gap-3 h-44 items-end pb-3 border-b">
                  {pmcVisitsTrend.map((p) => (
                    <div key={p.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="flex items-end gap-1 h-32 w-full justify-center">
                        {/* Env */}
                        <div
                          style={{ height: `${(p.env / 80) * 100}%` }}
                          className="w-2 bg-emerald-500 rounded-t-xs"
                          title={`Env: ${p.env}`}
                        />
                        {/* Social */}
                        <div
                          style={{ height: `${(p.social / 80) * 100}%` }}
                          className="w-2 bg-indigo-500 rounded-t-xs"
                          title={`Social: ${p.social}`}
                        />
                        {/* OHS */}
                        <div
                          style={{ height: `${(p.ohs / 80) * 100}%` }}
                          className="w-2 bg-amber-500 rounded-t-xs"
                          title={`OHS: ${p.ohs}`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center font-medium">
                        {p.month.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Env Visits</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Social Visits</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> OHS Visits</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">Active Month: 194 Total Visits</span>
                </div>
              </CardContent>
            </Card>

            {/* Visual D: Grouped Bar Chart: Grievance Redressal Committee (GRC) */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-indigo-500" />
                    Grievance Redressal Committee (GRC Complaints)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Received vs Resolved over 6 months. Cumulative Pending KPI (Rule 6: Pending &gt; 4 triggers Attention flag).
                  </p>
                </div>
                <Badge
                  className={`text-xs font-mono ${
                    grcTrend[grcTrend.length - 1]?.cumulative_pending > 4
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  Pending: {grcTrend[grcTrend.length - 1]?.cumulative_pending}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col justify-between">
                <div className="grid grid-cols-6 gap-3 h-44 items-end pb-3 border-b">
                  {grcTrend.map((g) => {
                    const isHigh = g.cumulative_pending > 4
                    return (
                      <div key={g.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className={`text-[10px] font-bold font-mono ${isHigh ? 'text-rose-600' : 'text-foreground'}`}>
                          P:{g.cumulative_pending}
                        </span>
                        <div className="flex items-end gap-1.5 h-32 w-full justify-center">
                          {/* Received */}
                          <div
                            style={{ height: `${(g.received / 25) * 100}%` }}
                            className="w-3 bg-amber-500 rounded-t-xs"
                            title={`Received: ${g.received}`}
                          />
                          {/* Resolved */}
                          <div
                            style={{ height: `${(g.resolved / 25) * 100}%` }}
                            className="w-3 bg-emerald-500 rounded-t-xs"
                            title={`Resolved: ${g.resolved}`}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center font-medium">
                          {g.month.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Received</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved</span>
                  </div>
                  <span className="text-[11px] font-medium text-foreground">
                    Resolution Rate: 92.8% Maintained
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORM 5: SKILL TRAINING & EMPLOYMENT FORM */}
      {/* ========================================================================= */}
      {subTab === 'skills' && (
        <div className="flex flex-col gap-3">
          {/* Visual A: KPI Strip: Workforce Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Total Workforce</span>
                <div className="text-2xl font-black text-foreground mt-0.5">{skillKpis.total_workers.toLocaleString()}</div>
                <span className="text-[10px] text-muted-foreground">Active on site</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Local Workforce %</span>
                <div className="text-2xl font-black text-primary mt-0.5">{skillKpis.local_pct}%</div>
                <span className="text-[10px] text-muted-foreground">Formula: (Local / Total) * 100</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Female Workforce %</span>
                <div className="text-2xl font-black text-indigo-600 mt-0.5">{skillKpis.female_pct}%</div>
                <span className="text-[10px] text-muted-foreground">Formula: (Female / Total) * 100</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Trained %</span>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">{skillKpis.trained_pct}%</div>
                <span className="text-[10px] text-muted-foreground">Formula: (Trained / Local) * 100</span>
              </CardContent>
            </Card>

            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardContent className="p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Trained & Employed %</span>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">{skillKpis.trained_employed_pct}%</div>
                <span className="text-[10px] text-muted-foreground">Formula: (Employed / Trained) * 100</span>
              </CardContent>
            </Card>
          </div>

          {/* Top Row: Visual B (Type of Local Workers Employed) + Visual C (Total Workforce 6-Month Trend) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Visual B: Horizontal Bar Chart: Type of Local Workers Employed */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Type of Local Workers Employed (Skill Levels)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Categorizes local workers into 4 statutory skill levels across active packages
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {totalLocalWorkers.toLocaleString()} Total Local
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3.5">
                {Object.entries(localTypes).map(([category, count], idx) => {
                  const pct = Math.round((count / totalLocalWorkers) * 100)
                  return (
                    <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground">{count.toLocaleString()} workers</span>
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-mono">
                            {pct}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Visual C: Line Chart: Total Workforce Trend (6 Months) */}
            <Card className="border shadow-xs flex flex-col justify-between rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Total Workforce Headcount Trend (6-Month Labour Influx)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Monitors labour mobilization trajectory and project ramp-up across Amaravati
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Peak: 18,450
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col justify-between flex-1">
                <div className="grid grid-cols-6 gap-3 h-44 items-end pb-3 border-b">
                  {workforceTrend.map((w) => {
                    const heightPct = Math.round((w.total / 20000) * 100)
                    return (
                      <div key={w.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-bold font-mono text-foreground">
                          {(w.total / 1000).toFixed(1)}k
                        </span>
                        <div className="w-full max-w-[34px] bg-muted/40 rounded-t-md relative h-32 flex items-end">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-indigo-500 rounded-t-md transition-all"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center font-medium">
                          {w.month.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Steady workforce ramp-up (+24.6% since April)
                  </span>
                  <span className="font-bold text-foreground">Current: 18,450 Workers</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual D: Horizontal Bar Chart: Skill-Set-Wise Local Workers Employed (All 26 Skill Sets) */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
            <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  All 26 Official Statutory Skill Sets — Local Workers Employed
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Evaluates workforce breakdown across all 26 trade skill sets (Male + Female summed, sorted highest first)
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                26 Official Trades
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 max-h-[480px] overflow-y-auto pr-2">
                {sortedSkillTrades.map(([trade, count], idx) => {
                  const pct = Math.round((count / maxSkillTradeCount) * 100)
                  return (
                    <div key={idx} className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 max-w-[240px]">
                          <span className="font-mono text-muted-foreground font-bold w-5 shrink-0">#{idx + 1}</span>
                          <span className="font-medium text-foreground truncate">{trade}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-foreground">{count.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground">workers</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="bg-primary h-full rounded-full" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FORM 6: LABOUR LAW COMPLIANCE FORM */}
      {/* ========================================================================= */}
      {subTab === 'labour' && (
        <div className="flex flex-col gap-3">
          {/* Visual A: Table: Establishment Registration & Licenses (7 Acts) */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
            <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Establishment Registration & Statutory Licenses (7 Enactments)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tracks statutory validity across BOCW, CLRA, ISMW, EPF, ESI, WC, MTW. Critical Alert: Expired &gt; 0 triggers "Non-Compliant" flag.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                7 Statutory Enactments
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/60 border-b">
                    <tr>
                      <th className="p-3 font-semibold text-foreground">Act / Statutory Registration</th>
                      <th className="p-3 font-semibold text-center text-foreground">Valid Licenses</th>
                      <th className="p-3 font-semibold text-center text-foreground">Expiring (&le; 2 Months)</th>
                      <th className="p-3 font-semibold text-center text-foreground">Expired (Non-Compliant)</th>
                      <th className="p-3 font-semibold text-center text-foreground">Status Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(licenses).map(([act, val], idx) => {
                      const isExpired = val.expired > 0
                      const isExpiring = val.expiring > 0
                      return (
                        <tr key={idx} className={`hover:bg-muted/30 ${isExpired ? 'bg-rose-500/5' : ''}`}>
                          <td className="p-3 font-medium text-foreground">
                            {act}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-600">
                            {val.valid}
                          </td>
                          <td className="p-3 text-center font-mono font-medium text-amber-600">
                            {val.expiring}
                          </td>
                          <td className={`p-3 text-center font-mono font-bold ${isExpired ? 'text-rose-600 bg-rose-500/10' : 'text-muted-foreground'}`}>
                            {val.expired}
                          </td>
                          <td className="p-3 text-center">
                            {isExpired ? (
                              <Badge variant="destructive" className="text-[10px]">
                                Non-Compliant (Rule 9)
                              </Badge>
                            ) : isExpiring ? (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                                Renewal Due
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                                Compliant
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

          {/* Middle Row: Visual B (Basic Camp Facilities H-Bar) + Visual C (Source of Labour Doughnut) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Visual B: Horizontal Bar Chart: Basic Facilities at Labour Camp */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    Basic Statutory Facilities at Labour Camps (9 Facilities)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Color Logic: Red if No &gt; 3, Amber if No &gt; 0, Green otherwise
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  9 Statutory Amenities
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3">
                {Object.entries(campFacilities).map(([facility, data], idx) => {
                  const isRed = data.no > 3
                  const isAmber = data.no > 0 && !isRed
                  return (
                    <div key={idx} className="flex flex-col gap-1 p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{facility}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">({data.no} Deficient)</span>
                          <Badge
                            className={`text-[10px] font-mono ${
                              isRed
                                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                : isAmber
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {data.yes_pct}% Yes
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden flex">
                        <div
                          style={{ width: `${data.yes_pct}%` }}
                          className={`h-full ${isRed ? 'bg-rose-500' : isAmber ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Visual C: Doughnut / Distribution: Source of Labour */}
            <Card className="border shadow-xs flex flex-col justify-between rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Workforce Engagement by Source
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Contractor vs Sub-Contractor vs Independent workforce distribution
                </p>
              </CardHeader>
              <CardContent className="p-4 flex flex-col justify-between flex-1 gap-4">
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="14" className="text-muted/30" />
                      {/* Main Contractor: 34% (Indigo) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="14"
                        strokeDasharray={`${34 * 2.51} 251.2`}
                        className="text-indigo-500"
                      />
                      {/* Sub-contractor: 52% (Emerald) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="14"
                        strokeDasharray={`${52 * 2.51} 251.2`}
                        strokeDashoffset={`-${34 * 2.51}`}
                        className="text-emerald-500"
                      />
                      {/* Independent: 10% (Amber) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="14"
                        strokeDasharray={`${10 * 2.51} 251.2`}
                        strokeDashoffset={`-${86 * 2.51}`}
                        className="text-amber-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black text-foreground">52%</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Sub-Contract</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(sourceOfLabour).map(([src, pct], idx) => (
                    <div key={idx} className="p-2 border rounded-md bg-card flex items-center justify-between">
                      <span className="text-muted-foreground truncate">{src}</span>
                      <span className="font-bold text-foreground font-mono">{pct}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Visual D (Labour Profile Origin & Age) + Visual E (Registers Submitted) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Visual D: Horizontal Bar Chart: Labour Profile — Origin & Age */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Labour Profile: Origin & Age Demographics
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Critical Alert Logic: If 14-18 &gt; 0, bar turns Red and triggers "Attention" flag (Child Labour Prohibition)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Demographic Breakdown
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                {/* 1. Origin Stacked Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Workforce Origin Distribution</span>
                    <span className="text-muted-foreground font-mono text-[11px]">Local: 74% • Other States: 26%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden flex">
                    <div style={{ width: '74%' }} className="bg-primary h-full" title="Local AP: 74%" />
                    <div style={{ width: '26%' }} className="bg-indigo-500 h-full" title="Other States: 26%" />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Andhra Pradesh (74%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Other Indian States (26%)</span>
                  </div>
                </div>

                {/* 2. Age Bands Stacked Bar */}
                <div className="flex flex-col gap-1.5 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Workforce Age Brackets</span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">14-18 Band: 0 (No Child Labour)</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden flex">
                    {/* 14-18 (Red if > 0) */}
                    {profileAge['14-18 (Adolescent Risk)'] > 0 && (
                      <div
                        style={{ width: `${profileAge['14-18 (Adolescent Risk)']}%` }}
                        className="bg-rose-600 h-full"
                      />
                    )}
                    {/* 18-25 (Emerald) */}
                    <div style={{ width: `${profileAge['18-25']}%` }} className="bg-emerald-500 h-full" />
                    {/* 25-50 (Indigo) */}
                    <div style={{ width: `${profileAge['25-50']}%` }} className="bg-indigo-500 h-full" />
                    {/* Above 50 (Amber) */}
                    <div style={{ width: `${profileAge['Above 50']}%` }} className="bg-amber-500 h-full" />
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-muted-foreground pt-0.5">
                    <span className="font-bold text-emerald-600">14-18: 0%</span>
                    <span>18-25: 32%</span>
                    <span>25-50: 58%</span>
                    <span>&gt;50: 10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual E: Horizontal Bar Chart: Registers & Records Submitted (8 Statutory Registers) */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    Statutory Labour Registers Submitted (8 Registers)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Form XII, Form A, Wages, Attendance, Overtime, Loan, Wage Slips, Worker Registrations
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  8 Registers
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-2.5">
                {Object.entries(statutoryRegisters).map(([reg, val], idx) => {
                  const total = val.yes + val.missing || 48
                  const pct = Math.round((val.yes / total) * 100)
                  return (
                    <div key={idx} className="flex flex-col gap-1 p-1 rounded-md hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground truncate max-w-xs">{reg}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {val.yes} Submitted • <strong className={val.missing > 3 ? 'text-amber-600' : 'text-muted-foreground'}>{val.missing} Missing</strong>
                          </span>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                            {pct}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FORM 7: GENDER FORM */}
      {/* ========================================================================= */}
      {subTab === 'gender' && (
        <div className="flex flex-col gap-3">
          {/* Staffing and Code of Conduct */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
            <CardHeader className="p-4 pb-2 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Staffing and Code of Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {staffingCocData.map((item, idx) => {
                  const r = 38;
                  const c = 2 * Math.PI * r;
                  const strokePct = Math.min(100, item.pct);
                  const dash = (strokePct / 100) * c;
                  return (
                    <div
                      key={idx}
                      className="bg-[#f0f4f2] dark:bg-muted/30 rounded-2xl p-5 flex flex-col items-center justify-between text-center min-h-[190px]"
                    >
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8.5"
                            className="text-slate-200 dark:text-slate-700/60"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="8.5"
                            strokeDasharray={`${dash} ${c}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-foreground font-sans">
                            {item.pct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center mt-3">
                        <span className="font-bold text-xs text-foreground leading-snug">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-1">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Code of Conduct signing by month */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 bg-card">
            <CardContent className="p-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">Code of Conduct signing by month</h3>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-2.5 mb-6 text-xs text-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#115e59]" />
                  <span>New labourers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706]" />
                  <span>Signed</span>
                </div>
              </div>

              {/* Chart Area */}
              <div className="relative h-64 pt-2 pb-8 pl-12 pr-4">
                {/* Y Axis & Grid Lines */}
                <div className="absolute inset-0 top-2 bottom-8 left-12 right-4 flex flex-col justify-between pointer-events-none">
                  {[
                    { label: '4,000', val: 4000 },
                    { label: '3,000', val: 3000 },
                    { label: '2,000', val: 2000 },
                    { label: '1,000', val: 1000 },
                    { label: '0', val: 0 },
                  ].map((tick) => (
                    <div key={tick.label} className="w-full flex items-center relative">
                      <span className="absolute -left-12 w-10 text-right text-xs text-muted-foreground font-mono">
                        {tick.label}
                      </span>
                      <div className="w-full border-b border-dashed border-border/60" />
                    </div>
                  ))}
                </div>

                {/* Columns */}
                <div className="relative h-full flex items-end justify-around z-10">
                  {cocSigningByMonth.map((item) => {
                    const maxVal = 4000;
                    const newPct = (item.newLabourers / maxVal) * 100;
                    const signedPct = (item.signed / maxVal) * 100;

                    return (
                      <div key={item.month} className="flex flex-col items-center justify-end h-full relative">
                        {/* Peak value on top */}
                        <span className="text-xs font-bold text-foreground mb-1 font-mono">
                          {item.peak}
                        </span>

                        {/* Side by side bars */}
                        <div className="flex items-end gap-1">
                          <div
                            style={{ height: `${newPct}%` }}
                            className="w-4 sm:w-5 bg-[#115e59] rounded-t-xs transition-all shadow-2xs"
                            title={`New labourers: ${item.newLabourers.toLocaleString()}`}
                          />
                          <div
                            style={{ height: `${signedPct}%` }}
                            className="w-4 sm:w-5 bg-[#d97706] rounded-t-xs transition-all shadow-2xs"
                            title={`Signed: ${item.signed.toLocaleString()}`}
                          />
                        </div>

                        {/* X Axis Label */}
                        <div className="absolute -bottom-7 flex flex-col items-center">
                          <span className="text-xs text-muted-foreground text-center whitespace-nowrap leading-tight">
                            {item.month}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Row: Visual B (SEA/SH Complaint Status Table) + Visual D (Children's Data in Labour Camps) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Visual B: Table: SEA/SH Complaint Status */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-primary" />
                    SEA / SH Complaint Redressal Status (Confidential Aggregate)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sexual Exploitation, Abuse & Sexual Harassment. Privacy-conscious aggregate (no PII exposed). Rule 7: Pending &gt; 0 triggers Attention flag.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Zero Pending
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/60 border-b">
                    <tr>
                      <th className="p-3 font-semibold text-foreground">Reporting Period</th>
                      <th className="p-3 font-semibold text-center text-foreground">Registered</th>
                      <th className="p-3 font-semibold text-center text-foreground">Resolved</th>
                      <th className="p-3 font-semibold text-center text-foreground">Pending</th>
                      <th className="p-3 font-semibold text-center text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {seaShStatus.map((row, idx) => {
                      const isPending = row.pending > 0
                      return (
                        <tr key={idx} className={`hover:bg-muted/30 ${isPending ? 'bg-rose-500/5' : ''}`}>
                          <td className="p-3 font-semibold text-foreground">{row.period}</td>
                          <td className="p-3 text-center font-mono font-bold text-foreground">{row.registered}</td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-600">{row.resolved}</td>
                          <td className={`p-3 text-center font-mono font-bold ${isPending ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600'}`}>
                            {row.pending}
                          </td>
                          <td className="p-3 text-center">
                            {isPending ? (
                              <Badge variant="destructive" className="text-[10px]">Attention Needed</Badge>
                            ) : (
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                                Clear / Resolved
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Visual D: Table: Children's Data in Labour Camp */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Children in Labour Camps (Age & Gender Breakdown)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tracks infant & adolescent children residing in project camps for crèche & education coverage
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  66 Total Camp Children
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[260px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                      <tr>
                        <th className="p-2.5 font-semibold text-foreground">Cohort</th>
                        <th className="p-2.5 font-semibold text-center text-foreground">Newly Added</th>
                        <th className="p-2.5 font-semibold text-center text-foreground">Remaining</th>
                        <th className="p-2.5 font-semibold text-center text-foreground">Left Camp</th>
                        <th className="p-2.5 font-semibold text-center text-foreground">Total Present</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {childrenData.map((c, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="p-2.5 font-medium text-foreground">{c.category}</td>
                          <td className="p-2.5 text-center font-mono text-primary font-bold">+{c.newly_added}</td>
                          <td className="p-2.5 text-center font-mono text-muted-foreground">{c.remaining}</td>
                          <td className="p-2.5 text-center font-mono text-rose-600">-{c.left}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-foreground">{c.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row: Gender-specific facilities + IEC material displayed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Card 1: Gender-specific facilities at labour camps */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 pb-3 border-b bg-muted/20">
                <div className="flex items-start gap-4">
                  {/* Overall Donut */}
                  <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#dc2626"
                        strokeWidth="11"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#16a34a"
                        strokeWidth="11"
                        strokeDasharray={`${0.75 * 238.76} 238.76`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-black text-foreground leading-none">75%</span>
                      <span className="text-[8px] text-muted-foreground mt-0.5 font-medium">overall</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground">
                      Gender-specific facilities at labour camps
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Yes 446
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <span className="w-2 h-2 rounded-full bg-[#dc2626]" /> No 152
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      12 items, latest answer per project. Ring = answer mix; % = share compliant (NA excluded). Select a card to see which projects answered what.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {genderFacilitiesDetailed.map((item) => {
                    const isGreen = item.pct >= 80;
                    const isAmber = item.pct >= 50 && item.pct < 80;
                    const borderClass = isGreen ? 'border-l-emerald-500' : isAmber ? 'border-l-amber-500' : 'border-l-rose-500';
                    const r = 16;
                    const c = 2 * Math.PI * r;
                    const dash = (item.pct / 100) * c;
                    return (
                      <div
                        key={item.name}
                        className={`bg-[#f8faf9] dark:bg-muted/20 rounded-xl p-2.5 flex items-center gap-2.5 border border-border/40 border-l-[3.5px] ${borderClass} hover:bg-muted/40 transition-colors`}
                      >
                        <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                            <circle
                              cx="20"
                              cy="20"
                              r={r}
                              fill="transparent"
                              stroke="#dc2626"
                              strokeWidth="3.5"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r={r}
                              fill="transparent"
                              stroke="#16a34a"
                              strokeWidth="3.5"
                              strokeDasharray={`${dash} ${c}`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground font-mono">
                            {item.pct}%
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-xs text-foreground truncate" title={item.name}>
                            {item.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {item.yes} of {item.total} projects ·{' '}
                            <span className={item.no > 0 ? 'text-rose-600 font-semibold' : ''}>
                              {item.no} no
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Card 2: IEC material displayed */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
              <CardHeader className="p-4 pb-3 border-b bg-muted/20">
                <div className="flex items-start gap-4">
                  {/* Overall Donut */}
                  <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#dc2626"
                        strokeWidth="11"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#16a34a"
                        strokeWidth="11"
                        strokeDasharray={`${0.91 * 238.76} 238.76`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-black text-foreground leading-none">91%</span>
                      <span className="text-[8px] text-muted-foreground mt-0.5 font-medium">overall</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground">
                      IEC material displayed
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Yes 417
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <span className="w-2 h-2 rounded-full bg-[#dc2626]" /> No 39
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      10 items, latest answer per project. Ring = answer mix; % = share compliant (NA excluded). Select a card to see which projects answered what.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {iecMaterialDetailed.map((item) => {
                    const isGreen = item.pct >= 80;
                    const isAmber = item.pct >= 50 && item.pct < 80;
                    const borderClass = isGreen ? 'border-l-emerald-500' : isAmber ? 'border-l-amber-500' : 'border-l-rose-500';
                    const r = 16;
                    const c = 2 * Math.PI * r;
                    const dash = (item.pct / 100) * c;
                    return (
                      <div
                        key={item.name}
                        className={`bg-[#f8faf9] dark:bg-muted/20 rounded-xl p-2.5 flex items-center gap-2.5 border border-border/40 border-l-[3.5px] ${borderClass} hover:bg-muted/40 transition-colors`}
                      >
                        <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                            <circle
                              cx="20"
                              cy="20"
                              r={r}
                              fill="transparent"
                              stroke="#dc2626"
                              strokeWidth="3.5"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r={r}
                              fill="transparent"
                              stroke="#16a34a"
                              strokeWidth="3.5"
                              strokeDasharray={`${dash} ${c}`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground font-mono">
                            {item.pct}%
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-xs text-foreground truncate" title={item.name}>
                            {item.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {item.yes} of {item.total} projects ·{' '}
                            <span className={item.no > 0 ? 'text-rose-600 font-semibold' : ''}>
                              {item.no} no
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capacity building participants (Full Width) */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 bg-card">
            <CardContent className="p-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">Capacity building participants</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Sum of monthly reports.</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-2.5 mb-6 text-xs text-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2563eb]" />
                  <span>Men</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#be185d]" />
                  <span>Women</span>
                </div>
              </div>

              {/* Horizontal Stacked Bars */}
              <div className="space-y-4">
                {capacityBuildingDetailed.map((item) => {
                  const maxScale = 9200;
                  const totalPct = (item.total / maxScale) * 100;
                  const menRatio = item.men / item.total;
                  const womenRatio = item.women / item.total;

                  return (
                    <div key={item.title} className="flex items-center gap-4 text-xs">
                      <div className="w-[340px] md:w-[420px] shrink-0 truncate text-foreground font-medium" title={item.title}>
                        {item.title}
                      </div>

                      <div className="flex-1 bg-muted/40 h-2.5 rounded-full overflow-hidden flex relative">
                        <div
                          style={{ width: `${totalPct}%` }}
                          className="h-full flex overflow-hidden rounded-full"
                        >
                          <div
                            style={{ width: `${menRatio * 100}%` }}
                            className="bg-[#2563eb] h-full transition-all"
                            title={`Men: ${item.men.toLocaleString()}`}
                          />
                          <div
                            style={{ width: `${womenRatio * 100}%` }}
                            className="bg-[#be185d] h-full transition-all"
                            title={`Women: ${item.women.toLocaleString()}`}
                          />
                        </div>
                      </div>

                      <div className="w-16 shrink-0 text-right font-bold text-foreground font-mono">
                        {item.displayTotal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Grid: Women newly employed, by skill & Children in labour camps, by age */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Women newly employed, by skill */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 bg-card">
              <CardContent className="p-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Women newly employed, by skill</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Sum of monthly reports.</p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-2.5 mb-6 text-xs text-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#115e59]" />
                    <span>Local (AP)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706]" />
                    <span>Migrant</span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="relative h-60 pt-2 pb-8 pl-12 pr-4">
                  {/* Y Axis & Grid Lines */}
                  <div className="absolute inset-0 top-2 bottom-8 left-12 right-4 flex flex-col justify-between pointer-events-none">
                    {[
                      { label: '2,000', val: 2000 },
                      { label: '1,500', val: 1500 },
                      { label: '1,000', val: 1000 },
                      { label: '500', val: 500 },
                      { label: '0', val: 0 },
                    ].map((tick) => (
                      <div key={tick.label} className="w-full flex items-center relative">
                        <span className="absolute -left-12 w-10 text-right text-xs text-muted-foreground font-mono">
                          {tick.label}
                        </span>
                        <div className="w-full border-b border-dashed border-border/60" />
                      </div>
                    ))}
                  </div>

                  {/* Columns */}
                  <div className="relative h-full flex items-end justify-around z-10">
                    {womenEmployedDetailed.map((item) => {
                      const maxVal = 2000;
                      const totalPct = (item.total / maxVal) * 100;
                      const localPct = (item.local / item.total) * 100;
                      const migrantPct = (item.migrant / item.total) * 100;

                      return (
                        <div key={item.skill} className="flex flex-col items-center justify-end h-full relative">
                          {/* Total on top */}
                          <span className="text-xs font-bold text-foreground mb-1 font-mono">
                            {item.displayTotal}
                          </span>

                          {/* Stacked bar */}
                          <div
                            style={{ height: `${totalPct}%` }}
                            className="w-12 rounded-t-xs flex flex-col-reverse overflow-hidden shadow-2xs"
                          >
                            <div
                              style={{ height: `${localPct}%` }}
                              className="bg-[#115e59] w-full"
                              title={`Local (AP): ${item.local}`}
                            />
                            <div
                              style={{ height: `${migrantPct}%` }}
                              className="bg-[#d97706] w-full"
                              title={`Migrant: ${item.migrant}`}
                            />
                          </div>

                          {/* X Axis Label */}
                          <div className="absolute -bottom-8 flex flex-col items-center">
                            <span className="text-xs text-muted-foreground text-center whitespace-pre-line leading-tight">
                              {item.skill}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Children in labour camps, by age */}
            <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 bg-card">
              <CardContent className="p-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Children in labour camps, by age</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest report per project.</p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-2.5 mb-6 text-xs text-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#2563eb]" />
                    <span>Boys</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#be185d]" />
                    <span>Girls</span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="relative h-60 pt-2 pb-8 pl-10 pr-4">
                  {/* Y Axis & Grid Lines */}
                  <div className="absolute inset-0 top-2 bottom-8 left-10 right-4 flex flex-col justify-between pointer-events-none">
                    {[
                      { label: '40', val: 40 },
                      { label: '30', val: 30 },
                      { label: '20', val: 20 },
                      { label: '10', val: 10 },
                      { label: '0', val: 0 },
                    ].map((tick) => (
                      <div key={tick.label} className="w-full flex items-center relative">
                        <span className="absolute -left-10 w-8 text-right text-xs text-muted-foreground font-mono">
                          {tick.label}
                        </span>
                        <div className="w-full border-b border-dashed border-border/60" />
                      </div>
                    ))}
                  </div>

                  {/* Columns */}
                  <div className="relative h-full flex items-end justify-around z-10">
                    {childrenByAgeDetailed.map((item) => {
                      const maxVal = 40;
                      const boysPct = (item.boys / maxVal) * 100;
                      const girlsPct = (item.girls / maxVal) * 100;

                      return (
                        <div key={item.age} className="flex flex-col items-center justify-end h-full relative">
                          {/* Max/Peak value on top */}
                          <span className="text-xs font-bold text-foreground mb-1 font-mono">
                            {item.max}
                          </span>

                          {/* Side by side bars */}
                          <div className="flex items-end gap-1.5">
                            <div
                              style={{ height: `${boysPct}%` }}
                              className="w-5 bg-[#2563eb] rounded-t-xs transition-all shadow-2xs"
                              title={`Boys: ${item.boys}`}
                            />
                            <div
                              style={{ height: `${girlsPct}%` }}
                              className="w-5 bg-[#be185d] rounded-t-xs transition-all shadow-2xs"
                              title={`Girls: ${item.girls}`}
                            />
                          </div>

                          {/* X Axis Label */}
                          <div className="absolute -bottom-8 flex flex-col items-center">
                            <span className="text-xs text-muted-foreground text-center whitespace-nowrap leading-tight">
                              {item.age}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1">
          <AttentionCard attentionItems={attentionItems} month={month} domain="Social" />
        </div>
      </div>
</div>
  )
}
