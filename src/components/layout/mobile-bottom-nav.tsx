'use client'

import { useNavStore, type PageId } from '@/stores/nav-store'
import { LayoutDashboard, Users, AlertTriangle, FileBarChart, Grid } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const { activePage, setPage, mobileView } = useNavStore()

  // Only render if mobileView is active (simulated or real)
  if (!mobileView) return null

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'workers', label: 'Workforce', icon: Users },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
  ]

  return (
    <nav className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activePage === item.id || activePage.startsWith(item.id.replace(/s$/, ''))
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id as PageId)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}

        {/* More Options Tab */}
        <button
          onClick={() => setPage('more')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            activePage === 'more' ? "text-teal-600 dark:text-teal-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
          )}
        >
          <Grid className={cn("h-5 w-5", activePage === 'more' && "stroke-[2.5px]")} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  )
}
