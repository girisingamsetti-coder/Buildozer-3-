import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'synthetic_data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];
const chance = (prob) => Math.random() < prob;

const AP_NAMES = [
  'K. Venkateswara Rao', 'Ch. Lakshmi Narayana', 'P. Suresh Babu', 'M. Srinivasulu',
  'Y. Ramesh Naidu', 'B. Satyanarayana', 'T. Anjaneyulu', 'G. Subba Rao',
  'D. Padmavathi', 'V. Siva Prasad', 'K. Durga Bhavani', 'S. Apparao',
  'N. Ramakrishna', 'A. Prasad', 'V. Venu Madhav', 'P. Srilatha',
  'K. Tirupathi Rao', 'Ch. Balaji', 'M. Veeraiah', 'J. Nageswara Rao'
];

const AP_VILLAGES = [
  { village: 'Rayapudi', mandal: 'Tulluru', district: 'Guntur' },
  { village: 'Mandadam', mandal: 'Tulluru', district: 'Guntur' },
  { village: 'Velagapudi', mandal: 'Tulluru', district: 'Guntur' },
  { village: 'Uddandarayunipalem', mandal: 'Tulluru', district: 'Guntur' },
  { village: 'Inavolu', mandal: 'Tulluru', district: 'Guntur' },
  { village: 'Nelapadu', mandal: 'Tulluru', district: 'Guntur' },
  { village: 'Sakhamuru', mandal: 'Tulluru', district: 'Guntur' },
  { village: 'Nowluru', mandal: 'Mangalagiri', district: 'Guntur' }
];

const GOV_CLIENTS = ['APCRDA (Andhra Pradesh Capital Region Development Authority)', 'Amaravati Development Corporation Ltd (ADCL)', 'AP Housing Board'];

const MONTHS_LIST = [
  '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
  '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
  '2026-01', '2026-02', '2026-03', '2026-04'
];

function generateAadhaar() {
  return `${randomInt(2000, 9999)} ${randomInt(1000, 9999)} ${randomInt(1000, 9999)}`;
}

function generateGPS(offsetLat = 0, offsetLng = 0) {
  const lat = (16.5120 + offsetLat + (Math.random() - 0.5) * 0.05).toFixed(5);
  const lng = (80.5180 + offsetLng + (Math.random() - 0.5) * 0.05).toFixed(5);
  return { latitude: parseFloat(lat), longitude: parseFloat(lng), formatted: `${lat}°N, ${lng}°E` };
}

function getSubmissionCycleDates(reportingMonth, isLate = false) {
  const [year, month] = reportingMonth.split('-').map(Number);
  const contractorDay = isLate ? randomInt(22, 28) : randomInt(15, 20);
  const pmcDay = isLate ? randomInt(24, 29) : randomInt(20, 22);
  const pgmcDay = isLate ? randomInt(28, 30) : randomInt(25, 27);
  const apcrdaDay = isLate ? 31 : 30;

  const pad = (n) => String(n).padStart(2, '0');
  return {
    contractor_submission: `${year}-${pad(month)}-${pad(contractorDay)}`,
    contractor_target: `${year}-${pad(month)}-20`,
    contractor_on_time: !isLate,
    pmc_review: `${year}-${pad(month)}-${pad(pmcDay)}`,
    pmc_target: `${year}-${pad(month)}-22`,
    pmc_on_time: !isLate,
    pgmc_review: `${year}-${pad(month)}-${pad(pgmcDay)}`,
    pgmc_target: `${year}-${pad(month)}-27`,
    pgmc_on_time: !isLate,
    apcrda_final: `${year}-${pad(month)}-${pad(apcrdaDay)}`,
    apcrda_target: `${year}-${pad(month)}-30`,
    apcrda_on_time: !isLate
  };
}

function createBaseRecord(prefix, index, reportingMonth, edgeCase = 'none') {
  const id = `${prefix}-${String(index).padStart(3, '0')}`;
  const [year, month] = reportingMonth.split('-').map(Number);
  
  // Submission lag: 4 to 8 months
  const lagMonths = randomInt(4, 8);
  const createdDateObj = new Date(year, month - 1 + lagMonths, randomInt(1, 28));
  let formCreatedDate = createdDateObj.toISOString().split('T')[0];

  let repMonth = reportingMonth;
  if (edgeCase === 'invalid_date') {
    formCreatedDate = chance(0.5) ? 'Invalid date' : '2023-11-15'; // Prior to project initiation
  } else if (edgeCase === 'mismatched_month') {
    repMonth = '2024-04'; // Mismatch
  }

  const customer = chance(0.1) ? randomItem(GOV_CLIENTS) : null;
  const manager = chance(0.2) ? randomItem(APNAMES_SAMPLE) : '-';

  const isLate = edgeCase === 'overdue' || chance(0.25);
  const submissionCycle = getSubmissionCycleDates(repMonth, isLate);

  // Compliance RAG classification (~70% good, 20% at-risk, 10% non-compliant)
  let ragStatus = 'Green';
  let complianceScore = randomInt(91, 100);
  if (edgeCase === 'overdue' || edgeCase === 'expired_license' || edgeCase === 'exceedance') {
    ragStatus = 'Red';
    complianceScore = randomInt(52, 68);
  } else if (edgeCase === 'over_20_blank' || chance(0.2)) {
    ragStatus = 'Amber';
    complianceScore = randomInt(72, 88);
  }

  return {
    id,
    form_type: '',
    category: '',
    project_no: 'WIN/0032/24-25',
    project_title: "Hon'ble MLAs and MLCs and AIS Officers - Housing",
    project_location: 'Rayapudi, Amaravati',
    gps_coordinates: generateGPS(),
    address_phone: 'Lenin Center, Beside Apsara Theatre, Governorpet, Vijayawada, Andhra Pradesh; +91 9666600919',
    customer,
    manager,
    reporting_month: repMonth,
    form_created_date: formCreatedDate,
    submission_lag_months: lagMonths,
    rag_status: ragStatus,
    compliance_score_pct: complianceScore,
    is_incomplete_flag: edgeCase === 'over_20_blank',
    edge_case_type: edgeCase,
    submission_cycle: submissionCycle
  };
}

const APNAMES_SAMPLE = AP_NAMES;

const EDGE_DISTRIBUTION = [
  'none', 'none', 'none', 'none', 'none', 'none', 'none',
  'invalid_date', 'over_20_blank', 'overdue', 'expired_license', 'exceedance'
];

