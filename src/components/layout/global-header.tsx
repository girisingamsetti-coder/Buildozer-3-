'use client'

import { useNavStore } from '@/stores/nav-store'
import { useAuthStore, roleLabels } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Bell,
  User as UserIcon,
  LayoutGrid,
  FileText,
  TrendingUp,
  Users,
  MapPin,
  MessageSquareWarning,
  Eye,
  FileBarChart,
  ChevronDown,
  LogOut,
  Calendar
} from 'lucide-react'
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { useState, useCallback, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

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

export function GlobalHeader() {
  const { setPage } = useNavStore()
  const { logout, login, userName, role } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  const demoUsers = [
    { name: 'Demo Admin', role: 'ADMIN' as const },
    { name: 'Demo Safety Officer', role: 'SAFETY_OFFICER' as const },
    { name: 'Demo PMC', role: 'PMC' as const },
    { name: 'Demo HR', role: 'HR_COORDINATOR' as const },
    { name: 'Demo Legal', role: 'LEGAL_ADVISOR' as const },
  ]

  const fetchNotifications = useCallback(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => { })
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

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

  const navItems = [
    { label: 'AICCC', icon: LayoutGrid, active: false },
    { label: 'Works', icon: LayoutGrid, active: false },
    { label: 'Bills', icon: FileText, active: false },
    { label: 'Physical Progress', icon: TrendingUp, active: false },
    { label: 'E&S', icon: Users, active: true },
    { label: 'Lands', icon: MapPin, active: false },
    { label: 'Grievances', icon: MessageSquareWarning, active: false },
    { label: 'Ground Observations', icon: Eye, active: false },
    { label: 'Reports', icon: FileText, active: false },
    { label: 'AICCC Reports', icon: FileBarChart, active: false },
  ]

  return (
    <header className="flex items-center justify-between h-14 shrink-0 bg-[#2b3544] text-white select-none w-full shadow-md z-[60]">
      {/* Left Section: Logos & Title */}
      <div className="flex items-center h-full px-4 gap-4">
        {/* AP Logo Placeholder */}
        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center p-0.5 overflow-hidden border-2 border-emerald-600 shadow-sm shrink-0">
          <div className="w-full h-full rounded-full border-2 border-emerald-500 border-dashed animate-[spin_10s_linear_infinite]" />
        </div>

        <div className="h-8 w-px bg-slate-600 shrink-0" />

        <div className="flex flex-col justify-center">
          <span className="text-sm font-bold tracking-wider leading-none text-white">AICCC</span>
          <span className="text-[10px] text-slate-300 font-medium leading-none mt-1">Amaravati Integrated Command Control Center</span>
        </div>

        <div className="h-8 w-px bg-slate-600 shrink-0 mx-2" />

        {/* Amaravati Logo Placeholder */}
        <div className="flex flex-col items-center justify-center">
          <div className="h-6 w-16 bg-gradient-to-t from-amber-200/20 to-amber-100/5 rounded-t-full border-b-2 border-amber-500" />
          <span className="text-[8px] tracking-[0.2em] text-white/80 mt-0.5">AMARAVATI</span>
        </div>
      </div>

      {/* Middle Section: Navigation */}
      <div className="flex-1 flex items-center h-full overflow-x-auto no-scrollbar gap-1 px-4">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 h-10 rounded-md whitespace-nowrap transition-colors",
              item.active
                ? "bg-slate-700/80 text-white font-semibold relative after:absolute after:bottom-0.5 after:left-2 after:right-2 after:h-0.5 after:bg-white after:rounded-full"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-white text-sm"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-2 px-4 shrink-0 h-full border-l border-slate-600 pl-4 ml-2">
        {/* Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-slate-300 hover:text-white hover:bg-slate-700">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-72 p-0 rounded-xl mt-2 z-[100] border-slate-200 shadow-xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <Badge variant="secondary" className="text-[10px] py-0">{unreadCount} new</Badge>}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-slate-500 hover:text-red-600" onClick={handleClearAll} disabled={clearing}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="h-80 max-h-[50vh]">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No notifications</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className={cn('mt-1 inline-block w-2 h-2 rounded-full shrink-0', n.priority === 'Critical' ? 'bg-red-500' : n.priority === 'High' ? 'bg-amber-500' : 'bg-teal-500')} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
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
            <Button variant="outline" className="h-9 px-3 bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:text-white text-slate-200 gap-2 rounded-md">
              <UserIcon className="h-4 w-4" />
              <span className="text-xs font-medium">{roleLabels[role] || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56 z-[100] mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{userName || 'User'}</p>
                <p className="text-xs leading-none text-slate-500">{roleLabels[role] || role}</p>
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                <span>Switch User</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[110]">
                  {demoUsers.map((u) => (
                    <DropdownMenuItem
                      key={u.role}
                      onClick={() => login(u.name, u.role)}
                      className="cursor-pointer flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="font-medium text-sm">{u.name}</span>
                      <span className="text-xs text-slate-500">{roleLabels[u.role]}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
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
