import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, handleApiError } from '@/lib/api-utils'
import { ensurePayrollDataForPeriod } from '@/lib/payroll-seed'

export const dynamic = 'force-dynamic'


// GET /api/payroll/compliance?period=2026-09
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '2026-09'

    await ensurePayrollDataForPeriod(period)

    const [workers, salaryRecords, epfRecords, contractors, sites] = await Promise.all([
      db.worker.findMany({
        where: { isActive: true },
        include: {
          designation: true,
          contractor: true,
          site: true,
          labourCamp: true,
        },
        orderBy: { employeeNumber: 'asc' },
      }),
      db.salaryPaymentRecord.findMany({ where: { period } }),
      db.ePFRecord.findMany({ where: { period } }),
      db.contractor.findMany({ where: { isActive: true } }),
      db.site.findMany({ where: { isActive: true } }),
    ])

    const salaryMap = new Map(salaryRecords.map(r => [r.workerId, r]))
    const epfMap = new Map(epfRecords.map(r => [r.workerId, r]))

    // 1. Worker-level compliance matrix
    const workerMatrix = workers.map(w => {
      const sal = salaryMap.get(w.id)
      const epf = epfMap.get(w.id)

      const salaryPaid = sal?.paymentStatus === 'Paid'
      const salaryVerified = sal?.verificationStatus === 'Verified'
      const epfRecorded = (epf?.totalContribution || 0) > 0
      const ecrFiled = epf?.ecrStatus === 'Filed'
      const depositRecorded = epf?.depositDate !== null && epf?.depositDate !== undefined
      const timely = epf?.timelinessStatus === 'On Time'
      const hasDocs = Boolean(sal?.proofDocumentName && epf?.proofDocumentName)

      let overall: 'Compliant' | 'Attention' | 'Non-Compliant' = 'Compliant'
      if (!salaryPaid || !epfRecorded || !depositRecorded) {
        overall = 'Non-Compliant'
      } else if (!salaryVerified || !timely || !hasDocs) {
        overall = 'Attention'
      }

      return {
        workerId: w.id,
        workerName: w.fullName || 'Unknown',
        employeeNumber: w.employeeNumber,
        designation: w.designation?.name || 'Worker',
        site: w.site?.name || 'Main Site',
        contractor: w.contractor?.name || 'Direct',
        camp: w.labourCamp?.name || 'Camp',
        salaryStatus: sal?.paymentStatus || 'Not Recorded',
        salaryVerified,
        epfStatus: epfRecorded ? 'Recorded' : 'Pending',
        ecrStatus: ecrFiled ? 'Filed' : 'Pending',
        depositStatus: depositRecorded ? 'Deposited' : 'Pending',
        timeliness: epf?.timelinessStatus || 'Pending',
        hasDocuments: hasDocs,
        overallCompliance: overall,
      }
    })

    // 2. Contractor-wise Compliance
    const contractorCompliance = contractors.map(c => {
      const cWorkers = workers.filter(w => w.contractorId === c.id)
      const total = cWorkers.length
      if (total === 0) {
        return {
          contractorId: c.id,
          contractorName: c.name,
          workerCount: 0,
          salaryRecordsPct: 100,
          salaryVerificationPct: 100,
          epfRecordsPct: 100,
          ecrFilingPct: 100,
          epfDepositPct: 100,
          timelyDepositPct: 100,
          overallCompliancePct: 100,
        }
      }

      const cSal = cWorkers.map(w => salaryMap.get(w.id)).filter(Boolean)
      const cEpf = cWorkers.map(w => epfMap.get(w.id)).filter(Boolean)

      const salPaid = cSal.filter(s => s?.paymentStatus === 'Paid').length
      const salVerif = cSal.filter(s => s?.verificationStatus === 'Verified').length
      const epfRec = cEpf.filter(e => (e?.totalContribution || 0) > 0).length
      const ecrFiled = cEpf.filter(e => e?.ecrStatus === 'Filed').length
      const epfDep = cEpf.filter(e => e?.depositDate != null).length
      const timely = cEpf.filter(e => e?.timelinessStatus === 'On Time').length

      const salaryRecordsPct = Math.round((salPaid / total) * 100)
      const salaryVerificationPct = salPaid > 0 ? Math.round((salVerif / salPaid) * 100) : 0
      const epfRecordsPct = Math.round((epfRec / total) * 100)
      const ecrFilingPct = Math.round((ecrFiled / total) * 100)
      const epfDepositPct = Math.round((epfDep / total) * 100)
      const timelyDepositPct = epfDep > 0 ? Math.round((timely / epfDep) * 100) : 0

      const overallCompliancePct = Math.round(
        salaryRecordsPct * 0.3 +
        epfRecordsPct * 0.25 +
        epfDepositPct * 0.25 +
        timelyDepositPct * 0.2
      )

      return {
        contractorId: c.id,
        contractorName: c.name,
        workerCount: total,
        salaryRecordsPct,
        salaryVerificationPct,
        epfRecordsPct,
        ecrFilingPct,
        epfDepositPct,
        timelyDepositPct,
        overallCompliancePct,
      }
    }).filter(c => c.workerCount > 0)

    // 3. Site-wise Compliance
    const siteCompliance = sites.map(s => {
      const sWorkers = workers.filter(w => w.siteId === s.id)
      const total = sWorkers.length
      if (total === 0) {
        return {
          siteId: s.id,
          siteName: s.name,
          workerCount: 0,
          salaryCompliancePct: 100,
          epfCompliancePct: 100,
          timelyDepositPct: 100,
          documentCompliancePct: 100,
          overallCompliancePct: 100,
        }
      }

      const sSal = sWorkers.map(w => salaryMap.get(w.id)).filter(Boolean)
      const sEpf = sWorkers.map(w => epfMap.get(w.id)).filter(Boolean)

      const salPaid = sSal.filter(r => r?.paymentStatus === 'Paid').length
      const epfDep = sEpf.filter(r => r?.depositDate != null).length
      const timely = sEpf.filter(r => r?.timelinessStatus === 'On Time').length
      const docs = sSal.filter(r => r?.proofDocumentName).length

      const salaryCompliancePct = Math.round((salPaid / total) * 100)
      const epfCompliancePct = Math.round((epfDep / total) * 100)
      const timelyDepositPct = epfDep > 0 ? Math.round((timely / epfDep) * 100) : 0
      const documentCompliancePct = Math.round((docs / total) * 100)

      const overallCompliancePct = Math.round(
        salaryCompliancePct * 0.3 +
        epfCompliancePct * 0.3 +
        timelyDepositPct * 0.2 +
        documentCompliancePct * 0.2
      )

      return {
        siteId: s.id,
        siteName: s.name,
        workerCount: total,
        salaryCompliancePct,
        epfCompliancePct,
        timelyDepositPct,
        documentCompliancePct,
        overallCompliancePct,
      }
    }).filter(s => s.workerCount > 0)

    return successResponse({
      period,
      workerMatrix,
      contractorCompliance,
      siteCompliance,
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/compliance')
  }
}
