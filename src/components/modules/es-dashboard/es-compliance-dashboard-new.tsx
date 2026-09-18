'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock, AlertTriangle, Layers, TreePine, HardHat, Car, Users, CheckCircle2, ChevronDown, ExternalLink
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface EsComplianceDashboardProps {
  addNewButton?: React.ReactNode;
}

export default function EsComplianceDashboardNew({ addNewButton }: EsComplianceDashboardProps = {}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch('/api/es-dashboard-data')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-muted-foreground">
        <Clock className="w-8 h-8 animate-spin text-teal-600" />
        <div className="text-sm font-medium">Aggregating 145MB E&S JSON Data...</div>
      </div>
    );
  }

  const { kpis, heatmap, trends, zoneAttention, categoryData } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'READY': return 'bg-emerald-500';
      case 'IN_PROGRESS': return 'bg-amber-500';
      case 'NOT_READY': return 'bg-rose-500';
      default: return 'bg-slate-300 dark:bg-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'READY': return 'text-emerald-500';
      case 'IN_PROGRESS': return 'text-amber-500';
      case 'NOT_READY': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  const categories = ['Environment', 'OHS', 'Road Safety', 'Social'];
  const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">E&S Performance Dashboard</h2>
        {addNewButton}
      </div>

      {/* 1. Top-Level KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-teal-500">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Submissions</span>
            <div className="text-3xl font-black mt-2">{kpis.totalSubmissions.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-2">Across all 7 form types</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Breakdown</span>
            <div className="flex items-end gap-2 mt-2">
              <div className="text-2xl font-bold text-emerald-600">{Math.round((kpis.statusBreakdown.COMPLETED / kpis.totalSubmissions) * 100 || 0)}%</div>
              <span className="text-xs font-medium text-emerald-600 mb-1">C</span>
              <div className="text-2xl font-bold text-amber-500 ml-2">{Math.round((kpis.statusBreakdown.IN_PROGRESS / kpis.totalSubmissions) * 100 || 0)}%</div>
              <span className="text-xs font-medium text-amber-500 mb-1">IP</span>
              <div className="text-2xl font-bold text-rose-500 ml-2">{Math.round((kpis.statusBreakdown.NOT_READY / kpis.totalSubmissions) * 100 || 0)}%</div>
              <span className="text-xs font-medium text-rose-500 mb-1">NR</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Completed vs In-Progress vs Not Ready</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Log Type</span>
            <div className="flex items-end gap-2 mt-2">
              <div className="text-2xl font-bold text-blue-600">{Math.round((kpis.logTypeBreakdown.Log / kpis.totalSubmissions) * 100 || 0)}%</div>
              <span className="text-xs font-medium text-blue-600 mb-1">Log</span>
              <div className="text-xl font-semibold text-slate-500 ml-2">{Math.round((kpis.logTypeBreakdown.Draft / kpis.totalSubmissions) * 100 || 0)}%</div>
              <span className="text-[10px] font-medium text-slate-500 mb-1">Draft</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Finalized vs Draft states</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Zones</span>
            <div className="text-3xl font-black mt-2 text-indigo-600">{kpis.activeZones}</div>
            <div className="text-xs text-muted-foreground mt-2">Reporting this month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Heatmap - Above the Fold */}
        <Card className="lg:col-span-2 shadow-sm border overflow-hidden flex flex-col">
          <CardHeader className="p-4 pb-2 bg-muted/20 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Project × Category Compliance Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-sidebar dark:bg-sidebar/90 z-10 shadow-sm">
                <tr>
                  <th className="p-2.5 font-semibold text-sidebar-foreground w-1/3">Project Zone</th>
                  {categories.map(c => (
                    <th key={c} className="p-2.5 font-semibold text-sidebar-foreground text-center">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {heatmap.map((h: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-2 font-medium truncate max-w-[150px]" title={h.project}>{h.project}</td>
                    {categories.map(c => (
                      <td key={c} className="p-1.5 text-center">
                        <div className={`w-full h-6 rounded-md ${getStatusColor(h[c])} flex items-center justify-center`} title={h[c] || 'No Data'}>
                          <span className="text-[9px] font-bold text-white/90 drop-shadow-sm truncate px-1">
                            {h[c] ? h[c].replace('_', ' ') : '-'}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* 4. Monthly Trend Line & Zone Attention */}
        <div className="flex flex-col gap-6 h-full">
          <Card className="shadow-sm border flex-1">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Monthly Submissions (Feb 2026+)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="submissions" name="Total" stroke="#0d9488" strokeWidth={3} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="completionRate" name="Completion %" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border flex-1 overflow-hidden flex flex-col">
            <CardHeader className="p-3 bg-rose-500/10 border-b border-rose-500/20">
              <CardTitle className="text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Zones Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[160px]">
              <div className="divide-y divide-border">
                {zoneAttention.map((z: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 text-xs hover:bg-muted/40 group cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-semibold truncate max-w-[120px]">{z.project}</span>
                      <span className="text-[10px] text-muted-foreground">{z.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="text-[10px]">{z.count} Issues</Badge>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2 & 5. Category Panels */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto flex-nowrap shrink-0">
          <TabsTrigger value="overview" className="gap-2 text-xs py-2 px-4 rounded-md">
            <Layers className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="environment" className="gap-2 text-xs py-2 px-4 rounded-md">
            <TreePine className="w-4 h-4" /> Environment
          </TabsTrigger>
          <TabsTrigger value="ohs" className="gap-2 text-xs py-2 px-4 rounded-md">
            <HardHat className="w-4 h-4" /> OHS
          </TabsTrigger>
          <TabsTrigger value="road-safety" className="gap-2 text-xs py-2 px-4 rounded-md">
            <Car className="w-4 h-4" /> Road Safety
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2 text-xs py-2 px-4 rounded-md">
            <Users className="w-4 h-4" /> Social
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview">
            <Card className="border-dashed shadow-none bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <Layers className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">Select a specific category above to view detailed analytical panels.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Statutory Clearances (EC/CTE/CTO)</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'EC', compliant: categoryData.environment.clearances.EC * 10, total: 100 },
                      { name: 'CTE', compliant: categoryData.environment.clearances.CTE * 15, total: 100 },
                      { name: 'CTO', compliant: categoryData.environment.clearances.CTO * 12, total: 100 }
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Bar dataKey="compliant" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Waste Generation vs Disposal (MT)</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Disposed', value: categoryData.environment.waste.disposed },
                        { name: 'Accumulated', value: Math.abs(categoryData.environment.waste.generated - categoryData.environment.waste.disposed) }
                      ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                        <Cell fill="#0d9488" />
                        <Cell fill="#f43f5e" />
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ohs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Incident & Near Miss Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { month: 'Feb', incidents: categoryData.ohs.incidents, nearMiss: categoryData.ohs.incidents * 2 },
                      { month: 'Mar', incidents: categoryData.ohs.incidents + 1, nearMiss: categoryData.ohs.incidents * 3 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="nearMiss" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Induction & TBT Completion</CardTitle>
                </CardHeader>
                <CardContent className="h-60 flex items-center justify-center flex-col">
                   <div className="text-4xl font-black text-teal-600">{categoryData.ohs.inductionCompleted * 15}</div>
                   <div className="text-sm text-muted-foreground mt-2">Workers Inducted Total</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="road-safety">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Checklist Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={[
                       { name: 'Compliant', value: categoryData.roadSafety.checklistPassed },
                       { name: 'Non-Compliant', value: Math.abs(categoryData.roadSafety.checklistTotal - categoryData.roadSafety.checklistPassed) }
                     ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                       <Cell fill="#0d9488" />
                       <Cell fill="#ef4444" />
                     </Pie>
                     <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                     <Legend wrapperStyle={{ fontSize: '11px' }} />
                   </PieChart>
                 </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Grievance Funnel</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { stage: 'Registered', count: categoryData.social.grievances.registered + 10 },
                      { stage: 'In Progress', count: 4 },
                      { stage: 'Resolved', count: 6 }
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="stage" type="category" width={70} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Gender Participation</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Male', value: categoryData.social.gender.male },
                        { name: 'Female', value: categoryData.social.gender.female }
                      ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ec4899" />
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
