import React, { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Maximize2, Minimize2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SubmittedFullFormView } from './submitted-full-form-view'

export type FormStatus = 'PMC' | 'PGMC' | 'CRDA' | 'Approved' | 'Rejected' | 'Pending'

export interface MockWizardForm {
  id: string
  formType: string
  project: string
  status: FormStatus
  date: string
  contractor: string
  pmc: string
  remarks?: string
}

const STATUS_COLORS: Record<FormStatus, string> = {
  PMC: '#3b82f6',
  PGMC: '#f59e0b',
  CRDA: '#8b5cf6',
  Approved: '#10b981',
  Rejected: '#ef4444',
  Pending: '#f97316',
}

interface SubmittedFormsWizardProps {
  isOpen: boolean
  onClose: () => void
  project: {
    projectName: string
    contractor: string
    pmc: string
  } | null
  formType: string | null
  stats: {
    raised: number
    approved: number
    rejected: number
    inProgress: number
  } | null
}

export function SubmittedFormsWizard({ isOpen, onClose, project, formType, stats }: SubmittedFormsWizardProps) {
  const [selectedForm, setSelectedForm] = useState<MockWizardForm | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)

  // Generate mock forms matching the stats perfectly
  const forms = useMemo(() => {
    if (!project || !formType || !stats || stats.raised === 0) return []

    const newForms: MockWizardForm[] = []
    
    const { approved, rejected, inProgress, raised } = stats
    
    // We'll distribute the inProgress ones randomly across PMC, PGMC, CRDA
    const inProgressStatuses: FormStatus[] = ['PMC', 'PGMC', 'CRDA', 'Pending']

    let addedApproved = 0
    let addedRejected = 0
    let addedInProgress = 0

    for (let i = 0; i < raised; i++) {
      let status: FormStatus = 'Pending'
      if (addedApproved < approved) {
        status = 'Approved'
        addedApproved++
      } else if (addedRejected < rejected) {
        status = 'Rejected'
        addedRejected++
      } else if (addedInProgress < inProgress) {
        status = inProgressStatuses[Math.floor(Math.random() * inProgressStatuses.length)]
        addedInProgress++
      }

      const d = new Date(2026, 8, Math.floor(Math.random() * 28) + 1) // Random date in Sep 2026
      
      newForms.push({
        id: `${formType}-${project.projectName.replace(/\s+/g, '').toUpperCase()}-${1000 + i}`,
        formType,
        project: project.projectName,
        contractor: project.contractor,
        pmc: project.pmc,
        status,
        date: d.toISOString().split('T')[0],
      })
    }
    
    // Sort randomly or by date, let's just reverse so newest might be first
    return newForms.reverse()
  }, [project, formType, stats])

  // Count breakdown for header
  const counts = useMemo(() => {
    return forms.reduce((acc, form) => {
      acc[form.status] = (acc[form.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [forms])

  const handleClose = () => {
    setSelectedForm(null)
    setIsMaximized(false)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        className={cn(
          "p-0 flex flex-col bg-slate-50 dark:bg-slate-950 transition-all duration-300",
          selectedForm
            ? (isMaximized ? "w-full sm:max-w-[95vw]" : "w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl")
            : "w-full sm:max-w-md md:max-w-lg lg:max-w-xl"
        )}
      >
        {!selectedForm ? (
          <>
            <SheetHeader className="p-4 border-b bg-white dark:bg-slate-900 shadow-sm z-10 sticky top-0 pr-12">
              <SheetTitle className="text-lg font-bold tracking-tight flex flex-col gap-1 text-left">
                <span>{project?.projectName}</span>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950">
                    {formType}
                  </Badge>
                  <span>Total Forms: {stats?.raised || 0}</span>
                </span>
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="flex-1 p-4 sm:p-5">
            <div className="flex flex-col gap-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border shadow-xs">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Approved</span>
                    <span className="text-2xl font-black text-foreground">{counts['Approved'] || 0}</span>
                  </CardContent>
                </Card>
                <Card className="border shadow-xs">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">PMC</span>
                    <span className="text-2xl font-black text-foreground">{counts['PMC'] || 0}</span>
                  </CardContent>
                </Card>
                <Card className="border shadow-xs">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">PGMC</span>
                    <span className="text-2xl font-black text-foreground">{counts['PGMC'] || 0}</span>
                  </CardContent>
                </Card>
                <Card className="border shadow-xs">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-1">CRDA</span>
                    <span className="text-2xl font-black text-foreground">{counts['CRDA'] || 0}</span>
                  </CardContent>
                </Card>
              </div>

              {/* Form List */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Form Submissions
                  <Badge variant="secondary" className="text-[10px] h-5">{forms.length}</Badge>
                </h3>
                
                <div className="flex flex-col gap-2">
                  {forms.map(form => (
                    <div 
                      key={form.id}
                      onClick={() => setSelectedForm(form)}
                      className="group flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{form.id}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] font-semibold border-current shadow-sm"
                        style={{ color: STATUS_COLORS[form.status], backgroundColor: `${STATUS_COLORS[form.status]}15` }}
                      >
                        {form.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <SheetTitle className="sr-only">
            {selectedForm.formType} Compliance Report - {selectedForm.id}
          </SheetTitle>
          <SubmittedFullFormView
            form={selectedForm}
            onBack={() => setSelectedForm(null)}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
          />
        </div>
      )}
      </SheetContent>
    </Sheet>
  )
}
