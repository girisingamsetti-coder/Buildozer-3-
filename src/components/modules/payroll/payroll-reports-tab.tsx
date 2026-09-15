'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileSpreadsheet,
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableExportButton, ExportColumn } from '@/components/ui/table-export-button'
import { toast } from 'sonner'

interface PayrollReportsTabProps {
  period: string
}

type ReportKey =
  | 'salary-monthly-register'
  | 'salary-contractor'
  | 'salary-site'
  | 'salary-pending'
  | 'salary-proof-pending'
  | 'salary-worker-history'
  | 'epf-monthly-register'
  | 'epf-contractor-compliance'
  | 'epf-deposit-report'
  | 'epf-late-deposits'
  | 'epf-pending'
  | 'epf-proof-pending'
  | 'epf-worker-history'
  | 'mgmt-monthly-compliance'
  | 'mgmt-exceptions'
  | 'mgmt-timeliness'

interface ReportMeta {
  key: ReportKey
  category: 'Salary' | 'EPF' | 'Management'
  title: string
  description: string
}

const REPORT_CATALOG: ReportMeta[] = [
  // Salary Reports
  { key: 'salary-monthly-register', category: 'Salary', title: 'Monthly Salary Payment Register', description: 'Complete record of gross, deductions, net salary, UTR and verification.' },
  { key: 'salary-contractor', category: 'Salary', title: 'Contractor-wise Salary Payment Summary', description: 'Aggregate salary disbursements categorized by contractor.' },
  { key: 'salary-site', category: 'Salary', title: 'Site-wise Salary Payment Summary', description: 'Location-based disbursement and verification metrics.' },
  { key: 'salary-pending', category: 'Salary', title: 'Pending Salary Payments Report', description: 'Workers with unrecorded or delayed salary payments.' },
  { key: 'salary-proof-pending', category: 'Salary', title: 'Payment Proof Pending Report', description: 'Disbursed records missing supporting bank advice or slip.' },
  { key: 'salary-worker-history', category: 'Salary', title: 'Worker-wise Payment History Report', description: 'Full salary payment history per individual worker across all periods on record.' },

  // EPF Reports
  { key: 'epf-monthly-register', category: 'EPF', title: 'Monthly EPF Statutory Register', description: 'Comprehensive EPF contribution breakdown with UAN and wages.' },
  { key: 'epf-contractor-compliance', category: 'EPF', title: 'Contractor EPF Compliance Report', description: 'Contractor-wise ECR filing, challans, and deposit tracking.' },
  { key: 'epf-deposit-report', category: 'EPF', title: 'EPF Deposit & Challan Report', description: 'Challan TRRN numbers, filing dates, deposit dates and amounts.' },
  { key: 'epf-late-deposits', category: 'EPF', title: 'EPF Late & Overdue Deposit Report', description: 'Deposits completed past statutory 15th deadline.' },
  { key: 'epf-pending', category: 'EPF', title: 'EPF Deposit Pending Report', description: 'Workers for whom EPF deposit has not yet been recorded for this period.' },
  { key: 'epf-proof-pending', category: 'EPF', title: 'EPF Proof Pending Report', description: 'EPF deposits recorded but missing supporting cyber receipt or challan proof.' },
  { key: 'epf-worker-history', category: 'EPF', title: 'Worker-wise EPF Contribution History', description: 'Per-worker EPF contribution and deposit history across all periods.' },

  // Management Reports
  { key: 'mgmt-monthly-compliance', category: 'Management', title: 'Monthly Payroll Compliance Report', description: 'Executive summary of salary and statutory compliance scores.' },
  { key: 'mgmt-exceptions', category: 'Management', title: 'Payroll Exception & Irregularity Report', description: 'Critical and high severity discrepancies requiring action.' },
  { key: 'mgmt-timeliness', category: 'Management', title: 'Statutory Timeliness Performance Report', description: 'Timeliness comparison across months and contractors.' },
]

