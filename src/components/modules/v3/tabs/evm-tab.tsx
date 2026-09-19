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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ProjectData,
  DomainAggregatesMonth,
  AirStation,
  NoiseStation,
  SoilStation,
} from "../v3-types";

interface EvmTabProps {
  projects: ProjectData[];
  month: string;
  domainAggregates?: DomainAggregatesMonth;
  onSelectProject: (p: ProjectData) => void;
}

export function EvmTab({
  projects,
  month,
  domainAggregates,
  onSelectProject,
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
  const noiseStations: NoiseStation[] =
    evmAgg?.noise_stations?.slice(0, 8) || [];
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

  return (
    <div className="flex flex-col gap-3">
      {/* Top Split: Visual A (Statutory Tracking Stacked Table) + Visual D (Water & Wastewater) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Visual A: Stacked Bar Table: Statutory Compliance Tracking */}
        <Card className="lg:col-span-2 border shadow-xs rounded-2xl shadow-sm border-border/40">
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

        {/* Visual D: Bar Chart / Cards: Water & Wastewater */}
        <Card className="border shadow-xs flex flex-col justify-between rounded-2xl shadow-sm border-border/40">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Water & Wastewater Management
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reuse % = (Reused / Generated) * 100 (
              {waterWW.wastewater.reuse_pct}%)
            </p>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-4">
            {/* Water Consumption Breakdown */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground">
                Water Consumption ({waterWW.consumption.total} KLD)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 border rounded-md bg-card">
                  <span className="text-[10px] text-muted-foreground">
                    Construction
                  </span>
                  <div className="font-bold text-foreground mt-0.5">
                    {waterWW.consumption.construction} KLD
                  </div>
                </div>
                <div className="p-2 border rounded-md bg-card">
                  <span className="text-[10px] text-muted-foreground">
                    Domestic
                  </span>
                  <div className="font-bold text-foreground mt-0.5">
                    {waterWW.consumption.domestic} KLD
                  </div>
                </div>
                <div className="p-2 border rounded-md bg-card">
                  <span className="text-[10px] text-muted-foreground">
                    Dust Suppr.
                  </span>
                  <div className="font-bold text-foreground mt-0.5">
                    {waterWW.consumption.dust_suppression} KLD
                  </div>
                </div>
              </div>
            </div>

            {/* Wastewater Treatment & Reuse */}
            <div className="flex flex-col gap-2 border-t pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Wastewater Reuse Ratio
                </span>
                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 font-mono">
                  {waterWW.wastewater.reuse_pct}% Reused
                </Badge>
              </div>
              <Progress
                value={waterWW.wastewater.reuse_pct}
                className="h-2.5 [&>div]:bg-blue-500"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  Generated: <strong>{waterWW.wastewater.generated} KLD</strong>
                </span>
                <span>
                  Treated: <strong>{waterWW.wastewater.treated} KLD</strong>
                </span>
                <span>
                  Reused: <strong>{waterWW.wastewater.reused} KLD</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Split: Visual C (Air Quality Latest Table) + Visual E (Waste Management 15 Types) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Visual C: Table: Air Quality Monitoring (Latest Results) with Red Bold ▲ Alerts */}
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
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-2.5 font-semibold text-foreground">
                      Station
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      PM10 (100)
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      PM2.5 (60)
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      SO2 (80)
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      NOx (80)
                    </th>
                    <th className="p-2.5 font-semibold text-center text-foreground">
                      CO (2.0)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {airStations.map((stn, idx) => {
                    const isPm10Exc = stn.pm10 !== null && stn.pm10 > 100;
                    const isPm25Exc = stn.pm25 !== null && stn.pm25 > 60;
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-muted/30 ${stn.exceedance ? "bg-rose-500/5" : ""}`}
                      >
                        <td className="p-2.5">
                          <span className="font-semibold text-foreground">
                            {stn.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            {stn.projectName}
                          </span>
                        </td>
                        <td
                          className={`p-2.5 text-center font-mono ${isPm10Exc ? "text-rose-600 font-bold bg-rose-500/10" : ""}`}
                        >
                          {stn.pm10 ?? "-"} {isPm10Exc ? " ▲" : ""}
                        </td>
                        <td
                          className={`p-2.5 text-center font-mono ${isPm25Exc ? "text-rose-600 font-bold bg-rose-500/10" : ""}`}
                        >
                          {stn.pm25 ?? "-"} {isPm25Exc ? " ▲" : ""}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {stn.so2 ?? "-"}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {stn.nox ?? "-"}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {stn.co ?? "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Visual E: Horizontal Bar Chart: Waste Management (15 Types) */}
        <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-primary" />
              Waste Management (15 Regulated Categories)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generated vs Disposed quantities sorted by highest volume
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="max-h-[320px] overflow-y-auto flex flex-col gap-3 pr-2">
              {wasteList.map((w, idx) => {
                const dispPct = Math.min(
                  100,
                  Math.round((w.disposed / Math.max(1, w.generated)) * 100),
                );
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {w.type}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {w.disposed.toLocaleString()} /{" "}
                        {w.generated.toLocaleString()} {w.unit} ({dispPct}%)
                      </span>
                    </div>
                    <Progress
                      value={dispPct}
                      className="h-2 [&>div]:bg-emerald-500"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Middle Split: Visual B (SVG Geographic Map) + Station Inspection Side-Panel */}
      <Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">
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
    </div>
  );
}
