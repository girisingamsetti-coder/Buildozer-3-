export type SalaryPaymentStatus =
  | 'Not Recorded'
  | 'Paid'
  | 'Partially Paid'
  | 'Failed / Returned'
  | 'On Hold'
  | 'Disputed'
  | 'Unknown'

export type VerificationStatus =
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected'
  | 'Verification Not Required'

export type PaymentMode =
  | 'Bank Transfer'
  | 'NEFT/RTGS'
  | 'Cheque'
  | 'Cash'
  | 'UPI'
  | 'Other'

export type PaymentSource =
  | 'Employer'
  | 'Contractor'
  | 'External Payroll System'
  | 'Bank'
  | 'Manual Record'
  | 'Other'

export type TimelinessStatus =
  | 'On Time'
  | 'Late'
  | 'Pending'
  | 'Overdue'
  | 'Not Applicable'

export type EcrStatus =
  | 'Filed'
  | 'Pending'
  | 'Corrected'
  | 'Rejected'
  | 'Not Applicable'

export type DocumentCategory = 'Salary' | 'EPF'

export type ExceptionSeverity = 'Critical' | 'High' | 'Medium' | 'Low'

export type OverallComplianceStatus =
  | 'Compliant'
  | 'Attention'
  | 'Non-Compliant'
  | 'Not Applicable'

export interface SalaryPaymentItem {
  id: string
  workerId: string
  period: string
  payableDays: number
  grossSalary: number
  deductions: number
  netSalary: number
  paymentStatus: SalaryPaymentStatus
  paymentDate: string | null
  paymentMode: string | null
  externalReference: string | null
  paymentSource: string | null
  bankName: string | null
  accountLast4: string | null
  proofDocumentName: string | null
  proofDocumentUrl: string | null
  verificationStatus: VerificationStatus
  verifiedBy: string | null
  verifiedAt: string | null
  verificationRemarks: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
  worker: {
    id: string
    employeeNumber: string
    fullName: string | null
    gender: string | null
    uanNumber: string | null
    isActive: boolean
    designation: { id: string; name: string } | null
    contractor: { id: string; name: string; code: string } | null
    site: { id: string; name: string; code: string } | null
    labourCamp: { id: string; name: string } | null
  }
}

export interface EPFRecordItem {
  id: string
  workerId: string
  period: string
  uan: string | null
  epfApplicable: boolean
  epfWage: number
  employeeContribution: number
  employerContribution: number
  epsContribution: number
  edliContribution: number
  totalContribution: number
  ecrStatus: EcrStatus
  ecrReference: string | null
  ecrFilingDate: string | null
  challanNumber: string | null
  challanDate: string | null
  depositDate: string | null
  dueDate: string | null
  externalReference: string | null
  timelinessStatus: TimelinessStatus
  daysDifference: number | null
  proofDocumentName: string | null
  proofDocumentUrl: string | null
  verificationStatus: VerificationStatus
  verifiedBy: string | null
  verifiedAt: string | null
  verificationRemarks: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
  worker: {
    id: string
    employeeNumber: string
    fullName: string | null
    gender: string | null
    uanNumber: string | null
    isActive: boolean
    designation: { id: string; name: string } | null
    contractor: { id: string; name: string; code: string } | null
    site: { id: string; name: string; code: string } | null
    labourCamp: { id: string; name: string } | null
  }
}

export interface ECRItem {
  id: string
  period: string
  contractorId: string | null
  contractorName: string | null
  workerCount: number
  ecrReference: string
  filingDate: string | null
  totalAmount: number
  challanNumber: string | null
  challanDate: string | null
  depositDate: string | null
  status: EcrStatus
  proofDocumentUrl: string | null
  proofDocumentName: string | null
  verificationStatus: string
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentDocumentItem {
  id: string
  workerId: string | null
  workerName: string | null
  employeeNumber: string | null
  contractorId: string | null
  contractorName: string | null
  siteId: string | null
  siteName: string | null
  period: string
  category: DocumentCategory
  documentType: string
  fileName: string
  fileUrl: string
  fileSize: string | null
  status: 'Uploaded' | 'Pending Verification' | 'Verified' | 'Rejected'
  verifiedBy: string | null
  verifiedAt: string | null
  uploadedBy: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export interface PayrollOverviewKPIs {
  period: string
  totalWorkers: number
  salaryRecorded: number
  salaryPending: number
  salaryRecordedPct: number
  totalSalaryAmount: number
  epfRecorded: number
  epfPending: number
  epfRecordedPct: number
  totalEpfAmount: number
  compliancePct: number
  complianceStatus: {
    salaryRecordsPct: number
    salaryVerificationPct: number
    epfRecordsPct: number
    ecrFilingPct: number
    epfDepositPct: number
    timelyDepositPct: number
    supportingDocsPct: number
  }
  requiresAttention: {
    id: string
    type: 'salary' | 'epf' | 'uan' | 'document' | 'verification'
    title: string
    count: number
    severity: ExceptionSeverity
    linkTab: 'salary' | 'epf' | 'exceptions' | 'documents'
  }[]
  monthlyHistory: {
    month: string
    compliancePct: number
    timelyPct: number
    latePct: number
    pendingPct: number
  }[]
}

export interface WorkerComplianceItem {
  workerId: string
  workerName: string
  employeeNumber: string
  designation: string
  site: string
  contractor: string
  camp: string
  salaryStatus: SalaryPaymentStatus
  salaryVerified: boolean
  epfStatus: string
  ecrStatus: string
  depositStatus: string
  timeliness: TimelinessStatus
  hasDocuments: boolean
  overallCompliance: OverallComplianceStatus
}

export interface ContractorComplianceItem {
  contractorId: string
  contractorName: string
  workerCount: number
  salaryRecordsPct: number
  salaryVerificationPct: number
  epfRecordsPct: number
  ecrFilingPct: number
  epfDepositPct: number
  timelyDepositPct: number
  overallCompliancePct: number
}

export interface SiteComplianceItem {
  siteId: string
  siteName: string
  workerCount: number
  salaryCompliancePct: number
  epfCompliancePct: number
  timelyDepositPct: number
  documentCompliancePct: number
  overallCompliancePct: number
}

export interface PayrollExceptionItem {
  id: string
  category: 'Salary' | 'EPF'
  severity: ExceptionSeverity
  title: string
  description: string
  workerId?: string
  workerName?: string
  employeeNumber?: string
  contractor?: string
  site?: string
  period: string
  dueDate?: string | null
  depositDate?: string | null
  amount?: number | null
  actionTab: 'salary' | 'epf' | 'documents'
}
