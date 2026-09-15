'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Download,
  FileSpreadsheet,
  Upload,
  LayoutDashboard,
  Receipt,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  FileText,
  FileBarChart,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, addMonths, subMonths, parseISO, startOfMonth } from 'date-fns'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

// Internal Tabs
import PayrollOverviewTab from './payroll-overview-tab'
import PayrollSalaryTab from './payroll-salary-tab'
import PayrollEPFTab from './payroll-epf-tab'
import PayrollComplianceTab from './payroll-compliance-tab'
import PayrollExceptionsTab from './payroll-exceptions-tab'
import PayrollDocumentsTab from './payroll-documents-tab'
import PayrollReportsTab from './payroll-reports-tab'
import PayrollImportDialog from './payroll-import-dialog'

export default function PayrollView() {
  const { role } = useAuthStore()
  const canEdit = role === 'ADMIN' || role === 'HR_COORDINATOR' || role === 'PMC'

  // Default to September 2026 as per user requirement, but allow selecting any month
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 8, 1)) // Sep 2026
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const periodStr = format(selectedDate, 'yyyy-MM')
  const monthDisplay = format(selectedDate, 'MMMM yyyy')

  const handlePrevMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(prev => addMonths(prev, 1))
  }

  const handleGlobalExport = () => {
    toast.info(`Exporting consolidated payroll package for ${monthDisplay}...`)
    // Trigger download or export
    const link = document.createElement('a')
    link.href = `/api/payroll/salary?period=${periodStr}&limit=1000`
    link.target = '_blank'
    window.open(`/api/payroll/overview?period=${periodStr}`, '_blank')
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full min-w-0 pb-8">
      {/* ====== Section 5: Page Header ====== */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Salary & Statutory Payment Tracking &middot; <span className="font-semibold text-foreground">Payroll Period: {monthDisplay}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'overview' && (
            <Button variant="outline" size="sm" onClick={handleGlobalExport}>
              <Download className="h-4 w-4 mr-1.5" />
              <span>Export</span>
            </Button>
          )}

          {/* Portal target for left-side tab actions (like Export) */}
          <div id="payroll-tab-actions-left" className="flex items-center gap-2" />

          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />
                <span className="hidden sm:inline">Import Excel</span>
                <span className="sm:hidden">Import</span>
              </Button>

              <Button
                size="sm"
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
                onClick={() => setActiveTab('documents')}
              >
                <Upload className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Upload Records</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </>
          )}
          {/* Portal target for right-side tab actions (like Record Payment) */}
          <div id="payroll-tab-actions-right" className="flex items-center gap-2" />
        </div>
      </div>

      {/* ====== Section 4: Secondary Internal Navigation Tabs ====== */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col gap-4"
      >
        <TabsList className="shrink-0 w-full bg-muted/70 p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="flex-1 min-w-[120px] gap-1.5 text-xs data-[state=inactive]:text-black data-[state=inactive]:shadow-sm">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex-1 min-w-[120px] gap-1.5 text-xs data-[state=inactive]:text-black data-[state=inactive]:shadow-sm">
            <Receipt className="h-3.5 w-3.5" />
            Salary Payments
          </TabsTrigger>
          <TabsTrigger value="epf" className="flex-1 min-w-[120px] gap-1.5 text-xs data-[state=inactive]:text-black data-[state=inactive]:shadow-sm">
            <Landmark className="h-3.5 w-3.5" />
            EPF
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex-1 min-w-[120px] gap-1.5 text-xs data-[state=inactive]:text-black data-[state=inactive]:shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="flex-1 min-w-[120px] gap-1.5 text-xs data-[state=inactive]:text-black data-[state=inactive]:shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5" />
            Exceptions
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 min-w-[120px] gap-1.5 text-xs data-[state=inactive]:text-black data-[state=inactive]:shadow-sm">
            <FileText className="h-3.5 w-3.5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 min-w-[120px] gap-1.5 text-xs data-[state=inactive]:text-black data-[state=inactive]:shadow-sm">
            <FileBarChart className="h-3.5 w-3.5" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 mt-0">
          <PayrollOverviewTab period={periodStr} onNavigateTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="salary" className="flex-1 mt-0">
          <PayrollSalaryTab period={periodStr} />
        </TabsContent>

        <TabsContent value="epf" className="flex-1 mt-0">
          <PayrollEPFTab period={periodStr} />
        </TabsContent>

        <TabsContent value="compliance" className="flex-1 mt-0">
          <PayrollComplianceTab period={periodStr} />
        </TabsContent>

        <TabsContent value="exceptions" className="flex-1 mt-0">
          <PayrollExceptionsTab period={periodStr} onNavigateTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="documents" className="flex-1 mt-0">
          <PayrollDocumentsTab period={periodStr} />
        </TabsContent>

        <TabsContent value="reports" className="flex-1 mt-0">
          <PayrollReportsTab period={periodStr} />
        </TabsContent>
      </Tabs>

      {/* Excel Import Dialog */}
      <PayrollImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        period={periodStr}
      />
    </div>
  )
}
