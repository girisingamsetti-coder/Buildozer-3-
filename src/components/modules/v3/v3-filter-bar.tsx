'use client'

import React from 'react'
import { Search, Filter, Calendar, Building2, AlertTriangle, Download } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DashboardFilterState } from './v3-types'
import { AddNewFormsDropdown } from './add-new-forms-dropdown'

interface V3FilterBarProps {
  filters: DashboardFilterState
  onFilterChange: (newFilters: Partial<DashboardFilterState>) => void
  months: string[]
  contractors: string[]
  projects: string[]
  filteredCount: number
  totalCount: number
  onExport?: () => void
}

const MONTH_LABELS: Record<string, string> = {
  '2026-02': 'February 2026',
  '2026-03': 'March 2026',
  '2026-04': 'April 2026',
  '2026-05': 'May 2026',
  '2026-06': 'June 2026',
  '2026-07': 'July 2026',
  '2026-08': 'August 2026',
  '2026-09': 'September 2026',
}

export function V3FilterBar({
  filters,
  onFilterChange,
  months,
  contractors,
  projects,
  filteredCount,
  totalCount,
  onExport,
}: V3FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border rounded-xl shadow-xs">
      <h1 className="text-xl font-bold text-foreground shrink-0 pl-1">Environment & Safety</h1>
      <div className="flex flex-wrap items-center justify-end gap-2.5 flex-1 min-w-[300px]">
        {/* Month Selector */}
        <div className="flex items-center gap-1.5">

          <Select
            value={filters.month}
            onValueChange={(val) => onFilterChange({ month: val })}
          >
            <SelectTrigger className="w-[170px] h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {MONTH_LABELS[m] || m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search by Name or ID */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">

          <Input
            placeholder="Search project or ID (e.g. Zone - 9A)..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="px-3 h-9 text-xs bg-background"
          />
        </div>

        {/* Contractor Filter */}
        <div className="flex items-center gap-1.5">

          <Select
            value={filters.contractor}
            onValueChange={(val) => onFilterChange({ contractor: val })}
          >
            <SelectTrigger className="w-[160px] h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="All Contractors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Contractors
              </SelectItem>
              {contractors.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-1.5">

          <Select
            value={filters.project}
            onValueChange={(val) => onFilterChange({ project: val })}
          >
            <SelectTrigger className="w-[160px] h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Projects
              </SelectItem>
              {projects.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">

          <Select
            value={filters.statusFilter}
            onValueChange={(val: any) => onFilterChange({ statusFilter: val })}
          >
            <SelectTrigger className="w-[175px] h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Compliance States
              </SelectItem>
              <SelectItem value="COMPLIANT" className="text-xs text-emerald-600 dark:text-emerald-400">
                ● Compliant Only
              </SelectItem>
              <SelectItem value="ATTENTION" className="text-xs text-amber-600 dark:text-amber-400">
                ▲ Attention / Issues Only
              </SelectItem>
              <SelectItem value="MISSING" className="text-xs text-rose-600 dark:text-rose-400">
                ✕ Missing Submissions
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right Controls: Count & Export */}
      <div className="flex items-center gap-2 shrink-0">
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </Button>
        )}
        <AddNewFormsDropdown />
      </div>
    </div>
  )
}
