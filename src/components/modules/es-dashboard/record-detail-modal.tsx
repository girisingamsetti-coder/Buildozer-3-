'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseRecord } from './types';
import {
  Calendar,
  Building,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink
} from 'lucide-react';

interface RecordDetailModalProps {
  record: BaseRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, open, onOpenChange }) => {
  if (!record) return null;

  const ragColors: Record<string, string> = {
    Green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    Amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    Red: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-teal-600 dark:text-teal-400">
                {record.id}
              </span>
              <Badge variant="outline" className={`font-semibold ${ragColors[record.rag_status]}`}>
                {record.rag_status} RAG ({record.compliance_score_pct}%)
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {record.category}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Reporting Month: <strong className="text-foreground">{record.reporting_month}</strong>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {record.form_type}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {record.project_title} • Project No: {record.project_no}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl text-xs">
            <div>
              <span className="text-muted-foreground block">Customer:</span>
              <span className="font-medium text-foreground">
                {record.customer || <span className="text-amber-500 italic">Unassigned (Public Sector Gap)</span>}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Designated Manager:</span>
              <span className="font-medium text-foreground">
                {record.manager === '-' ? <span className="text-muted-foreground italic">Unassigned (-)</span> : record.manager}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Submission Lag:</span>
              <span className="font-medium text-foreground">{record.submission_lag_months} months</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Created Date:</span>
              <span className={`font-medium ${record.form_created_date === 'Invalid date' ? 'text-rose-500 font-bold' : 'text-foreground'}`}>
                {record.form_created_date}
              </span>
            </div>
          </div>

          {/* Submission Workflow Cycle */}
          {record.submission_cycle && (
            <div className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Contractual Submission Cycle (20th / 22nd / 27th / 30th)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className={`p-2.5 rounded-lg border ${record.submission_cycle.contractor_on_time ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <div className="text-muted-foreground text-[11px]">Contractor (Target: 20th)</div>
                  <div className="font-semibold mt-0.5">{record.submission_cycle.contractor_submission}</div>
                  <Badge variant="outline" className="mt-1 text-[10px] h-4">
                    {record.submission_cycle.contractor_on_time ? 'On-time' : 'Delayed'}
                  </Badge>
                </div>
                <div className={`p-2.5 rounded-lg border ${record.submission_cycle.pmc_on_time ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <div className="text-muted-foreground text-[11px]">PMC Review (Target: 22nd)</div>
                  <div className="font-semibold mt-0.5">{record.submission_cycle.pmc_review}</div>
                  <Badge variant="outline" className="mt-1 text-[10px] h-4">
                    {record.submission_cycle.pmc_on_time ? 'On-time' : 'Delayed'}
                  </Badge>
                </div>
                <div className={`p-2.5 rounded-lg border ${record.submission_cycle.pgmc_on_time ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <div className="text-muted-foreground text-[11px]">PgMC Scrutiny (Target: 27th)</div>
                  <div className="font-semibold mt-0.5">{record.submission_cycle.pgmc_review}</div>
                  <Badge variant="outline" className="mt-1 text-[10px] h-4">
                    {record.submission_cycle.pgmc_on_time ? 'On-time' : 'Delayed'}
                  </Badge>
                </div>
                <div className={`p-2.5 rounded-lg border ${record.submission_cycle.apcrda_on_time ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <div className="text-muted-foreground text-[11px]">APCRDA Approval (Target: 30th)</div>
                  <div className="font-semibold mt-0.5">{record.submission_cycle.apcrda_final}</div>
                  <Badge variant="outline" className="mt-1 text-[10px] h-4">
                    {record.submission_cycle.apcrda_on_time ? 'On-time' : 'Delayed'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Form Specific Raw Data Preview */}
          <div className="border rounded-xl p-4 bg-muted/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Form Data Payload Summary</span>
              {record.is_incomplete_flag && (
                <Badge variant="destructive" className="text-[10px]">
                  Rejected: Over 20% Blank
                </Badge>
              )}
            </h4>
            <div className="max-h-72 overflow-y-auto font-mono text-[11px] bg-slate-950 text-slate-100 p-3 rounded-lg">
              <pre>{JSON.stringify(record, null, 2)}</pre>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close Inspector
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
