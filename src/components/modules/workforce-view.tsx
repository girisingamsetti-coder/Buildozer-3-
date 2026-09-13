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
        <TabsList className="shrink-0 w-full flex justify-between gap-2 bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="register" 
            className="flex-1 h-10 px-4 gap-2 !border !border-slate-300 !bg-white !text-black !font-bold !rounded-md !shadow-sm !transform-none hover:!bg-slate-50 data-[state=active]:!border-[#0d9488] transition-all"
          >
            <Users className="h-4 w-4 text-blue-500" />
            Register
          </TabsTrigger>
          <TabsTrigger 
            value="attendance" 
            className="flex-1 h-10 px-4 gap-2 !border !border-slate-300 !bg-white !text-black !font-bold !rounded-md !shadow-sm !transform-none hover:!bg-slate-50 data-[state=active]:!border-[#0d9488] transition-all"
          >
            <CalendarCheck className="h-4 w-4 text-emerald-500" />
            Attendance
          </TabsTrigger>
          <TabsTrigger 
            value="payroll" 
            className="flex-1 h-10 px-4 gap-2 !border !border-slate-300 !bg-white !text-black !font-bold !rounded-md !shadow-sm !transform-none hover:!bg-slate-50 data-[state=active]:!border-[#0d9488] transition-all"
          >
            <ReceiptText className="h-4 w-4 text-amber-500" />
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