// ==========================================
// 1. ENVIRONMENTAL COMPLIANCE MONITORING
// ==========================================
function generateEnvironmentalRecords() {
  const records = [];
  const facilities = [
    'Quarry (Gravel)', 'Quarry (Stone)', 'Sand Reach', 'RMC Plant',
    'Hot Mix Plant', 'WMM Plant', 'Crusher', 'STP'
  ];
  const airSources = [
    'labour camp', 'construction site', 'haulage routes', 'settlements',
    'storage yards', 'vehicular emissions', 'DG stack', 'RMC plant', 'PPEs', 'hot mix plant'
  ];
  const noiseSources = [
    'DG sets', 'construction sites/vehicles', 'equipment', 'sensitive locations',
    'PPEs', 'settlements', 'labour camps'
  ];
  const wasteCategories = [
    'food/kitchen', 'used lube oil', 'chemical/admixture barrels', 'grease barrels',
    'paint/solvent tins', 'air filters', 'oil filters', 'biomedical waste',
    'C&D waste', 'lead acid battery', 'recyclable plastics', 'HDPE cement bags',
    'HDPE bentonite bags', 'e-waste', 'other general solid waste'
  ];

  for (let i = 1; i <= 40; i++) {
    const repMonth = MONTHS_LIST[(i - 1) % MONTHS_LIST.length];
    const edgeCase = i === 4 ? 'invalid_date' : (i === 12 ? 'over_20_blank' : (i === 19 ? 'exceedance' : (i === 28 ? 'overdue' : randomItem(EDGE_DISTRIBUTION))));
    const base = createBaseRecord('ENV', i, repMonth, edgeCase);
    base.form_type = 'Environmental Compliance Monitoring';
    base.category = 'Environment';

    const isBlank = edgeCase === 'over_20_blank';
    const isExceed = edgeCase === 'exceedance';

    // Statutory compliance matrix
    const statutoryCompliance = facilities.map(fac => ({
      facility: fac,
      ec: chance(0.85) ? 'Yes' : (chance(0.5) ? 'Applied' : 'No'),
      cte: chance(0.9) ? 'Yes' : 'Applied',
      cto: chance(0.8) ? 'Yes' : (chance(0.5) ? 'Applied' : 'No'),
      status_overall: chance(0.85) ? 'Compliant' : 'Pending Verification'
    }));

    const specialClearances = {
      sgwb_permission: chance(0.9) ? 'Yes' : 'Applied',
      peso_approval: chance(0.85) ? 'Yes' : 'Applied',
      apwalta_tree_felling: chance(0.95) ? 'Yes' : 'No',
      blasting_approval: chance(0.7) ? 'NA' : 'Yes',
      submission_of_compliance_reports: chance(0.9) ? 'Yes' : 'Pending',
      form_v_submission: chance(0.85) ? 'Yes' : 'Applied'
    };

    // Air Quality per station AAQ1-AAQ6 (limits: PM10 <= 100, PM2.5 <= 60, SO2 <= 80, NOx <= 80)
    const airQuality = Array.from({ length: 6 }, (_, idx) => {
      const station = `AAQ${idx + 1}`;
      const exceedThis = isExceed && (idx === 1 || idx === 3);
      const pm10 = exceedThis ? randomInt(108, 145) : randomInt(42, 94);
      const pm25 = exceedThis ? randomInt(64, 88) : randomInt(18, 55);
      const so2 = randomInt(12, 48);
      const nox = randomInt(22, 65);
      const co = randomFloat(0.4, 1.8);
      return {
        station,
        gps: generateGPS(idx * 0.008, idx * 0.006),
        pm10,
        pm10_limit: 100,
        pm10_exceeded: pm10 > 100,
        pm25,
        pm25_limit: 60,
        pm25_exceeded: pm25 > 60,
        so2,
        so2_limit: 80,
        nox,
        nox_limit: 80,
        co_mg_m3: co,
        sampling_date: `${repMonth}-${String(randomInt(10, 25)).padStart(2, '0')}`,
        monitoring_report_url: `https://reports.buildozer.internal/env/air/${base.id}_${station}.pdf`,
        status: (pm10 > 100 || pm25 > 60) ? 'Exceedance' : 'Normal'
      };
    });

    const airPollutionControlMeasures = airSources.map(s => ({
      source: s,
      water_sprinkling_active: chance(0.9),
      dust_screens_installed: chance(0.85),
      green_belt_covering: chance(0.8),
      status: chance(0.9) ? 'Satisfactory' : 'Action Required'
    }));

    // Noise monitoring N1-N3 and DG Set (Limits: Day 75, Night 70, DG 75)
    const noiseLevels = [
      { location: 'N1 - North Gate Boundary', limit_day: 75, limit_night: 70 },
      { location: 'N2 - Near Residential Cluster', limit_day: 55, limit_night: 45 },
      { location: 'N3 - RMC Batching Plant', limit_day: 75, limit_night: 70 },
      { location: 'DG Set - Primary Power Zone', limit_day: 75, limit_night: 75 }
    ].map((loc, idx) => {
      const exceedThis = isExceed && idx === 0;
      const leq = exceedThis ? randomInt(78, 86) : randomInt(52, 73);
      return {
        location: loc.location,
        gps: generateGPS(idx * 0.004, idx * 0.005),
        leq_db: leq,
        lmax_db: leq + randomInt(4, 10),
        lmin_db: Math.max(40, leq - randomInt(8, 15)),
        l_day_db: leq,
        l_night_db: Math.max(42, leq - randomInt(6, 12)),
        limit_day: loc.limit_day,
        limit_night: loc.limit_night,
        is_exceeded: leq > loc.limit_day,
        sampling_date: `${repMonth}-${String(randomInt(12, 22)).padStart(2, '0')}`
      };
    });

    const noiseControlMeasures = noiseSources.map(s => ({
      source: s,
      acoustic_enclosures_fitted: chance(0.9),
      maintenance_logs_updated: chance(0.92),
      status: chance(0.9) ? 'Compliant' : 'Needs Repair'
    }));

    // Water consumption (m3/month)
    const constructionWater = randomInt(450, 950);
    const domesticWater = randomInt(280, 520);
    const dustSuppressionWater = randomInt(180, 360);
    const totalWater = constructionWater + domesticWater + dustSuppressionWater;

    // Wastewater
    const wwGenerated = randomInt(180, 340);
    const wwTreated = Math.round(wwGenerated * randomFloat(0.75, 0.95));
    const wwReused = Math.round(wwTreated * randomFloat(0.6, 0.85));
    const sludgeGeneratedKg = randomInt(40, 110);
    const sludgeDisposedKg = sludgeGeneratedKg;

    // Soil quality S1-S5
    const soilQuality = Array.from({ length: 5 }, (_, idx) => ({
      station: `S${idx + 1}`,
      gps: generateGPS(idx * 0.007, idx * 0.009),
      ph: randomFloat(6.8, 7.9),
      ec_ds_m: randomFloat(0.25, 0.85),
      organic_carbon_pct: randomFloat(0.45, 1.15),
      available_n_kg_ha: randomInt(180, 320),
      available_p_kg_ha: randomInt(14, 28),
      sampling_date: `${repMonth}-18`
    }));

    // Waste Management (15 categories)
    const wasteManagement = wasteCategories.map(cat => {
      const generated = randomInt(20, 250);
      const disposed = Math.min(generated, Math.round(generated * randomFloat(0.85, 1.0)));
      return {
        category: cat,
        unit: cat.includes('oil') || cat.includes('chemical') ? 'Liters' : (cat.includes('bags') || cat.includes('battery') ? 'Nos' : 'Kg'),
        quantity_generated: generated,
        quantity_disposed: disposed,
        quantity_sold: cat.includes('HDPE') || cat.includes('battery') ? randomInt(10, 50) : 0,
        cumulative_disposed: disposed * randomInt(3, 8),
        disposal_agency: 'APPCB Authorized Agency - Guntur Enviro Clean Tech Ltd',
        mou_tieup_active: chance(0.95)
      };
    });

    const openNcs = edgeCase === 'overdue' ? randomInt(2, 5) : (chance(0.3) ? randomInt(1, 2) : 0);
    const observationsRaised = randomInt(3, 9);
    const observationsComplied = Math.max(0, observationsRaised - openNcs);

    records.push({
      ...base,
      statutory_compliance: isBlank ? [] : statutoryCompliance,
      special_clearances: isBlank ? {} : specialClearances,
      air_quality: isBlank ? [] : airQuality,
      air_pollution_control_measures: isBlank ? [] : airPollutionControlMeasures,
      noise: isBlank ? [] : noiseLevels,
      noise_control_measures: isBlank ? [] : noiseControlMeasures,
      water_consumption: isBlank ? {} : {
        total_monthly_m3: totalWater,
        cumulative_m3: totalWater * randomInt(4, 9),
        source: 'Borewell & Authorized Tanker Supply',
        by_use_type: {
          construction_m3: constructionWater,
          domestic_m3: domesticWater,
          dust_suppression_m3: dustSuppressionWater
        }
      },
      wastewater: isBlank ? {} : {
        quantity_generated_m3: wwGenerated,
        quantity_treated_m3: wwTreated,
        quantity_reused_m3: wwReused,
        treatment_efficiency_pct: Math.round((wwTreated / wwGenerated) * 100),
        sludge_generated_kg: sludgeGeneratedKg,
        sludge_disposed_kg: sludgeDisposedKg,
        sludge_disposal_method: 'Composted for onsite landscaping'
      },
      soil_quality: isBlank ? [] : soilQuality,
      soil_management: isBlank ? {} : {
        topsoil_preserved_m3: randomInt(1200, 3500),
        topsoil_used_for_greenery_m3: randomInt(600, 1800),
        storage_condition: 'Bunded & stabilized with grass seeding'
      },
      erosion_control: isBlank ? {} : {
        construction_site: { implemented: true, evidence_attached: true },
        road_works: { implemented: true, evidence_attached: true },
        flood_mitigation: { implemented: true, evidence_attached: true }
      },
      muck_management: isBlank ? {} : {
        generated_m3: randomInt(400, 1200),
        stored_m3: randomInt(150, 450),
        disposed_m3: randomInt(350, 1000),
        disposal_method: 'low-lying fill within designated layout zones'
      },
      tree_management: isBlank ? {} : {
        identified_in_site: 142,
        identified_to_cut: 28,
        identified_for_transplantation: 34,
        cumulative_cut: 24,
        cumulative_transplanted: 30,
        transplantation_survival_rate_pct: 88,
        walta_permit_status: 'Approved by DFO Guntur (Ref: WALTA/GNT/2024/098)'
      },
      waste_management: isBlank ? [] : wasteManagement,
      training: isBlank ? {} : {
        date: `${repMonth}-14`,
        topic: 'Construction Waste Minimization & Spill Response Protocol',
        participants_count: randomInt(24, 45),
        attendance_sheet_attached: true
      },
      site_ncs: isBlank ? {} : {
        total_observations_given: observationsRaised,
        total_complied: observationsComplied,
        letters_issued: randomInt(0, 2),
        open_ncs: openNcs,
        issued_by: 'PMC - Aarvee Associates / PgMC - STUP',
        overdue_nc_count: edgeCase === 'overdue' ? openNcs : 0,
        target_close_date: `${repMonth}-28`,
        status: openNcs > 0 ? (edgeCase === 'overdue' ? 'Overdue' : 'Action In Progress') : 'Fully Closed'
      }
    });
  }

  return { form_type: 'Environmental Compliance Monitoring', category: 'Environment', records };
}

