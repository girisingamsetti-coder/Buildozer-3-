'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseRecord } from './types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  AlertCircle,
  FileText,
  Camera,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ExternalLink,
  Car
} from 'lucide-react';

interface RoadSafetyViewProps {
  records: BaseRecord[];
  onSelectRecord: (record: BaseRecord) => void;
}

export const RoadSafetyView: React.FC<RoadSafetyViewProps> = ({ records, onSelectRecord }) => {
  const rsRecords = useMemo(() => {
    return records.filter(r => r.category === 'Road Safety');
  }, [records]);

  const latestRecord = useMemo(() => {
    return rsRecords[0] || null;
  }, [rsRecords]);

  // Checklist items list (15 items)
  const checklistItems = useMemo(() => {
    if (latestRecord && Array.isArray(latestRecord.checklist)) {
      return latestRecord.checklist;
    }
    return [];
  }, [latestRecord]);

  // Compliance % Trend across months
  const monthlyRsTrend = useMemo(() => {
    const map: Record<string, { totalPct: number; count: number; evidencePct: number }> = {};
    rsRecords.forEach(r => {
      const m = r.reporting_month;
      if (!m) return;
      if (!map[m]) map[m] = { totalPct: 0, count: 0, evidencePct: 0 };
      map[m].totalPct += r.checklist_compliance_pct || r.compliance_score_pct || 90;
      map[m].evidencePct += r.evidence_completeness_pct || 92;
      map[m].count += 1;
    });

    return Object.keys(map).sort().map(month => ({
      month,
      compliance_pct: Math.round(map[month].totalPct / map[month].count),
      evidence_pct: Math.round(map[month].evidencePct / map[month].count)
    }));
  }, [rsRecords]);

  // Recurring issues list
  const recurringIssues = [
    {
      item: 'Night Safety Arrangements (Item 5)',
      description: 'Reflective solar blinkers missing along Sakhamuru detour curve during heavy truck movement',
      action: 'Installed 24 high-intensity amber LED solar flashers on jersey barriers',
      status: 'Resolved'
    },
    {
      item: 'Temporary Traffic Barriers (Item 4)',
      description: 'Water-filled plastic barriers displaced near Rayapudi junction due to unauthorized u-turns',
      action: 'Interlocked with steel pin chains and sand ballast added to 100% capacity',
      status: 'Under Verification'
    },
    {
      item: 'Pedestrian Crossing Arrangements (Item 12)',
      description: 'Safe walkway lighting deficient between labour camp and batching plant',
      action: 'Installed 6 high-mast solar illumination poles along walkway path',
      status: 'Resolved'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner & Evidence Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 shadow-sm bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                  Category C: Road Safety
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Active Reference: <strong>{latestRecord?.id || 'RS-001'}</strong> ({latestRecord?.reporting_month})
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                15-Item Road & Traffic Safety Checklist (IRC SP:55-2014)
              </h3>
              <p className="text-xs text-muted-foreground">
                Traffic management plans, diversion safety, flagmen deployment, night illumination, and crash barriers.
              </p>
            </div>
            {latestRecord && (
              <Button variant="outline" size="sm" onClick={() => onSelectRecord(latestRecord)} className="h-8 text-xs gap-1.5">
                Inspect Record <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 text-amber-600">
              <Camera className="w-4 h-4" /> Evidence Completeness
            </span>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {latestRecord?.evidence_completeness_pct || 94}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              Geo-tagged photo uploads and signed joint inspections
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Road Safety 15-Item Checklist Compliance % Trend Over Time
          </CardTitle>
          <CardDescription className="text-xs">
            Tracking implementation fidelity across 15 mandatory IRC SP:55 criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRsTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="compliance_pct" name="Checklist Compliance %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="evidence_pct" name="Upload Completeness %" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 15-Item Checklist Matrix Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Car className="w-4 h-4 text-teal-600" />
                15-Item Mandatory Road Safety Compliance Verification
              </CardTitle>
              <CardDescription className="text-xs">
                Status, remarks, and photo upload verification per item
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {latestRecord?.checklist_compliant_items || 14} / 15 Items Compliant
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-2.5 pl-4 w-12">#</th>
                <th className="p-2.5">Checklist Safety Criterion</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Field Remarks & Verification</th>
                <th className="p-2.5 pr-4 text-right">Photo / Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {checklistItems.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="p-2.5 pl-4 font-mono font-bold text-muted-foreground">{item.item_no}</td>
                  <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{item.item_name}</td>
                  <td className="p-2.5">
                    <Badge variant="outline" className={item.status === 'Yes' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-muted-foreground">{item.remarks}</td>
                  <td className="p-2.5 pr-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 font-medium cursor-pointer hover:underline">
                      <Camera className="w-3 h-3" /> {item.upload_status || 'Uploaded'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Recurring Non-Compliance & Corrective Action Register */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Recurring Issues & Traffic Rectification Action Register
          </CardTitle>
          <CardDescription className="text-xs">
            PMC Joint Inspection observations and speed calming interventions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recurringIssues.map((issue, idx) => (
            <div key={idx} className="p-3 border rounded-xl bg-card space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100">{issue.item}</span>
                <Badge variant="outline" className={issue.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700'}>
                  {issue.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{issue.description}</p>
              <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                Action Taken: {issue.action}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