export default function PayrollReportsTab({ period }: PayrollReportsTabProps) {
  const [selectedReport, setSelectedReport] = useState<ReportKey>('salary-monthly-register')
  const [search, setSearch] = useState('')

  // Fetch data for reports
  const { data: salResp, isLoading: salLoading } = useQuery<any>({
    queryKey: ['payroll-salary-report', period],
    queryFn: () => fetch(`/api/payroll/salary?period=${period}&limit=250`).then(r => r.json()),
  })
  const { data: epfResp, isLoading: epfLoading } = useQuery<any>({
    queryKey: ['payroll-epf-report', period],
    queryFn: () => fetch(`/api/payroll/epf?period=${period}&limit=250`).then(r => r.json()),
  })
  const { data: compResp, isLoading: compLoading } = useQuery<any>({
    queryKey: ['payroll-compliance-report', period],
    queryFn: () => fetch(`/api/payroll/compliance?period=${period}`).then(r => r.json()),
  })

  const salaryData: any[] = salResp?.data ?? []
  const epfData: any[] = epfResp?.data ?? []
  const complianceData = compResp?.data

  const currentReportMeta = REPORT_CATALOG.find(r => r.key === selectedReport) || REPORT_CATALOG[0]

  // Compute records for current selected report
  let reportRows: any[] = []
  let exportCols: ExportColumn<any>[] = []

  switch (selectedReport) {
    case 'salary-monthly-register':
      reportRows = salaryData
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'desig', header: 'Designation', accessor: r => r.worker.designation?.name || 'Worker' },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'gross', header: 'Gross Salary', accessor: r => r.grossSalary },
        { key: 'ded', header: 'Deductions', accessor: r => r.deductions },
        { key: 'net', header: 'Net Salary', accessor: r => r.netSalary },
        { key: 'status', header: 'Status', accessor: r => r.paymentStatus },
        { key: 'date', header: 'Payment Date', accessor: r => r.paymentDate ? r.paymentDate.split('T')[0] : '—' },
        { key: 'utr', header: 'UTR / Ref', accessor: r => r.externalReference || '—' },
        { key: 'verif', header: 'Verification', accessor: r => r.verificationStatus },
      ]
      break

    case 'salary-contractor':
      reportRows = complianceData?.contractorCompliance ?? []
      exportCols = [
        { key: 'name', header: 'Contractor', accessor: c => c.contractorName },
        { key: 'workers', header: 'Workers', accessor: c => c.workerCount },
        { key: 'salRec', header: 'Salary Recorded %', accessor: c => `${c.salaryRecordsPct}%` },
        { key: 'salVer', header: 'Salary Verified %', accessor: c => `${c.salaryVerificationPct}%` },
        { key: 'overall', header: 'Overall %', accessor: c => `${c.overallCompliancePct}%` },
      ]
      break

    case 'salary-site':
      reportRows = complianceData?.siteCompliance ?? []
      exportCols = [
        { key: 'name', header: 'Site / Location', accessor: s => s.siteName },
        { key: 'workers', header: 'Workers', accessor: s => s.workerCount },
        { key: 'salComp', header: 'Salary Compliance %', accessor: s => `${s.salaryCompliancePct}%` },
        { key: 'epfComp', header: 'EPF Compliance %', accessor: s => `${s.epfCompliancePct}%` },
        { key: 'overall', header: 'Overall %', accessor: s => `${s.overallCompliancePct}%` },
      ]
      break

    case 'salary-pending':
      reportRows = salaryData.filter(r => r.paymentStatus === 'Not Recorded')
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'site', header: 'Site / Zone', accessor: r => r.worker.site?.name },
        { key: 'net', header: 'Net Amount', accessor: r => r.netSalary },
        { key: 'status', header: 'Status', accessor: r => r.paymentStatus },
      ]
      break

    case 'salary-proof-pending':
      reportRows = salaryData.filter(r => r.paymentStatus !== 'Not Recorded' && !r.proofDocumentName)
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'net', header: 'Net Salary', accessor: r => r.netSalary },
        { key: 'utr', header: 'UTR Reference', accessor: r => r.externalReference || '—' },
        { key: 'status', header: 'Status', accessor: () => 'Proof Missing' },
      ]
      break

    case 'epf-monthly-register':
      reportRows = epfData
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'uan', header: 'UAN', accessor: r => r.uan || 'Missing' },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'wage', header: 'EPF Wage', accessor: r => r.epfWage },
        { key: 'empContrib', header: 'Employee (12%)', accessor: r => r.employeeContribution },
        { key: 'empyrContrib', header: 'Employer (3.67%)', accessor: r => r.employerContribution },
        { key: 'eps', header: 'EPS (8.33%)', accessor: r => r.epsContribution },
        { key: 'total', header: 'Total EPF', accessor: r => r.totalContribution },
        { key: 'ecr', header: 'ECR Status', accessor: r => r.ecrStatus },
        { key: 'timely', header: 'Timeliness', accessor: r => r.timelinessStatus },
      ]
      break

    case 'epf-late-deposits':
      reportRows = epfData.filter(r => r.timelinessStatus === 'Late' || r.timelinessStatus === 'Overdue')
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'total', header: 'EPF Amount', accessor: r => r.totalContribution },
        { key: 'due', header: 'Due Date', accessor: r => r.dueDate ? r.dueDate.split('T')[0] : '—' },
        { key: 'dep', header: 'Deposit Date', accessor: r => r.depositDate ? r.depositDate.split('T')[0] : 'Not Deposited' },
        { key: 'status', header: 'Timeliness Status', accessor: r => r.timelinessStatus },
      ]
      break

    case 'epf-pending':
      reportRows = epfData.filter(r => r.depositDate === null || r.ecrStatus === 'Pending')
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'uan', header: 'UAN', accessor: r => r.uan || 'Missing' },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'site', header: 'Site / Zone', accessor: r => r.worker.site?.name },
        { key: 'total', header: 'EPF Amount', accessor: r => r.totalContribution },
        { key: 'ecr', header: 'ECR Status', accessor: r => r.ecrStatus },
        { key: 'due', header: 'Due Date', accessor: r => r.dueDate ? r.dueDate.split('T')[0] : '—' },
        { key: 'status', header: 'Deposit Status', accessor: r => r.depositDate ? 'Deposited' : 'Not Deposited' },
      ]
      break

    case 'epf-proof-pending':
      reportRows = epfData.filter(r => r.depositDate !== null && !r.proofDocumentName)
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'uan', header: 'UAN', accessor: r => r.uan || 'Missing' },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'total', header: 'EPF Amount', accessor: r => r.totalContribution },
        { key: 'challan', header: 'Challan No', accessor: r => r.challanNumber || '—' },
        { key: 'dep', header: 'Deposit Date', accessor: r => r.depositDate ? r.depositDate.split('T')[0] : '—' },
        { key: 'proof', header: 'Proof Status', accessor: () => 'Proof Missing' },
      ]
      break

    case 'salary-worker-history':
      reportRows = salaryData
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'period', header: 'Period', accessor: r => r.period },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'site', header: 'Site / Zone', accessor: r => r.worker.site?.name },
        { key: 'days', header: 'Payable Days', accessor: r => r.payableDays },
        { key: 'gross', header: 'Gross Salary', accessor: r => r.grossSalary },
        { key: 'ded', header: 'Deductions', accessor: r => r.deductions },
        { key: 'net', header: 'Net Salary', accessor: r => r.netSalary },
        { key: 'status', header: 'Payment Status', accessor: r => r.paymentStatus },
        { key: 'date', header: 'Payment Date', accessor: r => r.paymentDate ? r.paymentDate.split('T')[0] : '—' },
        { key: 'utr', header: 'UTR / Ref', accessor: r => r.externalReference || '—' },
        { key: 'verif', header: 'Verification', accessor: r => r.verificationStatus },
      ]
      break

    case 'epf-worker-history':
      reportRows = epfData
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'period', header: 'Period', accessor: r => r.period },
        { key: 'uan', header: 'UAN', accessor: r => r.uan || 'Missing' },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'wage', header: 'EPF Wage', accessor: r => r.epfWage },
        { key: 'emp', header: 'Employee (12%)', accessor: r => r.employeeContribution },
        { key: 'er', header: 'Employer (3.67%)', accessor: r => r.employerContribution },
        { key: 'eps', header: 'EPS (8.33%)', accessor: r => r.epsContribution },
        { key: 'total', header: 'Total EPF', accessor: r => r.totalContribution },
        { key: 'ecr', header: 'ECR Status', accessor: r => r.ecrStatus },
        { key: 'challan', header: 'Challan No', accessor: r => r.challanNumber || '—' },
        { key: 'dep', header: 'Deposit Date', accessor: r => r.depositDate ? r.depositDate.split('T')[0] : 'Not Deposited' },
        { key: 'timely', header: 'Timeliness', accessor: r => r.timelinessStatus },
        { key: 'verif', header: 'Verification', accessor: r => r.verificationStatus },
      ]
      break

    default:
      reportRows = salaryData
      exportCols = [
        { key: 'empNo', header: 'Employee No', accessor: r => r.worker.employeeNumber },
        { key: 'name', header: 'Worker Name', accessor: r => r.worker.fullName },
        { key: 'contractor', header: 'Contractor', accessor: r => r.worker.contractor?.name },
        { key: 'net', header: 'Amount', accessor: r => r.netSalary },
        { key: 'status', header: 'Status', accessor: r => r.paymentStatus },
      ]
      break
  }

  const isLoading = salLoading || epfLoading || compLoading

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Report Catalog Selector */}
        <Card className="lg:col-span-1 p-2 space-y-1 max-h-[75vh] overflow-y-auto">
          <div className="px-2 py-1.5 font-bold text-base uppercase tracking-wider text-[#0d9488]">
            Report Catalog
          </div>

          <div className="space-y-1">
            <span className="text-sm font-bold text-muted-foreground px-2 pt-2 block uppercase">Salary Reports</span>
            {REPORT_CATALOG.filter(r => r.category === 'Salary').map(r => (
              <button
                key={r.key}
                onClick={() => setSelectedReport(r.key)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                  selectedReport === r.key ? 'bg-teal-50 dark:bg-teal-950/40 text-[#0d9488] font-bold border border-teal-200 dark:border-teal-800' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="truncate">{r.title}</span>
              </button>
            ))}

            <span className="text-sm font-bold text-muted-foreground px-2 pt-3 block uppercase">EPF Reports</span>
            {REPORT_CATALOG.filter(r => r.category === 'EPF').map(r => (
              <button
                key={r.key}
                onClick={() => setSelectedReport(r.key)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                  selectedReport === r.key ? 'bg-teal-50 dark:bg-teal-950/40 text-[#0d9488] font-bold border border-teal-200 dark:border-teal-800' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="truncate">{r.title}</span>
                {(r.key === 'epf-pending' || r.key === 'epf-proof-pending') && (
                  <span className="ml-1 shrink-0 text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">New</span>
                )}
              </button>
            ))}

            <span className="text-sm font-bold text-muted-foreground px-2 pt-3 block uppercase">Management Reports</span>
            {REPORT_CATALOG.filter(r => r.category === 'Management').map(r => (
              <button
                key={r.key}
                onClick={() => setSelectedReport(r.key)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                  selectedReport === r.key ? 'bg-teal-50 dark:bg-teal-950/40 text-[#0d9488] font-bold border border-teal-200 dark:border-teal-800' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="truncate">{r.title}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Right Column: Report Viewer & Export */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="p-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#0d9488]">
                    {currentReportMeta.category}
                  </Badge>
                  <h3 className="font-bold text-sm text-foreground">{currentReportMeta.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{currentReportMeta.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <TableExportButton
                  rows={reportRows}
                  columns={exportCols}
                  filename={`${currentReportMeta.key}_${period}`}
                  variant="outline"
                  size="sm"
                />
                <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / PDF
                </Button>
              </div>
            </div>
          </Card>

          {/* Report Data Table Preview */}
          <Card>
            <div className="overflow-x-auto max-h-[60vh]">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0">
                  <TableRow className="text-xs">
                    <TableHead className="w-10 text-center">#</TableHead>
                    {exportCols.map(c => (
                      <TableHead key={c.key} className="text-xs">{c.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={exportCols.length + 1} className="h-10">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : reportRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={exportCols.length + 1} className="h-32 text-center text-xs text-muted-foreground">
                        No rows found matching report criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportRows.slice(0, 100).map((row, idx) => (
                      <TableRow key={idx} className="text-xs hover:bg-muted/30">
                        <TableCell className="text-center font-mono text-muted-foreground">{idx + 1}</TableCell>
                        {exportCols.map(col => {
                          const val = col.accessor ? col.accessor(row, idx) : row[col.key]
                          return (
                            <TableCell key={col.key} className="text-xs">
                              {typeof val === 'number' ? val.toLocaleString('en-IN') : String(val ?? '—')}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
