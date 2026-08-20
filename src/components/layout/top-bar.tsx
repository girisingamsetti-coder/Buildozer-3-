'use client'

import { useNavStore, pageTitles } from '@/stores/nav-store'
import { useAuthStore, roleLabels } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Bell, User, Monitor, Moon, Sun, Trash2, Calendar, LogOut, User as UserIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getInitials(name: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface Notification {
  id: string
  title: string
  message: string
  priority: string
  isRead: boolean
  createdAt: string
}

export function TopBar() {
  const { mobileView, setMobileView, activePage, setPage } = useNavStore()
  const { logout, userName, role } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchNotifications = useCallback(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (mobileView) fetchNotifications()
  }, [fetchNotifications, mobileView])

  if (!mobileView) return null

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleClearAll = async () => {
    setClearing(true)
    try {
      await fetch('/api/notifications', { method: 'DELETE' })
      setNotifications([])
    } catch {
      // ignore
    }
    setClearing(false)
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const isDark = mounted && theme === 'dark'

  return (
    <header className="flex items-center justify-between px-3 h-14 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
          {pageTitles[activePage] || 'Buildozer'}
        </h1>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 shrink-0" onClick={() => setMobileView(false)} title="Exit Mobile View">
          <Monitor className="h-4 w-4" />
        </Button>
        {/* Dark Mode */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 rounded-full text-slate-600 dark:text-slate-300">
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full text-slate-600 dark:text-slate-300">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0 -right-0 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center ring-1 ring-background dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-72 p-0 rounded-xl mt-1 z-[100]">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-red-600" onClick={handleClearAll} disabled={clearing}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="h-80 max-h-[50vh]">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                <div className="divide-y">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className={cn('mt-1 inline-block w-2 h-2 rounded-full shrink-0', n.priority === 'Critical' ? 'bg-red-500' : n.priority === 'High' ? 'bg-amber-500' : 'bg-teal-500')} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600 dark:text-slate-300">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                {getInitials(userName || 'User')}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56 z-[100]">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{roleLabels[role] || role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPage('settings')} className="cursor-pointer">
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPage('attendance')} className="cursor-pointer">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
