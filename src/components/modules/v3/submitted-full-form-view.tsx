'use client'

import React, { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText, CheckCircle2, XCircle, AlertTriangle, Clock, ShieldCheck,
  Building2, User, Calendar, MapPin, Printer, Copy, Check,
  ExternalLink, HardHat, Activity, FileCheck, Truck, Users, Award,
  Trees, Droplets, Wind, Volume2, HeartHandshake, Eye, Download, Info
} from 'lucide-react'
import { MockWizardForm, FormStatus } from './submitted-forms-wizard'

interface SubmittedFullFormViewProps {
  form: MockWizardForm
  onBack?: () => void
  isMaximized?: boolean
  onToggleMaximize?: () => void
}

const STATUS_CONFIG: Record<FormStatus, { label: string; bg: string; text: string; border: string }> = {
  Approved: { label: 'Approved', bg: 'bg-emerald-500/10 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30' },
  PMC: { label: 'Under PMC Review', bg: 'bg-blue-500/10 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30' },
  PGMC: { label: 'Under PgMC Scrutiny', bg: 'bg-amber-500/10 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/30' },
  CRDA: { label: 'Under APCRDA Approval', bg: 'bg-purple-500/10 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30' },
  Rejected: { label: 'Returned for Revision', bg: 'bg-rose-500/10 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/30' },
  Pending: { label: 'Pending Submission', bg: 'bg-orange-500/10 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500/30' },
}

