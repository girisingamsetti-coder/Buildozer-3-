'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================

export type FormType = 'OHS' | 'EVM' | 'Road Safety' | 'Social' | 'Social Legacy'
export type FormStatus = 'PMC' | 'PGMC' | 'CRDA' | 'Approved' | 'Rejected' | 'Pending'

export interface FormEntry {
  id: string
  formType: FormType
  submittedBy: string
  location: string
  date: string
  status: FormStatus
  remarks?: string
}

export const FORM_TYPES: FormType[] = ['OHS', 'EVM', 'Road Safety', 'Social', 'Social Legacy']

export const STATUS_COLORS: Record<FormStatus, string> = {
  PMC: '#3b82f6',
  PGMC: '#f59e0b',
  CRDA: '#8b5cf6',
  Approved: '#10b981',
  Rejected: '#ef4444',
  Pending: '#f97316',
}

export const STATUS_OPTIONS: FormStatus[] = ['PMC', 'PGMC', 'CRDA', 'Approved', 'Rejected', 'Pending']

export const STORAGE_KEY = 'es-forms-data-v2'

// Seed data that strictly aligns with executive reporting
export function seedData(): FormEntry[] {
  const forms: FormEntry[] = []
  const names = ['Ravi Kumar', 'Sita Devi', 'Arjun Rao', 'Priya Reddy', 'Suresh Babu', 'Meena Sharma']
  const locations = [
    'Seed Access Road',
    'Capital Building (CBD)',
    'Government Complex',
    'High Court Complex',
    'Legislative Assembly',
    'Secretariat Building',
    'Amaravati Riverfront',
    'CRDA Township Phase 1',
    'PMGSY Roads Package',
    'Town & Country Planning',
  ]

  // Distribution matching dashboard reports:
  // OHS (14): PMC: 1, PGMC: 5, CRDA: 4, Approved: 2, Rejected: 2, Pending: 0
  // EVM (12): PMC: 1, PGMC: 5, CRDA: 1, Approved: 3, Rejected: 2, Pending: 0
  // Road Safety (10): PMC: 2, PGMC: 1, CRDA: 2, Approved: 2, Rejected: 3, Pending: 0
  // Social (16): PGMC: 2, CRDA: 2, Approved: 7, Rejected: 2, Pending: 3
  // Social Legacy (8): PMC: 1, PGMC: 3, CRDA: 1, Approved: 1, Rejected: 1, Pending: 1
  const spec: Record<FormType, Record<FormStatus, number>> = {
    OHS: { PMC: 1, PGMC: 5, CRDA: 4, Approved: 2, Rejected: 2, Pending: 0 },
    EVM: { PMC: 1, PGMC: 5, CRDA: 1, Approved: 3, Rejected: 2, Pending: 0 },
    'Road Safety': { PMC: 2, PGMC: 1, CRDA: 2, Approved: 2, Rejected: 3, Pending: 0 },
    Social: { PMC: 0, PGMC: 2, CRDA: 2, Approved: 7, Rejected: 2, Pending: 3 },
    'Social Legacy': { PMC: 1, PGMC: 3, CRDA: 1, Approved: 1, Rejected: 1, Pending: 1 },
  }

  FORM_TYPES.forEach(type => {
    const counts = spec[type]
    Object.entries(counts).forEach(([statusKey, count]) => {
      const status = statusKey as FormStatus
      for (let i = 0; i < count; i++) {
        const d = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        forms.push({
          id: `${type}-${status}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          formType: type,
          submittedBy: names[Math.floor(Math.random() * names.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          date: d.toISOString().split('T')[0],
          status,
        })
      }
    })
  })

  return forms
}

export function loadForms(): FormEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    const seed = seedData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  } catch {
    return []
  }
}

// ==================== STAT CARD ====================

interface StatCardProps {
  formType: FormType
  entries: FormEntry[]
  isSelected?: boolean
  onClick?: () => void
}

export function StatCard({ formType, entries, isSelected, onClick }: StatCardProps) {
  const total = entries.length
  const pending = entries.filter(e => e.status === 'Pending').length
  const breakdown = STATUS_OPTIONS.filter(s => s !== 'Pending').map(s => ({
    name: s,
    value: entries.filter(e => e.status === s).length,
    color: STATUS_COLORS[s],
  })).filter(d => d.value > 0)

  const chartData = breakdown.length > 0 ? breakdown : [{ name: 'None', value: 1, color: '#e2e8f0' }]

  return (
    <Card
      onClick={onClick}
      className={cn(
        'flex-1 min-w-0 border shadow-xs transition-all duration-200 cursor-pointer rounded-2xl bg-card',
        isSelected
          ? 'border-2 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      )}
    >
      <CardContent className="p-3.5 flex flex-col gap-2.5">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate text-center">
          {formType}
        </p>
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                dataKey="value"
                strokeWidth={0}
                cornerRadius={5}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: '11px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 8px',
                }}
                formatter={(v, n) => [v, n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
              {total}
            </span>
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Created</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
          {breakdown.map(b => (
            <span
              key={b.name}
              className="flex items-center gap-1 text-[9px] text-slate-600 dark:text-slate-300 font-medium"
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: b.color }}
              />
              {b.name}: {b.value}
            </span>
          ))}
        </div>
        <div className="border border-orange-400/80 rounded-xl px-2.5 py-1.5 text-center bg-orange-50/70 dark:bg-orange-950/20 flex items-center justify-between mt-auto">
          <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Pending</p>
          <p className="text-xl font-black text-orange-500 leading-none">{pending}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== COMPLIANCE SUBMISSIONS CARDS ROW ====================

export function ComplianceSubmissionsCards() {
  const [forms, setForms] = useState<FormEntry[]>([])
  const [selectedType, setSelectedType] = useState<FormType | null>('Social')

  useEffect(() => {
    setForms(loadForms())

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setForms(loadForms())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <h2 className="text-sm font-bold text-foreground tracking-tight">
        Compliance Submissions & Reports
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 shrink-0">
        {FORM_TYPES.map(type => (
          <StatCard
            key={type}
            formType={type}
            entries={forms.filter(f => f.formType === type)}
            isSelected={selectedType === type}
            onClick={() => setSelectedType(type === selectedType ? null : type)}
          />
        ))}
      </div>
    </div>
  )
}