// ==========================================
// 2. OHS MONITORING
// ==========================================
function generateOHSRecords() {
  const records = [];
  const auditTypes = ['Safety & Security', 'Internal OHS', 'MSAS', 'Electrical Safety'];

  for (let i = 1; i <= 40; i++) {
    const repMonth = MONTHS_LIST[(i - 1) % MONTHS_LIST.length];
    const edgeCase = i === 7 ? 'invalid_date' : (i === 15 ? 'overdue' : (i === 22 ? 'over_20_blank' : randomItem(EDGE_DISTRIBUTION)));
    const base = createBaseRecord('OHS', i, repMonth, edgeCase);
    base.form_type = 'OHS Monitoring';
    base.category = 'OHS';

    const isBlank = edgeCase === 'over_20_blank';
    const isOverdue = edgeCase === 'overdue';

    const dailyInductions = randomInt(60, 140);
    const toolboxTalks = randomInt(24, 28);
    const recognizedManpower = chance(0.7);

    const audits = [
      {
        audit_type: 'Safety & Security',
        frequency: 'Monthly',
        conducted: chance(0.9),
        compliance_report_status: 'Submitted',
        next_due_date: `${repMonth}-28`,
        is_overdue: false
      },
      {
        audit_type: 'Internal OHS',
        frequency: 'Half-Yearly (3rd Party)',
        conducted: chance(0.75),
        compliance_report_status: chance(0.8) ? 'Submitted' : 'Pending Action',
        next_due_date: `${repMonth}-25`,
        is_overdue: isOverdue
      },
      {
        audit_type: 'MSAS',
        frequency: 'Quarterly',
        conducted: chance(0.85),
        compliance_report_status: 'Approved',
        next_due_date: `${repMonth}-30`,
        is_overdue: false
      },
      {
        audit_type: 'Electrical Safety',
        frequency: 'Monthly',
        conducted: chance(0.9),
        compliance_report_status: 'Submitted',
        next_due_date: `${repMonth}-22`,
        is_overdue: false
      }
    ];

    const incidentCount = chance(0.3) ? randomInt(1, 3) : 0;
    const incidents = Array.from({ length: incidentCount }, (_, idx) => {
      const type = randomItem(['Near Miss', 'First Aid Case', 'Unsafe Condition', 'Minor Injury']);
      return {
        incident_id: `INC-${base.id}-${idx + 1}`,
        type,
        date: `${repMonth}-${String(randomInt(5, 24)).padStart(2, '0')}`,
        description: type === 'Near Miss' ? 'Loose scaffolding coupler fell from 3m during shuttering' : 'Hand scrape while tying reinforcement rebars',
        root_cause: 'Inadequate pre-task inspection & non-standard tethering',
        capa_status: isOverdue ? 'Pending Closure' : 'Closed',
        target_closure_date: `${repMonth}-20`,
        is_overdue: isOverdue,
        report_attached: true
      };
    });

    records.push({
      ...base,
      daily_monitoring: isBlank ? {} : {
        ohs_induction_conducted: true,
        induction_count: dailyInductions,
        daily_toolbox_talks_conducted: true,
        toolbox_talks_count: toolboxTalks,
        compliance_rate_pct: 98,
        remarks: '100% incoming workforce covered before site deployment'
      },
      weekly_reporting: isBlank ? {} : {
        wms_hira_approved: chance(0.92) ? 'Yes' : 'Pending Revision',
        fire_fighting_system_in_place: true,
        fire_extinguishers_tagged: randomInt(38, 55),
        drinking_water_available_onsite: true,
        drinking_water_test_report_valid: true,
        geotagged_photos_uploaded: true
      },
      monthly_monitoring: isBlank ? {} : {
        ohs_committee_formed: true,
        monthly_meetings_held: true,
        worker_rep_participation: true,
        worker_reps_count: 6,
        mpr_prepared_per_cesmp: true
      },
      promotional_motivational_programs: isBlank ? {} : {
        manpower_recognized_this_month: recognizedManpower,
        rewards_staff: recognizedManpower ? randomInt(1, 3) : 0,
        rewards_workers: recognizedManpower ? randomInt(4, 12) : 0,
        best_safety_performer: randomItem(AP_NAMES)
      },
      trainings: isBlank ? {} : {
        type: 'Working at Height & Scaffolding Safety',
        frequency: 'Bi-weekly',
        sessions_held: randomInt(3, 6),
        attendees_count: randomInt(45, 95),
        attendance_sheet_attached: true
      },
      ohs_inspections: isBlank ? {} : {
        frequency: 'Daily & Weekly Walkthroughs',
        total_inspections_conducted: randomInt(12, 16),
        report_attached: true
      },
      ohs_audits: isBlank ? [] : audits,
      hazard_id_sop: isBlank ? {} : {
        hira_carried_out_quarterly: true,
        quarter: `Q${Math.floor(randomInt(1, 4))}`,
        sops_submitted: [
          'SOP-CON-01: Deep Foundation & Shoring',
          'SOP-CON-04: Tower Crane Erection & Lifting',
          'SOP-CON-07: Confined Space Entry (STP/Sump)'
        ],
        attachments_verified: true
      },
      ohs_policies: isBlank ? {} : {
        health_and_safety_policy_displayed: true,
        ohs_plan_approved: true,
        emergency_response_plan_approved: true,
        lifting_tools_third_party_inspected: chance(0.9) ? 'Yes' : 'Due for Re-test',
        heat_stress_management_plan: true,
        monsoon_preparedness_plan: true
      },
      incidents: isBlank ? [] : incidents
    });
  }

  return { form_type: 'OHS Monitoring', category: 'OHS', records };
}

