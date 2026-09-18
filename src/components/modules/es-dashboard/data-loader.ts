import { FormDataset, BaseRecord, OverdueItem, DataQualityIssue, RAGStatus } from './types';

let cachedDatasets: FormDataset[] | null = null;

export async function fetchAllDatasets(): Promise<FormDataset[]> {
  if (cachedDatasets) return cachedDatasets;

  try {
    const res = await fetch('/synthetic_data/all_es_synthetic_datasets.json');
    if (res.ok) {
      const data = await res.json();
      cachedDatasets = data;
      return data;
    }
  } catch (e) {
    console.warn('Failed to load bundled datasets, attempting individual files:', e);
  }

  // Fallback to loading individually
  const fileNames = [
    'environmental_compliance_monitoring.json',
    'ohs_monitoring.json',
    'road_safety_checklist.json',
    'gender.json',
    'labour_law_compliance.json',
    'skill_training_and_employment.json',
    'social_safeguard_compliance.json'
  ];

  try {
    const promises = fileNames.map(f => fetch(`/synthetic_data/${f}`).then(r => r.json()));
    const datasets = await Promise.all(promises);
    cachedDatasets = datasets;
    return datasets;
  } catch (err) {
    console.error('Error fetching individual synthetic datasets:', err);
    return [];
  }
}

export function extractAllRecords(datasets: FormDataset[]): BaseRecord[] {
  return datasets.flatMap(d => d.records);
}

export function extractOverdueItems(records: BaseRecord[]): OverdueItem[] {
  const items: OverdueItem[] = [];
  const now = new Date();

  records.forEach(r => {
    // 1. Environmental Site NCs
    if (r.site_ncs?.target_close_date && (r.site_ncs.open_ncs > 0 || r.site_ncs.overdue_nc_count > 0)) {
      const target = new Date(r.site_ncs.target_close_date);
      const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = diffDays < 0 || r.site_ncs.status === 'Overdue';
      items.push({
        record_id: r.id,
        form_type: r.form_type,
        category: r.category,
        title: `Site NC Closure (${r.site_ncs.open_ncs} Open Observations)`,
        target_date: r.site_ncs.target_close_date,
        days_remaining: diffDays,
        status: isOverdue ? 'Overdue' : (diffDays <= 15 ? 'Due Soon' : 'Pending'),
        responsible_person: r.site_ncs.issued_by,
        details: `${r.site_ncs.total_observations_given} raised, ${r.site_ncs.total_complied} complied`
      });
    }

    // 2. OHS Incidents CAPA
    if (Array.isArray(r.incidents)) {
      r.incidents.forEach((inc: any) => {
        if (inc.capa_status !== 'Closed') {
          const target = new Date(inc.target_closure_date || r.reporting_month + '-20');
          const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          items.push({
            record_id: r.id,
            form_type: r.form_type,
            category: r.category,
            title: `OHS CAPA: ${inc.type} - ${inc.incident_id}`,
            target_date: inc.target_closure_date || `${r.reporting_month}-20`,
            days_remaining: diffDays,
            status: inc.is_overdue || diffDays < 0 ? 'Overdue' : 'Due Soon',
            responsible_person: 'OHS Lead Engineer',
            details: inc.description
          });
        }
      });
    }

    // 3. Labour Law License Expiries
    if (Array.isArray(r.establishment_registration_and_licenses)) {
      r.establishment_registration_and_licenses.forEach((lic: any) => {
        if (lic.status === 'Expired' || lic.status === 'Expiring Soon') {
          items.push({
            record_id: r.id,
            form_type: r.form_type,
            category: r.category,
            title: `Statutory License: ${lic.act_name} (${lic.license_no})`,
            target_date: lic.expiry_date,
            days_remaining: lic.days_to_expiry,
            status: lic.status === 'Expired' ? 'Overdue' : 'Due Soon',
            responsible_person: 'Labour Law Compliance Manager',
            details: `Act: ${lic.act_code}`
          });
        }
      });
    }

    // 4. Labour Law Corrective Actions
    if (Array.isArray(r.key_gaps_and_corrective_actions)) {
      r.key_gaps_and_corrective_actions.forEach((gap: any) => {
        if (gap.status === 'Overdue' || gap.status === 'Open') {
          items.push({
            record_id: r.id,
            form_type: r.form_type,
            category: r.category,
            title: `Labour Audit Gap: ${gap.gap.slice(0, 50)}...`,
            target_date: gap.target_date,
            days_remaining: -5,
            status: gap.status === 'Overdue' ? 'Overdue' : 'Pending',
            responsible_person: gap.responsible_person,
            details: gap.recommendation
          });
        }
      });
    }

    // 5. Social Safeguard Sub-committee
    if (Array.isArray(r.sub_committee_inspections)) {
      r.sub_committee_inspections.forEach((sub: any) => {
        if (sub.status === 'Overdue') {
          items.push({
            record_id: r.id,
            form_type: r.form_type,
            category: r.category,
            title: `Sub-committee Action: ${sub.committee}`,
            target_date: sub.target_close_date,
            days_remaining: -8,
            status: 'Overdue',
            responsible_person: 'Social Development Specialist',
            details: `${sub.observations_issued} issued, ${sub.observations_closed} closed`
          });
        }
      });
    }
  });

  // Sort by days_remaining ascending (most overdue first)
  return items.sort((a, b) => a.days_remaining - b.days_remaining);
}

