import React, { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle, Eye, ShieldCheck, Building2, User } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'

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
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 flex flex-col bg-slate-50 dark:bg-slate-950">
        <SheetHeader className="p-4 border-b bg-white dark:bg-slate-900 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {selectedForm && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0 -ml-2" onClick={() => setSelectedForm(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <SheetTitle className="text-lg font-bold tracking-tight flex flex-col gap-1">
              <span>{project?.projectName}</span>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950">
                  {formType}
                </Badge>
                {selectedForm ? (
                  <span>Form Details: {selectedForm.id}</span>
                ) : (
                  <span>Total Forms: {stats?.raised || 0}</span>
                )}
              </span>
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          {!selectedForm ? (
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
          ) : (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
              {/* Form Detail View */}
              <Card className="border shadow-sm">
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{selectedForm.id}</h4>
                      <p className="text-xs text-muted-foreground">Submitted on {new Date(selectedForm.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-1 font-bold border-current shadow-sm"
                        style={{ color: STATUS_COLORS[selectedForm.status], backgroundColor: `${STATUS_COLORS[selectedForm.status]}15` }}
                      >
                        {selectedForm.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Form Type</span>
                      <span className="font-semibold">{selectedForm.formType}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> Project</span>
                      <span className="font-semibold">{selectedForm.project}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Contractor</span>
                      <span className="font-semibold">{selectedForm.contractor}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> PMC</span>
                      <span className="font-semibold">{selectedForm.pmc}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm border-dashed">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                  <Eye className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">Full form view is available in the Forms module.</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Open in Forms Module
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
