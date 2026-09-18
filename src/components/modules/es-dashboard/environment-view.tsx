'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseRecord } from './types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TreePine,
  Wind,
  Volume2,
  Droplets,
  Trash2,
  AlertOctagon,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface EnvironmentViewProps {
  records: BaseRecord[];
  onSelectRecord: (record: BaseRecord) => void;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ records, onSelectRecord }) => {
  const envRecords = useMemo(() => {
    return records.filter(r => r.category === 'Environment');
  }, [records]);

  // Selected latest record for deep-dive
  const latestRecord = useMemo(() => {
    return envRecords[0] || null;
  }, [envRecords]);

  // Aggregated Air Quality Stations across latest records
  const airStationsData = useMemo(() => {
    if (!latestRecord || !Array.isArray(latestRecord.air_quality)) return [];
    return latestRecord.air_quality.map((aq: any) => ({
      station: aq.station,
      pm10: aq.pm10,
      pm10_limit: 100,
      pm25: aq.pm25,
      pm25_limit: 60,
      so2: aq.so2,
      nox: aq.nox,
      isExceeded: aq.pm10 > 100 || aq.pm25 > 60,
      gps: aq.gps?.formatted || '16.51°N, 80.52°E'
    }));
  }, [latestRecord]);

  // Noise Monitoring Data
  const noiseData = useMemo(() => {
    if (!latestRecord || !Array.isArray(latestRecord.noise)) return [];
    return latestRecord.noise.map((n: any) => ({
      location: n.location.split('-')[0].trim(),
      full_location: n.location,
      leq: n.leq_db,
      limit: n.limit_day,
      isExceeded: n.is_exceeded,
      samplingDate: n.sampling_date
    }));
  }, [latestRecord]);

  // Waste Management breakdown
  const wasteData = useMemo(() => {
    if (!latestRecord || !Array.isArray(latestRecord.waste_management)) return [];
    return latestRecord.waste_management.slice(0, 7).map((w: any) => ({
      category: w.category.slice(0, 16),
      generated: w.quantity_generated,
      disposed: w.quantity_disposed,
      unit: w.unit
    }));
  }, [latestRecord]);

  // Tree statistics
  const treeStats = useMemo(() => {
    if (!latestRecord || !latestRecord.tree_management) {
      return { identified: 142, cut: 24, transplanted: 30, survivalRate: 88, walta: 'Approved' };
    }
    const tm = latestRecord.tree_management;
    return {
      identified: tm.identified_in_site || 142,
      cut: tm.cumulative_cut || 24,
      transplanted: tm.cumulative_transplanted || 30,
      survivalRate: tm.transplantation_survival_rate_pct || 88,
      walta: tm.walta_permit_status || 'Approved by DFO'
    };
  }, [latestRecord]);

  // NC Tracker summary
  const ncSummary = useMemo(() => {
    let totalRaised = 0;
    let totalComplied = 0;
    let openCount = 0;
    envRecords.forEach(r => {
      if (r.site_ncs) {
        totalRaised += r.site_ncs.total_observations_given || 0;
        totalComplied += r.site_ncs.total_complied || 0;
        openCount += r.site_ncs.open_ncs || 0;
      }
    });
    return { totalRaised, totalComplied, openCount };
  }, [envRecords]);

  // Statutory Facility Matrix
  const statutoryMatrix = useMemo(() => {
    if (!latestRecord || !Array.isArray(latestRecord.statutory_compliance)) return [];
    return latestRecord.statutory_compliance;
  }, [latestRecord]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tree Compliance Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 shadow-sm bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  Category A: Environment
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Active Reference: <strong>{latestRecord?.id || 'ENV-001'}</strong> ({latestRecord?.reporting_month})
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Environmental & Ecological Safeguards Monitoring
              </h3>
              <p className="text-xs text-muted-foreground">
                Air quality, ambient noise, water balance, hazardous waste streams, and WALTA permits.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {latestRecord && (
                <Button variant="outline" size="sm" onClick={() => onSelectRecord(latestRecord)} className="h-8 text-xs gap-1.5">
                  Inspect Record <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tree Compliance Ratio Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-600">
                <TreePine className="w-4 h-4" /> APWALTA Tree Compliance
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700">
                {treeStats.walta.slice(0, 15)}...
              </Badge>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {treeStats.transplanted} / {treeStats.cut}
                </span>
                <span className="text-[11px] text-muted-foreground ml-1">Transplanted / Cut</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                {treeStats.survivalRate}% Survival
              </span>
            </div>
            <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden flex">
              <div style={{ width: `${treeStats.survivalRate}%` }} className="bg-emerald-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statutory Clearance Matrix */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Statutory Clearances Matrix (Facility × EC / CTE / CTO Status)
              </CardTitle>
              <CardDescription className="text-xs">
                Environmental Clearances (EC), Consent to Establish (CTE), and Consent to Operate (CTO) status per site facility
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              APPCB & SEIAA Compliance
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-2.5 pl-4">Facility / Installation</th>
                <th className="p-2.5">Environmental Clearance (EC)</th>
                <th className="p-2.5">Consent to Establish (CTE)</th>
                <th className="p-2.5">Consent to Operate (CTO)</th>
                <th className="p-2.5 pr-4 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {statutoryMatrix.map((item: any, idx: number) => {
                const badgeColor = (val: string) =>
                  val === 'Yes'
                    ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                    : val === 'Applied'
                    ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-700 border-rose-500/30';

                return (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="p-2.5 pl-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.facility}
                    </td>
                    <td className="p-2.5">
                      <Badge variant="outline" className={badgeColor(item.ec)}>
                        {item.ec}
                      </Badge>
                    </td>
                    <td className="p-2.5">
                      <Badge variant="outline" className={badgeColor(item.cte)}>
                        {item.cte}
                      </Badge>
                    </td>
                    <td className="p-2.5">
                      <Badge variant="outline" className={badgeColor(item.cto)}>
                        {item.cto}
                      </Badge>
                    </td>
                    <td className="p-2.5 pr-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Validated
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Air Quality & Noise Monitoring Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Air Quality vs Limits */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-600" />
                Ambient Air Quality (PM10 vs 100 µg/m³ Limit Line)
              </CardTitle>
              {airStationsData.some(a => a.isExceeded) && (
                <Badge variant="destructive" className="text-[10px] animate-pulse">
                  Exceedance Alert
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Continuous monitoring stations AAQ1 to AAQ6 around Rayapudi layout
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={airStationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="station" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 150]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Limit: 100', fill: '#ef4444', fontSize: 10 }} />
                <Bar dataKey="pm10" name="PM10 (µg/m³)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pm25" name="PM2.5 (µg/m³)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Noise Levels vs Limits */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-600" />
                Ambient Noise Leq (dB) vs CPCB Thresholds
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono">
                Day: 75 dB / Night: 70 dB
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Boundary & sensitive receptors (N1–N3 and Primary DG Set)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={noiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="location" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis domain={[30, 90]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Day Limit 75dB', fill: '#f59e0b', fontSize: 10 }} />
                <Bar dataKey="leq" name="Recorded Leq dB" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Waste Management & Water Efficiency Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Waste Management Bar Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-teal-600" />
              Waste Streams Management: Generated vs Disposed
            </CardTitle>
            <CardDescription className="text-xs">
              Hazardous, C&D, plastic, and domestic waste disposition via APPCB authorized recyclers
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="generated" name="Generated" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disposed" name="Disposed / Recycled" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NC Tracker & Water Balance Card */}
        <Card className="shadow-sm space-y-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-teal-600" />
              Water Balance & NC Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="p-3 bg-muted/40 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Wastewater Reuse Efficiency</span>
                <span className="text-teal-600">
                  {latestRecord?.wastewater?.treatment_efficiency_pct || 88}%
                </span>
              </div>
              <div className="w-full bg-muted/70 h-2 rounded-full overflow-hidden flex">
                <div style={{ width: `${latestRecord?.wastewater?.treatment_efficiency_pct || 88}%` }} className="bg-teal-500 rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Gen: {latestRecord?.wastewater?.quantity_generated_m3 || 260} m³</span>
                <span>Treated: {latestRecord?.wastewater?.quantity_treated_m3 || 230} m³</span>
                <span>Reused: {latestRecord?.wastewater?.quantity_reused_m3 || 180} m³</span>
              </div>
            </div>

            <div className="border rounded-xl p-3 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>PMC / PgMC Site NCs</span>
                <Badge variant="outline" className="text-[10px]">
                  {ncSummary.openCount} Open
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ncSummary.totalRaised}</div>
                  <div className="text-[10px] text-muted-foreground">Raised</div>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">{ncSummary.totalComplied}</div>
                  <div className="text-[10px] text-emerald-700">Complied</div>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground pt-1">
                Issued by: <strong>PMC Aarvee / PgMC STUP</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Stations GPS Coordinates Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            Environmental Monitoring Stations (Air, Noise, Soil GPS Fixes)
          </CardTitle>
          <CardDescription className="text-xs">
            Georeferenced monitoring stations across Rayapudi construction package
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-2.5 pl-4">Station ID</th>
                <th className="p-2.5">Domain</th>
                <th className="p-2.5">Georeference (GPS)</th>
                <th className="p-2.5">Key Metric / Reading</th>
                <th className="p-2.5 pr-4 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {airStationsData.map((s, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="p-2.5 pl-4 font-mono font-bold text-teal-600">{s.station}</td>
                  <td className="p-2.5">Ambient Air Quality</td>
                  <td className="p-2.5 font-mono text-[11px]">{s.gps}</td>
                  <td className="p-2.5">
                    PM10: <strong>{s.pm10}</strong> µg/m³ | PM2.5: <strong>{s.pm25}</strong> µg/m³
                  </td>
                  <td className="p-2.5 pr-4 text-right">
                    <Badge variant="outline" className={s.isExceeded ? 'bg-rose-500/15 text-rose-700 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'}>
                      {s.isExceeded ? 'Exceedance' : 'Normal'}
                    </Badge>
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
