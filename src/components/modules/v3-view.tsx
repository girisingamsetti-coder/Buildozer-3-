'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  Download,
  Building2,
  Calendar,
  Layers,
  Car,
  HardHat,
  Leaf,
  Users,
  LayoutDashboard,
  AlertCircle,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import * as XLSX from 'xlsx'

import { V3CompliancePayload, DashboardFilterState, ProjectData } from './v3/v3-types'
import { V3FilterBar } from './v3/v3-filter-bar'
import { V3KpiRow } from './v3/v3-kpi-row'
import { V3ProjectDrawer } from './v3/v3-project-drawer'
import { OverviewTab } from './v3/tabs/overview-tab'
import { EvmTab } from './v3/tabs/evm-tab'
import { OhsTab } from './v3/tabs/ohs-tab'
import { RoadSafetyTab } from './v3/tabs/road-safety-tab'
import { SocialTab } from './v3/tabs/social-tab'
import { ComplianceSubmissionsCards, AllSubmissionsTable, SubmittedFormsTable } from './v3/compliance-submissions-cards'

export default function V3View() {
  const [data, setData] = useState<V3CompliancePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Global Filter State
  const [filters, setFilters] = useState<DashboardFilterState>({
    month: '2026-09',
    searchQuery: '',
    contractor: 'ALL',
    project: 'ALL',
    statusFilter: 'ALL',
  })

  // Active Tab
  const [activeTab, setActiveTab] = useState('evm')

  // Selected Project for Drawer Drilldown
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fetch pre-aggregated data
  useEffect(() => {
    fetch('/data/v3-compliance-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load compliance data')
        return res.json()
      })
      .then((payload: V3CompliancePayload) => {
        setData(payload)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading V3 data:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Derived lists
  const months = useMemo(() => {
    return data?.metadata?.reporting_months || ['2026-09']
  }, [data])

  const contractors = useMemo(() => {
    if (!data) return []
    const set = new Set<string>()
    data.projects.forEach((p) => {
      if (p.contractor && p.contractor !== 'Unassigned') {
        set.add(p.contractor)
      }
    })
    return Array.from(set).sort()
  }, [data])

  const projectsList = useMemo(() => {
    if (!data) return []
    const set = new Set<string>()
    data.projects.forEach((p) => {
      set.add(p.name)
    })
    return Array.from(set).sort()
  }, [data])

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    if (!data) return []
    return data.projects.filter((p) => {
      // 1. Search Query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesName = p.name.toLowerCase().includes(query)
        const matchesId = p.id.toLowerCase().includes(query)
        if (!matchesName && !matchesId) return false
      }

      // 2. Contractor
      if (filters.contractor !== 'ALL' && p.contractor !== filters.contractor) {
        return false
      }

      // 3. Project Filter
      if (filters.project !== 'ALL' && p.name !== filters.project) {
        return false
      }

      // 3. Status Filter
      const mData = p.months_data[filters.month]
      const hasSub = mData?.has_submission
      if (filters.statusFilter === 'MISSING' && hasSub) return false
      if (filters.statusFilter === 'COMPLIANT') {
        if (!hasSub) return false
        const isRsOk = (mData?.road_safety?.compliance_pct ?? 0) >= 90
        const isOhsOk = (mData?.ohs?.compliance_pct ?? 0) >= 80
        const isEvmOk = mData?.evm?.exceedance_count === 0
        if (!isRsOk || !isOhsOk || !isEvmOk) return false
      }
      if (filters.statusFilter === 'ATTENTION') {
        if (!hasSub) return false
        const hasIssue =
          (mData?.road_safety?.no_count ?? 0) > 0 ||
          (mData?.evm?.exceedance_count ?? 0) > 0 ||
          (mData?.social?.grc?.pending ?? 0) > 0
        if (!hasIssue) return false
      }

      return true
    })
  }, [data, filters])

  const handleFilterChange = (updates: Partial<DashboardFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const currentDomainAgg = useMemo(() => {
    if (!data?.domain_aggregates) return undefined
    return (
      data.domain_aggregates[filters.month] ||
      data.domain_aggregates[data.metadata.default_month] ||
      Object.values(data.domain_aggregates)[0]
    )
  }, [data, filters.month])

  const handleOpenProject = (p: ProjectData) => {
    setSelectedProject(p)
    setDrawerOpen(true)
  }

  // Export Filtered Table to Excel
  const handleExport = () => {
    if (!filteredProjects.length) return
    const rows = filteredProjects.map((p) => {
      const m = p.months_data[filters.month]
      return {
        'Project ID': p.id,
        'Project Name': p.name,
        'Contractor': p.contractor,
        'Reporting Month': filters.month,
        'Submission Status': m?.has_submission ? 'Submitted' : 'Missing',
        'Road Safety Compliance %': m?.road_safety?.compliance_pct ?? 'N/A',
        'OHS Compliance %': m?.ohs?.compliance_pct ?? 'N/A',
        'Air & Noise Exceedances': m?.evm?.exceedance_count ?? 'N/A',
        'Total Workforce': m?.social?.workforce?.total ?? 'N/A',
        'Local Workforce %': m?.social?.workforce?.local_pct ?? 'N/A',
        'Pending Grievances (GRC)': m?.social?.grc?.pending ?? 'N/A',
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'E&S Compliance')
    XLSX.writeFile(workbook, `Amaravati_ES_Compliance_${filters.month}.xlsx`)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-4 pb-12 md:pb-16 h-full overflow-y-auto bg-muted/10">
        {/* Filter Bar Skeleton */}
        <div className="rounded-xl border bg-card p-3 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-48 flex-1 min-w-[160px] rounded-lg" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* KPI Row Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-3 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-20" />
              <div className="flex items-center gap-1.5 pt-1">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Attention Card Skeleton */}
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/30 dark:bg-amber-950/10 p-3.5 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-7 w-24 rounded-lg shrink-0" />
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex items-center gap-1.5 border-b pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[360px]">
          <div className="lg:col-span-2 rounded-xl border bg-card p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b/40">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-5 text-center border rounded-xl bg-destructive/5 text-destructive max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <h3 className="text-base font-semibold">Error Loading Compliance Data</h3>
        <p className="text-xs mt-1 text-muted-foreground">{error || 'Data could not be retrieved.'}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-4 pb-12 md:pb-16 h-full overflow-y-auto bg-muted/10">

      {/* Global Filter Bar */}
      <V3FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        months={months}
        contractors={contractors}
        projects={projectsList}
        filteredCount={filteredProjects.length}
        totalCount={data.projects.length}
        onExport={handleExport}
      />

      {/* 5 Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4 flex-1"
      >
        <TabsList className="w-full flex gap-2 h-10 p-0 bg-transparent border-0">
          <TabsTrigger 
            value="overview" 
            className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-none rounded-md text-xs font-bold text-black dark:text-white gap-2 py-2"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="evm" 
            className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-none rounded-md text-xs font-bold text-black dark:text-white gap-2 py-2"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
            EVM (Environment)
          </TabsTrigger>
          <TabsTrigger 
            value="ohs" 
            className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-none rounded-md text-xs font-bold text-black dark:text-white gap-2 py-2"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-500" />
            OHS
          </TabsTrigger>
          <TabsTrigger 
            value="road-safety" 
            className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-none rounded-md text-xs font-bold text-black dark:text-white gap-2 py-2"
          >
            <Car className="w-3.5 h-3.5 text-blue-500" />
            Road Safety
          </TabsTrigger>
          <TabsTrigger 
            value="social" 
            className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-none rounded-md text-xs font-bold text-black dark:text-white gap-2 py-2"
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Social
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview - Stat cards appear only here */}
        <TabsContent value="overview" className="m-0 flex flex-col gap-3 focus-visible:outline-none">
          {/* Executive Overview Stat Cards */}
          <V3KpiRow
            projects={filteredProjects}
            month={filters.month}
            totalPortfolioCount={data.metadata.total_portfolio_projects}
          />

          {/* Compliance Submissions & Reports Cards */}
          <ComplianceSubmissionsCards />

          {/* Submitted Forms + Recent Submissions side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">
            <div className="lg:col-span-2 min-w-0">
              <SubmittedFormsTable projects={filteredProjects} />
            </div>
            {/* Recent Submissions Table */}
            <div className="min-w-0">
              <AllSubmissionsTable />
            </div>
          </div>

          <OverviewTab
            projects={filteredProjects}
            month={filters.month}
            attentionItems={data.attention_required}
            defaulterProjects={data.defaulter_projects}
            domainAggregates={currentDomainAgg}
            onSelectProject={handleOpenProject}
          />
        </TabsContent>

        <TabsContent value="evm" className="m-0 focus-visible:outline-none">
          <EvmTab
            projects={filteredProjects}
            month={filters.month}
            domainAggregates={currentDomainAgg}
            onSelectProject={handleOpenProject}
            attentionItems={data.attention_required}
          />
        </TabsContent>

        {/* Tab 3: OHS */}
        <TabsContent value="ohs" className="m-0 focus-visible:outline-none">
          <OhsTab
            projects={filteredProjects}
            month={filters.month}
            domainAggregates={currentDomainAgg}
            onSelectProject={handleOpenProject}
            attentionItems={data.attention_required}
          />
        </TabsContent>

        {/* Tab 4: Road Safety */}
        <TabsContent value="road-safety" className="m-0 focus-visible:outline-none">
          <RoadSafetyTab
            projects={filteredProjects}
            month={filters.month}
            officialItems={data.metadata.official_road_safety_items}
            domainAggregates={currentDomainAgg}
            onSelectProject={handleOpenProject}
            attentionItems={data.attention_required}
          />
        </TabsContent>

        {/* Tab 5: Social */}
        <TabsContent value="social" className="m-0 focus-visible:outline-none">
          <SocialTab
            projects={filteredProjects}
            month={filters.month}
            domainAggregates={currentDomainAgg}
            metadata={data.metadata}
            onSelectProject={handleOpenProject}
            attentionItems={data.attention_required}
          />
        </TabsContent>

      </Tabs>

      {/* Contextual Project E&S Profile Drawer */}
      <V3ProjectDrawer
        project={selectedProject}
        month={filters.month}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
