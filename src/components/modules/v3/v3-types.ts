export interface RoadSafetyItem {
  item: string
  answer: string
  remarks: string
}

export interface RoadSafetyData {
  total_items: number
  yes_count: number
  no_count: number
  compliance_pct: number | null
  items: RoadSafetyItem[]
}

export interface OhsData {
  daily_induction: string
  tbt: string
  method_statement: string
  fire_safety: string
  drinking_water: string
  committee_meeting: string
  audits_conducted: string[]
  incidents_logged: string[]
  compliance_pct: number
}

export interface AirStation {
  code: string
  name: string
  gps: string
  pm10: number | null
  pm25: number | null
  so2: number | null
  nox: number | null
  co: number | null
  exceedance: boolean
}

export interface NoiseStation {
  code: string
  name: string
  gps: string
  leq: number | null
  lmax: number | null
  lday: number | null
  lnight: number | null
}

export interface EvmData {
  air_stations: AirStation[]
  noise_stations: NoiseStation[]
  statutory: {
    EC: string
    CTE: string
    CTO: string
    Groundwater_SGWB: string
  }
  exceedance_count: number
  compliant: boolean
}

export interface SocialData {
  grc: {
    received: number
    resolved: number
    pending: number
  }
  workforce: {
    total: number
    local: number
    local_pct: number
    male: number
    female: number
    skills_category: Record<string, number>
    skill_trades: Record<string, number>
  }
  labour_camp: {
    facilities_score: number
    children: {
      '0-5': number
      '6-10': number
      '11-18': number
      total: number
    }
  }
  gender: {
    gbv_open: number
  }
}

export interface MonthSubmissionData {
  has_submission: boolean
  status: 'SUBMITTED' | 'MISSING_SUBMISSION'
  road_safety: RoadSafetyData | null
  ohs: OhsData | null
  evm: EvmData | null
  social: SocialData | null
}

export interface ProjectData {
  id: string
  name: string
  contractor: string
  pmc: string
  active_months: string[]
  months_data: Record<string, MonthSubmissionData>
}

export interface AttentionItem {
  id: string
  projectId: string
  projectName: string
  contractor: string
  domain: 'Road Safety' | 'OHS' | 'Environment' | 'Social' | 'Governance'
  issue: string
  severity: 'CRITICAL' | 'ATTENTION_REQUIRED' | 'MISSING_EVIDENCE'
  action: string
  month: string
}

export interface MonthlyStat {
  month: string
  submitted_projects_count: number
  awaiting_projects_count: number
  submission_rate: number
}

export interface V3CompliancePayload {
  metadata: {
    generated_at: string
    total_portfolio_projects: number
    active_submitting_projects: number
    awaiting_onboarding_projects: number
    reporting_months: string[]
    default_month: string
    official_road_safety_items: string[]
  }
  monthly_stats: Record<string, MonthlyStat>
  projects: ProjectData[]
  defaulter_projects: Array<{ id: string; name: string; contractor: string; pmc: string }>
  attention_required: AttentionItem[]
}

export interface DashboardFilterState {
  month: string
  searchQuery: string
  contractor: string
  statusFilter: 'ALL' | 'COMPLIANT' | 'ATTENTION' | 'MISSING'
}
