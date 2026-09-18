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
  AlertCircle
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default function V3View() {
  const [data, setData] = useState<V3CompliancePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Global Filter State
  const [filters, setFilters] = useState<DashboardFilterState>({
    month: '2026-09',
    searchQuery: '',
    contractor: 'ALL',
    statusFilter: 'ALL',
  })

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview')

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
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading Amaravati E&S Compliance Intelligence...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center border rounded-xl bg-destructive/5 text-destructive max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <h3 className="text-base font-semibold">Error Loading Compliance Data</h3>
        <p className="text-xs mt-1 text-muted-foreground">{error || 'Data could not be retrieved.'}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 min-h-screen bg-muted/10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[11px] font-semibold">
              APCRDA / ADCL E&S Monitoring System
            </Badge>
            <Badge variant="outline" className="text-[11px] text-muted-foreground">
              94 Active Infrastructure Packages
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Amaravati Environmental & Social Compliance Monitoring Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time compliance intelligence across Road Safety, OHS, Environment, and Social Safeguards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Export Monthly Summary
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <V3FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        months={months}
        contractors={contractors}
        filteredCount={filteredProjects.length}
        totalCount={data.projects.length}
        onExport={handleExport}
      />

      {/* Executive KPI Strip */}
      <V3KpiRow
        projects={filteredProjects}
        month={filters.month}
        totalPortfolioCount={data.metadata.total_portfolio_projects}
      />

      {/* 5 Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4 flex-1"
      >
        <TabsList className="w-full sm:w-auto self-start grid grid-cols-5 h-10 p-1 bg-muted/60 border">
          <TabsTrigger value="overview" className="text-xs font-semibold gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="evm" className="text-xs font-semibold gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
            EVM (Environment)
          </TabsTrigger>
          <TabsTrigger value="ohs" className="text-xs font-semibold gap-1.5">
            <HardHat className="w-3.5 h-3.5 text-amber-500" />
            OHS
          </TabsTrigger>
          <TabsTrigger value="road-safety" className="text-xs font-semibold gap-1.5">
            <Car className="w-3.5 h-3.5 text-blue-500" />
            Road Safety
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs font-semibold gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Social & Labor
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="m-0 focus-visible:outline-none">
          <OverviewTab
            projects={filteredProjects}
            month={filters.month}
            attentionItems={data.attention_required}
            defaulterProjects={data.defaulter_projects}
            onSelectProject={handleOpenProject}
          />
        </TabsContent>

        {/* Tab 2: EVM (Environment) */}
        <TabsContent value="evm" className="m-0 focus-visible:outline-none">
          <EvmTab
            projects={filteredProjects}
            month={filters.month}
            onSelectProject={handleOpenProject}
          />
        </TabsContent>

        {/* Tab 3: OHS */}
        <TabsContent value="ohs" className="m-0 focus-visible:outline-none">
          <OhsTab
            projects={filteredProjects}
            month={filters.month}
            onSelectProject={handleOpenProject}
          />
        </TabsContent>

        {/* Tab 4: Road Safety */}
        <TabsContent value="road-safety" className="m-0 focus-visible:outline-none">
          <RoadSafetyTab
            projects={filteredProjects}
            month={filters.month}
            officialItems={data.metadata.official_road_safety_items}
            onSelectProject={handleOpenProject}
          />
        </TabsContent>

        {/* Tab 5: Social */}
        <TabsContent value="social" className="m-0 focus-visible:outline-none">
          <SocialTab
            projects={filteredProjects}
            month={filters.month}
            onSelectProject={handleOpenProject}
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
