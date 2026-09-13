import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, handleApiError } from '@/lib/api-utils'
import { ensurePayrollDataForPeriod } from '@/lib/payroll-seed'
import { ExceptionSeverity } from '@/types/payroll'

// GET /api/payroll/exceptions?period=2026-09&category=all&severity=all
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '2026-09'
    const category = searchParams.get('category') || 'all'
    const severity = searchParams.get('severity') || 'all'

    await ensurePayrollDataForPeriod(period)

    const [salaryRecords, epfRecords, workers] = await Promise.all([
      db.salaryPaymentRecord.findMany({
        where: { period },
        include: {
          worker: {
            include: {
              contractor: true,
              site: true,
            },
          },
        },
      }),
      db.ePFRecord.findMany({
        where: { period },
        include: {
          worker: {
            include: {
              contractor: true,
              site: true,
            },
          },
        },
      }),
      db.worker.findMany({
        where: { isActive: true },
        include: { contractor: true, site: true },
      }),
    ])

    const exceptions: any[] = []

    // 1. Salary Exceptions
    for (const sal of salaryRecords) {
      const w = sal.worker
      if (sal.paymentStatus === 'Not Recorded') {
        exceptions.push({
          id: `sal-unrecorded-${sal.id}`,
          category: 'Salary',
          severity: 'Critical' as ExceptionSeverity,
          title: 'Salary Payment Not Recorded',
          description: `No external salary payment recorded for ${w.fullName} (${w.employeeNumber}) for ${period}.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          amount: sal.netSalary,
          actionTab: 'salary',
        })
      } else if (sal.paymentStatus === 'Partially Paid') {
        exceptions.push({
          id: `sal-partial-${sal.id}`,
          category: 'Salary',
          severity: 'High' as ExceptionSeverity,
          title: 'Partial Salary Payment',
          description: `Partial salary recorded for ${w.fullName}. Expected ₹${sal.grossSalary}, paid ₹${sal.netSalary}.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          amount: sal.netSalary,
          actionTab: 'salary',
        })
      } else if (sal.paymentStatus === 'On Hold') {
        exceptions.push({
          id: `sal-hold-${sal.id}`,
          category: 'Salary',
          severity: 'Medium' as ExceptionSeverity,
          title: 'Salary Record On Hold',
          description: `Salary record is marked On Hold: ${sal.remarks || 'Under review'}.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          amount: sal.netSalary,
          actionTab: 'salary',
        })
      }

      if (sal.paymentStatus !== 'Not Recorded' && !sal.proofDocumentName) {
        exceptions.push({
          id: `sal-proof-${sal.id}`,
          category: 'Salary',
          severity: 'High' as ExceptionSeverity,
          title: 'Payment Proof Missing',
          description: `Salary paid externally but supporting proof document is missing.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          amount: sal.netSalary,
          actionTab: 'salary',
        })
      }

      if (sal.paymentStatus !== 'Not Recorded' && sal.verificationStatus === 'Pending Verification') {
        exceptions.push({
          id: `sal-verif-${sal.id}`,
          category: 'Salary',
          severity: 'Medium' as ExceptionSeverity,
          title: 'Payment Record Verification Pending',
          description: `Payment recorded with UTR ${sal.externalReference || '—'} awaiting compliance verification.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          amount: sal.netSalary,
          actionTab: 'salary',
        })
      }
    }

    // 2. EPF Exceptions
    for (const epf of epfRecords) {
      const w = epf.worker
      if (!epf.uan || epf.uan.trim() === '') {
        exceptions.push({
          id: `epf-uan-${epf.id}`,
          category: 'EPF',
          severity: 'High' as ExceptionSeverity,
          title: 'UAN Not Available',
          description: `Worker ${w.fullName} (${w.employeeNumber}) does not have an active Universal Account Number (UAN).`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          actionTab: 'epf',
        })
      }

      if (epf.timelinessStatus === 'Overdue') {
        exceptions.push({
          id: `epf-overdue-${epf.id}`,
          category: 'EPF',
          severity: 'Critical' as ExceptionSeverity,
          title: 'EPF Deposit Overdue',
          description: `EPF deposit overdue past statutory deadline (${epf.dueDate ? new Date(epf.dueDate).toLocaleDateString('en-IN') : '15th'}). Amount ₹${epf.totalContribution}.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          dueDate: epf.dueDate,
          amount: epf.totalContribution,
          actionTab: 'epf',
        })
      } else if (epf.timelinessStatus === 'Late') {
        exceptions.push({
          id: `epf-late-${epf.id}`,
          category: 'EPF',
          severity: 'Medium' as ExceptionSeverity,
          title: 'EPF Deposit Recorded Late',
          description: `EPF deposit made 3 days past due date (${epf.depositDate ? new Date(epf.depositDate).toLocaleDateString('en-IN') : '—'}).`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          depositDate: epf.depositDate,
          dueDate: epf.dueDate,
          amount: epf.totalContribution,
          actionTab: 'epf',
        })
      } else if (epf.depositDate === null && epf.timelinessStatus === 'Pending') {
        exceptions.push({
          id: `epf-pend-${epf.id}`,
          category: 'EPF',
          severity: 'High' as ExceptionSeverity,
          title: 'EPF Deposit Not Recorded',
          description: `EPF contribution calculated (₹${epf.totalContribution}) but deposit challan not recorded.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          dueDate: epf.dueDate,
          amount: epf.totalContribution,
          actionTab: 'epf',
        })
      }

      if (epf.depositDate !== null && !epf.proofDocumentName) {
        exceptions.push({
          id: `epf-proof-${epf.id}`,
          category: 'EPF',
          severity: 'Medium' as ExceptionSeverity,
          title: 'EPF Deposit Proof Missing',
          description: `Deposit recorded (${epf.challanNumber || 'Challan'}) but cyber receipt/proof document missing.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          amount: epf.totalContribution,
          actionTab: 'epf',
        })
      }
    }

    // 3. Duplicate Reference Detection
    const refMap = new Map<string, typeof salaryRecords>()
    for (const sal of salaryRecords) {
      if (sal.externalReference && sal.externalReference.trim() !== '') {
        const key = sal.externalReference.trim().toUpperCase()
        if (!refMap.has(key)) refMap.set(key, [])
        refMap.get(key)!.push(sal)
      }
    }
    for (const [ref, recs] of refMap) {
      if (recs.length > 1) {
        for (const sal of recs) {
          const w = sal.worker
          exceptions.push({
            id: `sal-dupref-${sal.id}`,
            category: 'Salary',
            severity: 'High' as ExceptionSeverity,
            title: 'Duplicate External Reference (UTR)',
            description: `Reference ${ref} used for ${recs.length} workers. May indicate data entry error or duplicate recording.`,
            workerId: w.id,
            workerName: w.fullName,
            employeeNumber: w.employeeNumber,
            contractor: w.contractor?.name,
            site: w.site?.name,
            period,
            amount: sal.netSalary,
            actionTab: 'salary',
          })
        }
      }
    }

    // 4. Amount Mismatch Detection (gross vs net difference > 50% — flags unusually large deductions)
    for (const sal of salaryRecords) {
      if (
        sal.paymentStatus !== 'Not Recorded' &&
        sal.grossSalary > 0 &&
        sal.deductions > sal.grossSalary * 0.5
      ) {
        const w = sal.worker
        exceptions.push({
          id: `sal-mismatch-${sal.id}`,
          category: 'Salary',
          severity: 'Medium' as ExceptionSeverity,
          title: 'Unusual Deduction Amount',
          description: `Deductions (₹${sal.deductions.toLocaleString()}) exceed 50% of gross salary (₹${sal.grossSalary.toLocaleString()}) for ${w.fullName}. Please verify.`,
          workerId: w.id,
          workerName: w.fullName,
          employeeNumber: w.employeeNumber,
          contractor: w.contractor?.name,
          site: w.site?.name,
          period,
          amount: sal.netSalary,
          actionTab: 'salary',
        })
      }
    }

    // Filter by category & severity
    let filtered = exceptions
    if (category !== 'all') {
      filtered = filtered.filter(e => e.category === category)
    }
    if (severity !== 'all') {
      filtered = filtered.filter(e => e.severity === severity)
    }

    const counts = {
      total: exceptions.length,
      critical: exceptions.filter(e => e.severity === 'Critical').length,
      high: exceptions.filter(e => e.severity === 'High').length,
      medium: exceptions.filter(e => e.severity === 'Medium').length,
      low: exceptions.filter(e => e.severity === 'Low').length,
      salary: exceptions.filter(e => e.category === 'Salary').length,
      epf: exceptions.filter(e => e.category === 'EPF').length,
    }

    return successResponse({
      period,
      counts,
      exceptions: filtered,
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/payroll/exceptions')
  }
}
