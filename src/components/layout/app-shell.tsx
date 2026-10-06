'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useNavStore } from '@/stores/nav-store'
import { SidebarNav } from './sidebar-nav'
import { GlobalHeader } from './global-header'
import { TopBar } from './top-bar'
import { MobileBottomNav } from './mobile-bottom-nav'
import { LoginScreen } from './login-screen'
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Dialog-based wizards (always mounted, conditionally visible)
import WorkerFormDialog from '@/components/modules/worker-form-dialog'
import IncidentFormDialog from '@/components/modules/incident-form-dialog'

// Lazy-load module views for performance
const DashboardView = lazy(() => import('@/components/modules/dashboard-view'))
const WorkforceView = lazy(() => import('@/components/modules/workforce-view'))
const WorkerDetailView = lazy(() => import('@/components/modules/worker-detail-view'))
const WorkerFormView = lazy(() => import('@/components/modules/worker-form-view'))
const WorkerFitnessView = lazy(() => import('@/components/modules/worker-fitness-view'))
const LocationsView = lazy(() => import('@/components/modules/locations-view'))
const MedicalView = lazy(() => import('@/components/modules/medical-view'))
const TrainingView = lazy(() => import('@/components/modules/training-view'))
const IncidentListView = lazy(() => import('@/components/modules/incident-list-view'))
const IncidentDetailView = lazy(() => import('@/components/modules/incident-detail-view'))
const IncidentFormView = lazy(() => import('@/components/modules/incident-form-view'))
const GrievanceView = lazy(() => import('@/components/modules/grievance-view'))
const VehicleListView = lazy(() => import('@/components/modules/vehicle-list-view'))
const VehicleDetailView = lazy(() => import('@/components/modules/vehicle-detail-view'))
const HazardousView = lazy(() => import('@/components/modules/hazardous-view'))
const LegalView = lazy(() => import('@/components/modules/legal-view'))
const ComplianceView = lazy(() => import('@/components/modules/compliance-view'))
const SettingsView = lazy(() => import('@/components/modules/settings-view'))
const ReportsView = lazy(() => import('@/components/modules/reports-view'))
const EsFormsView = lazy(() => import('@/components/modules/es-forms-view'))
const EsForms2View = lazy(() => import('@/components/modules/es-forms-2-view'))
const V3View = lazy(() => import('@/components/modules/v3-view'))
const MoreView = lazy(() => import('@/components/modules/more-view'))
const ProcurementView = lazy(() => import('@/app/procurement/page'))

function LoadingFallback() {
  return (
    <div className="space-y-4 p-4 sm:p-6 w-full h-full overflow-hidden">
      {/* Page Title & Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Metric Tiles Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-3 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[350px]">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
          <div className="space-y-2 flex-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b/50">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
          <Skeleton className="h-44 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

const pageComponents: Record<string, React.LazyExoticComponent<any>> = {
  dashboard: DashboardView,
  workers: WorkforceView,
  'worker-detail': WorkerDetailView,
  'worker-form': WorkerFormView,
  'worker-fitness': WorkerFitnessView,
  locations: LocationsView,
  medical: MedicalView,
  training: TrainingView,
  attendance: WorkforceView,
  payroll: WorkforceView,
  incidents: IncidentListView,
  'incident-detail': IncidentDetailView,
  'incident-form': IncidentFormView,
  grievance: GrievanceView,
  vehicles: VehicleListView,
  'vehicle-detail': VehicleDetailView,
  hazardous: HazardousView,
  legal: LegalView,
  compliance: ComplianceView,
  settings: SettingsView,
  reports: ReportsView,
  'es-forms': EsFormsView,
  'es-forms-2': EsForms2View,
  'v3': V3View,
  more: MoreView,
  procurement: ProcurementView,
}

const deviceDimensions: Record<string, { width: string, height: string }> = {
  'iphone-15-pro': { width: '393px', height: '852px' },
  'iphone-se': { width: '375px', height: '667px' },
  'galaxy-s23': { width: '360px', height: '780px' },
  'pixel-7': { width: '412px', height: '915px' },
}

export function AppShell() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const activePage = useNavStore(s => s.activePage)
  const mobileView = useNavStore(s => s.mobileView)

  if (!isAuthenticated) return <LoginScreen />

  const PageComponent = pageComponents[activePage]

  const pageContent = (
    <Suspense fallback={<LoadingFallback />}>
      {PageComponent ? <PageComponent /> : <div className="text-center py-20 text-muted-foreground">Page not found</div>}
    </Suspense>
  )

  const isMobile = !!mobileView;
  const currentDevice = typeof mobileView === 'string' ? deviceDimensions[mobileView] : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <GlobalHeader />
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && <SidebarNav />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isMobile ? (
            <div className="flex-1 overflow-hidden bg-muted/50 flex items-center justify-center p-0 sm:p-4 lg:p-6">
              <div
                className="mobile-frame bg-background shadow-2xl ring-1 ring-black/10 sm:rounded-[2.5rem] overflow-hidden flex flex-col relative"
                style={{
                  width: currentDevice ? currentDevice.width : '420px',
                  height: currentDevice ? currentDevice.height : '100%',
                  maxHeight: '100%',
                }}
              >
                {/* Optional simulated notch removed as per request */}
                {/* TopBar inside the mobile frame so it aligns with content */}
                <TopBar />
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                  <div className="p-4 pb-20">{pageContent}</div>
                </main>
                <MobileBottomNav />
              </div>
            </div>
          ) : (
            <>
              <main className="flex-1 overflow-hidden">
                <div className="px-3 sm:px-4 pt-3 pb-0 h-full flex flex-col min-w-0">{pageContent}</div>
              </main>
            </>
          )}
        </div>
      </div>
      {/* Global wizard dialogs — always mounted so any caller can open them */}
      <WorkerFormDialog />
      <IncidentFormDialog />
    </div>
  )
}