// ==========================================
// 3. ROAD SAFETY CHECKLIST
// ==========================================
function generateRoadSafetyRecords() {
  const records = [];
  const checklist15 = [
    'Approved TMP (IRC SP:55-2014)',
    'Indicative signages per CESMP Ch.7',
    'Approved diversion plans',
    'Temporary traffic barriers/barricades/caution tapes',
    'Night safety arrangements (lighting, reflectors, blinkers, signage)',
    'Traffic marshals/flagmen deployment',
    'Traffic calming (speed breakers, rumble strips, markings)',
    'Alternate route plans avoiding villages',
    'Plastic/water-filled crash barriers',
    'Road safety awareness programs',
    'Controlled access/regulated entry to work zones',
    'Pedestrian safety arrangements',
    'PPE provision/use (high-vis vests for marshals)',
    'Monthly Advance Action Plan',
    'Monthly Progress Report – road safety measures'
  ];

  for (let i = 1; i <= 40; i++) {
    const repMonth = MONTHS_LIST[(i - 1) % MONTHS_LIST.length];
    const edgeCase = i === 10 ? 'over_20_blank' : (i === 18 ? 'overdue' : randomItem(EDGE_DISTRIBUTION));
    const base = createBaseRecord('RS', i, repMonth, edgeCase);
    base.form_type = 'Road Safety Checklist';
    base.category = 'Road Safety';

    const isBlank = edgeCase === 'over_20_blank';

    let compliantCount = 0;
    const checklistItems = checklist15.map((item, idx) => {
      // simulate realistic variation: night safety and crash barriers have higher non-compliance
      const passRate = idx === 4 || idx === 8 ? 0.75 : 0.92;
      const isYes = chance(passRate);
      if (isYes) compliantCount++;
      return {
        item_no: idx + 1,
        item_name: item,
        status: isYes ? 'Yes' : 'No',
        remarks: isYes ? 'Verified on site during joint inspection' : 'Additional reflective solar blinkers required at detour curves',
        upload_status: isYes ? 'Uploaded' : (chance(0.5) ? 'Pending' : 'Uploaded'),
        photo_url: `https://reports.buildozer.internal/rs/${base.id}_item_${idx + 1}.jpg`
      };
    });

    const compliancePct = Math.round((compliantCount / checklist15.length) * 100);

    records.push({
      ...base,
      checklist: isBlank ? [] : checklistItems,
      checklist_total_items: checklist15.length,
      checklist_compliant_items: isBlank ? 0 : compliantCount,
      checklist_compliance_pct: isBlank ? 0 : compliancePct,
      safety_audit_conducted: isBlank ? false : chance(0.85),
      safety_audit_document_url: isBlank ? null : `https://reports.buildozer.internal/rs/audit/${base.id}.pdf`,
      evidence_completeness_pct: isBlank ? 0 : randomInt(85, 100),
      recurring_issues: isBlank ? [] : [
        { issue: 'Night visibility blinkers missing near Sakhamuru diversion', status: 'Rectified' },
        { issue: 'Traffic marshal relief shift delay during peak truck haulage hours', status: 'Under Review' }
      ]
    });
  }

  return { form_type: 'Road Safety Checklist', category: 'Road Safety', records };
}

