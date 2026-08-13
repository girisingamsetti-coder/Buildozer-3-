'use client'

import { useAuthStore } from '@/lib/auth-store'
import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Bell, LogOut, Trash2, Smartphone, Menu } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  priority: string
  isRead: boolean
  createdAt: string
}

export function TopBar() {
  const { logout, userName } = useAuthStore()
  const { mobileView, toggleMobileView, setSidebarOpen } = useNavStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  const fetchNotifications = useCallback(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {})
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

  return (
    <header className={cn(
      'flex items-center shrink-0 no-print',
      mobileView ? 'justify-between px-3 h-11' : 'justify-end px-4 h-11'
    )}>
      {/* Left: hamburger menu — only in mobile view */}
      {mobileView && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          title="Open menu"
          aria-label="Open menu"
          className="h-8 w-8 rounded-lg hover:bg-muted/60"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Right: action buttons */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileView}
          title={mobileView ? 'Exit mobile view' : 'Mobile view'}
          aria-label={mobileView ? 'Exit mobile view' : 'Mobile view'}
          aria-pressed={mobileView}
          className={cn(
            'h-8 w-8 rounded-lg transition-colors',
            mobileView
              ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
              : 'hover:bg-muted/60'
          )}
        >
          <Smartphone className="h-4 w-4" />
        </Button>

        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg hover:bg-muted/60">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 rounded-xl">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-red-600"
                    onClick={handleClearAll}
                    disabled={clearing}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                <div className="divide-y">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className={cn(
                          'mt-1 inline-block w-2 h-2 rounded-full shrink-0',
                          n.priority === 'Critical' ? 'bg-red-500' : n.priority === 'High' ? 'bg-amber-500' : 'bg-teal-500'
                        )} />
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

        <span className="hidden sm:inline text-sm font-medium text-muted-foreground mx-2">{userName}</span>

        <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
