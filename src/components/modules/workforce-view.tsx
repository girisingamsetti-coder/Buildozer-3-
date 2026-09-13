'use client'

import { useNavStore } from '@/stores/nav-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, CalendarCheck, ReceiptText } from 'lucide-react'
import WorkerListView from './worker-list-view'
import AttendanceView from './attendance-view'
import PayrollView from './payroll/payroll-view'

export default function WorkforceView() {
  const activePage = useNavStore((s) => s.activePage)
  const setPage = useNavStore((s) => s.setPage)

  // Derive active tab directly from nav store: 'register' | 'attendance' | 'payroll'
  const tab = activePage === 'attendance' ? 'attendance' : activePage === 'payroll' ? 'payroll' : 'register'

  const handleTabChange = (value: string) => {
    setPage(value === 'attendance' ? 'attendance' : value === 'payroll' ? 'payroll' : 'workers')
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="flex-1 min-h-0 flex flex-col gap-3"
      >
        <TabsList className="shrink-0 self-start">
          <TabsTrigger value="register" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Register
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-1.5">
            <ReceiptText className="h-3.5 w-3.5" />
            Payroll
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="flex-1 min-h-0 overflow-hidden mt-0">
          <WorkerListView />
        </TabsContent>
        <TabsContent value="attendance" className="flex-1 min-h-0 overflow-y-auto mt-0 pr-0.5">
          <AttendanceView />
        </TabsContent>
        <TabsContent value="payroll" className="flex-1 min-h-0 overflow-y-auto mt-0 pr-0.5">
          <PayrollView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