// ==========================================
// 4. SOCIAL — GENDER
// ==========================================
function generateGenderRecords() {
  const records = [];
  const genderFacilities = [
    'Separate accommodation for female workers', 'Dedicated female toilets with locks & running water',
    'Separate bathing cubicles with privacy screens', 'Clean cooking / kitchen spaces with LPG',
    'Designated breastfeeding room', 'Sturdy bed & cot provision', 'Functional on-site creche with caregiver',
    'LPG gas distribution (smoke-free cooking)', 'Safe and tested drinking water stations',
    'Free sanitary napkins dispenser & incinerator', 'Privacy in periodic medical health checkup camps',
    'Separate female nurse / healthcare assistant deployed'
  ];

  const trainingTypes = [
    'Community GBV Awareness Workshop', 'Gender Sensitization for Village Orgs / Community Elders',
    'ICC Training on POSH Act 2013', 'Code of Conduct (CoC) Training for Supervisory Staff',
    'Code of Conduct (CoC) Training for Construction Workers', 'GBV/SEA-SH Orientation for E&S Specialists',
    'GBV/SEA-SH Grievance Redressal Refresher for Female Workers'
  ];

  for (let i = 1; i <= 40; i++) {
    const repMonth = MONTHS_LIST[(i - 1) % MONTHS_LIST.length];
    const edgeCase = i === 5 ? 'over_20_blank' : (i === 14 ? 'overdue' : randomItem(EDGE_DISTRIBUTION));
    const base = createBaseRecord('GEN', i, repMonth, edgeCase);
    base.form_type = 'Gender';
    base.category = 'Social';

    const isBlank = edgeCase === 'over_20_blank';

    const registeredComplaints = chance(0.2) ? randomInt(1, 2) : 0;
    const resolvedComplaints = registeredComplaints > 0 ? (edgeCase === 'overdue' ? 0 : registeredComplaints) : 0;
    const pendingComplaints = registeredComplaints - resolvedComplaints;

    const facilitiesStatus = genderFacilities.map(fac => ({
      facility_name: fac,
      is_provided: chance(0.9),
      condition: chance(0.9) ? 'Good & Operational' : 'Under Maintenance',
      verified_by_icc: true
    }));

    const newStaff = randomInt(4, 12);
    const newLabourers = randomInt(40, 110);
    const totalNew = newStaff + newLabourers;
    const signedCoc = Math.round(totalNew * randomFloat(0.92, 1.0));

    const capacityBuilding = trainingTypes.map(t => {
      const male = randomInt(15, 35);
      const female = randomInt(10, 28);
      return {
        training_topic: t,
        male_participants: male,
        female_participants: female,
        total_participants: male + female,
        trainer_name: randomItem(AP_NAMES),
        date: `${repMonth}-${String(randomInt(8, 24)).padStart(2, '0')}`
      };
    });

    records.push({
      ...base,
      contracting_agency: 'NCC - Navayuga JV Construction Ltd',
      pmc_name: 'Aarvee Associates Architects Engineers & Consultants Pvt Ltd',
      gbv_staffing: isBlank ? {} : {
        social_and_labour_managers_required: 2,
        social_and_labour_managers_deployed: 2,
        female_social_officer_present: true,
        remarks: 'Full compliance with contract staffing requirements'
      },
      icc_status: isBlank ? {} : {
        constituted: true,
        presiding_officer: 'D. Padmavathi (External Legal Expert)',
        meetings_held_this_month: 1,
        members_trained_male: 3,
        members_trained_female: 4,
        members_trained_total: 7,
        remarks: 'Regular monthly compliance session conducted at site office'
      },
      gender_facilities_checklist: isBlank ? [] : facilitiesStatus,
      sea_sh_complaints: isBlank ? {} : {
        monthly_registered: registeredComplaints,
        monthly_resolved: resolvedComplaints,
        monthly_pending: pendingComplaints,
        monthly_escalated: 0,
        cumulative_registered: registeredComplaints + randomInt(2, 6),
        cumulative_resolved: registeredComplaints + randomInt(2, 5),
        cumulative_pending: pendingComplaints,
        cumulative_escalated: 0,
        helpline_number_displayed: '+91 9666600919 / 181 Women Helpline'
      },
      iec_material_display: isBlank ? {} : {
        labour_camp: { gbv_sea_sh: true, code_of_conduct: true, icc_members_list: true, service_providers: true },
        site_office: { gbv_sea_sh: true, code_of_conduct: true, icc_members_list: true, service_providers: true }
      },
      coc_compliance: isBlank ? {} : {
        new_staff_deployed: newStaff,
        new_labourers_deployed: newLabourers,
        total_new_deployed: totalNew,
        number_signed_coc: signedCoc,
        compliance_pct: Math.round((signedCoc / totalNew) * 100)
      },
      children_in_camp: isBlank ? {} : {
        age_0_5: { male: randomInt(4, 8), female: randomInt(5, 9), total: 12 },
        age_6_10: { male: randomInt(6, 12), female: randomInt(6, 11), total: 18 },
        age_11_18: { male: randomInt(3, 7), female: randomInt(4, 8), total: 11 },
        total_children: 41,
        creche_attendance_avg: 18,
        school_going_connected: 22
      },
      women_newly_employed: isBlank ? {} : {
        local: { highly_skilled: 1, skilled: 3, semi_skilled: 8, unskilled: 14, total: 26 },
        migrant: { highly_skilled: 0, skilled: 2, semi_skilled: 4, unskilled: 18, total: 24 },
        overall_female_workforce_pct: 18.5
      },
      capacity_building: isBlank ? [] : capacityBuilding
    });
  }

  return { form_type: 'Gender', category: 'Social', records };
}

