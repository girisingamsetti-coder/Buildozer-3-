import { ChevronRight, Users, Wrench, Activity, HeartPulse, GraduationCap, ShieldCheck, FileCheck2, Truck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function D1Dashboard({ data }: { data: any }) {
  // We need to map the D2 dashboard data to 9 cards
  const maleCount = data.genderBreakdown?.find((g: any) => g.gender === 'Male')?.count ?? 0
  const femaleCount = data.genderBreakdown?.find((g: any) => g.gender === 'Female')?.count ?? 0
  const otherGender = data.totalWorkers - maleCount - femaleCount

  const trainingTotal = data.trainingStatusBreakdown?.reduce((s: any, t: any) => s + t.count, 0) ?? 0
  const trainingValid = data.trainingStatusBreakdown?.find((t: any) => t.status === 'Valid')?.count ?? 0
  const trainingExpiring = data.trainingStatusBreakdown?.find((t: any) => t.status === 'ExpiringSoon')?.count ?? 0
  const trainingExpired = data.trainingStatusBreakdown?.find((t: any) => t.status === 'Expired')?.count ?? 0

  const medFit = data.medicalTestBreakdown?.find((m: any) => m.status === 'Fit')?.count ?? 0
  const medUnfit = data.medicalTestBreakdown?.find((m: any) => m.status === 'Unfit')?.count ?? 0
  const medPending = data.medicalTestBreakdown?.find((m: any) => m.status === 'Pending')?.count ?? 0
  const medConditional = data.medicalTestBreakdown?.find((m: any) => m.status === 'Conditional')?.count ?? 0

  const vs = data.vehicleStats || { total: 0, active: 0, equipmentStatus: { Fit: 0, NeedsRepair: 0, Grounded: 0 }, inspectionStatus: { Passed: 0, Failed: 0, Pending: 0 }, ownership: { Own: 0, Rented: 0 }, approvalStatus: { Approved: 0, Rejected: 0, Pending: 0 } }

  const buildStats = (l1: string, v1: number, l2: string, v2: number, l3: string, v3: number, l4: string, v4: number, total: number) => {
    const calcPct = (v: number) => total > 0 ? Number(((v / total) * 100).toFixed(1)) : 0
    return {
      inProgress: { label: l1, pct: calcPct(v1), count: v1 },
      revision: { label: l2, pct: calcPct(v2), count: v2 },
      approved: { label: l3, pct: calcPct(v3), count: v3 },
      rejected: { label: l4, pct: calcPct(v4), count: v4 }
    }
  }

  const cards = [
    {
      title: 'Total Workforce',
      icon: Users,
      iconColor: 'text-teal-500',
      iconBg: 'bg-teal-50 border-teal-100',
      total: data.totalWorkers,
      ...buildStats('MALE', maleCount, 'FEMALE', femaleCount, 'OTHER', otherGender, 'PENDING', 0, data.totalWorkers)
    },
    {
      title: 'Skill Mix',
      icon: Wrench,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50 border-orange-100',
      total: data.skilledWorkers + data.unskilledWorkers,
      ...buildStats('SKILLED', data.skilledWorkers, 'UNSKILLED', data.unskilledWorkers, 'SEMI', 0, 'UNKNOWN', 0, data.skilledWorkers + data.unskilledWorkers)
    },
    {
      title: 'Age Distribution',
      icon: Activity,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50 border-purple-100',
      total: data.totalWorkers,
      ...buildStats('18-25', data.ageDistribution?.[0]?.count ?? 0, '26-35', data.ageDistribution?.[1]?.count ?? 0, '36-45', data.ageDistribution?.[2]?.count ?? 0, '46+', data.ageDistribution?.[3]?.count ?? 0, data.totalWorkers)
    },
    {
      title: 'Medical Tests',
      icon: HeartPulse,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50 border-emerald-100',
      total: medFit + medUnfit + medPending + medConditional,
      ...buildStats('PENDING', medPending, 'COND.', medConditional, 'FIT', medFit, 'UNFIT', medUnfit, medFit + medUnfit + medPending + medConditional)
    },
    {
      title: 'Training Status',
      icon: GraduationCap,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50 border-orange-100',
      total: trainingTotal,
      ...buildStats('VALID', trainingValid, 'EXPIRING', trainingExpiring, 'EXPIRED', trainingExpired, 'NONE', 0, trainingTotal)
    },
    {
      title: 'Equipment Status',
      icon: Wrench,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50 border-orange-100',
      total: vs.equipmentStatus.Fit + vs.equipmentStatus.NeedsRepair + vs.equipmentStatus.Grounded,
      ...buildStats('FIT', vs.equipmentStatus.Fit, 'REPAIR', vs.equipmentStatus.NeedsRepair, 'GROUNDED', vs.equipmentStatus.Grounded, 'NA', 0, vs.equipmentStatus.Fit + vs.equipmentStatus.NeedsRepair + vs.equipmentStatus.Grounded)
    },
    {
      title: 'Inspection Status',
      icon: ShieldCheck,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50 border-emerald-100',
      total: vs.inspectionStatus.Passed + vs.inspectionStatus.Failed + vs.inspectionStatus.Pending,
      ...buildStats('PENDING', vs.inspectionStatus.Pending, 'RE-EVAL', 0, 'PASSED', vs.inspectionStatus.Passed, 'FAILED', vs.inspectionStatus.Failed, vs.inspectionStatus.Passed + vs.inspectionStatus.Failed + vs.inspectionStatus.Pending)
    },
    {
      title: 'Vehicle Ownership',
      icon: Truck,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50 border-blue-100',
      total: vs.ownership.Own + vs.ownership.Rented,
      ...buildStats('OWN', vs.ownership.Own, 'RENTED', vs.ownership.Rented, 'LEASED', 0, 'OTHER', 0, vs.ownership.Own + vs.ownership.Rented)
    },
    {
      title: 'Document Approvals',
      icon: FileCheck2,
      iconColor: 'text-teal-500',
      iconBg: 'bg-teal-50 border-teal-100',
      total: vs.approvalStatus.Approved + vs.approvalStatus.Rejected + vs.approvalStatus.Pending,
      ...buildStats('PENDING', vs.approvalStatus.Pending, 'REVIEW', 0, 'APPROVED', vs.approvalStatus.Approved, 'REJECTED', vs.approvalStatus.Rejected, vs.approvalStatus.Approved + vs.approvalStatus.Rejected + vs.approvalStatus.Pending)
    }
  ]

  const renderCard = (d: any, i: number) => {
    const Icon = d.icon
    
    // Progress bar segments
    const inProgW = `${Math.max(d.inProgress.pct, 2)}%`
    const revW = d.revision.pct > 0 ? `${Math.max(d.revision.pct, 2)}%` : '0%'
    const appW = `${Math.max(d.approved.pct, 2)}%`
    const rejW = d.rejected.pct > 0 ? `${Math.max(d.rejected.pct, 2)}%` : '5%'
    
    return (
      <Card key={i} className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col min-w-0">
        <CardContent className="px-2.5 2xl:px-3 pt-2 pb-2 flex-1 flex flex-col justify-between min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between min-w-0 pb-1.5">
            <div className="flex items-center gap-1.5 2xl:gap-2 min-w-0 shrink">
              <div className={cn("p-1.5 rounded-lg border shrink-0", d.iconBg)}>
                <Icon className={cn("h-3.5 w-3.5 2xl:h-4 2xl:w-4", d.iconColor)} />
              </div>
              <h3 className="font-extrabold text-[11px] 2xl:text-xs text-slate-900 truncate" title={d.title}>{d.title}</h3>
            </div>
            <div className="flex items-center gap-1.5 2xl:gap-2 shrink-0 pl-1">
              <span className="text-sm 2xl:text-base font-extrabold tabular-nums">{d.total}</span>
              <button className="h-4 w-4 2xl:h-5 2xl:w-5 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
                <ChevronRight className="h-2.5 w-2.5 2xl:h-3 2xl:w-3 text-slate-400" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex h-1.5 2xl:h-2 gap-0.5 2xl:gap-1 w-full shrink-0 my-1">
            <div className="bg-[#6b66ff] h-full rounded-full" style={{ width: inProgW }} />
            <div className="bg-[#12c4d6] h-full rounded-full" style={{ width: appW }} />
            <div className="bg-[#ffaa00] h-full rounded-full" style={{ width: revW }} />
            <div className="bg-[#ff205b] h-full rounded-full" style={{ width: rejW }} />
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-2 gap-1.5 2xl:gap-2 mt-auto min-h-0 shrink-0 pt-1">
            <div className="bg-[#fcfdfd] rounded-md p-1.5 2xl:p-2 text-center border border-slate-100 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.02)] min-w-0">
              <div className="text-[8px] 2xl:text-[9px] font-bold text-slate-500 mb-0.5 truncate" title={d.inProgress.label}>{d.inProgress.label} <span className="hidden xl:inline">{d.inProgress.pct}%</span></div>
              <div className="text-xs 2xl:text-sm font-extrabold text-slate-800 tabular-nums">{d.inProgress.count}</div>
            </div>
            <div className="bg-[#fcfdfd] rounded-md p-1.5 2xl:p-2 text-center border border-slate-100 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.02)] min-w-0">
              <div className="text-[8px] 2xl:text-[9px] font-bold text-slate-500 mb-0.5 truncate" title={d.revision.label}>{d.revision.label} <span className="hidden xl:inline">{d.revision.pct}%</span></div>
              <div className="text-xs 2xl:text-sm font-extrabold text-slate-800 tabular-nums">{d.revision.count}</div>
            </div>
            <div className="bg-[#f5fdf9] rounded-md p-1.5 2xl:p-2 text-center border border-[#c1ebd9] shadow-[0_2px_4px_-2px_rgba(0,0,0,0.02)] min-w-0">
              <div className="text-[8px] 2xl:text-[9px] font-bold text-[#0c9c71] mb-0.5 truncate" title={d.approved.label}>{d.approved.label} <span className="hidden xl:inline">{d.approved.pct}%</span></div>
              <div className="text-xs 2xl:text-sm font-extrabold text-slate-800 tabular-nums">{d.approved.count}</div>
            </div>
            <div className="bg-[#fef9f4] rounded-md p-1.5 2xl:p-2 text-center border border-[#fce3c7] shadow-[0_2px_4px_-2px_rgba(0,0,0,0.02)] min-w-0">
              <div className="text-[8px] 2xl:text-[9px] font-bold text-[#e65c00] mb-0.5 truncate" title={d.rejected.label}>{d.rejected.label} <span className="hidden xl:inline">{d.rejected.pct}%</span></div>
              <div className="text-xs 2xl:text-sm font-extrabold text-slate-800 tabular-nums">{d.rejected.count}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3 pb-4 h-full min-h-0">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 2xl:gap-3">
        {cards.slice(0, 5).map((d, i) => renderCard(d, i))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 2xl:gap-3">
        {cards.slice(5).map((d, i) => renderCard(d, i + 5))}
      </div>
    </div>
  )
}
