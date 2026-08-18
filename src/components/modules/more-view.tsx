'use client'

import { useNavStore, type PageId } from '@/stores/nav-store'
import { useAuthStore, rolePermissions } from '@/lib/auth-store'
import {
  MapPin,
  Truck,
  GraduationCap,
  HeartPulse,
  MessageSquareWarning,
  Flame,
  Scale,
  ClipboardCheck,
  Settings,
} from 'lucide-react'

// All modules except the 4 already in the bottom nav
const moreNavItems: { id: PageId; label: string; icon: any; color: string }[] = [
  { id: 'locations', label: 'Locations', icon: MapPin, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
  { id: 'vehicles', label: 'Machinery', icon: Truck, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
  { id: 'training', label: 'Training', icon: GraduationCap, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
  { id: 'medical', label: 'Medical', icon: HeartPulse, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' },
  { id: 'grievance', label: 'Grievances', icon: MessageSquareWarning, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10' },
  { id: 'hazardous', label: 'Hazmat', icon: Flame, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
  { id: 'legal', label: 'Legal', icon: Scale, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
  { id: 'compliance', label: 'Compliance', icon: ClipboardCheck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-500 bg-slate-50 dark:bg-slate-500/10' },
]

export default function MoreView() {
  const { setPage } = useNavStore()
  const role = useAuthStore((s) => s.role)
  const permissions = rolePermissions[role] ?? rolePermissions.SAFETY_OFFICER
  
  const allowedItems = moreNavItems.filter((item) => permissions.modules.includes(item.id as any))

  return (
    <div className="h-full overflow-y-auto pb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {allowedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 transition-transform active:scale-95"
          >
            <div className={`p-4 rounded-full ${item.color}`}>
              <item.icon className="h-7 w-7" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