// ==========================================
// 5. SOCIAL — LABOUR LAW COMPLIANCE
// ==========================================
function generateLabourLawRecords() {
  const records = [];
  const acts = [
    { code: 'BOCW', name: 'Building & Other Construction Workers Act 1996', license_prefix: 'BOCW/GNT' },
    { code: 'CLA', name: 'Contract Labour (Regulation & Abolition) Act 1970', license_prefix: 'CLA/AP' },
    { code: 'ISMW', name: 'Inter-State Migrant Workmen Act 1979', license_prefix: 'ISMW/GNT' },
    { code: 'EPF', name: 'Employees Provident Funds & Misc Provisions Act 1952', license_prefix: 'AP/VJA/EPF' },
    { code: 'ESI', name: 'Employees State Insurance Act 1948', license_prefix: 'ESI/GNT/REG' },
    { code: 'WC', name: 'Workmens Compensation Insurance Policy', license_prefix: 'WC/UIIC' },
    { code: 'MTW', name: 'Motor Transport Workers Act 1961', license_prefix: 'MTW/AP/TRANS' }
  ];

  const campFacilities = [
    'Subsidized Canteen', 'Adequate Rest Rooms', 'Cool Safe Drinking Water (RO)',
    'Operational Creche', 'First Aid Center with Attendant', 'Grievance Redressal Cell (GRC)',
    'Internal Complaints Committee (ICC)', 'Notice Board: Abstract of Labour Acts in Telugu/Hindi',
    'Notice Board: Wage Rates & Pay Dates Display'
  ];

  for (let i = 1; i <= 40; i++) {
    const repMonth = MONTHS_LIST[(i - 1) % MONTHS_LIST.length];
    const edgeCase = i === 8 ? 'expired_license' : (i === 16 ? 'over_20_blank' : (i === 24 ? 'overdue' : randomItem(EDGE_DISTRIBUTION)));
    const base = createBaseRecord('LL', i, repMonth, edgeCase);
    base.form_type = 'Labour Law Compliance';
    base.category = 'Social';

    const isBlank = edgeCase === 'over_20_blank';
    const isExpired = edgeCase === 'expired_license';

    // 7 statutory licenses
    const licenseRecords = acts.map((act, idx) => {
      const expiredThis = isExpired && idx === 0;
      const daysToExpiry = expiredThis ? -randomInt(12, 60) : randomInt(45, 480);
      const expiryDateObj = new Date();
      expiryDateObj.setDate(expiryDateObj.getDate() + daysToExpiry);

      return {
        act_code: act.code,
        act_name: act.name,
        license_no: `${act.license_prefix}/${randomInt(10000, 99999)}`,
        start_date: '2024-04-01',
        expiry_date: expiryDateObj.toISOString().split('T')[0],
        days_to_expiry: daysToExpiry,
        status: daysToExpiry < 0 ? 'Expired' : (daysToExpiry <= 30 ? 'Expiring Soon' : 'Active & Valid'),
        document_uploaded: chance(0.92)
      };
    });

    const hasExpiredLicense = licenseRecords.some(l => l.status === 'Expired');
    const hasExpiringSoon = licenseRecords.some(l => l.status === 'Expiring Soon');
    if (hasExpiredLicense) base.rag_status = 'Red';
    else if (hasExpiringSoon && base.rag_status === 'Green') base.rag_status = 'Amber';

    const totalEmployees = randomInt(420, 680);
    const localCount = Math.round(totalEmployees * randomFloat(0.35, 0.45));
    const migrantCount = totalEmployees - localCount;
    const maleWorkers = Math.round(totalEmployees * randomFloat(0.80, 0.85));
    const femaleWorkers = totalEmployees - maleWorkers;

    const wageSlipCompleteness = chance(0.95);
    const bankTransferTraceabilityPct = randomInt(88, 99);

    const gapsList = [
      {
        gap: '6 Sub-contractor workers pending Aadhaar seeding into UAN',
        recommendation: 'Conduct dedicated Aadhaar-EPFO link camp on Saturday',
        responsible_person: 'Ch. Lakshmi Narayana (Labour Officer)',
        target_date: `${repMonth}-25`,
        status: edgeCase === 'overdue' ? 'Overdue' : 'Open'
      }
    ];

    records.push({
      ...base,
      establishment_registration_and_licenses: isBlank ? [] : licenseRecords,
      basic_facilities_at_camp: isBlank ? [] : campFacilities.map(fac => ({
        facility: fac,
        status: chance(0.92) ? 'Compliant' : 'Minor Rectification Needed',
        upload_verified: true
      })),
      sub_contractor_register_form_xii: isBlank ? [] : [
        { contractor_name: 'Sri Krishna Shuttering & Bar Bending Works', nature_of_work: 'RCC Formwork', max_workers: 85, valid_to: '2026-06-30' },
        { contractor_name: 'Balaji Electrical & Plumbing Contractors', nature_of_work: 'MEP Services', max_workers: 45, valid_to: '2026-08-31' }
      ],
      employee_master_sample_form_a: isBlank ? [] : Array.from({ length: 5 }, (_, idx) => ({
        employee_code: `EMP-RAYA-${randomInt(1000, 9999)}`,
        name: AP_NAMES[(i + idx) % AP_NAMES.length],
        gender: idx === 3 ? 'Female' : 'Male',
        designation: randomItem(['Bar Bender', 'Mason', 'Electrician', 'Carpenter', 'Helper']),
        uan: `${randomInt(1000, 9999)}${randomInt(1000, 9999)}${randomInt(1000, 9999)}`,
        pan: `ABCDE${randomInt(1000, 9999)}F`,
        aadhaar_virtual: generateAadhaar(),
        bank_account_verified: chance(0.95),
        completeness_pct: idx === 0 ? 95 : randomInt(70, 90)
      })),
      statutory_id_coverage: isBlank ? {} : {
        uan_coverage_pct: randomInt(88, 96),
        esic_coverage_pct: randomInt(86, 94),
        aadhaar_coverage_pct: 100,
        bank_account_linked_pct: bankTransferTraceabilityPct
      },
      wages_and_records: isBlank ? {} : {
        total_wages_disbursed_inr: totalEmployees * randomInt(14000, 18500),
        bank_disbursement_pct: bankTransferTraceabilityPct,
        cash_voucher_pct: 100 - bankTransferTraceabilityPct,
        pf_remittance_status: 'Paid (E-Challan verified)',
        esic_remittance_status: 'Paid',
        disbursement_date: `${repMonth}-07`
      },
      labour_profile: isBlank ? {} : {
        total_workers: totalEmployees,
        gender_distribution: { male: maleWorkers, female: femaleWorkers },
        origin_distribution: { local_ap: localCount, inter_state_migrant: migrantCount },
        skill_distribution: {
          highly_skilled: Math.round(totalEmployees * 0.08),
          skilled: Math.round(totalEmployees * 0.38),
          semi_skilled: Math.round(totalEmployees * 0.28),
          unskilled: Math.round(totalEmployees * 0.26)
        },
        age_distribution: {
          age_18_25: Math.round(totalEmployees * 0.28),
          age_26_45: Math.round(totalEmployees * 0.54),
          age_46_58: Math.round(totalEmployees * 0.18),
          below_18: 0
        }
      },
      overtime_and_loans: isBlank ? {} : {
        total_ot_hours: randomInt(280, 650),
        ot_wages_paid_inr: randomInt(65000, 140000),
        active_advances_loans_count: randomInt(12, 35),
        loan_recoveries_compliant: true
      },
      key_gaps_and_corrective_actions: isBlank ? [] : gapsList
    });
  }

  return { form_type: 'Labour Law Compliance', category: 'Social', records };
}