export function extractDataQualityIssues(records: BaseRecord[]): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  records.forEach(r => {
    // 1. Blank Customer
    if (!r.customer) {
      issues.push({
        record_id: r.id,
        form_type: r.form_type,
        issue_type: 'Blank Customer',
        severity: 'Low',
        description: 'Customer organization field is unassigned (common public sector gap)',
        reporting_month: r.reporting_month
      });
    }

    // 2. Unassigned Manager
    if (r.manager === '-' || !r.manager) {
      issues.push({
        record_id: r.id,
        form_type: r.form_type,
        issue_type: 'Unassigned Manager',
        severity: 'Low',
        description: 'Designated manager is unassigned ("-")',
        reporting_month: r.reporting_month
      });
    }

    // 3. Invalid Date
    if (r.form_created_date === 'Invalid date' || r.form_created_date < '2024-01-01') {
      issues.push({
        record_id: r.id,
        form_type: r.form_type,
        issue_type: 'Invalid Date',
        severity: 'High',
        description: `Form creation date "${r.form_created_date}" is invalid or precedes project kick-off`,
        reporting_month: r.reporting_month
      });
    }

    // 4. >20% Incomplete
    if (r.is_incomplete_flag) {
      issues.push({
        record_id: r.id,
        form_type: r.form_type,
        issue_type: '>20% Blank Fields',
        severity: 'High',
        description: 'Over 20% required fields are blank; subject to form rejection per CESMP criteria',
        reporting_month: r.reporting_month
      });
    }

    // 5. Expired License
    if (Array.isArray(r.establishment_registration_and_licenses)) {
      const expired = r.establishment_registration_and_licenses.find((l: any) => l.status === 'Expired');
      if (expired) {
        issues.push({
          record_id: r.id,
          form_type: r.form_type,
          issue_type: 'Expired License',
          severity: 'High',
          description: `Statutory License expired: ${expired.act_name} (${expired.license_no})`,
          reporting_month: r.reporting_month
        });
      }
    }

    // 6. Air or Noise Exceedance
    if (Array.isArray(r.air_quality)) {
      const exceedAir = r.air_quality.find((a: any) => a.pm10 > a.pm10_limit || a.pm25 > a.pm25_limit);
      if (exceedAir) {
        issues.push({
          record_id: r.id,
          form_type: r.form_type,
          issue_type: 'Exceedance',
          severity: 'Medium',
          description: `Air quality limit exceeded at ${exceedAir.station}: PM10=${exceedAir.pm10} (limit 100), PM2.5=${exceedAir.pm25} (limit 60)`,
          reporting_month: r.reporting_month
        });
      }
    }
  });

  return issues;
}

export function calculateProjectRAG(records: BaseRecord[]): {
  overallScore: number;
  overallRAG: RAGStatus;
  categoryScores: Record<string, { score: number; rag: RAGStatus; total: number; green: number; amber: number; red: number }>;
  openNCs: number;
  overdueCount: number;
  expiredLicenses: number;
  dataCompleteness: number;
} {
  if (records.length === 0) {
    return {
      overallScore: 0,
      overallRAG: 'Green',
      categoryScores: {},
      openNCs: 0,
      overdueCount: 0,
      expiredLicenses: 0,
      dataCompleteness: 100
    };
  }

  const categoryMap: Record<string, { totalScore: number; count: number; green: number; amber: number; red: number }> = {};
  let totalScore = 0;
  let openNCs = 0;
  let overdueCount = 0;
  let expiredLicenses = 0;
  let incompleteCount = 0;

  records.forEach(r => {
    totalScore += r.compliance_score_pct;
    const cat = r.category || 'Other';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { totalScore: 0, count: 0, green: 0, amber: 0, red: 0 };
    }
    categoryMap[cat].totalScore += r.compliance_score_pct;
    categoryMap[cat].count += 1;

    if (r.rag_status === 'Green') categoryMap[cat].green += 1;
    else if (r.rag_status === 'Amber') categoryMap[cat].amber += 1;
    else categoryMap[cat].red += 1;

    if (r.site_ncs?.open_ncs) openNCs += r.site_ncs.open_ncs;
    if (r.edge_case_type === 'overdue') overdueCount += 1;
    if (r.edge_case_type === 'expired_license') expiredLicenses += 1;
    if (r.is_incomplete_flag) incompleteCount += 1;
  });

  const overallScore = Math.round(totalScore / records.length);
  const dataCompleteness = Math.round(((records.length - incompleteCount) / records.length) * 100);

  // RAG Logic:
  // Green >= 90% and nothing overdue/expired
  // Amber 70-89% or items due within 30 days
  // Red < 70% or overdue/expired > 0
  let overallRAG: RAGStatus = 'Green';
  if (overallScore < 70 || overdueCount > 2 || expiredLicenses > 0) {
    overallRAG = 'Red';
  } else if (overallScore < 90 || overdueCount > 0) {
    overallRAG = 'Amber';
  }

  const categoryScores: Record<string, { score: number; rag: RAGStatus; total: number; green: number; amber: number; red: number }> = {};
  Object.keys(categoryMap).forEach(cat => {
    const item = categoryMap[cat];
    const score = Math.round(item.totalScore / item.count);
    let rag: RAGStatus = 'Green';
    if (score < 70 || item.red > 0) rag = 'Red';
    else if (score < 90 || item.amber > 0) rag = 'Amber';

    categoryScores[cat] = {
      score,
      rag,
      total: item.count,
      green: item.green,
      amber: item.amber,
      red: item.red
    };
  });

  return {
    overallScore,
    overallRAG,
    categoryScores,
    openNCs,
    overdueCount,
    expiredLicenses,
    dataCompleteness
  };
}
