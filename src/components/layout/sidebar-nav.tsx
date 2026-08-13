'use client'

import { useNavStore, type PageId } from '@/stores/nav-store'
import { useAuthStore, rolePermissions } from '@/lib/auth-store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  GraduationCap,
  AlertTriangle,
  MessageSquareWarning,
  Truck,
  Scale,
  ClipboardCheck,
  Settings,
  X,
  FileBarChart,
  Menu,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'workers', label: 'Workforce', icon: Users },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'vehicles', label: 'Machinery & Vehicles', icon: Truck },
  { id: 'incidents', label: 'Incident Register', icon: AlertTriangle },
  { id: 'training', label: 'Training & Certification', icon: GraduationCap },
  { id: 'medical', label: 'Medical Records', icon: HeartPulse },
  { id: 'grievance', label: 'Grievances', icon: MessageSquareWarning },
  { id: 'legal', label: 'Legal Compliance', icon: Scale },
  { id: 'compliance', label: 'Site Compliance', icon: ClipboardCheck },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function SidebarNav() {
  const { activePage, setPage, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, mobileView } = useNavStore()
  const role = useAuthStore(s => s.role)
  const permissions = rolePermissions[role] ?? rolePermissions.SAFETY_OFFICER

  const filteredItems = navItems.filter(item => permissions.modules.includes(item.id))
  // When mobile view is forced, the sidebar always behaves as a mobile overlay
  // (never collapsed, always slide-in) regardless of screen size.
  const forceMobile = mobileView
  const collapsed = forceMobile ? false : sidebarCollapsed

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={cn(
            'fixed inset-0 bg-black/50 z-40 backdrop-blur-sm',
            forceMobile ? '' : 'lg:hidden'
          )}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={cn(
        'bg-sidebar text-sidebar-foreground flex flex-col shrink-0 transition-[width] duration-300 ease-in-out border-r border-sidebar-border relative',
        // Mobile: fixed, slide in/out
        'fixed top-0 left-0 z-50 h-full w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: in-flow, full or mini — only when not in forced mobile view
        !forceMobile && 'lg:static lg:h-full lg:translate-x-0',
        !forceMobile && (collapsed ? 'lg:w-16' : 'lg:w-64')
      )}>
        {/* Header */}
        <div className={cn(
          'flex items-center border-b border-sidebar-border shrink-0',
          collapsed ? 'h-14 justify-center px-2' : 'h-20 px-3'
        )}>
          <img
            src="/buildozer-logo.png"
            alt="Buildozer"
            className={cn(
              'object-contain transition-all duration-300',
              collapsed ? 'w-10 h-10 rounded-xl' : 'w-full rounded-2xl'
            )}
          />
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8 shrink-0 ml-auto',
              forceMobile ? '' : 'lg:hidden'
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav items */}
        <ScrollArea className="flex-1 min-h-0 py-3 px-2.5">
          <nav className="space-y-0.5">
            {filteredItems.map(item => {
              const Icon = item.icon
              const isActive = activePage === item.id || (item.id === 'workers' && ['worker-detail', 'worker-form', 'worker-fitness', 'attendance'].includes(activePage)) || (item.id === 'incidents' && ['incident-detail', 'incident-form'].includes(activePage)) || (item.id === 'vehicles' && activePage === 'vehicle-detail')

              const btn = (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setSidebarOpen(false) }}
                  className={cn(
                    'w-full flex items-center rounded-lg text-sm font-medium transition-colors relative',
                    collapsed
                      ? 'justify-center px-0 py-2.5'
                      : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      {btn}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return btn
            })}
          </nav>
        </ScrollArea>

        {/* Collapse toggle — always on the sidebar right edge, vertically centered (desktop only, hidden in forced mobile view) */}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -right-3 z-10 h-6 w-6 rounded-full border border-border bg-background shadow-sm items-center justify-center hover:bg-accent hover:shadow-md transition-all',
            forceMobile ? 'hidden' : 'hidden lg:flex'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          }
        </button>
      </aside>

      {/* Mobile floating menu button (also shown on desktop when mobile view is forced) */}
      <button
        className={cn(
          'fixed bottom-4 left-4 z-30 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform',
          forceMobile ? '' : 'lg:hidden'
        )}
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
    </TooltipProvider>
  )
}