// ==========================================
// 6. SOCIAL — SKILL TRAINING & EMPLOYMENT
// ==========================================
function generateSkillTrainingRecords() {
  const records = [];
  const trades26 = [
    'Front Office Assistance', 'Masonry', 'Electrician', 'Driver', 'Fitter', 'Security',
    'Housekeeping', 'Welder', 'Heavy Machinery Operator', 'Carpentry', 'Surveyor', 'Painter',
    'Driller', 'Food Processing', 'Bar Bender', 'Foreman', 'Gardener', 'Chipper',
    'First Aid Attendant', 'Wheel Load Operator', 'Mechanic', 'Plumber', 'Scaffolder',
    'Gas Cutter', 'Rigger', 'Other General Trades'
  ];

  for (let i = 1; i <= 40; i++) {
    const repMonth = MONTHS_LIST[(i - 1) % MONTHS_LIST.length];
    const edgeCase = i === 11 ? 'over_20_blank' : randomItem(EDGE_DISTRIBUTION);
    const base = createBaseRecord('SKILL', i, repMonth, edgeCase);
    base.form_type = 'Skill Training and Employment';
    base.category = 'Social';

    const isBlank = edgeCase === 'over_20_blank';

    const totalEmployed = randomInt(380, 560);
    const localEmployed = Math.round(totalEmployed * randomFloat(0.36, 0.48));
    const localMale = Math.round(localEmployed * 0.78);
    const localFemale = localEmployed - localMale;

    const tradeBreakdown = trades26.map(trade => {
      const isCommon = ['Masonry', 'Bar Bender', 'Scaffolder', 'Carpentry', 'Electrician'].includes(trade);
      const count = isCommon ? randomInt(14, 38) : randomInt(2, 10);
      const male = Math.round(count * (['Housekeeping', 'Front Office Assistance', 'Food Processing'].includes(trade) ? 0.4 : 0.85));
      const female = count - male;
      return { trade, male, female, total: count };
    });

    const localWorkerRegistrySample = Array.from({ length: 6 }, (_, idx) => {
      const vill = randomItem(AP_VILLAGES);
      return {
        name: AP_NAMES[(i + idx) % AP_NAMES.length],
        gender: idx % 3 === 0 ? 'Female' : 'Male',
        job_role: randomItem(['Assistant Electrician', 'Bar Bender Grade II', 'Safety Marshal', 'Survey Assistant']),
        aadhaar_redacted: generateAadhaar(),
        village: vill.village,
        mandal: vill.mandal,
        district: vill.district,
        date_of_employment: `${repMonth}-${String(randomInt(1, 15)).padStart(2, '0')}`,
        contact_number: `+91 ${randomInt(94400, 99999)}${randomInt(10000, 99999)}`,
        data_completeness_pct: 85
      };
    });

    records.push({
      ...base,
      employment_details: isBlank ? {} : {
        total_workers_employed: totalEmployed,
        local_workers_employed: {
          male: localMale,
          female: localFemale,
          total: localEmployed,
          local_share_pct: Math.round((localEmployed / totalEmployed) * 100)
        }
      },
      type_of_local_workers: isBlank ? {} : {
        highly_skilled: { male: 12, female: 2, total: 14 },
        skilled: { male: 54, female: 14, total: 68 },
        semi_skilled: { male: 48, female: 22, total: 70 },
        unskilled: { male: 38, female: 22, total: 60 }
      },
      skill_set_wise_local_workers: isBlank ? [] : tradeBreakdown,
      details_of_local_workers_sample: isBlank ? [] : localWorkerRegistrySample,
      vacancies: isBlank ? {} : {
        staff_vacancies: [
          { role: 'Junior Billing & Quantity Surveyor', age_limit: '24-35', qualification: 'B.Tech Civil', experience_yrs: 3, count: 2, salary_range_inr: '30,000 - 40,000' },
          { role: 'E&S Field Monitoring Officer', age_limit: '25-40', qualification: 'M.Sc Environmental Science', experience_yrs: 2, count: 1, salary_range_inr: '35,000 - 45,000' }
        ],
        worker_vacancies: [
          { role: 'Certified Scaffolders (CISRS trained)', age_limit: '20-45', qualification: 'ITI / Trade Certificate', experience_yrs: 2, count: 15, salary_range_inr: '22,000 - 28,000' },
          { role: 'Licensed Rigger', age_limit: '22-48', qualification: 'Class 10 + Rigging Pass', experience_yrs: 3, count: 6, salary_range_inr: '24,000 - 30,000' }
        ]
      }
    });
  }

  return { form_type: 'Skill Training and Employment', category: 'Social', records };
}

