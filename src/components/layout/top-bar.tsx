'use client'

import { useNavStore, pageTitles } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Bell, User } from 'lucide-react'

export function TopBar() {
  const { mobileView, activePage } = useNavStore()

  if (!mobileView) return null

  return (
    <header className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
      <div className="w-8" /> {/* Placeholder for balance */}
      
      <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate flex-1 text-center">
        {pageTitles[activePage] || 'Buildozer'}
      </h1>

      <div className="flex items-center gap-2 w-8 justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
