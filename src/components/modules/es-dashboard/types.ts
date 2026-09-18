export type RAGStatus = 'Green' | 'Amber' | 'Red';

export type ComplianceCategory = 'All' | 'Environment' | 'OHS' | 'Road Safety' | 'Social';

export interface BaseRecord {
  id: string;
  form_type: string;
  category: string;
  project_no: string;
  project_title: string;
  project_location: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
    formatted: string;
  };
  address_phone: string;
  customer: string | null;
  manager: string;
  reporting_month: string;
  form_created_date: string;
  submission_lag_months: number;
  rag_status: RAGStatus;
  compliance_score_pct: number;
  is_incomplete_flag: boolean;
  edge_case_type: string;
  submission_cycle?: {
    contractor_submission: string;
    contractor_target: string;
    contractor_on_time: boolean;
    pmc_review: string;
    pmc_target: string;
    pmc_on_time: boolean;
    pgmc_review: string;
    pgmc_target: string;
    pgmc_on_time: boolean;
    apcrda_final: string;
    apcrda_target: string;
    apcrda_on_time: boolean;
  };
  [key: string]: any;
}

export interface FormDataset {
  form_type: string;
  category: string;
  records: BaseRecord[];
}

export interface DashboardFilterState {
  month: string; // 'All' or 'YYYY-MM'
  category: ComplianceCategory;
  formType: string; // 'All' or specific form type
  ragStatus: 'All' | RAGStatus;
  searchQuery: string;
}

export interface OverdueItem {
  record_id: string;
  form_type: string;
  category: string;
  title: string;
  target_date: string;
  days_remaining: number;
  status: 'Overdue' | 'Due Soon' | 'Pending';
  responsible_person?: string;
  details?: string;
}

export interface DataQualityIssue {
  record_id: string;
  form_type: string;
  issue_type: 'Blank Customer' | 'Unassigned Manager' | 'Invalid Date' | '>20% Blank Fields' | 'Expired License' | 'Exceedance';
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  reporting_month: string;
}
