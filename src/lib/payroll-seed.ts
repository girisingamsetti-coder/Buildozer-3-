import { db } from '@/lib/db'

// Designation wage guide for realistic wage generation
const WAGE_MAP: Record<string, { gross: number; deductions: number }> = {
  Helper: { gross: 18700, deductions: 2000 },
  'General Labour': { gross: 18200, deductions: 1950 },
  Mason: { gross: 24500, deductions: 2600 },
  Carpenter: { gross: 23800, deductions: 2500 },
  Electrician: { gross: 26000, deductions: 2800 },
  Welder: { gross: 25500, deductions: 2700 },
  Plumber: { gross: 24000, deductions: 2550 },
  Painter: { gross: 22000, deductions: 2350 },
  Driver: { gross: 23000, deductions: 2450 },
  'Heavy Equipment Operator': { gross: 31000, deductions: 3300 },
  Rigger: { gross: 22500, deductions: 2400 },
  'Scaffolding Erector': { gross: 23500, deductions: 2500 },
  Supervisor: { gross: 34000, deductions: 3600 },
  'Safety Marshal': { gross: 28000, deductions: 3000 },
}

export async function ensurePayrollDataForPeriod(period: string) {
  try {
    const existingSalaryCount = await db.salaryPaymentRecord.count({ where: { period } })
    const existingEpfCount = await db.ePFRecord.count({ where: { period } })
    if (existingSalaryCount > 0 && existingEpfCount > 0) {
      return
    }

    const workers = await db.worker.findMany({
      include: {
        designation: true,
        contractor: true,
        site: true,
        labourCamp: true,
      },
      orderBy: { employeeNumber: 'asc' },
    })

    if (workers.length === 0) return

    const [yearStr, monthStr] = period.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)

    // EPF Due date is 15th of the following month (e.g. For Aug, due Sep 15)
    // Or for the payroll month itself, standard statutory due date
    const dueDate = new Date(Date.UTC(year, month, 15, 0, 0, 0))

    const totalWorkers = workers.length
    // In our requirement: e.g. 214 recorded / 7 pending for 221 total workers
    const pendingCount = Math.min(7, Math.max(1, Math.round(totalWorkers * 0.032)))
    const recordedCount = totalWorkers - pendingCount

    const salaryRecords: any[] = []
    const epfRecords: any[] = []

    for (let i = 0; i < workers.length; i++) {
      const w = workers[i]
      const desigName = w.designation?.name || 'Helper'
      const baseRates = WAGE_MAP[desigName] || { gross: 19000, deductions: 2050 }

      const isPending = i >= recordedCount
      const payableDays = isPending ? 24 : 26
      const gross = baseRates.gross + ((i % 5) * 200)
      const deductions = baseRates.deductions + ((i % 3) * 50)
      const net = gross - deductions

      // Missing proof for ~12 workers
      const isMissingProof = !isPending && (i % 18 === 3)
      // Pending verification for ~10 workers
      const isPendingVerification = !isPending && (i % 22 === 4)

      let paymentStatus = 'Paid'
      let paymentDate: Date | null = new Date(Date.UTC(year, month - 1, 5 + (i % 4), 10, 0, 0))
      const paymentMode = i % 10 === 0 ? 'NEFT/RTGS' : 'Bank Transfer'
      let extRef = `UTR${year}${monthStr.padStart(2, '0')}${(100000 + i).toString()}`
      const paymentSource = 'Contractor'
      const bankName = i % 2 === 0 ? 'State Bank of India' : 'HDFC Bank'
      const accountLast4 = (1000 + (i * 37) % 9000).toString()
      let proofDocName: string | null = isMissingProof ? null : `payment_advice_${w.employeeNumber}_${period}.pdf`
      let proofDocUrl: string | null = isMissingProof ? null : `/upload/payroll/${period}/${w.employeeNumber}_advice.pdf`
      let verifStatus = isPendingVerification ? 'Pending Verification' : 'Verified'
      let verifiedBy = verifStatus === 'Verified' ? 'Compliance Admin' : null
      let verifiedAt = verifStatus === 'Verified' ? new Date(Date.UTC(year, month - 1, 10, 14, 0, 0)) : null

      if (isPending) {
        paymentStatus = 'Not Recorded'
        paymentDate = null
        extRef = ''
        proofDocName = null
        proofDocUrl = null
        verifStatus = 'Pending Verification'
        verifiedBy = null
        verifiedAt = null
      } else if (i === 15) {
        paymentStatus = 'Partially Paid'
      } else if (i === 42) {
        paymentStatus = 'On Hold'
      }

      salaryRecords.push({
        workerId: w.id,
        period,
        payableDays,
        grossSalary: gross,
        deductions,
        netSalary: net,
        paymentStatus,
        paymentDate,
        paymentMode: paymentDate ? paymentMode : null,
        externalReference: extRef || null,
        paymentSource,
        bankName,
        accountLast4,
        proofDocumentName: proofDocName,
        proofDocumentUrl: proofDocUrl,
        verificationStatus: verifStatus,
        verifiedBy,
        verifiedAt,
        remarks: isPending ? 'Payment reconciliation pending from contractor' : 'Salary credited externally to worker account',
        createdBy: 'System Seed',
      })

      // EPF Record
      // 5 workers missing UAN
      const hasUAN = (w.uanNumber && w.uanNumber.trim() !== '') || i >= 5
      const uan = hasUAN ? (w.uanNumber || `1012${(80000000 + i).toString()}`) : null

      const epfWage = Math.min(15000, gross - 3000)
      const employeeContrib = Math.round(epfWage * 0.12)
      const employerContrib = Math.round(epfWage * 0.0367)
      const epsContrib = Math.round(epfWage * 0.0833)
      const edliContrib = Math.round(epfWage * 0.005)
      const totalContrib = employeeContrib + employerContrib + epsContrib + edliContrib

      const isEpfPending = isPending || (i === 200)
      // 6 EPF deposits late
      const isLate = !isEpfPending && (i % 35 === 2)

      const ecrStatus = isEpfPending ? 'Pending' : 'Filed'
      const ecrRef = isEpfPending ? null : `ECR${year}${monthStr}00${(500 + (i % 6)).toString()}`
      const ecrDate = isEpfPending ? null : new Date(Date.UTC(year, month, 12, 11, 0, 0))
      const challanNo = isEpfPending ? null : `CHL${year}${monthStr}${(20000 + (i % 8)).toString()}`
      const challanDate = isEpfPending ? null : new Date(Date.UTC(year, month, 13, 15, 0, 0))

      let depositDate: Date | null = null
      let timelinessStatus = 'Pending'
      let daysDiff = 0

      if (!isEpfPending) {
        if (isLate) {
          depositDate = new Date(Date.UTC(year, month, 18, 12, 0, 0))
          timelinessStatus = 'Late'
          daysDiff = 3
        } else {
          depositDate = new Date(Date.UTC(year, month, 14, 11, 0, 0))
          timelinessStatus = 'On Time'
          daysDiff = -1
        }
      } else {
        const now = new Date()
        if (now > dueDate) {
          timelinessStatus = 'Overdue'
        } else {
          timelinessStatus = 'Pending'
        }
      }

      epfRecords.push({
        workerId: w.id,
        period,
        uan,
        epfApplicable: true,
        epfWage,
        employeeContribution: employeeContrib,
        employerContribution: employerContrib,
        epsContribution: epsContrib,
        edliContribution: edliContrib,
        totalContribution: totalContrib,
        ecrStatus,
        ecrReference: ecrRef,
        ecrFilingDate: ecrDate,
        challanNumber: challanNo,
        challanDate,
        depositDate,
        dueDate,
        externalReference: depositDate ? `EPFUTR${year}${(300000 + i).toString()}` : null,
        timelinessStatus,
        daysDifference: daysDiff,
        proofDocumentName: depositDate ? `epf_challan_receipt_${period}_${w.employeeNumber}.pdf` : null,
        proofDocumentUrl: depositDate ? `/upload/payroll/${period}/epf_${w.employeeNumber}.pdf` : null,
        verificationStatus: isEpfPending ? 'Pending Verification' : 'Verified',
        verifiedBy: isEpfPending ? null : 'Compliance Officer',
        verifiedAt: isEpfPending ? null : new Date(Date.UTC(year, month, 16, 10, 0, 0)),
        remarks: isLate ? 'Deposited 3 days past statutory due date by contractor' : 'EPF statutory deposit verified against EPFO ECR challan',
        createdBy: 'System Seed',
      })
    }

    // Insert records in batches
    if (existingSalaryCount === 0) {
      for (let i = 0; i < salaryRecords.length; i += 50) {
        await db.salaryPaymentRecord.createMany({
          data: salaryRecords.slice(i, i + 50),
          skipDuplicates: true,
        })
      }
    }

    if (existingEpfCount === 0) {
      for (let i = 0; i < epfRecords.length; i += 50) {
        await db.ePFRecord.createMany({
          data: epfRecords.slice(i, i + 50),
          skipDuplicates: true,
        })
      }
    }

    // Also create contractor ECR entries
    // Also create contractor ECR entries
    const existingEcrCount = await db.eCRRecord.count({ where: { period } })
    if (existingEcrCount === 0) {
      const contractors = await db.contractor.findMany()
      for (const c of contractors) {
        const cWorkers = workers.filter(w => w.contractorId === c.id)
        if (cWorkers.length === 0) continue

        await db.eCRRecord.create({
          data: {
            period,
            contractorId: c.id,
            contractorName: c.name,
            workerCount: cWorkers.length,
            ecrReference: `ECR-${c.code}-${period}`,
            filingDate: new Date(Date.UTC(year, month, 12)),
            totalAmount: cWorkers.length * 2850,
            challanNumber: `TRRN-${c.code}-${year}${monthStr}01`,
            challanDate: new Date(Date.UTC(year, month, 13)),
            depositDate: new Date(Date.UTC(year, month, 14)),
            status: 'Filed',
            proofDocumentName: `ECR_Acknowledgement_${c.code}_${period}.pdf`,
            proofDocumentUrl: `/upload/payroll/${period}/ecr_${c.code}.pdf`,
            verificationStatus: 'Verified',
            remarks: `Monthly ECR and EPF contribution for ${cWorkers.length} workers filed on EPFO portal`,
          },
        })
      }
    }

    // Create sample PaymentDocuments
    const existingDocCount = await db.paymentDocument.count({ where: { period } })
    if (existingDocCount === 0) {
      const docTypes = [
        { cat: 'Salary', type: 'Salary Register', name: `Consolidated_Wage_Register_${period}.xlsx`, size: '2.4 MB' },
        { cat: 'Salary', type: 'Bank Statement', name: `Bank_Payment_Statement_LNT_${period}.pdf`, size: '1.8 MB' },
        { cat: 'Salary', type: 'Bank Statement', name: `Bank_Payment_Statement_NCC_${period}.pdf`, size: '1.5 MB' },
        { cat: 'Salary', type: 'Contractor Payment Report', name: `Contractor_Disbursement_Summary_${period}.pdf`, size: '940 KB' },
        { cat: 'EPF', type: 'ECR', name: `EPFO_ECR_Filing_LNT_${period}.pdf`, size: '3.1 MB' },
        { cat: 'EPF', type: 'ECR Acknowledgement', name: `EPFO_ECR_Ack_NCC_${period}.pdf`, size: '1.2 MB' },
        { cat: 'EPF', type: 'Challan', name: `TRRN_Challan_Receipt_LNT_${period}.pdf`, size: '850 KB' },
        { cat: 'EPF', type: 'EPF Deposit Proof', name: `Cyber_Receipt_EPF_Payment_${period}.pdf`, size: '620 KB' },
      ]

      for (const d of docTypes) {
        await db.paymentDocument.create({
          data: {
            period,
            category: d.cat,
            documentType: d.type,
            fileName: d.name,
            fileUrl: `/upload/payroll/${period}/${d.name}`,
            fileSize: d.size,
            status: 'Verified',
            verifiedBy: 'Senior Compliance Auditor',
            verifiedAt: new Date(Date.UTC(year, month, 16)),
            uploadedBy: 'HR Coordinator',
            remarks: 'Statutory compliance document verified against bank & portal records',
          },
        })
      }
    }
  } catch (err) {
    console.error(`Error ensuring payroll data for period ${period}:`, err)
  }
}
