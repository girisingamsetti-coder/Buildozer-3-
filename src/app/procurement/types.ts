export interface ProcurementData {
  id: number;
  workNumber?: string | null;
  projectName?: string | null;
  projectDescription?: string | null;
  adminSanctionDate?: string | null;
  technicalSanctionDate?: string | null;
  estimatedCostInrCr?: number | null;
  estimatedCostUsdMn?: number | null;
  procurementCategory?: string | null;
  procurementMethod?: string | null;
  rateType?: string | null;
  nitPlannedMonth?: string | null;
  techEnvelopeOpeningMonth?: string | null;
  expectedAwardMonth?: string | null;
  tenderPublishDate?: string | null;
  loaIssueDate?: string | null;
  agreementDate?: string | null;
  contractorName?: string | null;
  procurementCycleDays?: number | null;
  financialQuoteVariancePct?: number | null;
  avgBidderCount?: number | null;
  status?: number;
  createdBy?: number | null;
  updatedBy?: number | null;
}

export const PROCUREMENT_CATEGORIES = [
  'Goods',
  'Works',
  'Non-Consulting Services (NCS)',
  'Consulting Services (CS)',
];

export const PROCUREMENT_METHODS = [
  'Open Competitive Bidding (OCB)',
  'Limited Competitive Bidding (LCB)',
  'Direct Contracting (DC)',
];

export const PROCUREMENT_RATE_TYPES = [
  'Item Rate',
  'Lumpsum',
  'EPC',
  'DBO',
];
