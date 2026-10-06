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
  Calendar,
  ShoppingCart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  const { setPage, activePage } = useNavStore()
  const { logout, login, userName, role } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [notifLoading, setNotifLoading] = useState(true)

  const demoUsers = [
    { name: 'Demo Admin', role: 'ADMIN' as const },
    { name: 'Demo Safety Officer', role: 'SAFETY_OFFICER' as const },
    { name: 'Demo PMC', role: 'PMC' as const },
    { name: 'Demo HR', role: 'HR_COORDINATOR' as const },
    { name: 'Demo Legal', role: 'LEGAL_ADVISOR' as const },
  ]

  const fetchNotifications = useCallback(() => {
    setNotifLoading(true)
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setNotifications(data)
        setNotifLoading(false)
      })
      .catch(() => {
        setNotifLoading(false)
      })
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
    { label: 'E&S', id: 'dashboard', icon: Users, active: activePage !== 'procurement' },
    { label: 'Procurement', id: 'procurement', icon: ShoppingCart, active: activePage === 'procurement' },
    { label: 'Lands', icon: MapPin, active: false },
    { label: 'Grievances', icon: MessageSquareWarning, active: false },
    { label: 'Ground Observations', icon: Eye, active: false },
    { label: 'Reports', icon: FileText, active: false },
  ]

  return (
    <header className="flex items-center justify-between h-14 shrink-0 bg-[#241a1a] text-white select-none w-full shadow-md z-[60] border-b border-[#3d2626]">
      {/* Left Section: Logos & Title */}
      <div className="flex items-center h-full px-2 sm:px-4 gap-2 sm:gap-3 shrink-0">
        {/* AP Govt Logo */}
        <div className="flex items-center justify-center shrink-0">
          <img
            src="/ap-govt-logo.png"
            alt="Government of Andhra Pradesh"
            className="h-9 sm:h-10 w-auto object-contain drop-shadow-sm"
          />
        </div>

        <div className="h-7 w-px bg-stone-700 shrink-0" />

        <div className="flex flex-col justify-center">
          <span className="text-sm font-bold tracking-wider leading-none text-white font-display">AICCC</span>
          <span className="hidden md:inline text-[10px] text-stone-300 font-medium leading-none mt-1 font-body">Amaravati Integrated Command Control Center</span>
        </div>

        <div className="h-7 w-px bg-stone-700 shrink-0 mx-1 sm:mx-2" />

        {/* Amaravati Logo */}
        <div className="flex items-center justify-center shrink-0">
          <img
            src="/amaravati-logo.png"
            alt="Amaravati The People's Capital"
            className="h-8 sm:h-9 md:h-10 max-h-10 w-auto object-contain drop-shadow-sm"
          />
        </div>
      </div>

      {/* Middle Section: Navigation */}
      <div className="flex-1 min-w-0 flex items-center h-full overflow-x-auto no-scrollbar gap-1 px-4 font-body">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => { if (item.id) setPage(item.id as any) }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 h-10 rounded-md whitespace-nowrap transition-colors cursor-pointer",
              item.active
                ? "bg-[#8B2A2A] text-white font-semibold relative after:absolute after:bottom-0.5 after:left-2 after:right-2 after:h-0.5 after:bg-[#F1E1CE] after:rounded-full shadow-sm"
                : "text-stone-300 hover:bg-[#8B2A2A]/40 hover:text-white text-sm"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-2 px-4 shrink-0 h-full border-l border-stone-700 pl-4 ml-2">
        {/* Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-stone-300 hover:text-white hover:bg-stone-800">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-72 p-0 rounded-xl mt-2 z-[100] border-border shadow-xl font-body">
            <div className="flex items-center justify-between p-3 border-b border-border bg-[#F1E1CE]/20">
              <h3 className="font-semibold text-sm font-display text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <Badge variant="secondary" className="text-[10px] py-0 bg-[#F1E1CE] text-[#8B2A2A]">{unreadCount} new</Badge>}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-red-600" onClick={handleClearAll} disabled={clearing}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="h-80 max-h-[50vh]">
              {notifLoading ? (
                <div className="p-3 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1">
                      <Skeleton className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-2.5 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 font-body">No notifications</p>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-[#F1E1CE]/20 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className={cn('mt-1 inline-block w-2 h-2 rounded-full shrink-0', n.priority === 'Critical' ? 'bg-red-500' : n.priority === 'High' ? 'bg-amber-500' : 'bg-[var(--maroon-700,#8B2A2A)]')} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-foreground font-body">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-body">{n.message}</p>
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
            <Button variant="outline" className="h-9 px-3 bg-stone-800/80 border-stone-700 hover:bg-stone-800 hover:text-white text-stone-200 gap-2 rounded-md font-body">
              <UserIcon className="h-4 w-4" />
              <span className="text-xs font-medium">{roleLabels[role] || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56 z-[100] mt-2 font-body">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{userName || 'User'}</p>
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                <span>Switch User</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[110] font-body">
                  {demoUsers.map((u) => (
                    <DropdownMenuItem
                      key={u.role}
                      onClick={() => login(u.name, u.role)}
                      className="cursor-pointer flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="font-medium text-sm">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{roleLabels[u.role]}</span>
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
