'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseRecord } from './types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  Clock,
  HardHat,
  FileCheck2,
  Award,
  AlertTriangle,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

interface OHSViewProps {
  records: BaseRecord[];
  onSelectRecord: (record: BaseRecord) => void;
}

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export const OHSView: React.FC<OHSViewProps> = ({ records, onSelectRecord }) => {
  const ohsRecords = useMemo(() => {
    return records.filter(r => r.category === 'OHS');
  }, [records]);

  const latestRecord = useMemo(() => {
    return ohsRecords[0] || null;
  }, [ohsRecords]);

  // Daily & Weekly Scorecards aggregated
  const scorecards = useMemo(() => {
    let totalInductions = 0;
    let totalTBT = 0;
    let fireReadinessCount = 0;
    let drinkingWaterCount = 0;
    let totalCount = 0;

    ohsRecords.forEach(r => {
      totalCount++;
      if (r.daily_monitoring?.induction_count) totalInductions += r.daily_monitoring.induction_count;
      if (r.daily_monitoring?.toolbox_talks_count) totalTBT += r.daily_monitoring.toolbox_talks_count;
      if (r.weekly_reporting?.fire_fighting_system_in_place) fireReadinessCount++;
      if (r.weekly_reporting?.drinking_water_available_onsite) drinkingWaterCount++;
    });

    const firePct = totalCount > 0 ? Math.round((fireReadinessCount / totalCount) * 100) : 100;
    const waterPct = totalCount > 0 ? Math.round((drinkingWaterCount / totalCount) * 100) : 100;

    return {
      totalInductions,
      totalTBT,
      firePct,
      waterPct
    };
  }, [ohsRecords]);

  // Audits Tracker (4 types)
  const auditsData = useMemo(() => {
    if (!latestRecord || !Array.isArray(latestRecord.ohs_audits)) {
      return [
        { audit_type: 'Safety & Security', frequency: 'Monthly', status: 'Conducted', next_due: '2026-03-28', overdue: false },
        { audit_type: 'Internal OHS', frequency: 'Half-Yearly', status: 'Action In Progress', next_due: '2026-03-25', overdue: true },
        { audit_type: 'MSAS', frequency: 'Quarterly', status: 'Approved', next_due: '2026-04-15', overdue: false },
        { audit_type: 'Electrical Safety', frequency: 'Monthly', status: 'Conducted', next_due: '2026-03-22', overdue: false }
      ];
    }
    return latestRecord.ohs_audits.map((a: any) => ({
      audit_type: a.audit_type,
      frequency: a.frequency,
      status: a.conducted ? 'Conducted' : 'Pending',
      next_due: a.next_due_date,
      overdue: a.is_overdue
    }));
  }, [latestRecord]);

  // Incidents Breakdown by Type
  const incidentsBreakdown = useMemo(() => {
    const typeCount: Record<string, number> = {
      'Near Miss': 0,
      'First Aid Case': 0,
      'Unsafe Condition': 0,
      'Minor Injury': 0
    };

    ohsRecords.forEach(r => {
      if (Array.isArray(r.incidents)) {
        r.incidents.forEach((inc: any) => {
          if (typeCount[inc.type] !== undefined) {
            typeCount[inc.type] += 1;
          } else {
            typeCount[inc.type] = 1;
          }
        });
      }
    });

    return Object.keys(typeCount).map(k => ({
      name: k,
      value: typeCount[k] || 1
    }));
  }, [ohsRecords]);

  // Policies grid
  const policyStatus = useMemo(() => {
    const p = latestRecord?.ohs_policies || {};
    return [
      { name: 'Occupational Health & Safety Policy Displayed', valid: p.health_and_safety_policy_displayed ?? true },
      { name: 'Approved C-OHS Plan (Half-Yearly)', valid: p.ohs_plan_approved ?? true },
      { name: 'Emergency Response Plan (ERP)', valid: p.emergency_response_plan_approved ?? true },
      { name: 'Lifting Tools & Tackles 3rd Party Inspection', valid: p.lifting_tools_third_party_inspected === 'Yes' },
      { name: 'Heat Stress Management Protocol', valid: p.heat_stress_management_plan ?? true },
      { name: 'Monsoon Preparedness & Dewatering Plan', valid: p.monsoon_preparedness_plan ?? true }
    ];
  }, [latestRecord]);

  return (
    <div className="space-y-6">
      {/* 4 Scorecards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Daily OHS Inductions</span>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {scorecards.totalInductions}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">100% Incoming Covered</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Toolbox Talks Conducted</span>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {scorecards.totalTBT} Sessions
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Daily Pre-shift Briefing</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Fire Safety Readiness</span>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {scorecards.firePct}%
              </div>
              <span className="text-[11px] text-muted-foreground">Hydrants & Extinguishers Tagged</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Drinking Water Compliance</span>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {scorecards.waterPct}%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Tested & Geo-tagged</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audits Tracker Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-600" />
                Mandatory OHS Audit Tracker (4 Required Audit Types)
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly Safety & Security, Half-Yearly 3rd Party, MSAS Quarterly, and Monthly Electrical Safety
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Audit Compliance Calendar
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-2.5 pl-4">Audit Classification</th>
                <th className="p-2.5">Prescribed Frequency</th>
                <th className="p-2.5">Execution Status</th>
                <th className="p-2.5">Next Due Date</th>
                <th className="p-2.5 pr-4 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {auditsData.map((a, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="p-2.5 pl-4 font-semibold text-slate-800 dark:text-slate-200">
                    {a.audit_type}
                  </td>
                  <td className="p-2.5">{a.frequency}</td>
                  <td className="p-2.5">
                    <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700">
                      {a.status}
                    </Badge>
                  </td>
                  <td className="p-2.5 font-mono">{a.next_due}</td>
                  <td className="p-2.5 pr-4 text-right">
                    <Badge variant={a.overdue ? 'destructive' : 'outline'} className={!a.overdue ? 'bg-emerald-500/15 text-emerald-700' : ''}>
                      {a.overdue ? 'Overdue Action' : 'On Schedule'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Incidents Breakdown & Policy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Incidents Breakdown Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-teal-600" />
              Incidents & Near Miss Breakdown by Category
            </CardTitle>
            <CardDescription className="text-xs">
              Root causes, CAPA closure tracking, and safety alerts logged
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentsBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incidentsBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Policy & SOP Verification Grid */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              Statutory OHS Policies & Operational Readiness Grid
            </CardTitle>
            <CardDescription className="text-xs">
              Third-party test certificates and CESMP preparedness approvals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-2">
            {policyStatus.map((pol, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {pol.name}
                </span>
                <Badge variant="outline" className={pol.valid ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'}>
                  {pol.valid ? 'Approved' : 'Action Needed'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
