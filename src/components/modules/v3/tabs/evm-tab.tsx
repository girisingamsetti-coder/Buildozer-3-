"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
const EVMMap = dynamic(() => import("./evm-map"), { ssr: false });
import {
  Leaf,
  Wind,
  Volume2,
  Droplets,
  Trash2,
  FileCheck,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AttentionCard } from '../attention-card';
import { ProjectData, DomainAggregatesMonth, AttentionItem,
  AirStation,
  NoiseStation,
  SoilStation,
} from "../v3-types";

interface EvmTabProps {
  projects: ProjectData[];
  month: string;
  domainAggregates?: DomainAggregatesMonth;
  onSelectProject: (p: ProjectData) => void;
  attentionItems: AttentionItem[];
}

export function EvmTab({
  projects,
  month,
  domainAggregates,
  onSelectProject,
  attentionItems,
}: EvmTabProps) {
  const evmAgg = domainAggregates?.evm;

  // Selected Monitoring Station for SVG Map side-panel
  const [selectedStation, setSelectedStation] = useState<any | null>({
    type: "Air Quality",
    code: "A1",
    name: "Rayapudi Air Monitor S1",
    pm10: 95,
    pm2_5: 42,
    so2: 12,
    nox: 24,
    exceedance: false,
    lat: 16.512,
    lng: 80.524,
    gps: "16.512, 80.524",
  });

  // Visual A: Statutory Tracking
  const statutory = evmAgg?.statutory || {
    "Environmental Clearance (EC)": {
      yes: 41,
      no: 1,
      na: 3,
      applied: 1,
      blank: 0,
    },
    "Consent to Establish (CTE) - Plants": {
      yes: 40,
      no: 2,
      na: 2,
      applied: 2,
      blank: 0,
    },
    "Consent to Operate (CTO) - Plants": {
      yes: 39,
      no: 3,
      na: 2,
      applied: 2,
      blank: 0,
    },
    "Groundwater SGWB Extraction Permission": {
      yes: 44,
      no: 0,
      na: 1,
      applied: 1,
      blank: 0,
    },
    "PESO Petroleum / Fuel Storage License": {
      yes: 38,
      no: 2,
      na: 4,
      applied: 2,
      blank: 0,
    },
    "APWALTA Tree Transit / Cutting Permission": {
      yes: 42,
      no: 1,
      na: 2,
      applied: 1,
      blank: 0,
    },
    "Hazardous Waste Authorization (HWA)": {
      yes: 40,
      no: 2,
      na: 2,
      applied: 2,
      blank: 0,
    },
  };

  // Visual B: Map Stations
  const airStations: AirStation[] = evmAgg?.air_stations?.slice(0, 12) || [];
  const noiseStations: NoiseStation[] = evmAgg?.noise_stations?.slice(0, 8) || [];
  const validNoiseStations = (noiseStations || []).filter(s => s.leq !== null).sort((a, b) => (b.leq as number) - (a.leq as number));
  const topNoiseStations = validNoiseStations.slice(0, 6);
  const highestLeq = topNoiseStations.length > 0 ? topNoiseStations[0].leq : 0;
  const avgLeq = validNoiseStations.length > 0 ? (validNoiseStations.reduce((acc, curr) => acc + (curr.leq as number), 0) / validNoiseStations.length).toFixed(1) : 0;

  const soilStations: SoilStation[] = evmAgg?.soil_stations || [
    {
      code: "S1",
      name: "Rayapudi Soil Point 1",
      gps: "16.512, 80.524",
      lat: 16.512,
      lng: 80.524,
      status: "Normal",
    },
    {
      code: "S2",
      name: "Sakhamuru Reservoir Soil",
      gps: "16.535, 80.548",
      lat: 16.535,
      lng: 80.548,
      status: "Normal",
    },
    {
      code: "S3",
      name: "Amaravati Core Soil S3",
      gps: "16.558, 80.572",
      lat: 16.558,
      lng: 80.572,
      status: "Normal",
    },
  ];

  // Visual D: Water & Wastewater
  const waterWW = evmAgg?.water_wastewater || {
    consumption: {
      construction: 1420,
      domestic: 680,
      dust_suppression: 850,
      total: 2950,
    },
    wastewater: { generated: 540, treated: 480, reused: 420, reuse_pct: 77.8 },
  };

  // Visual E: Waste Management (15 Types)
  const wasteList = evmAgg?.waste || [];

  const trainingByMonth = [
    { month: "Jan 26", men: 108, women: 0, total: 108 },
    { month: "Feb 26", men: 1180, women: 253, total: 1433 },
    { month: "Mar 26", men: 720, women: 116, total: 836 },
    { month: "Apr 26", men: 1230, women: 97, total: 1327 },
    { month: "May 26", men: 980, women: 121, total: 1101 },
    { month: "Jun 26", men: 1690, women: 55, total: 1745 },
    { month: "Jul 26", men: 1160, women: 157, total: 1317 },
    { month: "Aug 26", men: 780, women: 48, total: 828 },
  ];

  const trainingGender = [
    { name: "Men", value: 7858, color: "#3b82f6", pct: "90%" },
    { name: "Women", value: 837, color: "#b9426f", pct: "10%" }
  ];


  const muckUsage = [
    { name: "Filled low-lying areas", value: 68900000, color: "#0d5c50", label: "68.9M", pct: "99%" },
    { name: "Raised site levels", value: 19074, color: "#f59e0b", label: "19,074", pct: "0.0%" },
    { name: "Unutilised", value: 476000, color: "#8b5cf6", label: "476k", pct: "0.7%" }
  ];

  const muckVolumes = [
    { label: "Muck generated", value: 69500000, display: "69.5M", color: "#0d5c50", max: 70000000 },
    { label: "Muck stored", value: 566000, display: "566k", color: "#e2e8f0", max: 70000000 },
    { label: "Muck disposed", value: 21014, display: "21,014", color: "#e2e8f0", max: 70000000 },
    { label: "Topsoil preserved", value: 5000000, display: "5M", color: "#0d5c50", max: 70000000 },
    { label: "Topsoil for greenery", value: 438000, display: "438k", color: "#e2e8f0", max: 70000000 }
  ];


  return (
    <div className="flex flex-col gap-3">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-1">
        {/* Card 1 */}
        <Card className="shadow-xs border-border/40 px-3 py-2.5 flex flex-col justify-between min-h-0">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Projects reporting</p>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">66</div>
          </div>
        </Card>
        {/* Card 2 */}
        <Card className="shadow-xs border-border/40 px-3 py-2.5 flex flex-col justify-between min-h-0">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium truncate">Statutory approvals in place</p>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">69%</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 truncate">Yes among applicable items</p>
          </div>
        </Card>
        {/* Card 3 */}
        <Card className="shadow-xs border-border/40 px-3 py-2.5 flex flex-col justify-between min-h-0">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium truncate">Air readings above limit</p>
            <div className="text-xl font-bold text-red-500 mt-0.5">14</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">of 4,235 readings</p>
          </div>
        </Card>
        {/* Card 4 */}
        <Card className="shadow-xs border-border/40 px-3 py-2.5 flex flex-col justify-between min-h-0">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Water consumed</p>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              30.7M <span className="text-[10px] font-normal text-muted-foreground">m³</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">cumulative</p>
          </div>
        </Card>
        {/* Card 5 */}
        <Card className="shadow-xs border-border/40 px-3 py-2.5 flex flex-col justify-between min-h-0">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium truncate">Wastewater treated</p>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">74%</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 truncate">of wastewater generated</p>
          </div>
        </Card>
        {/* Card 6 */}
        <Card className="shadow-xs border-border/40 px-3 py-2.5 flex flex-col justify-between min-h-0">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium truncate">Training participants</p>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">8,695</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">10% women</p>
          </div>
        </Card>
      </div>

      {/* Top Split: Statutory, Air Quality, and Noise */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Visual A: Stacked Bar Table: Statutory Compliance Tracking */}
        <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
          <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Statutory Compliance Tracking (Clearances & Permissions)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluation across all projects | "Applied" is never counted as
                compliant
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-md bg-emerald-500 inline-block" />{" "}
                Yes
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-md bg-rose-500 inline-block" />{" "}
                No
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-md bg-amber-500 inline-block" />{" "}
                Applied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-md bg-slate-300 inline-block" />{" "}
                NA
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[340px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-2.5 font-semibold text-foreground">
                      Statutory Approval / Act
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground w-36">
                      Response Ratio
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      Yes
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      No
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      Applied
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      NA
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      Blank
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Object.entries(statutory).map(([name, sdata], idx) => {
                    const total =
                      sdata.yes +
                        sdata.no +
                        sdata.applied +
                        sdata.na +
                        sdata.blank || 46;
                    const yW = (sdata.yes / total) * 100;
                    const nW = (sdata.no / total) * 100;
                    const aW = (sdata.applied / total) * 100;
                    const naW = (sdata.na / total) * 100;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-2.5 font-medium text-foreground">
                          {name}
                        </td>
                        <td className="p-2.5">
                          <div className="w-full h-3 rounded-full bg-muted/60 flex overflow-hidden">
                            <div
                              style={{ width: `${yW}%` }}
                              className="bg-emerald-500 h-full"
                              title={`Yes: ${sdata.yes}`}
                            />
                            <div
                              style={{ width: `${nW}%` }}
                              className="bg-rose-500 h-full"
                              title={`No: ${sdata.no}`}
                            />
                            <div
                              style={{ width: `${aW}%` }}
                              className="bg-amber-500 h-full"
                              title={`Applied: ${sdata.applied}`}
                            />
                            <div
                              style={{ width: `${naW}%` }}
                              className="bg-slate-300 h-full"
                              title={`NA: ${sdata.na}`}
                            />
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-600 font-mono">
                          {sdata.yes}
                        </td>
                        <td className="p-2.5 text-center font-bold text-rose-600 font-mono">
                          {sdata.no}
                        </td>
                        <td className="p-2.5 text-center font-medium text-amber-600 font-mono">
                          {sdata.applied}
                        </td>
                        <td className="p-2.5 text-center text-muted-foreground font-mono">
                          {sdata.na}
                        </td>
                        <td className="p-2.5 text-center text-muted-foreground font-mono">
                          {sdata.blank}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Visual C: Table: Air Quality Monitoring */}
        <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              Air Quality Monitoring (Latest Station Results)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Standards: PM10 &gt; 100, PM2.5 &gt; 60, SO2 &gt; 80, NOx &gt; 80,
              CO &gt; 2.0 | Alert: Red, Bold, and " ▲"
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[280px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-2.5 font-semibold text-foreground">Station</th>
                    <th className="p-2.5 font-semibold text-center text-foreground">PM10 (100)</th>
                    <th className="p-2.5 font-semibold text-center text-foreground">PM2.5 (60)</th>
                    <th className="p-2.5 font-semibold text-center text-foreground">SO2 (80)</th>
                    <th className="p-2.5 font-semibold text-center text-foreground">NOx (80)</th>
                    <th className="p-2.5 font-semibold text-center text-foreground">CO (2.0)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {airStations.map((stn, idx) => {
                    const isPm10Exc = stn.pm10 !== null && stn.pm10 > 100;
                    const isPm25Exc = stn.pm25 !== null && stn.pm25 > 60;
                    return (
                      <tr key={idx} className={`hover:bg-muted/30 ${stn.exceedance ? "bg-rose-500/5" : ""}`}>
                        <td className="p-2.5">
                          <span className="font-semibold text-foreground">{stn.name}</span>
                          <span className="text-[10px] text-muted-foreground block font-mono">{stn.projectName}</span>
                        </td>
                        <td className={`p-2.5 text-center font-mono ${isPm10Exc ? "text-rose-600 font-bold bg-rose-500/10" : ""}`}>
                          {stn.pm10 ?? "-"} {isPm10Exc ? " ▲" : ""}
                        </td>
                        <td className={`p-2.5 text-center font-mono ${isPm25Exc ? "text-rose-600 font-bold bg-rose-500/10" : ""}`}>
                          {stn.pm25 ?? "-"} {isPm25Exc ? " ▲" : ""}
                        </td>
                        <td className="p-2.5 text-center font-mono">{stn.so2 ?? "-"}</td>
                        <td className="p-2.5 text-center font-mono">{stn.nox ?? "-"}</td>
                        <td className="p-2.5 text-center font-mono">{stn.co ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Noise: Loudest Projects */}
        <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 flex flex-col">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              Noise: loudest projects
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Highest equivalent continuous sound level (Leq) recorded by each project.
            </p>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Average Leq</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avgLeq}</span>
                  <span className="text-[10px] text-muted-foreground">dB(A)</span>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Highest Leq</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{highestLeq}</span>
                  <span className="text-[10px] text-muted-foreground">dB(A)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-1 justify-center">
              {topNoiseStations.map((stn, idx) => {
                const pct = Math.min(100, Math.round(((stn.leq || 0) / 100) * 100));
                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-xs font-medium text-foreground truncate">
                        {stn.projectName || stn.name}
                      </div>
                      <div className="text-xs font-bold font-mono">
                        {stn.leq} <span className="text-[10px] font-normal text-muted-foreground">dB(A)</span>
                      </div>
                    </div>
                    <div className="pl-8">
                      <Progress value={pct} className="h-1.5 [&>div]:bg-teal-700 dark:[&>div]:bg-teal-600" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Muck, Soil and Waste Section */}
      <div className="flex flex-col gap-3 mt-4 mb-4">
        <div className="flex items-baseline gap-3 px-1">
          <h3 className="font-bold text-foreground text-lg">Muck, soil and waste</h3>
          <p className="text-xs text-muted-foreground">Cumulative figures from each project's latest report.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Card 1: How excavated muck was used */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                How excavated muck was used
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center gap-6 h-full justify-center">
              <div className="w-36 h-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={muckUsage}
                      innerRadius="70%"
                      outerRadius="90%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {muckUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">69.4M</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">m³ total</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-[240px]">
                {muckUsage.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-muted-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="font-bold text-foreground min-w-[40px]">{item.label}</span>
                      <span className="text-muted-foreground min-w-[30px]">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Muck and topsoil volumes */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Muck and topsoil volumes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-4">
              {muckVolumes.map((item, idx) => {
                const pct = (item.value / item.max) * 100;
                return (
                  <div key={idx} className="flex items-center gap-4 text-xs">
                    <span className="w-32 font-medium text-muted-foreground shrink-0">{item.label}</span>
                    <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                      <div className={`h-full rounded-full transition-all duration-500 ${item.color === '#e2e8f0' ? 'bg-slate-200 dark:bg-slate-700' : ''}`} style={{ width: `${Math.max(2, pct)}%`, backgroundColor: item.color === '#e2e8f0' ? 'currentColor' : item.color }} />
                    </div>
                    <span className="w-16 text-right font-bold text-foreground">{item.display}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Participants by month */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Participants by month
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <span className="w-2 h-2 rounded-sm bg-[#3b82f6]" /> Men
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#b9426f]" /> Women
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingByMonth} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  <Bar dataKey="men" stackId="a" fill="#3b82f6" maxBarSize={40} />
                  <Bar dataKey="women" stackId="a" fill="#b9426f" maxBarSize={40} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="total" position="top" offset={8} fill="#334155" fontSize={11} fontWeight={600} formatter={(v: any) => v ? v.toLocaleString() : ''} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Participants by gender */}
          <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground">
                Participants by gender
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center gap-6 h-full justify-center min-h-[300px]">
              <div className="w-40 h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trainingGender}
                      innerRadius="75%"
                      outerRadius="100%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {trainingGender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">8,695</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">participants</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-[240px]">
                {trainingGender.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="font-bold text-foreground">{item.value.toLocaleString()}</span>
                      <span className="text-muted-foreground w-8">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        
      </div>
      
      {/* Map and Solid Waste Split Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        {/* Middle Split: Visual B (SVG Geographic Map) + Station Inspection Side-Panel */}

      <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 w-full lg:w-[65%] h-full">
        <CardHeader className="px-4 py-1.5 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Geographic Map
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive plots for Air (AAQ), Noise (N), and Soil (S) stations.
              Click any point to inspect exact parameters.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{" "}
              Air (Normal)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />{" "}
              Air (Exceedance)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-blue-500 inline-block rounded-md" />{" "}
              Noise (dB)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-700 inline-block rounded-md" />{" "}
              Soil Point
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-2 flex flex-col lg:flex-row gap-3">
          {/* SVG Map Canvas */}
          <div className="flex-1 bg-slate-950/5 dark:bg-slate-900/40 rounded-xl border border-border/80 relative min-h-[600px] p-4 flex items-center justify-center overflow-hidden">
            {/* Background Map Contours (Amaravati River & Zone Grid) */}
            <EVMMap
              airStations={airStations}
              noiseStations={noiseStations}
              soilStations={soilStations}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
            />
          </div>

          {/* Interactive Side-Panel */}
          <div className="w-full lg:w-80 border rounded-xl p-4 bg-card flex flex-col justify-between shrink-0">
            {selectedStation ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-1 text-[10px]">
                      {selectedStation.type}
                    </Badge>
                    <h4 className="text-sm font-bold text-foreground">
                      {selectedStation.name}
                    </h4>
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      {selectedStation.code} •{" "}
                      {selectedStation.gps || "GPS Tagged"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedStation(null)}
                    className="h-6 w-6"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {selectedStation.type === "Air Quality" && (
                  <div className="flex flex-col gap-2 pt-2 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        PM10 (Limit &le; 100):
                      </span>
                      <span
                        className={`font-mono font-bold ${selectedStation.pm10 > 100 ? "text-rose-600" : "text-foreground"}`}
                      >
                        {selectedStation.pm10 ?? "-"} µg/m³{" "}
                        {selectedStation.pm10 > 100 ? "▲ (Exceeded)" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        PM2.5 (Limit &le; 60):
                      </span>
                      <span
                        className={`font-mono font-bold ${selectedStation.pm25 > 60 ? "text-rose-600" : "text-foreground"}`}
                      >
                        {selectedStation.pm25 ?? "-"} µg/m³{" "}
                        {selectedStation.pm25 > 60 ? "▲ (Exceeded)" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        SO2 (Limit &le; 80):
                      </span>
                      <span className="font-mono">
                        {selectedStation.so2 ?? "-"} µg/m³
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        NOx (Limit &le; 80):
                      </span>
                      <span className="font-mono">
                        {selectedStation.nox ?? "-"} µg/m³
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        CO (Limit &le; 2.0):
                      </span>
                      <span className="font-mono">
                        {selectedStation.co ?? "-"} mg/m³
                      </span>
                    </div>
                    <div className="p-2 rounded-md bg-muted/40 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        Project: <strong>{selectedStation.projectName}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {selectedStation.type === "Noise Monitoring" && (
                  <div className="flex flex-col gap-2 pt-2 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Day Leq (Limit &le; 75):
                      </span>
                      <span className="font-mono font-bold">
                        {selectedStation.lday ?? selectedStation.leq ?? "-"}{" "}
                        dB(A)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Night Leq (Limit &le; 70):
                      </span>
                      <span className="font-mono font-bold">
                        {selectedStation.lnight ?? "-"} dB(A)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lmax:</span>
                      <span className="font-mono">
                        {selectedStation.lmax ?? "-"} dB(A)
                      </span>
                    </div>
                  </div>
                )}

                {selectedStation.type === "Soil Sampling" && (
                  <div className="flex flex-col gap-2 pt-2 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Soil Quality:
                      </span>
                      <span className="font-bold text-emerald-600">
                        Compliant (Baseline)
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Heavy metals & pH within prescribed agricultural standards
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-xs my-auto flex flex-col items-center">
                <Info className="w-8 h-8 text-muted-foreground/60 mb-2" />
                <span className="font-medium text-foreground">
                  Click a Station Node
                </span>
                <span className="text-[11px] mt-1">
                  Select any point on the SVG map to view real-time sensor
                  parameters against standards.
                </span>
              </div>
            )}
            <span className="text-[10px] text-muted-foreground text-center border-t pt-2 block">
              APCRDA Environmental GIS Layer
            </span>
          </div>
        </CardContent>
      </Card>
        
        {/* Card 3: Solid waste: generated vs disposed */}
        <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 w-full lg:w-[35%] h-full">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground">
              Solid waste: generated vs disposed
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Units differ by waste type, so each row has its own scale.
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0d5c50]" /> Generated
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#eab308]" /> Disposed
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="max-h-[380px] overflow-y-auto pr-4 flex flex-col gap-4">
              {wasteList.map((w, idx) => {
                const maxVal = Math.max(w.generated, w.disposed, 1);
                const genPct = (w.generated / maxVal) * 100;
                const dispPct = (w.disposed / maxVal) * 100;
                
                const formatVal = (val: number) => {
                  if(val >= 1000000) return (val/1000000).toFixed(1) + 'M';
                  if(val >= 1000) return Math.round(val/1000) + 'k';
                  return val.toLocaleString();
                };

                return (
                  <div key={idx} className="flex items-center gap-4 text-xs group">
                    <span className="w-[300px] font-medium text-muted-foreground shrink-0 truncate" title={w.type}>
                      {w.type} ({w.unit})
                    </span>
                    <div className="flex-1 flex flex-col justify-center gap-1">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                        <div className="h-full bg-[#0d5c50] rounded-full" style={{ width: `${genPct}%` }} />
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                        <div className="h-full bg-[#eab308] rounded-full" style={{ width: `${dispPct}%` }} />
                      </div>
                    </div>
                    <span className="w-[100px] text-right font-medium text-foreground shrink-0">
                      {formatVal(w.generated)} / {formatVal(w.disposed)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>


</div>
  );
}
