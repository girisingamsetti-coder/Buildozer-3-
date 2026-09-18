'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseRecord, DataQualityIssue } from './types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Sparkles,
  Download,
  AlertTriangle,
  Search,
  CheckCircle2,
  FileCheck,
  Scale,
  Clock,
  ExternalLink
} from 'lucide-react';

interface CrossCuttingViewProps {
  records: BaseRecord[];
  dataQualityIssues: DataQualityIssue[];
  onSelectRecord: (record: BaseRecord) => void;
}

export const CrossCuttingView: React.FC<CrossCuttingViewProps> = ({
  records,
  dataQualityIssues,
  onSelectRecord
}) => {
  const [issueFilter, setIssueFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Gender Equity Cross-cutting Stats
  const genderEquity = useMemo(() => {
    return {
      overallFemaleShare: 18.5,
      trainingFemaleShare: 32.0,
      bankTransferShare: 96.0,
      equalPayCompliance: '100% (Equal Remuneration Act 1976)'
    };
  }, []);

  // 2. Document & Evidence Completeness Score across modules
  const moduleCompleteness = useMemo(() => {
    return [
      { module: 'Environment', score: 94 },
      { module: 'OHS', score: 96 },
      { module: 'Road Safety', score: 92 },
      { module: 'Gender', score: 98 },
      { module: 'Labour Law', score: 88 },
      { module: 'Skill Training', score: 91 },
      { module: 'Social Safeguard', score: 95 }
    ];
  }, []);

  // 3. Filtered Data Quality Issues
  const filteredIssues = useMemo(() => {
    return dataQualityIssues.filter(issue => {
      const matchesFilter = issueFilter === 'All' || issue.issue_type === issueFilter;
      const matchesSearch =
        issue.record_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.form_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [dataQualityIssues, issueFilter, searchQuery]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Form Type', 'Reporting Month', 'Issue Type', 'Severity', 'Description'];
    const rows = filteredIssues.map(i => [
      i.record_id,
      `"${i.form_type}"`,
      i.reporting_month,
      i.issue_type,
      i.severity,
      `"${i.description}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `es_data_quality_issues_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Gender Equity & Evidence Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Workforce Female Participation</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {genderEquity.overallFemaleShare}%
            </div>
            <div className="text-[11px] text-teal-600 font-medium">
              Admin & Technical Roles: 36%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Capacity Building Female Share</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {genderEquity.trainingFemaleShare}%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              Community & POSH Sessions
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Equal Remuneration Assurance</span>
            <div className="text-lg font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5" /> 100% Certified
            </div>
            <div className="text-[11px] text-muted-foreground">
              No Wage Disparity Observed
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Total Data Quality Alerts</span>
            <div className="text-2xl font-bold text-amber-600">
              {dataQualityIssues.length}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Across 280 Submissions Ingested
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Evidence & Upload Completeness Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-teal-600" />
            Document & Evidence Completeness Score by Form Module (%)
          </CardTitle>
          <CardDescription className="text-xs">
            Assessing uploaded signed copies, third-party lab test reports, and geotagged photographs
          </CardDescription>
        </CardHeader>
        <CardContent className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleCompleteness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="module" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
              <Bar dataKey="score" name="Completeness %" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Exportable Data Quality Panel */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Data Quality Exceptions & Edge-Cases Inspection Register
              </CardTitle>
              <CardDescription className="text-xs">
                Surfacing blank client/manager fields, invalid timestamps, &gt;20% incomplete forms, and exceedances
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs gap-1.5 shrink-0">
              <Download className="w-3.5 h-3.5" /> Export Exceptions (CSV)
            </Button>
          </div>

          {/* Filter Bar within Data Quality */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search exceptions by ID, description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs rounded-lg"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {['All', 'Blank Customer', 'Unassigned Manager', 'Invalid Date', '>20% Blank Fields', 'Expired License', 'Exceedance'].map(t => (
                <Button
                  key={t}
                  variant={issueFilter === t ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIssueFilter(t)}
                  className="h-7 text-[11px] px-2"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-2.5 pl-4">Record ID</th>
                <th className="p-2.5">Form Module</th>
                <th className="p-2.5">Month</th>
                <th className="p-2.5">Issue Classification</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5 pr-4">Audit Finding Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredIssues.slice(0, 20).map((issue, idx) => {
                const rec = records.find(r => r.id === issue.record_id);
                return (
                  <tr
                    key={idx}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => rec && onSelectRecord(rec)}
                  >
                    <td className="p-2.5 pl-4 font-mono font-bold text-teal-600">{issue.record_id}</td>
                    <td className="p-2.5 font-medium">{issue.form_type}</td>
                    <td className="p-2.5 font-mono">{issue.reporting_month}</td>
                    <td className="p-2.5 font-semibold">{issue.issue_type}</td>
                    <td className="p-2.5">
                      <Badge
                        variant="outline"
                        className={
                          issue.severity === 'High'
                            ? 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                            : issue.severity === 'Medium'
                            ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-700 border-blue-500/30'
                        }
                      >
                        {issue.severity}
                      </Badge>
                    </td>
                    <td className="p-2.5 pr-4 text-muted-foreground">{issue.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-2.5 border-t text-[11px] text-muted-foreground text-center">
            Showing top {Math.min(20, filteredIssues.length)} of {filteredIssues.length} issues • Click any row to inspect record
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
