'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseRecord } from './types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Baby,
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SocialViewProps {
  records: BaseRecord[];
  onSelectRecord: (record: BaseRecord) => void;
}

const PIE_COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const SocialView: React.FC<SocialViewProps> = ({ records, onSelectRecord }) => {
  const [activeSubTab, setActiveSubTab] = useState<'gender' | 'labour' | 'skills' | 'safeguard'>('gender');

  const socialRecords = useMemo(() => {
    return records.filter(r => r.category === 'Social');
  }, [records]);

  const genderRecords = useMemo(() => socialRecords.filter(r => r.form_type === 'Gender'), [socialRecords]);
  const labourRecords = useMemo(() => socialRecords.filter(r => r.form_type === 'Labour Law Compliance'), [socialRecords]);
  const skillRecords = useMemo(() => socialRecords.filter(r => r.form_type === 'Skill Training and Employment'), [socialRecords]);
  const safeguardRecords = useMemo(() => socialRecords.filter(r => r.form_type === 'Social Safeguard Compliance'), [socialRecords]);

  const latestGender = genderRecords[0] || null;
  const latestLabour = labourRecords[0] || null;
  const latestSkill = skillRecords[0] || null;
  const latestSafeguard = safeguardRecords[0] || null;

  // 1. Gender metrics
  const seaGrievanceFunnel = useMemo(() => {
    const reg = latestGender?.sea_sh_complaints?.monthly_registered ?? 1;
    const res = latestGender?.sea_sh_complaints?.monthly_resolved ?? 1;
    const pend = latestGender?.sea_sh_complaints?.monthly_pending ?? 0;
    return [
      { stage: 'Registered', count: reg },
      { stage: 'Resolved', count: res },
      { stage: 'Pending Investigation', count: pend }
    ];
  }, [latestGender]);

  // 2. Labour Law Licenses (7 Acts)
  const licenses = useMemo(() => {
    if (latestLabour && Array.isArray(latestLabour.establishment_registration_and_licenses)) {
      return latestLabour.establishment_registration_and_licenses;
    }
    return [];
  }, [latestLabour]);

  // 3. Labour Profile (Skill & Origin)
  const labourProfileSkill = useMemo(() => {
    const dist = latestLabour?.labour_profile?.skill_distribution;
    if (!dist) {
      return [
        { name: 'Skilled', value: 210 },
        { name: 'Semi-Skilled', value: 155 },
        { name: 'Unskilled', value: 140 },
        { name: 'Highly Skilled', value: 45 }
      ];
    }
    return [
      { name: 'Highly Skilled', value: dist.highly_skilled },
      { name: 'Skilled', value: dist.skilled },
      { name: 'Semi-Skilled', value: dist.semi_skilled },
      { name: 'Unskilled', value: dist.unskilled }
    ];
  }, [latestLabour]);

  // 4. Skills 26-Trade Heatmap Data
  const tradesData = useMemo(() => {
    if (latestSkill && Array.isArray(latestSkill.skill_set_wise_local_workers)) {
      return latestSkill.skill_set_wise_local_workers.slice(0, 10);
    }
    return [];
  }, [latestSkill]);

  // 5. Social Safeguard Funnel
  const safeguardFunnel = useMemo(() => {
    const cr = latestSafeguard?.compliance_reporting;
    return [
      { stage: 'Reports Generated', count: cr?.reports_generated || 6 },
      { stage: 'Observations Raised', count: cr?.observations_raised || 12 },
      { stage: 'Observations Closed', count: cr?.observations_closed || 10 },
      { stage: 'Pending Open', count: cr?.pending_observations || 2 }
    ];
  }, [latestSafeguard]);

  return (
    <div className="space-y-6">
      {/* Social Sub-Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/50 rounded-xl border">
          <Button
            variant={activeSubTab === 'gender' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSubTab('gender')}
            className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeSubTab === 'gender' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
          >
            <Users className="w-3.5 h-3.5" /> 1. Gender & POSH
          </Button>
          <Button
            variant={activeSubTab === 'labour' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSubTab('labour')}
            className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeSubTab === 'labour' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
          >
            <Briefcase className="w-3.5 h-3.5" /> 2. Labour Law & Wages
          </Button>
          <Button
            variant={activeSubTab === 'skills' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSubTab('skills')}
            className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeSubTab === 'skills' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> 3. Skill Training & Jobs
          </Button>
          <Button
            variant={activeSubTab === 'safeguard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSubTab('safeguard')}
            className={`text-xs gap-1.5 h-8 px-3 rounded-lg ${activeSubTab === 'safeguard' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}`}
          >
            <HeartHandshake className="w-3.5 h-3.5" /> 4. Social Safeguards & GRC
          </Button>
        </div>

        <Badge variant="outline" className="text-xs font-mono">
          Category D: Social (4 Sub-Modules)
        </Badge>
      </div>

      {/* ================= SUB-TAB 1: GENDER ================= */}
      {activeSubTab === 'gender' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Internal Complaints Committee (ICC)</span>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" /> Active & Constituted
                </div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Presiding Officer: {latestGender?.icc_status?.presiding_officer || 'D. Padmavathi'}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Members Trained on POSH Act</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestGender?.icc_status?.members_trained_total || 7} Members
                </div>
                <div className="text-[11px] text-teal-600 font-medium pt-1">
                  3 Male | 4 Female Representatives
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Female Workforce Share</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  18.5%
                </div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  50 Women Employed (Local & Migrant)
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Children in Camp / Creche</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestGender?.children_in_camp?.total_children || 41} Children
                </div>
                <div className="text-[11px] text-emerald-600 font-medium pt-1">
                  18 in Creche | 22 in Local Schools
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* SEA/SH Grievance Funnel */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  SEA / SH Grievance Redressal Funnel
                </CardTitle>
                <CardDescription className="text-xs">
                  Zero-tolerance Sexual Exploitation, Abuse & Harassment resolution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {seaGrievanceFunnel.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.stage}</span>
                    <Badge variant="outline" className={item.stage === 'Resolved' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-blue-500/15 text-blue-700'}>
                      {item.count} Cases
                    </Badge>
                  </div>
                ))}
                <div className="text-[11px] text-muted-foreground p-2 rounded bg-muted/40 text-center">
                  Helpline Displayed at All Camps: <strong>+91 9666600919 / 181 Women Helpline</strong>
                </div>
              </CardContent>
            </Card>

            {/* 12-Item Gender Facilities Checklist */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Baby className="w-4 h-4 text-teal-600" />
                  Gender-Sensitive Amenities & Camp Facilities (12 Items)
                </CardTitle>
                <CardDescription className="text-xs">
                  Creche, sanitary dispensers, private toilets, and healthcare
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto space-y-1.5 p-3">
                {latestGender?.gender_facilities_checklist?.map((fac: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded border bg-card text-xs">
                    <span className="text-slate-700 dark:text-slate-300">{fac.facility_name}</span>
                    <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700">
                      {fac.is_provided ? 'Provided' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: LABOUR LAW ================= */}
      {activeSubTab === 'labour' && (
        <div className="space-y-5">
          {/* Statutory ID & Traceability Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Bank Wage Traceability %</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestLabour?.statutory_id_coverage?.bank_account_linked_pct || 94}%
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  Direct Bank Transaction IDs Logged
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">EPFO & UAN Coverage</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestLabour?.statutory_id_coverage?.uan_coverage_pct || 92}%
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Challans reconciled with EPFO portal
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">ESIC Registration</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestLabour?.statutory_id_coverage?.esic_coverage_pct || 90}%
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Statutory Medical Coverage Active
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 7 Statutory Licenses Expiry Tracker */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Statutory Establishments Registration & License Expiry Tracker (7 Acts)
              </CardTitle>
              <CardDescription className="text-xs">
                BOCW 1996, Contract Labour 1970, ISMW 1979, EPF 1952, ESI 1948, Workmen Compensation & Motor Transport
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                    <th className="p-2.5 pl-4">Statutory Act</th>
                    <th className="p-2.5">License / Registration No.</th>
                    <th className="p-2.5">Expiry Date</th>
                    <th className="p-2.5">Countdown (Days)</th>
                    <th className="p-2.5 pr-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {licenses.map((lic: any, idx: number) => {
                    const isExpired = lic.status === 'Expired';
                    const isExpiringSoon = lic.status === 'Expiring Soon';
                    return (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-2.5 pl-4 font-semibold text-slate-800 dark:text-slate-200">{lic.act_name}</td>
                        <td className="p-2.5 font-mono">{lic.license_no}</td>
                        <td className="p-2.5 font-mono">{lic.expiry_date}</td>
                        <td className="p-2.5 font-bold">
                          {lic.days_to_expiry < 0 ? `${Math.abs(lic.days_to_expiry)}d Overdue` : `${lic.days_to_expiry}d Left`}
                        </td>
                        <td className="p-2.5 pr-4 text-right">
                          <Badge
                            variant="outline"
                            className={
                              isExpired
                                ? 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                                : isExpiringSoon
                                ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                            }
                          >
                            {lic.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Labour Profile Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Workforce Skill-Level Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={labourProfileSkill} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {labourProfileSkill.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Gaps & Corrective Actions */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Key Gaps & Corrective Action Plan (CAPA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs">
                {latestLabour?.key_gaps_and_corrective_actions?.map((gap: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-xl bg-card space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span>{gap.gap}</span>
                      <Badge variant="outline" className={gap.status === 'Overdue' ? 'bg-rose-500/15 text-rose-700' : 'bg-amber-500/15 text-amber-700'}>
                        {gap.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">{gap.recommendation}</div>
                    <div className="text-[11px] text-teal-700 font-medium">Responsible: {gap.responsible_person}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: SKILL TRAINING ================= */}
      {activeSubTab === 'skills' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Local Workforce Share</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestSkill?.employment_details?.local_workers_employed?.local_share_pct || 42}%
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {latestSkill?.employment_details?.local_workers_employed?.total || 195} Local AP Residents
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Total Project Workforce</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestSkill?.employment_details?.total_workers_employed || 460}
                </div>
                <div className="text-[11px] text-muted-foreground">Across General & Specialized Trades</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Open Staff & Worker Vacancies</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">24 Positions</div>
                <div className="text-[11px] text-amber-600 font-medium">Scaffolders, Riggers & Site Engineers</div>
              </CardContent>
            </Card>
          </div>

          {/* 26-Trades Distribution Bar Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                Local Workforce Skill-Set Breakdown by Trade (Top 10 Trades)
              </CardTitle>
              <CardDescription className="text-xs">
                Masonry, bar bending, scaffolding, electrical, and MEP trades
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="trade" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="male" name="Male" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="female" name="Female" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= SUB-TAB 4: SOCIAL SAFEGUARD ================= */}
      {activeSubTab === 'safeguard' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">E&S Key Staff Deployment</span>
                <div className="text-xl font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-5 h-5" /> 4 / 4 Deployed
                </div>
                <div className="text-[11px] text-muted-foreground">Full Field Team On-duty</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">PMC Monthly Inspections</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestSafeguard?.pmc_site_inspections?.total_visits || 18} Visits
                </div>
                <div className="text-[11px] text-muted-foreground">Env: 5 | Social: 5 | OHS: 8</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">GRC Community Complaints</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestSafeguard?.grc_grievance_redressal?.complaints_resolved || 2} Resolved
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">Average 7.5 Days Resolution</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Health Camp Coverage</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {latestSafeguard?.medical_and_health_activities?.total_covered || 268} Persons
                </div>
                <div className="text-[11px] text-muted-foreground">GGH Guntur Joint Health Camp</div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Report Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Compliance Reporting & Closure Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs">
                {safeguardFunnel.map((f, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg border bg-muted/20">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{f.stage}</span>
                    <Badge variant="outline" className="bg-teal-500/15 text-teal-700 font-bold">
                      {f.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Host Community Baseline Table */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  Host Community Socio-Demographic Baseline
                </CardTitle>
                <CardDescription className="text-xs">
                  Rayapudi, Mandadam, Velagapudi & Uddandarayunipalem
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                      <th className="p-2.5 pl-4">Village</th>
                      <th className="p-2.5">Population</th>
                      <th className="p-2.5">Vulnerable HH</th>
                      <th className="p-2.5 pr-4 text-right">Elderly (60+)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {latestSafeguard?.host_community_profile?.map((v: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-2.5 pl-4 font-semibold">{v.village_name}</td>
                        <td className="p-2.5">{v.total_population}</td>
                        <td className="p-2.5">{v.vulnerable_households}</td>
                        <td className="p-2.5 pr-4 text-right">{v.elderly_60_plus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
