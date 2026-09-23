export interface RoadSafetyItem {
  item: string
  answer: string
  remarks: string
}

export interface RoadSafetyData {
  total_items: number
  yes_count: number
  no_count: number
  blank_count?: number
  na_count?: number
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
  lat?: number
  lng?: number
  pm10: number | null
  pm25: number | null
  so2: number | null
  nox: number | null
  co: number | null
  exceedance: boolean
  projectName?: string
  projectId?: string
}

export interface NoiseStation {
  code: string
  name: string
  gps: string
  lat?: number
  lng?: number
  leq: number | null
  lmax: number | null
  lday: number | null
  lnight: number | null
  projectName?: string
  projectId?: string
}

export interface SoilStation {
  code: string
  name: string
  gps: string
  lat: number
  lng: number
  status: string
}

export interface EvmData {
  air_stations: AirStation[]
  noise_stations: NoiseStation[]
  statutory: Record<string, string>
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
  domain: string
  rule?: string
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

export interface DomainAggregatesMonth {
  road_safety: {
    mix: { yes: number; no: number; blank: number; na: number }
    items: Record<string, { yes: number; no: number; blank: number; na: number; total: number; compliance_pct: number }>
    exceptions: Array<{ projectName: string; projectId: string; contractor: string; no_count: number; items: string[]; evidence_status: string }>
  }
  ohs: {
    groups: Record<string, { yes: number; no: number; applicable: number; pct: number }>
    audits: Record<string, { conducted: number; no: number; pending_ns: number }>
    trainings: Record<string, { freq: string; conducted: number; attendance: number }>
    incidents: Array<{ project: string; type: string; description: string; status: string; rca: string }>
    policies: Record<string, { yes: number; no: number }>
  }
  evm: {
    statutory: Record<string, { yes: number; no: number; na: number; applied: number; blank: number }>
    air_stations: AirStation[]
    noise_stations: NoiseStation[]
    soil_stations: SoilStation[]
    water_wastewater: {
      consumption: { construction: number; domestic: number; dust_suppression: number; total: number }
      wastewater: { generated: number; treated: number; reused: number; reuse_pct: number }
    }
    waste: Array<{ type: string; generated: number; disposed: number; unit: string }>
  }
  social_safeguard: {
    staff: Record<string, { filled: number; vacant: number }>
    pmc_visits: { env: number; social: number; ohs: number }
    observations: { raised: number; closed: number; cumulative_pending: number }
    grc: { received: number; resolved: number; cumulative_pending: number }
    influx_camps: {
      camps_count: number
      migrant_workers: number
      new_workers: number
      police_verified_pct: number
      medical_coverage_pct: number
      programs_conducted: number
    }
  }
  skill_training: {
    kpis: {
      total_workers: number
      local_pct: number
      female_pct: number
      trained_pct: number
      trained_employed_pct: number
    }
    local_types: Record<string, number>
    skill_trades: Record<string, number>
  }
  labour_law: {
    licenses: Record<string, { valid: number; expiring: number; expired: number }>
    facilities: Record<string, { yes_pct: number; no: number }>
    source_of_labour: Record<string, number>
    profile_origin: Record<string, number>
    profile_age: Record<string, number>
    registers: Record<string, { yes: number; missing: number }>
  }
  gender: {
    focal_icc: {
      focal_deployed: number
      icc_constituted: number
      icc_meetings_held: number
      icc_members_trained: number
      coc_signed_pct: number
    }
    sea_sh_status: Array<{ period: string; registered: number; resolved: number; pending: number }>
    facilities: Record<string, { yes_pct: number; no: number }>
    children: Array<{ category: string; newly_added: number; remaining: number; left: number; total: number }>
    women_employed: Array<{ skill: string; local_ap: number; migrant: number }>
    capacity_building: Array<{ program: string; participants: number }>
  }
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
    pmc_inspection_trend?: Array<{ month: string; env: number; social: number; ohs: number }>
    observation_trend?: Array<{ month: string; raised: number; closed: number; cumulative_pending: number }>
    grc_trend?: Array<{ month: string; received: number; resolved: number; cumulative_pending: number }>
    workforce_trend?: Array<{ month: string; total: number; local: number; female: number }>
  }
  projects: ProjectData[]
  defaulter_projects: Array<{ id: string; name: string; contractor: string; pmc: string }>
  domain_aggregates: Record<string, DomainAggregatesMonth>
  attention_required: AttentionItem[]
}

export interface DashboardFilterState {
  month: string
  searchQuery: string
  contractor: string
  project: string
  statusFilter: 'ALL' | 'COMPLIANT' | 'ATTENTION' | 'MISSING'
}
