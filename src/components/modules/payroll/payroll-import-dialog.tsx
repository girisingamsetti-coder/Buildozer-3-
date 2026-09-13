'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as XLSX from 'xlsx'
import {
  Upload,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

interface PayrollImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period: string
}

const TEMPLATE_HEADERS = [
  'Employee Number',
  'Payable Days',
  'Gross Salary',
  'Deductions',
  'Net Salary',
  'Payment Status',
  'Payment Date',
  'Payment Mode',
  'External Reference',
  'Payment Source',
  'Bank Name',
  'Account Last 4',
  'Remarks',
]

export default function PayrollImportDialog({
  open,
  onOpenChange,
  period,
}: PayrollImportDialogProps) {
  const queryClient = useQueryClient()
  const userName = useAuthStore(s => s.userName)

  const [phase, setPhase] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload')
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [validationResult, setValidationResult] = useState<{
    validCount: number
    warningCount: number
    errorCount: number
    errors: any[]
    warnings: any[]
    preview: any[]
  } | null>(null)
  const [importedResult, setImportedResult] = useState<{ importedCount: number } | null>(null)

  const resetState = useCallback(() => {
    setPhase('upload')
    setFileName('')
    setParsedRows([])
    setValidationResult(null)
    setImportedResult(null)
  }, [])

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  // Template Download
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ['APCRDA-0001', 26, 18700, 2000, 16700, 'Paid', `${period}-05`, 'Bank Transfer', `UTR${period.replace('-', '')}001`, 'Contractor', 'SBI', '1042', 'Disbursed externally'],
      ['APCRDA-0002', 26, 24500, 2600, 21900, 'Paid', `${period}-05`, 'Bank Transfer', `UTR${period.replace('-', '')}002`, 'Contractor', 'HDFC', '5521', 'Disbursed externally'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'SalaryRecords')
    XLSX.writeFile(wb, `payroll_salary_template_${period}.xlsx`)
    toast.success('Template downloaded')
  }

  // Dry-run validate mutation
  const validateMutation = useMutation({
    mutationFn: async (rows: any[]) => {
      const res = await fetch('/api/payroll/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          records: rows,
          dryRun: true,
          userName,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Validation failed')
      return json.data
    },
    onSuccess: (data) => {
      setValidationResult(data)
      setPhase('preview')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setPhase('upload')
    },
  })

  // Commit mutation
  const commitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/payroll/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          records: parsedRows,
          dryRun: false,
          userName,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')
      return json.data
    },
    onSuccess: (data) => {
      setImportedResult(data)
      setPhase('done')
      queryClient.invalidateQueries({ queryKey: ['payroll-salary'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-overview'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-compliance'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-exceptions'] })
      toast.success(`Successfully imported ${data.importedCount} records`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setPhase('preview')
    },
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws)

        if (rawJson.length === 0) {
          toast.error('The uploaded sheet is empty')
          return
        }

        // Map sheet headers to internal fields
        const mapped = rawJson.map((row) => ({
          employeeNumber: row['Employee Number'] || row['employeeNumber'] || row['Emp No'] || row['Worker ID'],
          payableDays: row['Payable Days'] || row['payableDays'] || row['Days'] || 26,
          grossSalary: row['Gross Salary'] || row['grossSalary'] || row['Gross'] || 0,
          deductions: row['Deductions'] || row['deductions'] || 0,
          netSalary: row['Net Salary'] || row['netSalary'] || row['Net'] || 0,
          paymentStatus: row['Payment Status'] || row['paymentStatus'] || 'Paid',
          paymentDate: row['Payment Date'] || row['paymentDate'] || null,
          paymentMode: row['Payment Mode'] || row['paymentMode'] || 'Bank Transfer',
          externalReference: row['External Reference'] || row['externalReference'] || row['UTR'] || null,
          paymentSource: row['Payment Source'] || row['paymentSource'] || 'Contractor',
          bankName: row['Bank Name'] || row['bankName'] || null,
          accountLast4: row['Account Last 4'] || row['accountLast4'] || null,
          remarks: row['Remarks'] || row['remarks'] || null,
        }))

        setParsedRows(mapped)
        setPhase('preview')
        validateMutation.mutate(mapped)
      } catch {
        toast.error('Failed to parse file. Please upload a valid .xlsx or .xls file')
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-[#0d9488]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Import External Salary Records</DialogTitle>
              <DialogDescription className="text-xs">
                Upload and validate external payment registers for <span className="font-semibold text-foreground">{period}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Phase 1: Upload */}
        {phase === 'upload' && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-3 hover:border-[#0d9488]/60 transition-colors">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium">Select or drag your payroll Excel file</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .xlsx, .xls</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-medium cursor-pointer transition-colors">
                <span>Choose File</span>
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <span className="text-muted-foreground">Need the standard column format?</span>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Excel Template
              </Button>
            </div>
          </div>
        )}

        {/* Phase 2: Preview & Validation */}
        {phase === 'preview' && (
          <div className="space-y-4 py-2">
            {validateMutation.isPending ? (
              <div className="text-center py-12 space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0d9488]" />
                <p className="text-sm font-medium">Validating rows against Workforce register...</p>
                <p className="text-xs text-muted-foreground">Checking employee numbers, duplicates, and calculations</p>
              </div>
            ) : validationResult ? (
              <>
                <div className="p-3 rounded-lg bg-muted/40 border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0d9488]" />
                    <span className="font-mono font-medium">{fileName}</span>
                  </div>
                  <span className="text-muted-foreground">{parsedRows.length} rows detected</span>
                </div>

                {/* Validation Summary Cards */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200">
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block">
                      {validationResult.validCount}
                    </span>
                    <span className="text-xs text-muted-foreground">Valid Records</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200">
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-400 block">
                      {validationResult.warningCount}
                    </span>
                    <span className="text-xs text-muted-foreground">Warnings</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-red-50/50 dark:bg-red-950/20 border-red-200">
                    <span className="text-xl font-bold text-red-700 dark:text-red-400 block">
                      {validationResult.errorCount}
                    </span>
                    <span className="text-xs text-muted-foreground">Errors</span>
                  </div>
                </div>

                {/* Errors & Warnings List */}
                {validationResult.errorCount > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50/40 p-3 max-h-36 overflow-y-auto space-y-1.5 text-xs">
                    <p className="font-bold text-red-700 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Errors (These rows cannot be imported):
                    </p>
                    {validationResult.errors.map((err, idx) => (
                      <p key={idx} className="text-red-600 font-mono text-[11px]">
                        Row {err.row}: [{err.employeeNumber}] {err.message}
                      </p>
                    ))}
                  </div>
                )}

                {validationResult.warningCount > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 max-h-28 overflow-y-auto space-y-1 text-xs">
                    <p className="font-bold text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Warnings (Will be imported with note):
                    </p>
                    {validationResult.warnings.map((w, idx) => (
                      <p key={idx} className="text-amber-700 font-mono text-[11px]">
                        Row {w.row}: [{w.employeeNumber}] {w.message}
                      </p>
                    ))}
                  </div>
                )}

                <DialogFooter className="gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={resetState}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
                    disabled={validationResult.validCount === 0 || commitMutation.isPending}
                    onClick={() => commitMutation.mutate()}
                  >
                    {commitMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
                    Import {validationResult.validCount} Valid Records
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </div>
        )}

        {/* Phase 3: Done */}
        {phase === 'done' && importedResult && (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold">Import Completed</h3>
            <p className="text-xs text-muted-foreground">
              {importedResult.importedCount} external salary payment records successfully recorded for {period}.
            </p>
            <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white mt-2" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