// ==========================================
// 7. SOCIAL — SOCIAL SAFEGUARD COMPLIANCE
// ==========================================
function generateSocialSafeguardRecords() {
  const records = [];

  for (let i = 1; i <= 40; i++) {
    const repMonth = MONTHS_LIST[(i - 1) % MONTHS_LIST.length];
    const edgeCase = i === 13 ? 'overdue' : (i === 21 ? 'over_20_blank' : randomItem(EDGE_DISTRIBUTION));
    const base = createBaseRecord('SS', i, repMonth, edgeCase);
    base.form_type = 'Social Safeguard Compliance';
    base.category = 'Social';

    const isBlank = edgeCase === 'over_20_blank';

    const complaintsReceived = chance(0.3) ? randomInt(1, 3) : 0;
    const complaintsResolved = complaintsReceived > 0 ? (edgeCase === 'overdue' ? 0 : complaintsReceived) : 0;
    const complaintsPending = complaintsReceived - complaintsResolved;

    const reportsGenerated = randomInt(4, 8);
    const observationsRaised = randomInt(6, 14);
    const observationsClosed = observationsRaised - (edgeCase === 'overdue' ? randomInt(3, 5) : randomInt(0, 2));

    records.push({
      ...base,
      deployment_of_es_staff: isBlank ? [] : [
        { position: 'Environmental Safeguard Specialist', name: 'Dr. M. Veeraiah', status: 'Deployed', appointment_date: '2024-05-15' },
        { position: 'Social Development & Gender Specialist', name: 'Ch. Padmavathi', status: 'Deployed', appointment_date: '2024-06-01' },
        { position: 'Senior OHS Lead Manager', name: 'K. Venkateswara Rao', status: 'Deployed', appointment_date: '2024-05-20' },
        { position: 'Assistant Community Liaison Officer', name: 'Y. Ramesh', status: 'Deployed', appointment_date: '2024-07-10' }
      ],
      pmc_site_inspections: isBlank ? {} : {
        pmc_name: 'Aarvee Associates',
        environmental_manager_visits: randomInt(4, 7),
        social_manager_visits: randomInt(3, 6),
        ohs_visits: randomInt(6, 9),
        total_visits: randomInt(14, 22)
      },
      compliance_reporting: isBlank ? {} : {
        reports_generated: reportsGenerated,
        observations_raised: observationsRaised,
        observations_closed: observationsClosed,
        pending_observations: Math.max(0, observationsRaised - observationsClosed),
        closure_rate_pct: Math.round((observationsClosed / observationsRaised) * 100),
        cumulative_reports: reportsGenerated * randomInt(4, 8),
        cumulative_observations: observationsRaised * randomInt(4, 8)
      },
      grc_grievance_redressal: isBlank ? {} : {
        meetings_held: 1,
        complaints_received: complaintsReceived,
        complaints_resolved: complaintsResolved,
        pending_complaints: complaintsPending,
        cumulative_pending: complaintsPending + (edgeCase === 'overdue' ? 2 : 0),
        average_resolution_days: 7.5,
        key_complaint_sample: complaintsReceived > 0 ? 'Dust dispersion along Sakhamuru haulage path' : 'None'
      },
      sub_committee_inspections: isBlank ? [] : [
        {
          committee: 'Joint Environmental & Social Review Committee',
          observations_issued: randomInt(2, 4),
          observations_closed: edgeCase === 'overdue' ? 1 : 3,
          target_close_date: `${repMonth}-28`,
          status: edgeCase === 'overdue' ? 'Overdue' : 'On Track'
        }
      ],
      programs_and_events: isBlank ? [] : [
        {
          date: `${repMonth}-12`,
          title: 'Amaravati Local Stakeholder Dialogue & Water Conservation Workshop',
          type: 'Community Engagement',
          male_participants: 32,
          female_participants: 28,
          total_participants: 60,
          village: 'Rayapudi Gram Panchayat Hall'
        }
      ],
      labour_camp_and_migrant_workers: isBlank ? {} : {
        camps: [
          { location: 'Main Camp Rayapudi Site (Near Batching Plant)', male_workers: 240, female_workers: 45, total: 285, police_verification_submitted: true },
          { location: 'Camp B (Mandadam Access Road)', male_workers: 180, female_workers: 25, total: 205, police_verification_submitted: true }
        ]
      },
      medical_and_health_activities: isBlank ? {} : {
        date: `${repMonth}-19`,
        camp_type: 'Comprehensive General Health, Eye Check & Vector-Borne Disease Screening',
        male_covered: 185,
        female_covered: 55,
        children_covered: 28,
        total_covered: 268,
        partner_hospital: 'Government General Hospital (GGH) Guntur Team'
      },
      host_community_profile: isBlank ? [] : AP_VILLAGES.slice(0, 4).map(v => ({
        village_name: v.village,
        mandal: v.mandal,
        district: v.district,
        total_population: randomInt(2800, 7500),
        vulnerable_households: randomInt(60, 180),
        elderly_60_plus: randomInt(180, 420),
        persons_with_disabilities: randomInt(25, 75),
        women_headed_households: randomInt(40, 110)
      }))
    });
  }

  return { form_type: 'Social Safeguard Compliance', category: 'Social', records };
}

// Generate all 7
const datasets = [
  generateEnvironmentalRecords(),
  generateOHSRecords(),
  generateRoadSafetyRecords(),
  generateGenderRecords(),
  generateLabourLawRecords(),
  generateSkillTrainingRecords(),
  generateSocialSafeguardRecords()
];

// Write individual JSON files
const fileNames = [
  'environmental_compliance_monitoring.json',
  'ohs_monitoring.json',
  'road_safety_checklist.json',
  'gender.json',
  'labour_law_compliance.json',
  'skill_training_and_employment.json',
  'social_safeguard_compliance.json'
];

datasets.forEach((ds, idx) => {
  const filePath = path.join(OUTPUT_DIR, fileNames[idx]);
  fs.writeFileSync(filePath, JSON.stringify(ds, null, 2), 'utf-8');
  console.log(`[OK] Generated: ${fileNames[idx]} (${ds.records.length} records)`);
});

// Also create a bundled JSON file for ultra-fast single-request loading or direct import in client
const bundlePath = path.join(OUTPUT_DIR, 'all_es_synthetic_datasets.json');
fs.writeFileSync(bundlePath, JSON.stringify(datasets, null, 2), 'utf-8');
console.log(`[OK] Generated bundle: all_es_synthetic_datasets.json (7 datasets, 280 total records)`);
