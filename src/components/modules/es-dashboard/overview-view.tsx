'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseRecord, RAGStatus } from './types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface OverviewViewProps {
  records: BaseRecord[];
  onSelectRecord: (record: BaseRecord) => void;
  onSelectCategoryTab: (tabKey: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  records,
  onSelectRecord,
  onSelectCategoryTab
}) => {
  // Category statistics breakdown
  const categoryStats = useMemo(() => {
    const categories = ['Environment', 'OHS', 'Road Safety', 'Social'];
    return categories.map(cat => {
      const catRecords = records.filter(r => r.category === cat);
      const total = catRecords.length;
      if (total === 0) return { category: cat, score: 0, rag: 'Green' as RAGStatus, green: 0, amber: 0, red: 0, count: 0 };

      const score = Math.round(catRecords.reduce((acc, r) => acc + r.compliance_score_pct, 0) / total);
      const green = catRecords.filter(r => r.rag_status === 'Green').length;
      const amber = catRecords.filter(r => r.rag_status === 'Amber').length;
      const red = catRecords.filter(r => r.rag_status === 'Red').length;

      let rag: RAGStatus = 'Green';
      if (score < 70 || red > 0) rag = 'Red';
      else if (score < 90 || amber > 0) rag = 'Amber';

      return { category: cat, score, rag, green, amber, red, count: total };
    });
  }, [records]);

  // Monthly trend calculations
  const monthlyTrend = useMemo(() => {
    const monthMap: Record<string, { totalScore: number; count: number; onTimeCount: number }> = {};
    records.forEach(r => {
      const m = r.reporting_month;
      if (!m) return;
      if (!monthMap[m]) monthMap[m] = { totalScore: 0, count: 0, onTimeCount: 0 };
      monthMap[m].totalScore += r.compliance_score_pct;
      monthMap[m].count += 1;
      if (r.submission_cycle?.contractor_on_time) monthMap[m].onTimeCount += 1;
    });

    return Object.keys(monthMap).sort().map(month => {
      const item = monthMap[month];
      return {
        month,
        compliance_pct: Math.round(item.totalScore / item.count),
        submissions: item.count,
        on_time_pct: Math.round((item.onTimeCount / item.count) * 100)
      };
    });
  }, [records]);

  // Submission cycle breakdown (Contractor -> PMC -> PgMC -> APCRDA)
  const cycleMetrics = useMemo(() => {
    let total = 0;
    let contractorOnTime = 0;
    let pmcOnTime = 0;
    let pgmcOnTime = 0;
    let apcrdaOnTime = 0;

    records.forEach(r => {
      if (r.submission_cycle) {
        total++;
        if (r.submission_cycle.contractor_on_time) contractorOnTime++;
        if (r.submission_cycle.pmc_on_time) pmcOnTime++;
        if (r.submission_cycle.pgmc_on_time) pgmcOnTime++;
        if (r.submission_cycle.apcrda_on_time) apcrdaOnTime++;
      }
    });

    if (total === 0) return [];

    return [
      { stage: '1. Contractor (20th Target)', onTimePct: Math.round((contractorOnTime / total) * 100), delayed: total - contractorOnTime, total },
      { stage: '2. PMC Review (22nd Target)', onTimePct: Math.round((pmcOnTime / total) * 100), delayed: total - pmcOnTime, total },
      { stage: '3. PgMC Scrutiny (27th Target)', onTimePct: Math.round((pgmcOnTime / total) * 100), delayed: total - pgmcOnTime, total },
      { stage: '4. APCRDA Final (30th Target)', onTimePct: Math.round((apcrdaOnTime / total) * 100), delayed: total - apcrdaOnTime, total }
    ];
  }, [records]);

  // Recent representative records for immediate drilldown
  const recentRecords = useMemo(() => {
    return records.slice(0, 6);
  }, [records]);

  const ragBadgeStyle: Record<RAGStatus, string> = {
    Green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    Amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    Red: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Project Context Header Banner */}
      <Card className="border-teal-500/20 bg-gradient-to-r from-teal-500/5 via-teal-500/10 to-transparent shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30 font-mono">
                WIN/0032/24-25
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Active Monitoring Phase
              </Badge>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
              Hon&apos;ble MLAs and MLCs and AIS Officers - Housing
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Rayapudi, Amaravati (~16.51°N, 80.52°E)
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                PMC: Aarvee Associates / PgMC: STUP
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Contract Cycle: 20th - 30th Monthly
              </span>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border shadow-sm text-right shrink-0">
            <div className="text-[11px] text-muted-foreground">Active Form Datasets</div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400">7 Types</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {records.length} Submissions Synchronized
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RAG Summary Cards Per Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryStats.map(cat => {
          const tabKey = cat.category === 'Road Safety' ? 'road-safety' : cat.category.toLowerCase();
          return (
            <Card
              key={cat.category}
              className="cursor-pointer transition-all hover:shadow-md hover:border-teal-500/40 relative overflow-hidden"
              onClick={() => onSelectCategoryTab(tabKey)}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${cat.rag === 'Green' ? 'bg-emerald-500' : (cat.rag === 'Amber' ? 'bg-amber-500' : 'bg-rose-500')}`} />
              <CardContent className="p-4 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {cat.category}
                  </span>
                  <Badge variant="outline" className={ragBadgeStyle[cat.rag]}>
                    {cat.rag}
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100">
                    {cat.score}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cat.count} Records
                  </div>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(cat.green / cat.count) * 100}%` }} className="bg-emerald-500" title={`Green: ${cat.green}`} />
                  <div style={{ width: `${(cat.amber / cat.count) * 100}%` }} className="bg-amber-500" title={`Amber: ${cat.amber}`} />
                  <div style={{ width: `${(cat.red / cat.count) * 100}%` }} className="bg-rose-500" title={`Red: ${cat.red}`} />
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t">
                  <span>G: {cat.green} | A: {cat.amber} | R: {cat.red}</span>
                  <span className="text-teal-600 hover:underline flex items-center font-medium">
                    View Module <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dual Charts: Compliance Trend & Submission Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Compliance Trend Line */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Overall Project Compliance % Trend by Reporting Month
            </CardTitle>
            <CardDescription className="text-xs">
              Blended average score across all 7 statutory and CESMP compliance categories
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="compliance_pct"
                  name="Compliance %"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#0d9488' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="on_time_pct"
                  name="On-time Submission %"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Submission Timeline Cycle */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              Submission Workflow Cycle Timeliness
            </CardTitle>
            <CardDescription className="text-xs">
              Contractor (20th) → PMC (22nd) → PgMC (27th) → APCRDA (30th)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {cycleMetrics.map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{stage.stage}</span>
                  <span className={`font-bold ${stage.onTimePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {stage.onTimePct}% On-time
                  </span>
                </div>
                <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${stage.onTimePct}%` }} className="bg-teal-500 rounded-full" />
                </div>
                <div className="text-[10px] text-muted-foreground text-right">
                  {stage.delayed} submissions experienced verification lag
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Drilldown Quick Access Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold">
                Recent Submissions & Form Quality Snapshot
              </CardTitle>
              <CardDescription className="text-xs">
                Click any record to open the complete field inspector
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Showing 6 of {records.length} Submissions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3 pl-4">Form ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Form Type</th>
                <th className="p-3">Reporting Month</th>
                <th className="p-3">Created Date</th>
                <th className="p-3">Lag</th>
                <th className="p-3">RAG</th>
                <th className="p-3">Score</th>
                <th className="p-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentRecords.map(r => (
                <tr
                  key={r.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelectRecord(r)}
                >
                  <td className="p-3 pl-4 font-mono font-bold text-teal-600">{r.id}</td>
                  <td className="p-3">{r.category}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{r.form_type}</td>
                  <td className="p-3">{r.reporting_month}</td>
                  <td className="p-3">
                    <span className={r.form_created_date === 'Invalid date' ? 'text-rose-500 font-bold' : ''}>
                      {r.form_created_date}
                    </span>
                  </td>
                  <td className="p-3">{r.submission_lag_months}m</td>
                  <td className="p-3">
                    <Badge variant="outline" className={ragBadgeStyle[r.rag_status]}>
                      {r.rag_status}
                    </Badge>
                  </td>
                  <td className="p-3 font-semibold">{r.compliance_score_pct}%</td>
                  <td className="p-3 pr-4 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-600">
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
