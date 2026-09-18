'use client'

import React from 'react'
import {
  Leaf,
  Wind,
  Volume2,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectData } from '../v3-types'

interface EvmTabProps {
  projects: ProjectData[]
  month: string
  onSelectProject: (p: ProjectData) => void
}

export function EvmTab({ projects, month, onSelectProject }: EvmTabProps) {
  // Aggregate all air stations for this month
  const allAirStations: Array<{
    projectName: string
    projectId: string
    contractor: string
    code: string
    name: string
    gps: string
    pm10: number | null
    pm25: number | null
    so2: number | null
    nox: number | null
    co: number | null
    exceedance: boolean
  }> = []

  let totalExceedances = 0
  let validStationsCount = 0
  let validNoiseCount = 0
  let cteYesCount = 0
  let ctoYesCount = 0
  let ecYesCount = 0

  projects.forEach((p) => {
    const mData = p.months_data[month]
    if (mData?.has_submission && mData.evm) {
      const evm = mData.evm
      if (evm.statutory.CTE === 'Yes') cteYesCount++
      if (evm.statutory.CTO === 'Yes') ctoYesCount++
      if (evm.statutory.EC === 'Yes') ecYesCount++

      evm.air_stations.forEach((stn) => {
        validStationsCount++
        if (stn.exceedance) totalExceedances++
        allAirStations.push({
          projectName: p.name,
          projectId: p.id,
          contractor: p.contractor,
          ...stn
        })
      })

      validNoiseCount += evm.noise_stations.length
    }
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner: Statutory & Standards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium">Air Stations Monitored</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{validStationsCount} Stations</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                <span className={totalExceedances > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                  {totalExceedances} Exceedances
                </span> detected
              </div>
            </div>
            <Wind className="w-6 h-6 text-primary/70 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium">Consent to Establish (CTE)</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{cteYesCount} Approved</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Plants & Quarry Facilities</div>
            </div>
            <FileCheck className="w-6 h-6 text-emerald-500/70 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium">Consent to Operate (CTO)</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{ctoYesCount} Approved</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Active Operations Verified</div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-blue-500/70 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium">Noise Monitoring</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{validNoiseCount} Points</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Commercial Limit ≤ 75 dB(A)</div>
            </div>
            <Volume2 className="w-6 h-6 text-amber-500/70 shrink-0" />
          </CardContent>
        </Card>
      </div>

      {/* Main Air Quality Stations Table */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              Ambient Air Quality Monitoring Records ({month})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Parameters compared against CPCB / APPCB National Ambient Air Quality Standards (NAAQS)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground font-mono">
              Limits: PM10 ≤ 100 µg/m³ | PM2.5 ≤ 60 µg/m³ | SO2 ≤ 80 | NOx ≤ 80 | CO ≤ 2.0 mg/m³
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 sticky top-0 z-10 border-b">
                <tr>
                  <th className="p-3 font-semibold text-foreground">Project / Zone</th>
                  <th className="p-3 font-semibold text-foreground">Contractor</th>
                  <th className="p-3 font-semibold text-foreground">Station Name</th>
                  <th className="p-3 font-semibold text-foreground">GPS Location</th>
                  <th className="p-3 font-semibold text-center text-foreground">PM10 (≤100)</th>
                  <th className="p-3 font-semibold text-center text-foreground">PM2.5 (≤60)</th>
                  <th className="p-3 font-semibold text-center text-foreground">SO2 (≤80)</th>
                  <th className="p-3 font-semibold text-center text-foreground">NOx (≤80)</th>
                  <th className="p-3 font-semibold text-center text-foreground">CO (≤2.0)</th>
                  <th className="p-3 font-semibold text-center text-foreground">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allAirStations.length > 0 ? (
                  allAirStations.map((stn, idx) => {
                    const pm10Exceeded = stn.pm10 !== null && stn.pm10 > 100
                    const pm25Exceeded = stn.pm25 !== null && stn.pm25 > 60

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-muted/30 transition-colors ${stn.exceedance ? 'bg-rose-500/5' : ''}`}
                      >
                        <td className="p-3 font-medium text-foreground">
                          {stn.projectName}
                          <span className="text-[10px] text-muted-foreground font-mono block">{stn.projectId}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{stn.contractor}</td>
                        <td className="p-3 font-medium text-foreground">{stn.name}</td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                          {stn.gps ? (
                            <>
                              <MapPin className="w-3 h-3 text-primary shrink-0" />
                              <span>{stn.gps}</span>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className={`p-3 text-center font-mono ${pm10Exceeded ? 'text-rose-600 font-bold bg-rose-500/10 rounded-xs' : ''}`}>
                          {stn.pm10 ?? '-'}
                        </td>
                        <td className={`p-3 text-center font-mono ${pm25Exceeded ? 'text-rose-600 font-bold bg-rose-500/10 rounded-xs' : ''}`}>
                          {stn.pm25 ?? '-'}
                        </td>
                        <td className="p-3 text-center font-mono">{stn.so2 ?? '-'}</td>
                        <td className="p-3 text-center font-mono">{stn.nox ?? '-'}</td>
                        <td className="p-3 text-center font-mono">{stn.co ?? '-'}</td>
                        <td className="p-3 text-center">
                          {stn.exceedance ? (
                            <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px]">
                              Exceeded
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                              Normal
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground text-xs">
                      No environmental air quality stations logged for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
