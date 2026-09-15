'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShieldCheck,
  Building2,
  X,
  Plus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { PaymentDocumentItem } from '@/types/payroll'
import { useAuthStore } from '@/stores/auth-store'

interface PayrollDocumentsTabProps {
  period: string
}

const SALARY_DOC_TYPES = [
  'Salary Register',
  'Wage Sheet',
  'Payment Statement',
  'Bank Statement',
  'Contractor Payment Report',
  'Payment Confirmation',
  'Worker Acknowledgement',
  'Other',
]

const EPF_DOC_TYPES = [
  'ECR',
  'ECR Acknowledgement',
  'Challan',
  'EPF Deposit Proof',
  'Contribution Statement',
  'Compliance Correspondence',
  'Other',
]

export default function PayrollDocumentsTab({ period }: PayrollDocumentsTabProps) {
  const queryClient = useQueryClient()
  const { userName, role } = useAuthStore()
  const canVerify = role === 'ADMIN' || role === 'PMC' || role === 'HR_COORDINATOR'

  const [category, setCategory] = useState<string>('all')
  const [docType, setDocType] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [newCat, setNewCat] = useState<'Salary' | 'EPF'>('Salary')
  const [newDocType, setNewDocType] = useState('Salary Register')
  const [newFileName, setNewFileName] = useState('')
  const [newRemarks, setNewRemarks] = useState('')
  const [newWorkerId, setNewWorkerId] = useState('all')
  const [newContractorId, setNewContractorId] = useState('all')

  // Fetch filter dropdown options
  const { data: contractors = [] } = useQuery<any[]>({
    queryKey: ['contractors'],
    queryFn: () => fetch('/api/contractors').then(r => r.json()),
  })
  const { data: workersResp } = useQuery<{ data: any[] }>({
    queryKey: ['workers-all-active'],
    queryFn: () => fetch('/api/workers?limit=250&status=active').then(r => r.json()),
  })
  const workers = workersResp?.data ?? []

  const { data: resp, isLoading } = useQuery<{ data: PaymentDocumentItem[] }>({
    queryKey: ['payroll-documents', period, category, docType, status, search],
    queryFn: () => {
      const p = new URLSearchParams({ period })
      if (category !== 'all') p.set('category', category)
      if (docType !== 'all') p.set('documentType', docType)
      if (status !== 'all') p.set('status', status)
      if (search) p.set('search', search)
      return fetch(`/api/payroll/documents?${p}`).then(r => r.json())
    },
  })
  const documents = resp?.data ?? []

  // Create doc mutation
  const uploadMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/payroll/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload document')
      return data
    },
    onSuccess: () => {
      toast.success('Document uploaded and logged')
      queryClient.invalidateQueries({ queryKey: ['payroll-documents'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-overview'] })
      setUploadDialogOpen(false)
      setNewFileName('')
      setNewRemarks('')
      setNewWorkerId('all')
      setNewContractorId('all')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // Verify/Reject doc mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await fetch('/api/payroll/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, userName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update document status')
      return data
    },
    onSuccess: (_, vars) => {
      toast.success(`Document marked as ${vars.newStatus}`)
      queryClient.invalidateQueries({ queryKey: ['payroll-documents'] })
      queryClient.invalidateQueries({ queryKey: ['payroll-overview'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFileName) {
      toast.error('Please select a file to upload')
      return
    }

    uploadMutation.mutate({
      period,
      category: newCat,
      documentType: newDocType,
      fileName: newFileName,
      fileSize: '1.2 MB', // Dummy size for now
      remarks: newRemarks,
      status: 'Uploaded',
      workerId: newWorkerId !== 'all' ? newWorkerId : undefined,
      contractorId: newContractorId !== 'all' ? newContractorId : undefined,
    })
  }

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Verified':
        return <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-300 text-[11px]">Verified</Badge>
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 text-[11px]">Rejected</Badge>
      case 'Pending Verification':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 text-[11px]">Pending Verification</Badge>
      default:
        return <Badge variant="secondary" className="text-[11px]">Uploaded</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {mounted && document.getElementById('payroll-tab-actions-right') && createPortal(
        <Button
          size="sm"
          className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Upload Document
        </Button>,
        document.getElementById('payroll-tab-actions-right')!
      )}

      {/* Filter Bar */}
      <Card className="py-0">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search file name, contractor, type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                <SelectItem value="Salary" className="text-xs">Salary Documents</SelectItem>
                <SelectItem value="EPF" className="text-xs">EPF Documents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Document Types</SelectItem>
                <SelectItem value="Salary Register" className="text-xs">Salary Register</SelectItem>
                <SelectItem value="Bank Statement" className="text-xs">Bank Statement</SelectItem>
                <SelectItem value="Contractor Payment Report" className="text-xs">Contractor Payment Report</SelectItem>
                <SelectItem value="ECR" className="text-xs">ECR Filing</SelectItem>
                <SelectItem value="ECR Acknowledgement" className="text-xs">ECR Acknowledgement</SelectItem>
                <SelectItem value="Challan" className="text-xs">TRRN Challan</SelectItem>
                <SelectItem value="EPF Deposit Proof" className="text-xs">EPF Deposit Proof</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="Verified" className="text-xs">Verified</SelectItem>
                <SelectItem value="Pending Verification" className="text-xs">Pending</SelectItem>
                <SelectItem value="Uploaded" className="text-xs">Uploaded</SelectItem>
                <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {(category !== 'all' || docType !== 'all' || status !== 'all' || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCategory('all'); setDocType('all'); setStatus('all'); setSearch('') }}
                className="h-8 text-xs text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs">
                <TableHead className="w-12 text-center">S.No.</TableHead>
                <TableHead className="min-w-[200px]">Document Name</TableHead>
                <TableHead className="w-24">Category</TableHead>
                <TableHead className="w-36">Document Type</TableHead>
                <TableHead className="w-20">Size</TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
                <TableHead className="min-w-[140px]">Verified By</TableHead>
                <TableHead className="w-28">Upload Date</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9} className="h-10">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center text-muted-foreground text-xs">
                    No compliance documents found for {period}.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc, idx) => (
                  <TableRow key={doc.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="text-center font-mono text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#0d9488] shrink-0" />
                        <span className="truncate max-w-[240px] font-mono">{doc.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">{doc.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doc.documentType}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{doc.fileSize || '1.2 MB'}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.verifiedBy ? (
                        <span className="text-teal-700 dark:text-teal-300 text-[11px] font-medium">
                          {doc.verifiedBy} ({doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'})
                        </span>
                      ) : (
                        <span className="text-amber-600 text-[11px]">Pending Review</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toast.info(`Viewing ${doc.fileName}`)}
                          title="Download / View"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        {canVerify && doc.status !== 'Verified' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#0d9488]"
                            onClick={() => statusMutation.mutate({ id: doc.id, newStatus: 'Verified' })}
                            title="Verify Document"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Upload Document Modal */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Compliance Document</DialogTitle>
            <DialogDescription className="text-xs">
              Upload supporting salary advice, contractor wage sheet, or EPF TRRN challan for {period}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={newCat} onValueChange={(v: any) => { setNewCat(v); setNewDocType(v === 'Salary' ? 'Salary Register' : 'ECR') }}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary" className="text-xs">Salary Document</SelectItem>
                  <SelectItem value="EPF" className="text-xs">EPF / Statutory Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Document Type</Label>
              <Select value={newDocType} onValueChange={setNewDocType}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(newCat === 'Salary' ? SALARY_DOC_TYPES : EPF_DOC_TYPES).map(t => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contractor (Optional)</Label>
                <Select value={newContractorId} onValueChange={setNewContractorId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Contractors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Contractors</SelectItem>
                    {contractors.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Worker (Optional)</Label>
                <Select value={newWorkerId} onValueChange={setNewWorkerId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Workers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Workers</SelectItem>
                    {workers.map(w => (
                      <SelectItem key={w.id} value={w.id} className="text-xs">{w.fullName} ({w.employeeNumber})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select File</Label>
              <Input
                type="file"
                className="text-xs cursor-pointer"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) setNewFileName(f.name)
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks / Notes</Label>
              <Input
                placeholder="e.g. TRRN challan paid via State Bank"
                value={newRemarks}
                onChange={e => setNewRemarks(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white">
                Upload & Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
