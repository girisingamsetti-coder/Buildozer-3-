'use client'

import React from 'react'
import {
  X,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  HardHat,
  Car,
  Leaf,
  Users,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProjectData } from './v3-types'

interface V3ProjectDrawerProps {
  project: ProjectData | null
  month: string
  open: boolean
  onClose: () => void
}

export function V3ProjectDrawer({ project, month, open, onClose }: V3ProjectDrawerProps) {
  if (!project) return null

  const mData = project.months_data[month]
  const hasSubmission = mData?.has_submission
  const rs = mData?.road_safety
  const ohs = mData?.ohs
  const evm = mData?.evm
  const social = mData?.social

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl md:max-w-3xl overflow-y-auto p-0 flex flex-col gap-0">
        {/* Header */}
        <div className="p-5 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-[11px] bg-background">
                  {project.id}
                </Badge>
                {hasSubmission ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px]">
                    ● Submitted for {month}
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[11px]">
                    ✕ Submission Missing for {month}
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                {project.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Contractor: <strong className="text-foreground">{project.contractor}</strong>
                </span>
                <span>•</span>
                <span>PMC: {project.pmc}</span>
                <span>•</span>
                <span>Reporting Cycles: {project.active_months.join(', ')}</span>
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          {!hasSubmission ? (
            <div className="p-8 text-center border rounded-xl bg-muted/20 my-auto">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">No Submission for {month}</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                The contractor ({project.contractor}) has not submitted monthly E&S compliance logs for this cycle. 
                Please inspect previous months or issue a formal submission notice.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="summary" className="flex flex-col gap-4">
              <TabsList className="grid grid-cols-5 w-full h-9 bg-muted/60 p-1">
                <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                <TabsTrigger value="road" className="text-xs">Road Safety</TabsTrigger>
                <TabsTrigger value="evm" className="text-xs">Environment</TabsTrigger>
                <TabsTrigger value="ohs" className="text-xs">OHS</TabsTrigger>
                <TabsTrigger value="social" className="text-xs">Social & Labor</TabsTrigger>
              </TabsList>

              {/* 1. Summary Tab */}
              <TabsContent value="summary" className="flex flex-col gap-4 m-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-[11px] text-muted-foreground uppercase font-medium">Road Safety</span>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {rs?.compliance_pct !== null ? `${rs?.compliance_pct}%` : 'N/A'}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{rs?.yes_count || 0} of {rs?.total_items || 0} Passed</span>
                  </div>

                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-[11px] text-muted-foreground uppercase font-medium">OHS Safeguards</span>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {ohs?.compliance_pct}%
                    </div>
                    <span className="text-[10px] text-muted-foreground">TBT: {ohs?.tbt}</span>
                  </div>

                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-[11px] text-muted-foreground uppercase font-medium">Environment</span>
                    <div className={`text-lg font-bold mt-1 ${evm?.exceedance_count ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {evm?.exceedance_count ? `${evm.exceedance_count} Violations` : 'Compliant'}
                    </div>
                    <span className="text-[10px] text-muted-foreground">CTE: {evm?.statutory.CTE}, CTO: {evm?.statutory.CTO}</span>
                  </div>

                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-[11px] text-muted-foreground uppercase font-medium">Workforce</span>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {social?.workforce.total || 0}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{social?.workforce.local_pct}% Local Workers</span>
                  </div>
                </div>

                {/* Statutory Permissions status */}
                <div className="border rounded-xl p-4 bg-card">
                  <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
                    Statutory Environmental & Safety Clearances
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-md bg-muted/40 border">
                      <div className="text-[11px] text-muted-foreground">Environmental Clearance (EC)</div>
                      <div className="font-semibold text-foreground mt-0.5">{evm?.statutory.EC || 'NA'}</div>
                    </div>
                    <div className="p-2.5 rounded-md bg-muted/40 border">
                      <div className="text-[11px] text-muted-foreground">Consent to Establish (CTE)</div>
                      <div className="font-semibold text-foreground mt-0.5">{evm?.statutory.CTE || 'NA'}</div>
                    </div>
                    <div className="p-2.5 rounded-md bg-muted/40 border">
                      <div className="text-[11px] text-muted-foreground">Consent to Operate (CTO)</div>
                      <div className="font-semibold text-foreground mt-0.5">{evm?.statutory.CTO || 'NA'}</div>
                    </div>
                    <div className="p-2.5 rounded-md bg-muted/40 border">
                      <div className="text-[11px] text-muted-foreground">Groundwater SGWB</div>
                      <div className="font-semibold text-foreground mt-0.5">{evm?.statutory.Groundwater_SGWB || 'NA'}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 2. Road Safety Tab */}
              <TabsContent value="road" className="flex flex-col gap-3 m-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    19-Point Road Safety Checklist Audit
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Compliance: {rs?.compliance_pct !== null ? `${rs?.compliance_pct}%` : 'N/A'}
                  </Badge>
                </div>

                <div className="border rounded-xl divide-y overflow-hidden text-xs bg-card">
                  {rs?.items && rs.items.length > 0 ? (
                    rs.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-start justify-between gap-3 hover:bg-muted/20">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.item}</p>
                          {item.remarks && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                              Remarks: {item.remarks}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={
                            item.answer.toLowerCase() === 'yes'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                          }
                        >
                          {item.answer || 'Not Reported'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-xs">
                      No Road Safety checklist records for this month.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 3. EVM Tab */}
              <TabsContent value="evm" className="flex flex-col gap-4 m-0">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Ambient Air Quality Monitoring Stations
                </h4>
                <div className="border rounded-xl overflow-hidden bg-card">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/60 border-b">
                      <tr>
                        <th className="p-2.5 font-medium">Station</th>
                        <th className="p-2.5 font-medium">GPS</th>
                        <th className="p-2.5 font-medium">PM10 (≤100)</th>
                        <th className="p-2.5 font-medium">PM2.5 (≤60)</th>
                        <th className="p-2.5 font-medium">SO2 (≤80)</th>
                        <th className="p-2.5 font-medium">NOx (≤80)</th>
                        <th className="p-2.5 font-medium">CO (≤2.0)</th>
                        <th className="p-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {evm?.air_stations && evm.air_stations.length > 0 ? (
                        evm.air_stations.map((stn, idx) => (
                          <tr key={idx} className={stn.exceedance ? 'bg-rose-500/5' : ''}>
                            <td className="p-2.5 font-semibold text-foreground">{stn.name}</td>
                            <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{stn.gps || '-'}</td>
                            <td className={`p-2.5 font-mono ${stn.pm10 && stn.pm10 > 100 ? 'text-rose-600 font-bold' : ''}`}>
                              {stn.pm10 ?? '-'}
                            </td>
                            <td className={`p-2.5 font-mono ${stn.pm25 && stn.pm25 > 60 ? 'text-rose-600 font-bold' : ''}`}>
                              {stn.pm25 ?? '-'}
                            </td>
                            <td className="p-2.5 font-mono">{stn.so2 ?? '-'}</td>
                            <td className="p-2.5 font-mono">{stn.nox ?? '-'}</td>
                            <td className="p-2.5 font-mono">{stn.co ?? '-'}</td>
                            <td className="p-2.5">
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-4 text-center text-muted-foreground text-xs">
                            No air quality readings logged for this month.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Noise Readings */}
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mt-2">
                  Noise Level Measurements (dB)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {evm?.noise_stations && evm.noise_stations.length > 0 ? (
                    evm.noise_stations.map((n, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-card">
                        <span className="font-semibold text-foreground">{n.name}</span>
                        <div className="text-sm font-mono font-bold mt-1">{n.lday ?? n.leq ?? '-'} dB(A)</div>
                        <span className="text-[10px] text-muted-foreground">Standard: ≤ 75 dB</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 p-4 text-center text-muted-foreground text-xs border rounded-lg">
                      No noise measurements logged.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 4. OHS Tab */}
              <TabsContent value="ohs" className="flex flex-col gap-4 m-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Daily OHS Induction</span>
                    <div className="text-base font-bold text-foreground mt-1">{ohs?.daily_induction}</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Tool Box Talks (TBT)</span>
                    <div className="text-base font-bold text-foreground mt-1">{ohs?.tbt}</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">HIRA / Method Statements</span>
                    <div className="text-base font-bold text-foreground mt-1">{ohs?.method_statement}</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Fire Safety Systems</span>
                    <div className="text-base font-bold text-foreground mt-1">{ohs?.fire_safety}</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Drinking Water Facility</span>
                    <div className="text-base font-bold text-foreground mt-1">{ohs?.drinking_water}</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">OHS Committee Meeting</span>
                    <div className="text-base font-bold text-foreground mt-1">{ohs?.committee_meeting}</div>
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-card text-xs">
                  <h4 className="font-semibold text-foreground uppercase tracking-wider mb-2">Audits & Inspections Conducted</h4>
                  {ohs?.audits_conducted && ohs.audits_conducted.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {ohs.audits_conducted.map((a, i) => (
                        <li key={i} className="text-foreground">{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No formal third-party audits recorded for this month.</p>
                  )}
                </div>
              </TabsContent>

              {/* 5. Social Tab */}
              <TabsContent value="social" className="flex flex-col gap-4 m-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Total Workers</span>
                    <div className="text-base font-bold text-foreground mt-1">{social?.workforce.total}</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Local Workers (%)</span>
                    <div className="text-base font-bold text-foreground mt-1">{social?.workforce.local_pct}%</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Male / Female</span>
                    <div className="text-base font-bold text-foreground mt-1">
                      {social?.workforce.male} / {social?.workforce.female}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-muted-foreground text-[11px]">Labour Camp Score</span>
                    <div className="text-base font-bold text-foreground mt-1">{social?.labour_camp.facilities_score} / 9</div>
                  </div>
                </div>

                {/* GRC Complaints */}
                <div className="border rounded-xl p-4 bg-card text-xs">
                  <h4 className="font-semibold text-foreground uppercase tracking-wider mb-2">Grievance Redressal (GRC)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-md bg-muted/40 text-center">
                      <div className="text-[11px] text-muted-foreground">Received</div>
                      <div className="text-base font-bold text-foreground">{social?.grc.received}</div>
                    </div>
                    <div className="p-2.5 rounded-md bg-muted/40 text-center">
                      <div className="text-[11px] text-muted-foreground">Resolved</div>
                      <div className="text-base font-bold text-emerald-600">{social?.grc.resolved}</div>
                    </div>
                    <div className="p-2.5 rounded-md bg-muted/40 text-center">
                      <div className="text-[11px] text-muted-foreground">Pending</div>
                      <div className="text-base font-bold text-rose-600">{social?.grc.pending}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
