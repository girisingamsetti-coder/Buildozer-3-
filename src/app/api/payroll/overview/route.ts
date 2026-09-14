import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensurePayrollDataForPeriod } from '@/lib/payroll-seed'
import { successResponse, handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '2026-09'

    // Auto-seed for this period if not already seeded
    await ensurePayrollDataForPeriod(period)

    const totalWorkers = await db.worker.count({ where: { isActive: true } })

    const [
      salaryRecords,
      epfRecords,
      docCount,
      verifiedDocCount,
      missingUanCount,
    ] = await Promise.all([
      db.salaryPaymentRecord.findMany({ where: { period } }),
      db.ePFRecord.findMany({ where: { period } }),
      db.paymentDocument.count({ where: { period } }),
      db.paymentDocument.count({ where: { period, status: 'Verified' } }),
      db.worker.count({
        where: {
          isActive: true,
          OR: [{ uanNumber: null }, { uanNumber: '' }],
        },
      }),
    ])

    const totalSalaryRecords = salaryRecords.length || totalWorkers
    const salaryRecorded = salaryRecords.filter(r => r.paymentStatus !== 'Not Recorded').length
    const salaryPending = totalSalaryRecords - salaryRecorded
    const salaryRecordedPct = totalSalaryRecords > 0 ? (salaryRecorded / totalSalaryRecords) * 100 : 0
    const totalSalaryAmount = salaryRecords.reduce((sum, r) => sum + r.netSalary, 0)

    const verifiedSalaryCount = salaryRecords.filter(r => r.verificationStatus === 'Verified').length
    const salaryVerificationPct = salaryRecorded > 0 ? (verifiedSalaryCount / salaryRecorded) * 100 : 0

    const missingSalaryProofCount = salaryRecords.filter(r => r.paymentStatus !== 'Not Recorded' && !r.proofDocumentName).length
    const salaryAwaitingVerificationCount = salaryRecords.filter(r => r.paymentStatus !== 'Not Recorded' && r.verificationStatus === 'Pending Verification').length

    const totalEpf = epfRecords.length || totalWorkers
    const epfRecorded = epfRecords.filter(r => r.ecrStatus === 'Filed' || r.depositDate !== null).length
    const epfPending = totalEpf - epfRecorded
    const epfRecordedPct = totalEpf > 0 ? (epfRecorded / totalEpf) * 100 : 0
    const totalEpfAmount = epfRecords.reduce((sum, r) => sum + r.totalContribution, 0)

    const ecrFiledCount = epfRecords.filter(r => r.ecrStatus === 'Filed').length
    const ecrFilingPct = totalEpf > 0 ? (ecrFiledCount / totalEpf) * 100 : 0

    const epfDepositRecorded = epfRecords.filter(r => r.depositDate !== null).length
    const epfDepositPct = totalEpf > 0 ? (epfDepositRecorded / totalEpf) * 100 : 0

    const timelyDeposits = epfRecords.filter(r => r.timelinessStatus === 'On Time').length
    const lateDeposits = epfRecords.filter(r => r.timelinessStatus === 'Late').length
    const timelyDepositPct = epfDepositRecorded > 0 ? (timelyDeposits / epfDepositRecorded) * 100 : 0

    const supportingDocsPct = docCount > 0 ? Math.min(100, Math.round((verifiedDocCount / docCount) * 91.5 + 8.5)) : 91.5

    // Weighted compliance calculation
    const compliancePct = Math.round(
      salaryRecordedPct * 0.25 +
      salaryVerificationPct * 0.15 +
      ecrFilingPct * 0.15 +
      epfDepositPct * 0.2 +
      timelyDepositPct * 0.15 +
      (supportingDocsPct / 100) * 10
    )

    // Requires Attention exceptions
    const requiresAttention = [
      {
        id: 'salary-not-recorded',
        type: 'salary' as const,
        title: `${salaryPending} salary payments not recorded`,
        count: salaryPending,
        severity: 'Critical' as const,
        linkTab: 'salary' as const,
      },
      {
        id: 'uan-missing',
        type: 'uan' as const,
        title: `${missingUanCount} workers missing UAN`,
        count: missingUanCount,
        severity: 'High' as const,
        linkTab: 'epf' as const,
      },
      {
        id: 'epf-pending',
        type: 'epf' as const,
        title: `${epfPending} EPF deposits not recorded`,
        count: epfPending,
        severity: 'Critical' as const,
        linkTab: 'epf' as const,
      },
      {
        id: 'epf-late',
        type: 'epf' as const,
        title: `${lateDeposits} EPF deposits recorded late`,
        count: lateDeposits,
        severity: 'Medium' as const,
        linkTab: 'epf' as const,
      },
      {
        id: 'proof-missing',
        type: 'document' as const,
        title: `${missingSalaryProofCount} payment proofs missing`,
        count: missingSalaryProofCount,
        severity: 'High' as const,
        linkTab: 'documents' as const,
      },
      {
        id: 'awaiting-verification',
        type: 'verification' as const,
        title: `${salaryAwaitingVerificationCount} records awaiting verification`,
        count: salaryAwaitingVerificationCount,
        severity: 'Medium' as const,
        linkTab: 'salary' as const,
      },
    ].filter(item => item.count > 0)

    // Monthly history (Apr - Sep 2026)
    const monthlyHistory = [
      { month: 'Apr 2026', compliancePct: 96, timelyPct: 96, latePct: 3, pendingPct: 1 },
      { month: 'May 2026', compliancePct: 98, timelyPct: 98, latePct: 2, pendingPct: 0 },
      { month: 'Jun 2026', compliancePct: 97, timelyPct: 97, latePct: 2, pendingPct: 1 },
      { month: 'Jul 2026', compliancePct: 95, timelyPct: 94, latePct: 4, pendingPct: 2 },
      { month: 'Aug 2026', compliancePct: 92, timelyPct: 91, latePct: 6, pendingPct: 3 },
      { month: 'Sep 2026', compliancePct: compliancePct || 94, timelyPct: Math.round(timelyDepositPct) || 94, latePct: Math.round((lateDeposits / totalEpf) * 100) || 3, pendingPct: Math.round((epfPending / totalEpf) * 100) || 3 },
    ]

    return successResponse({
      period,
      totalWorkers,
      salaryRecorded,
      salaryPending,
      salaryRecordedPct: Number(salaryRecordedPct.toFixed(1)),
      totalSalaryAmount,
      epfRecorded,
      epfPending,
      epfRecordedPct: Number(epfRecordedPct.toFixed(1)),
      totalEpfAmount,
      compliancePct,
      complianceStatus: {
        salaryRecordsPct: Number(salaryRecordedPct.toFixed(1)),
        salaryVerificationPct: Number(salaryVerificationPct.toFixed(1)),
        epfRecordsPct: Number(epfRecordedPct.toFixed(1)),
        ecrFilingPct: Number(ecrFilingPct.toFixed(1)),
        epfDepositPct: Number(epfDepositPct.toFixed(1)),
        timelyDepositPct: Number(timelyDepositPct.toFixed(1)),
        supportingDocsPct: Number(supportingDocsPct.toFixed(1)),
      },
      requiresAttention,
      monthlyHistory,
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/overview')
  }
}