export function SubmittedFullFormView({ form, onBack }: SubmittedFullFormViewProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('overview')

  const statusInfo = STATUS_CONFIG[form.status] || STATUS_CONFIG.Pending
  const reportingDate = useMemo(() => new Date(form.date), [form.date])
  const reportingMonthStr = reportingDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  // Pseudo-random deterministic hash based on form.id to generate consistent metrics
  const hash = useMemo(() => {
    let h = 0
    for (let i = 0; i < form.id.length; i++) {
      h = (Math.imul(31, h) + form.id.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }, [form.id])

  const complianceScore = useMemo(() => {
    if (form.status === 'Approved') return 92 + (hash % 8)
    if (form.status === 'CRDA') return 88 + (hash % 7)
    if (form.status === 'PGMC') return 82 + (hash % 9)
    if (form.status === 'PMC') return 76 + (hash % 12)
    if (form.status === 'Rejected') return 48 + (hash % 15)
    return 65 + (hash % 20)
  }, [form.status, hash])

  const rag = useMemo(() => {
    if (complianceScore >= 85) return { status: 'Green', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300' }
    if (complianceScore >= 70) return { status: 'Amber', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 border-amber-300' }
    return { status: 'Red', color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 border-rose-300' }
  }, [complianceScore])

  const copyId = () => {
    navigator.clipboard.writeText(form.id)
    setCopied(true)
    toast.success('Form ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    toast.success(`Preparing printable PDF summary for ${form.id}...`)
    window.print()
  }

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(form, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${form.id}_full_form.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Form payload exported as JSON')
  }

  // Normalized form type
  const normType = form.formType.toLowerCase()

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ================= FIXED TOP HEADER BAR ================= */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 font-bold border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/50">
                {form.id}
              </Badge>
              <button 
                onClick={copyId} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copy Form ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <Badge 
                variant="outline" 
                className={`text-xs px-2.5 py-0.5 font-semibold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
              >
                {statusInfo.label}
              </Badge>
              <Badge variant="outline" className={`text-xs px-2 py-0.5 font-semibold ${rag.color}`}>
                {rag.status} RAG ({complianceScore}% Score)
              </Badge>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {form.formType} Compliance Report
            </h2>
            
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-teal-600" /> {form.project}</span>
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-500" /> Contractor: <strong className="text-foreground">{form.contractor}</strong></span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> PMC: <strong className="text-foreground">{form.pmc}</strong></span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-500" /> Reporting Period: <strong className="text-foreground">{reportingMonthStr}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleExportJson} className="h-8 text-xs gap-1.5">
              <Download className="w-3.5 h-3.5 text-slate-500" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs gap-1.5">
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
            </Button>
          </div>
        </div>

        {/* Workflow Lifecycle Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" /> APCRDA Contractual Review Cycle (20th / 22nd / 27th / 30th)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
              <div className="text-[11px] text-muted-foreground">1. Contractor Submission</div>
              <div className="font-semibold text-foreground mt-0.5">{form.date} (Target: 20th)</div>
              <Badge variant="outline" className="mt-1 text-[10px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200">
                Submitted On-time
              </Badge>
            </div>

            <div className={`p-2.5 rounded-lg border ${['PMC', 'PGMC', 'CRDA', 'Approved'].includes(form.status) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-muted-foreground">2. PMC Review (Target: 22nd)</div>
              <div className="font-semibold text-foreground mt-0.5">{form.pmc}</div>
              <Badge variant="outline" className="mt-1 text-[10px] h-4">
                {['PGMC', 'CRDA', 'Approved'].includes(form.status) ? 'Verified & Forwarded' : form.status === 'PMC' ? 'In Progress' : 'Pending'}
              </Badge>
            </div>

            <div className={`p-2.5 rounded-lg border ${['PGMC', 'CRDA', 'Approved'].includes(form.status) ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-muted-foreground">3. PgMC Scrutiny (Target: 27th)</div>
              <div className="font-semibold text-foreground mt-0.5">STUP Consultants</div>
              <Badge variant="outline" className="mt-1 text-[10px] h-4">
                {['CRDA', 'Approved'].includes(form.status) ? 'Scrutinized & Passed' : form.status === 'PGMC' ? 'Under Review' : 'Pending'}
              </Badge>
            </div>

            <div className={`p-2.5 rounded-lg border ${form.status === 'Approved' ? 'bg-purple-500/5 border-purple-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-muted-foreground">4. APCRDA Final (Target: 30th)</div>
              <div className="font-semibold text-foreground mt-0.5">ESMU Amaravati</div>
              <Badge variant="outline" className="mt-1 text-[10px] h-4">
                {form.status === 'Approved' ? 'Sanction Approved' : form.status === 'CRDA' ? 'Awaiting Signoff' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ================= INLINE SCROLLABLE FORM BODY ================= */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 sm:p-6 space-y-6">
          {/* ================= DOMAIN TABBED VIEW ================= */}
          {normType.includes('evm') && <EVMDetailTabs form={form} hash={hash} />}
          {normType.includes('ohs') && <OHSDetailTabs form={form} hash={hash} />}
          {normType.includes('road') && <RoadSafetyDetailTabs form={form} hash={hash} />}
          {(normType.includes('social') || normType.includes('labour') || normType.includes('gender')) && <SocialDetailTabs form={form} hash={hash} />}

          {/* ================= REVIEW SIGN-OFF & ATTACHMENTS ================= */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 pt-4 px-4 sm:px-5 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-600" />
                Supervisory Observations, Endorsements & Digital Signoffs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg border bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Contractor In-Charge
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Certified that all monitoring metrics, photographs and supporting laboratory test reports conform to the project C-ESMP.
                  </p>
                  <div className="pt-2 text-[10px] text-muted-foreground border-t flex justify-between">
                    <span>Sign: <strong>Project Manager ({form.contractor})</strong></span>
                    <span>Date: {form.date}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> PMC Verification
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Verified on-site. Mandatory environmental & safety controls verified in active work zones and labour camps.
                  </p>
                  <div className="pt-2 text-[10px] text-muted-foreground border-t flex justify-between">
                    <span>Sign: <strong>Lead Consultant ({form.pmc})</strong></span>
                    <span>Status: Compliant</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> PgMC / APCRDA
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Submission endorsed for monthly contractual compliance certificate under World Bank E&S safeguards.
                  </p>
                  <div className="pt-2 text-[10px] text-muted-foreground border-t flex justify-between">
                    <span>Sign: <strong>ESMU Officer</strong></span>
                    <span>RAG: {rag.status}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-600" />
                  Evidence archive contains 14 geo-tagged photographs and 3 certified NABL test certificates.
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  SHA256: e8b9f...4c1d
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}

// =========================================================================
// 1. EVM (ENVIRONMENTAL COMPLIANCE MONITORING) FULL FORM TABS
// =========================================================================
function EVMDetailTabs({ form, hash }: { form: MockWizardForm; hash: number }) {
  return (
    <Tabs defaultValue="air-noise" className="w-full">
      <TabsList className="sticky top-0 z-20 w-full justify-start overflow-x-auto whitespace-nowrap scrollbar-none h-10 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center gap-1">
        <TabsTrigger value="personnel" className="text-xs">1. Setup & Personnel</TabsTrigger>
        <TabsTrigger value="statutory" className="text-xs">2. Consents & Clearances</TabsTrigger>
        <TabsTrigger value="air-noise" className="text-xs">3. Air & Noise Monitoring</TabsTrigger>
        <TabsTrigger value="water-soil" className="text-xs">4. Water, Soil & Trees</TabsTrigger>
        <TabsTrigger value="waste" className="text-xs">5. Waste Management</TabsTrigger>
        <TabsTrigger value="ncs" className="text-xs">6. NCs & Observations</TabsTrigger>
      </TabsList>

      {/* 1. Setup & Personnel */}
      <TabsContent value="personnel" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Key Project & Personnel Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-lg">
              <div><span className="text-muted-foreground block text-[11px]">Project Title:</span><span className="font-semibold text-foreground">{form.project}</span></div>
              <div><span className="text-muted-foreground block text-[11px]">Contractor:</span><span className="font-semibold text-foreground">{form.contractor}</span></div>
              <div><span className="text-muted-foreground block text-[11px]">Supervising PMC:</span><span className="font-semibold text-foreground">{form.pmc}</span></div>
              <div><span className="text-muted-foreground block text-[11px]">Location Coordinates:</span><span className="font-mono text-[11px]">16.5124°N, 80.5187°E</span></div>
            </div>

            <div>
              <h4 className="font-bold text-xs mb-2">Contractor E&S Key Personnel</h4>
              <div className="overflow-x-auto max-h-[340px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
                <table className="w-full text-xs">
                  <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 text-left">Designation</th>
                      <th className="p-2.5 text-left">Name</th>
                      <th className="p-2.5 text-left">Contact</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { role: 'Project Manager', name: 'K. Ramesh Babu', contact: '+91 98480 23411', status: 'Deployed' },
                      { role: 'Environmental Engineer', name: 'Dr. M. Veeraiah', contact: '+91 94401 56782', status: 'Deployed' },
                      { role: 'Grievance Manager', name: 'Ch. Padmavathi', contact: '+91 99890 44321', status: 'Deployed' },
                      { role: 'OHS Manager', name: 'K. Venkateswara Rao', contact: '+91 97012 33451', status: 'Deployed' },
                      { role: 'Social & Labour Manager', name: 'Y. Ramesh', contact: '+91 98661 77239', status: 'Deployed' },
                    ].map(p => (
                      <tr key={p.role} className="hover:bg-muted/10">
                        <td className="p-2.5 font-medium">{p.role}</td>
                        <td className="p-2.5">{p.name}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">{p.contact}</td>
                        <td className="p-2.5 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 2. Statutory Consents */}
      <TabsContent value="statutory" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Consents & Clearances Register</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 text-left">Facility / Operation</th>
                    <th className="p-2.5 text-center">EC</th>
                    <th className="p-2.5 text-center">CTE</th>
                    <th className="p-2.5 text-center">CTO</th>
                    <th className="p-2.5 text-left">Validity & Reference</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { name: 'Quarry – Stone & Aggregates', ec: 'Yes', cte: 'Yes', cto: 'Yes', ref: 'APPCB/VJA/CTO/2024-89', status: 'Compliant' },
                    { name: 'Quarry – Gravel', ec: 'Yes', cte: 'Yes', cto: 'Yes', ref: 'APPCB/GNT/CTO/2024-112', status: 'Compliant' },
                    { name: 'Sand Reach (Krishna River)', ec: 'Applied', cte: 'Yes', cto: 'Yes', ref: 'Mines Dept Allotment 44/2024', status: 'Compliant' },
                    { name: 'RMC Batching Plant (60 cum/hr)', ec: 'Yes', cte: 'Yes', cto: 'Yes', ref: 'APPCB/VJA/EXP/2025-09', status: 'Compliant' },
                    { name: 'Hot Mix Plant', ec: 'NA', cte: 'Yes', cto: 'Yes', ref: 'Valid up to Dec 2026', status: 'Compliant' },
                    { name: 'WMM Plant', ec: 'Yes', cte: 'Yes', cto: 'Yes', ref: 'APPCB/VJA/2024-331', status: 'Compliant' },
                    { name: 'Stone Crusher Unit', ec: 'Yes', cte: 'Yes', cto: 'Yes', ref: 'APPCB/CTO/2024-912', status: 'Compliant' },
                    { name: 'Sewage Treatment Plant (STP)', ec: 'Yes', cte: 'Yes', cto: 'Yes', ref: 'Modular 50 KLD Unit', status: 'Compliant' },
                  ].map(r => (
                    <tr key={r.name} className="hover:bg-muted/10">
                      <td className="p-2.5 font-medium">{r.name}</td>
                      <td className="p-2.5 text-center"><Badge variant="outline" className="text-[10px]">{r.ec}</Badge></td>
                      <td className="p-2.5 text-center"><Badge variant="outline" className="text-[10px]">{r.cte}</Badge></td>
                      <td className="p-2.5 text-center"><Badge variant="outline" className="text-[10px]">{r.cto}</Badge></td>
                      <td className="p-2.5 text-muted-foreground">{r.ref}</td>
                      <td className="p-2.5 text-center"><Badge className="bg-emerald-600 text-white text-[10px]">{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="font-semibold block mb-1">SGWB Ground Water Permission:</span>
                <span className="text-muted-foreground">Order Ref: SGWB/GNT/2024/77 — Extraction permitted for domestic usage (15 KLD cap).</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="font-semibold block mb-1">PESO Approval for Diesel / DG Sets:</span>
                <span className="text-muted-foreground">Ref: PESO/SZ/AP/2024/552 — 15 KL Class B Petroleum installation certified.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 3. Air & Noise Monitoring */}
      <TabsContent value="air-noise" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Ambient Air Quality Monitoring (AAQ1 – AAQ6)</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left">Station</th>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-center">PM10 (≤100)</th>
                    <th className="p-2 text-center">PM2.5 (≤60)</th>
                    <th className="p-2 text-center">SO₂ (≤80)</th>
                    <th className="p-2 text-center">NOx (≤80)</th>
                    <th className="p-2 text-center">CO (mg/m³)</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { id: 'AAQ1', loc: 'North Boundary / Gate 1', pm10: 76, pm25: 38, so2: 18, nox: 24, co: 1.2 },
                    { id: 'AAQ2', loc: 'Batching Plant Area', pm10: 88, pm25: 45, so2: 22, nox: 34, co: 1.5 },
                    { id: 'AAQ3', loc: 'Labour Camp Perimeter', pm10: 64, pm25: 31, so2: 14, nox: 20, co: 0.9 },
                    { id: 'AAQ4', loc: 'Haulage Road Junction', pm10: 92, pm25: 48, so2: 26, nox: 38, co: 1.7 },
                    { id: 'AAQ5', loc: 'Near Nearest Habitation', pm10: 58, pm25: 28, so2: 12, nox: 18, co: 0.8 },
                    { id: 'AAQ6', loc: 'South Alignment Chainage', pm10: 71, pm25: 35, so2: 16, nox: 22, co: 1.1 },
                  ].map(a => (
                    <tr key={a.id} className="hover:bg-muted/10">
                      <td className="p-2 font-mono font-bold text-teal-600">{a.id}</td>
                      <td className="p-2">{a.loc}</td>
                      <td className="p-2 text-center font-semibold">{a.pm10} µg/m³</td>
                      <td className="p-2 text-center font-semibold">{a.pm25} µg/m³</td>
                      <td className="p-2 text-center">{a.so2} µg/m³</td>
                      <td className="p-2 text-center">{a.nox} µg/m³</td>
                      <td className="p-2 text-center">{a.co}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">Normal</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2">
              <h4 className="font-bold text-xs mb-2">Ambient Noise Level Monitoring (N1 – N3 & DG)</h4>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
                <table className="w-full text-xs">
                  <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left">Location</th>
                      <th className="p-2 text-center">Leq dB(A)</th>
                      <th className="p-2 text-center">Lmax</th>
                      <th className="p-2 text-center">Lmin</th>
                      <th className="p-2 text-center">Day Limit</th>
                      <th className="p-2 text-center">Night Limit</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { name: 'N1 - North Gate Boundary', leq: 63, lmax: 67, lmin: 54, limitDay: 75, limitNight: 70 },
                      { name: 'N2 - Near Residential Cluster', leq: 52, lmax: 56, lmin: 44, limitDay: 55, limitNight: 45 },
                      { name: 'N3 - RMC Batching Plant', leq: 72, lmax: 78, lmin: 62, limitDay: 75, limitNight: 70 },
                      { name: 'DG Set Primary Zone', leq: 68, lmax: 74, lmin: 58, limitDay: 75, limitNight: 75 },
                    ].map(n => (
                      <tr key={n.name} className="hover:bg-muted/10">
                        <td className="p-2 font-medium">{n.name}</td>
                        <td className="p-2 text-center font-bold">{n.leq} dB(A)</td>
                        <td className="p-2 text-center">{n.lmax}</td>
                        <td className="p-2 text-center">{n.lmin}</td>
                        <td className="p-2 text-center text-muted-foreground">{n.limitDay} dB(A)</td>
                        <td className="p-2 text-center text-muted-foreground">{n.limitNight} dB(A)</td>
                        <td className="p-2 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">Within Limits</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 4. Water, Soil & Trees */}
      <TabsContent value="water-soil" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Water, Wastewater & Muck Balances</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Total Water Consumed:</span>
                <span className="text-lg font-bold text-foreground">1,522 m³</span>
                <span className="text-[11px] text-muted-foreground block mt-1">Construction: 826 m³ • Domestic: 362 m³ • Sprinkling: 334 m³</span>
              </div>

              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Wastewater Treated & Reused:</span>
                <span className="text-lg font-bold text-emerald-600">204 m³ / 129 m³</span>
                <span className="text-[11px] text-muted-foreground block mt-1">Treatment efficiency: 88% (STP + Sedimentation pits)</span>
              </div>

              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Tree Preservation & Felling:</span>
                <span className="text-lg font-bold text-teal-600">88% Survival</span>
                <span className="text-[11px] text-muted-foreground block mt-1">Felled: 24 • Transplanted: 30 • Survival: 26 thriving</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border space-y-1">
              <span className="font-semibold block">Muck & Earth Excavation Management:</span>
              <p className="text-muted-foreground">
                Total Muck Generated: <strong>1,069 m³</strong> • Stored at designated yard: <strong>398 m³</strong> • Disposed for site leveling & low-lying fills: <strong>898 m³</strong>.
                All slopes bunded with geotextile covers to prevent silt runoff into Krishna River catchment.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 5. Waste Management */}
      <TabsContent value="waste" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Solid & Hazardous Waste Generation & Disposal (15 Categories)</CardTitle></CardHeader>
          <CardContent className="text-xs">
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left">Waste Category</th>
                    <th className="p-2 text-center">Unit</th>
                    <th className="p-2 text-center">Generated</th>
                    <th className="p-2 text-center">Disposed</th>
                    <th className="p-2 text-center">Cum. Disposed</th>
                    <th className="p-2 text-left">Authorized Agency</th>
                    <th className="p-2 text-center">MoU</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { cat: 'Food & Kitchen Waste', unit: 'Kg', gen: 220, disp: 200, cum: 1380, agency: 'Rayapudi Gram Panchayat Biocompost' },
                    { cat: 'Used Lubricating Oil', unit: 'Liters', gen: 240, disp: 220, cum: 660, agency: 'APPCB Authorized - Guntur Enviro Clean Tech' },
                    { cat: 'Chemical & Admixture Barrels', unit: 'Nos', gen: 80, disp: 78, cum: 620, agency: 'Returned to Chemical Manufacturer' },
                    { cat: 'Used Grease Barrels', unit: 'Kg', gen: 140, disp: 125, cum: 625, agency: 'Guntur Enviro Clean Tech Ltd' },
                    { cat: 'Empty Paint / Solvent Tins', unit: 'Kg', gen: 210, disp: 185, cum: 740, agency: 'Guntur Enviro Clean Tech Ltd' },
                    { cat: 'Air & Oil Filters', unit: 'Nos', gen: 85, disp: 75, cum: 590, agency: 'Authorized Scrap Dealer' },
                    { cat: 'Biomedical Waste (First Aid)', unit: 'Kg', gen: 12, disp: 12, cum: 84, agency: 'Common Bio-Medical Waste Facility (CBMWTF)' },
                    { cat: 'Construction & Demolition (C&D)', unit: 'Cum', gen: 140, disp: 140, cum: 980, agency: 'CRDA Designated C&D Processing Yard' },
                    { cat: 'Used Lead-Acid Batteries', unit: 'Nos', gen: 6, disp: 6, cum: 32, agency: 'Authorized Buy-Back Exide Agency' },
                    { cat: 'HDPE Cement & Bentonite Bags', unit: 'Nos', gen: 145, disp: 135, cum: 630, agency: 'Authorized Recycler - Sri Balaji Plastics' },
                  ].map(w => (
                    <tr key={w.cat} className="hover:bg-muted/10">
                      <td className="p-2 font-medium">{w.cat}</td>
                      <td className="p-2 text-center text-muted-foreground">{w.unit}</td>
                      <td className="p-2 text-center font-semibold">{w.gen}</td>
                      <td className="p-2 text-center font-semibold">{w.disp}</td>
                      <td className="p-2 text-center text-muted-foreground">{w.cum}</td>
                      <td className="p-2 text-muted-foreground">{w.agency}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">Active</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 6. NCs & Observations */}
      <TabsContent value="ncs" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">PMC / PgMC Site Observations & Non-Conformances</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Observations Raised:</span><span className="text-lg font-bold">9</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Observations Closed:</span><span className="text-lg font-bold text-emerald-600">9</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">PMC Letters Issued:</span><span className="text-lg font-bold">2</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Overdue NCs:</span><span className="text-lg font-bold text-emerald-600">0</span></div>
            </div>

            <div className="p-3 rounded-lg border space-y-1">
              <span className="font-semibold block text-emerald-700 dark:text-emerald-400">All Site Non-Conformances Resolved</span>
              <p className="text-muted-foreground">
                All 9 observations highlighted during the monthly joint PMC inspection (including water sprinkling frequency along Sakhamuru road and secondary containment for diesel storage) have been rectified with photographic evidence accepted by Aarvee Associates.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// =========================================================================
// 2. OHS (OCCUPATIONAL HEALTH & SAFETY) FULL FORM TABS
// =========================================================================
function OHSDetailTabs({ form, hash }: { form: MockWizardForm; hash: number }) {
  return (
    <Tabs defaultValue="daily-tbt" className="w-full">
      <TabsList className="sticky top-0 z-20 w-full justify-start overflow-x-auto whitespace-nowrap scrollbar-none h-10 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center gap-1">
        <TabsTrigger value="daily-tbt" className="text-xs">1. Induction & Daily TBT</TabsTrigger>
        <TabsTrigger value="safeguards" className="text-xs">2. Work Zone Safeguards</TabsTrigger>
        <TabsTrigger value="committee" className="text-xs">3. Safety Committee & Rewards</TabsTrigger>
        <TabsTrigger value="audits" className="text-xs">4. Audits & Training</TabsTrigger>
        <TabsTrigger value="incidents" className="text-xs">5. Incidents & Safe Hours</TabsTrigger>
      </TabsList>

      {/* 1. Induction & Daily TBT */}
      <TabsContent value="daily-tbt" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Workforce OHS Induction & Tool Box Talks (TBT)</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">New Inductions This Month:</span>
                <span className="text-xl font-bold text-foreground">126 Workers</span>
                <span className="text-[11px] text-emerald-600 block mt-1">100% incoming workforce covered</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Daily Tool Box Talks:</span>
                <span className="text-xl font-bold text-foreground">25 Sessions</span>
                <span className="text-[11px] text-muted-foreground block mt-1">Conducted daily at 08:00 AM across all gangs</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Compliance Rate:</span>
                <span className="text-xl font-bold text-emerald-600">98% Verified</span>
                <span className="text-[11px] text-muted-foreground block mt-1">Daily signed attendance logs verified</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs mb-2">Sample Daily TBT Topics Log</h4>
              <div className="overflow-x-auto max-h-[340px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
                <table className="w-full text-xs">
                  <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">TBT Topic</th>
                      <th className="p-2 text-left">Target Gang / Trades</th>
                      <th className="p-2 text-center">Attendees</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { date: '2026-09-02', topic: 'Safe Working at Heights & 100% Tie-Off Rule', gang: 'Scaffolders & Bar Benders', count: 48 },
                      { date: '2026-09-06', topic: 'Deep Excavation Shoring & Safe Access Ladders', gang: 'Earthwork & Foundation Gang', count: 35 },
                      { date: '2026-09-11', topic: 'Lifting Safety, Taglines & Crane Blind Spots', gang: 'Riggers & Crane Operators', count: 22 },
                      { date: '2026-09-17', topic: 'Electrical Safety, LOTO & 30mA ELCB Protection', gang: 'Electricians & Plant Fitters', count: 18 },
                      { date: '2026-09-22', topic: 'Heat Stress Management & Hydration Protocols', gang: 'All General Labour Gangs', count: 85 },
                    ].map(t => (
                      <tr key={t.date} className="hover:bg-muted/10">
                        <td className="p-2 font-mono text-muted-foreground">{t.date}</td>
                        <td className="p-2 font-medium">{t.topic}</td>
                        <td className="p-2 text-muted-foreground">{t.gang}</td>
                        <td className="p-2 text-center font-semibold">{t.count}</td>
                        <td className="p-2 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">Conducted</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 2. Safeguards */}
      <TabsContent value="safeguards" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Work Method Statements & Fire Readiness</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                <span className="font-semibold block">WMS & HIRA Approvals:</span>
                <p className="text-muted-foreground">All critical work method statements approved by PMC prior to activity commencement.</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px]">Deep Foundation SOP (Approved)</Badge>
                  <Badge variant="outline" className="text-[10px]">Tower Crane Erection SOP (Approved)</Badge>
                  <Badge variant="outline" className="text-[10px]">Confined Space Entry SOP (Approved)</Badge>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                <span className="font-semibold block">Fire Extinguisher & Potable Water Checks:</span>
                <p className="text-muted-foreground">
                  39 Fire Extinguishers tagged and inspected on site (DCP & CO₂). Pressure gauges verified.
                  Potable cool drinking water dispensers installed at all active blocks; periodic NABL test valid (IS 10500).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 3. Committee & Rewards */}
      <TabsContent value="committee" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Site Safety Committee & Motivation Programs</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Monthly OHS Committee Meeting</span>
              <p className="text-muted-foreground">
                Conducted with participation of 6 elected worker safety representatives, site engineers and PMC safety officer.
                Action items from previous month closed. Zero high-risk pending actions.
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 space-y-1">
              <span className="font-semibold block text-emerald-700 dark:text-emerald-300">Safety Champion of the Month</span>
              <p className="text-muted-foreground">
                Awarded to <strong>K. Tirupathi Rao (Rigger)</strong> for reporting an unsafe lifting bridle and preventing a potential rigging hazard.
                2 site staff and 4 workers received monthly safety badges and incentives.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 4. Audits & Training */}
      <TabsContent value="audits" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Safety Audits & Specialized Training Matrix</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="overflow-x-auto max-h-[340px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left">Audit Category</th>
                    <th className="p-2 text-center">Frequency</th>
                    <th className="p-2 text-center">Conducted</th>
                    <th className="p-2 text-left">Report Reference</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { name: 'Weekly Safety Walkthrough', freq: 'Weekly', date: '4 Conducted', ref: 'Walkthrough Log W1-W4', status: 'Compliant' },
                    { name: 'Internal OHS Audit', freq: 'Monthly', date: 'Yes', ref: 'INT-AUDIT-2026-09', status: 'Submitted' },
                    { name: 'Third-Party MSAS Audit', freq: 'Quarterly', date: 'Yes', ref: 'MSAS/APCRDA/Q3/2026', status: 'Approved' },
                    { name: 'Electrical Safety Audit', freq: 'Monthly', date: 'Yes', ref: 'ELEC/INSP/2026/09', status: 'Earthing OK' },
                  ].map(a => (
                    <tr key={a.name} className="hover:bg-muted/10">
                      <td className="p-2 font-medium">{a.name}</td>
                      <td className="p-2 text-center text-muted-foreground">{a.freq}</td>
                      <td className="p-2 text-center font-semibold">{a.date}</td>
                      <td className="p-2 text-muted-foreground">{a.ref}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-xs mb-1.5">Specialized Safety Training Sessions</h4>
              <p className="text-muted-foreground">
                Working at Heights & Scaffold Safety (70 attendees) • Emergency First Aid & CPR (30 attendees) • Fire Fighting Drill (45 attendees).
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 5. Incidents & Safe Hours */}
      <TabsContent value="incidents" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Safety Metrics & Incident Register</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Fatalities:</span><span className="text-xl font-bold text-emerald-600">0</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Lost Time Injuries (LTI):</span><span className="text-xl font-bold text-emerald-600">0</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Safe Man-Hours Worked:</span><span className="text-xl font-bold text-foreground">48,250 hrs</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">First Aid Cases:</span><span className="text-xl font-bold text-foreground">2 (Minor)</span></div>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
              <span className="font-semibold block text-emerald-700 dark:text-emerald-300">Incident Free Period: 240 Days Continuous</span>
              <p className="text-muted-foreground mt-0.5">
                Site maintains full zero-harm status for current reporting quarter under World Bank OHS benchmarks.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// =========================================================================
// 3. ROAD SAFETY FULL FORM TABS
// =========================================================================
function RoadSafetyDetailTabs({ form, hash }: { form: MockWizardForm; hash: number }) {
  const CHECKLIST_15 = [
    { no: 1, title: 'Approved Traffic Management Plan (TMP)', spec: 'TMP approved by PMC per IRC SP:55-2014 guidelines', status: 'Yes', remark: 'TMP Revision 2.0 active' },
    { no: 2, title: 'Indicative Signages per CESMP Ch.7', spec: 'Advance warning signages, speed limits, detour boards placed', status: 'Yes', remark: '80+ reflective boards installed' },
    { no: 3, title: 'Approved Diversion Plans', spec: 'Diversion plans approved by Engineer-in-Charge & Traffic Police', status: 'Yes', remark: 'Approved on site' },
    { no: 4, title: 'Temporary Barriers & Barricading', spec: 'Double row barricading and retro-reflective caution tapes placed', status: 'Yes', remark: 'Chainage 0+000 to 4+500' },
    { no: 5, title: 'Night Safety Arrangements', spec: 'Solar blinkers, retro-reflective hazard markers & illumination (>50 lux)', status: 'Yes', remark: 'All 12 solar blinkers operational' },
    { no: 6, title: 'Deployment of Traffic Marshals / Flagmen', spec: 'Trained marshals deployed at active work zones with safety kits', status: 'Yes', remark: '12 marshals in 2 shifts' },
    { no: 7, title: 'Traffic Calming Measures', spec: 'Speed breakers, rumble strips and thermoplastic markings installed', status: 'Yes', remark: 'Rumble strips at entry gates' },
    { no: 8, title: 'Alternate Route Planning', spec: 'Heavy vehicles diverted away from congested village residential lanes', status: 'Yes', remark: 'Bypass haul road operational' },
    { no: 9, title: 'Plastic / Water-Filled Crash Barriers', spec: 'Energy absorbing crash barriers deployed at vulnerable curves', status: 'Yes', remark: 'Filled and chained' },
    { no: 10, title: 'Road Safety Awareness Campaigns', spec: 'Training sessions conducted for dumper and mixer drivers', status: 'Yes', remark: 'Defensive driving module done' },
    { no: 11, title: 'Controlled Site Access Gates', spec: 'Security manned entry/exit points with vehicle registration log', status: 'Yes', remark: 'Boom barriers functional' },
    { no: 12, title: 'Pedestrian & Road User Safe Crossings', spec: 'Segregated pedestrian walkways and zebra crossings provided', status: 'Yes', remark: 'Safe walkways maintained' },
    { no: 13, title: 'Worker Safety & High-Visibility PPE', spec: '100% workforce wearing EN 471 Class 3 reflective safety vests', status: 'Yes', remark: 'Verified by safety marshal' },
    { no: 14, title: 'Monthly Advance Action Plan - Road Safety', spec: 'Advance road safety plan submitted for next month work zones', status: 'Yes', remark: 'Submitted with coordinates' },
    { no: 15, title: 'Monthly Progress Report - Road Safety', spec: 'CESMP compliant monthly progress report submitted to PMC', status: 'Yes', remark: 'Complete report attached' },
  ]

  return (
    <Tabs defaultValue="checklist" className="w-full">
      <TabsList className="sticky top-0 z-20 w-full justify-start overflow-x-auto whitespace-nowrap scrollbar-none h-10 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center gap-1">
        <TabsTrigger value="checklist" className="text-xs">1. 15-Point CESMP Checklist</TabsTrigger>
        <TabsTrigger value="marshals" className="text-xs">2. Marshals & TMP</TabsTrigger>
        <TabsTrigger value="vehicles" className="text-xs">3. Vehicles & Drivers Fitness</TabsTrigger>
        <TabsTrigger value="incidents" className="text-xs">4. Traffic Incidents Log</TabsTrigger>
      </TabsList>

      {/* 1. 15-Point Checklist */}
      <TabsContent value="checklist" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">15-Point Road Safety Checklist (IRC SP:55-2014 & CESMP)</CardTitle></CardHeader>
          <CardContent className="text-xs">
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 text-center w-12">#</th>
                    <th className="p-2.5 text-left min-w-[200px]">Requirement Item</th>
                    <th className="p-2.5 text-left">Specification Standard</th>
                    <th className="p-2.5 text-center w-24">Status</th>
                    <th className="p-2.5 text-left">Verification Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {CHECKLIST_15.map(item => (
                    <tr key={item.no} className="hover:bg-muted/10">
                      <td className="p-2.5 text-center font-bold text-muted-foreground">{item.no}</td>
                      <td className="p-2.5 font-medium">{item.title}</td>
                      <td className="p-2.5 text-muted-foreground">{item.spec}</td>
                      <td className="p-2.5 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">{item.status}</Badge></td>
                      <td className="p-2.5 text-muted-foreground">{item.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 2. Marshals & TMP */}
      <TabsContent value="marshals" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Traffic Marshals & Control Assets</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Marshals Deployed:</span><span className="text-lg font-bold">12 Staff</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Solar Blinkers Active:</span><span className="text-lg font-bold text-amber-600">12 Units</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Crash Barriers:</span><span className="text-lg font-bold">340 Rmt</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Speed Limit:</span><span className="text-lg font-bold">20 Km/h</span></div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20">
              <span className="font-semibold block mb-1">Equipment Kit Provided to Each Marshal:</span>
              <p className="text-muted-foreground">
                High-visibility LED batons, STOP/GO handheld paddles, whistle, two-way walkie-talkie radio, safety helmet with chin strap and retro-reflective vest.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 3. Vehicles & Drivers Fitness */}
      <TabsContent value="vehicles" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Heavy Machinery Fitness & Breathalyzer Screenings</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="overflow-x-auto max-h-[340px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left">Vehicle Category</th>
                    <th className="p-2 text-center">Active Count</th>
                    <th className="p-2 text-center">Fitness Valid</th>
                    <th className="p-2 text-center">PUC Valid</th>
                    <th className="p-2 text-center">Reverse Alarms</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { type: 'Tipper Dump Trucks', count: 18, fitness: '100%', puc: '100%', alarms: 'Operational' },
                    { type: 'Transit Concrete Mixers (TM)', count: 8, fitness: '100%', puc: '100%', alarms: 'Operational' },
                    { type: 'Excavators & Backhoe Loaders', count: 6, fitness: '100%', puc: '100%', alarms: 'Operational' },
                    { type: 'Water Sprinkling Tankers', count: 4, fitness: '100%', puc: '100%', alarms: 'Operational' },
                  ].map(v => (
                    <tr key={v.type} className="hover:bg-muted/10">
                      <td className="p-2 font-medium">{v.type}</td>
                      <td className="p-2 text-center font-bold">{v.count}</td>
                      <td className="p-2 text-center text-emerald-600 font-semibold">{v.fitness}</td>
                      <td className="p-2 text-center text-emerald-600 font-semibold">{v.puc}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">{v.alarms}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
              <span className="font-semibold block text-emerald-700 dark:text-emerald-300">Driver License & Breathalyzer Log</span>
              <p className="text-muted-foreground mt-0.5">
                All 36 heavy vehicle commercial licenses verified. 100% daily random breathalyzer alcohol screenings conducted at site gate — Zero positive alcohol cases recorded.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 4. Traffic Incidents Log */}
      <TabsContent value="incidents" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Traffic & Pedestrian Incidents Register</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-center">
              <span className="text-2xl font-black text-emerald-600">0</span>
              <span className="block text-xs font-bold text-foreground mt-1">Road Safety Incidents / Collisions Recorded</span>
              <span className="text-[11px] text-muted-foreground block">Zero public road or internal construction corridor vehicle accidents this month.</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// =========================================================================
// 4. SOCIAL & LABOUR LAW FULL FORM TABS
// =========================================================================
function SocialDetailTabs({ form, hash }: { form: MockWizardForm; hash: number }) {
  return (
    <Tabs defaultValue="labour-camp" className="w-full">
      <TabsList className="sticky top-0 z-20 w-full justify-start overflow-x-auto whitespace-nowrap scrollbar-none h-10 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center gap-1">
        <TabsTrigger value="labour-camp" className="text-xs">1. Labour Camp & Amenities</TabsTrigger>
        <TabsTrigger value="statutory-acts" className="text-xs">2. Labour Law Registrations</TabsTrigger>
        <TabsTrigger value="grc" className="text-xs">3. GRC & Grievances</TabsTrigger>
        <TabsTrigger value="gender" className="text-xs">4. Gender & POSH</TabsTrigger>
        <TabsTrigger value="training-local" className="text-xs">5. Local Employment & Skills</TabsTrigger>
      </TabsList>

      {/* 1. Labour Camp & Amenities */}
      <TabsContent value="labour-camp" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Labour Camp Profile & Mandatory Amenities (9 Points)</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Labour Camp Location:</span>
                <span className="font-bold text-foreground">Rayapudi Main Camp</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">240 Male + 45 Female = 285 Workers</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Police Verification:</span>
                <span className="font-bold text-emerald-600">100% Submitted</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">All migrant worker intimations filed at PS</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20">
                <span className="text-muted-foreground block text-[11px]">Sanitation Standard:</span>
                <span className="font-bold text-emerald-600">Compliant</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">1 toilet per 15 workers + separate female block</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs mb-2">9 Mandatory Statutory Amenities Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Canteen & Mess Facility', status: 'Hygienic & Functional' },
                  { name: 'Rest Shelters with Ventilation', status: 'Available' },
                  { name: 'Potable Drinking Water (RO)', status: 'Certified Safe' },
                  { name: 'Crèche Facility for Children', status: 'Trained Caretaker Active' },
                  { name: 'First Aid Medical Station', status: 'Paramedic On-duty' },
                  { name: 'Grievance Redressal Box (GRC)', status: 'Installed at Gate' },
                  { name: 'Internal Complaints (POSH)', status: 'Notices Displayed' },
                  { name: 'Labour Acts Abstract Boards', status: 'Telugu / Hindi / English' },
                  { name: 'Wage Rate Display Boards', status: 'Updated & Displayed' },
                ].map(a => (
                  <div key={a.name} className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 flex items-center justify-between">
                    <span className="font-medium">{a.name}</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 shrink-0 ml-1">{a.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 2. Statutory Acts */}
      <TabsContent value="statutory-acts" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Labour Law Statutory Licenses & Registrations (7 Acts)</CardTitle></CardHeader>
          <CardContent className="text-xs">
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/95 dark:bg-slate-800/95 backdrop-blur border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left">Statutory Act</th>
                    <th className="p-2 text-left">License / Registration No</th>
                    <th className="p-2 text-center">Validity</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { act: 'BOCW Act 1996 (Building & Other Construction)', no: 'BOCW/AP/GNT/2024/182', valid: 'Active', status: 'Valid' },
                    { act: 'Contract Labour (Regulation & Abolition) Act 1970', no: 'CLRA/LIC/450-MAX/2024', valid: 'Dec 2026', status: 'Valid' },
                    { act: 'Inter-State Migrant Workmen (ISMW) Act 1979', no: 'ISMW/GNT/2024/09', valid: 'Active', status: 'Valid' },
                    { act: 'Employees Provident Fund (EPF) Act 1952', no: 'EPFO/VJA/AP/0088192', valid: 'Monthly Paid', status: 'Compliant' },
                    { act: 'Employees State Insurance (ESI) Act 1948', no: 'ESIC/AP/5200098177', valid: 'Monthly Paid', status: 'Compliant' },
                    { act: 'Workmen Compensation Insurance Policy', no: 'NIA/WC/2024/491208', valid: 'Mar 2027', status: 'Valid' },
                    { act: 'Motor Transport Workers Act 1961', no: 'MTW/REG/2024/22', valid: 'Active', status: 'Valid' },
                  ].map(l => (
                    <tr key={l.act} className="hover:bg-muted/10">
                      <td className="p-2 font-medium">{l.act}</td>
                      <td className="p-2 font-mono text-muted-foreground">{l.no}</td>
                      <td className="p-2 text-center">{l.valid}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">{l.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 3. GRC */}
      <TabsContent value="grc" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Grievance Redressal Committee (GRC) Log</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">GRC Meetings:</span><span className="text-lg font-bold">1 Held</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Complaints Received:</span><span className="text-lg font-bold">2</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Resolved:</span><span className="text-lg font-bold text-emerald-600">2 (100%)</span></div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center"><span className="text-muted-foreground block text-[11px]">Avg Resolution SLA:</span><span className="text-lg font-bold">7.5 Days</span></div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <span className="font-semibold block">Sample Grievance Resolved:</span>
              <p className="text-muted-foreground">
                Grievance #GRC-2026-08: Local villager reported dust settling on roadside guava orchard along haul road.
                <strong> Action Taken:</strong> Deployed 1 additional dedicated water sprinkler tanker; route speed capped to 15 km/h. Complainant confirmed closure with signed letter.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 4. Gender & POSH */}
      <TabsContent value="gender" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Gender Safeguards, POSH & SEA/SH Compliance</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                <span className="font-semibold block">Internal Complaints Committee (ICC / POSH):</span>
                <p className="text-muted-foreground">
                  ICC functional and chaired by external female NGO member. Toll-free helpline 1091 and local committee contact numbers displayed at labour camp and site offices.
                </p>
              </div>

              <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                <span className="font-semibold block">Female Workforce Welfare:</span>
                <p className="text-muted-foreground">
                  Separate secure residential accommodation with night security. Dedicated sanitary restrooms with incinerators. Zero SEA/SH incidents reported.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 5. Local Employment & Skills */}
      <TabsContent value="training-local" className="space-y-4 pt-3">
        <Card className="border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Local Employment & Skill Development (World Bank Metrics)</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-muted/20 text-center">
                <span className="text-muted-foreground block text-[11px]">Total Workforce:</span>
                <span className="text-lg font-bold">425 Workers</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center">
                <span className="text-muted-foreground block text-[11px]">Local Workers Engaged:</span>
                <span className="text-lg font-bold text-teal-600">198 (46.5%)</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 text-center">
                <span className="text-muted-foreground block text-[11px]">Skilled Trainees Certified:</span>
                <span className="text-lg font-bold text-emerald-600">35 Candidates</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <span className="font-semibold block">Skill Upgradation Programs:</span>
              <p className="text-muted-foreground">
                Conducted onsite certified training modules for local youth: Bar bending & BBS, Masonry & plastering, Shuttering carpentry, Scaffolding erection.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
