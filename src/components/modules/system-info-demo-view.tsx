'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Users,
  Shield,
  ShieldCheck,
  Lock,
  GitBranch,
  ClipboardList,
  Info,
  Database,
  Globe,
  AlertTriangle,
  ArrowRight,
  FileText,
  CheckCircle2,
  Laptop,
  Smartphone,
  Server,
  Cpu,
  Layers,
  HardHat,
  FileSpreadsheet,
  KeyRound,
  Sparkles,
  Building2,
  Activity,
  HeartPulse,
  GraduationCap,
  Truck,
  Scale,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Eye,
  Sliders,
  CalendarCheck,
  FileCheck2,
  Terminal,
  Zap,
  CheckSquare,
  Flame,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuthStore, roleLabels, type UserRole } from '@/stores/auth-store'
import { useNavStore, type PageId } from '@/stores/nav-store'

const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

// ==================== DATA DEFINITIONS ====================

interface DemoPersona {
  role: UserRole
  name: string
  contractor: string
  username: string
  password: string
  desc: string
  responsibilities: string[]
  badgeColor: string
  siteId?: string
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'ADMIN',
    name: 'Admin',
    contractor: 'All Contractors',
    username: 'admin',
    password: 'admin@123',
    desc: 'Superuser with full administrative control across all sites, contractors, users, and audit registries.',
    responsibilities: [
      'User provisioning & access role assignment',
      'System-wide workflow status pipeline management',
      'RBAC matrix configuration for all 13 modules',
      'Immutable audit trail inspection & data export',
    ],
    badgeColor: 'bg-red-500/10 text-red-700 border-red-200 dark:border-red-800 dark:text-red-400',
  },
  {
    role: 'SAFETY_OFFICER',
    name: 'Rajesh Patil',
    contractor: 'Clove Constructions Pvt. Ltd.',
    username: 'rajesh.patil',
    password: 'safety@123',
    desc: 'On-site safety commander managing daily inspections, hazard assessments, and medical checkups.',
    responsibilities: [
      'Conducting OHS & environmental inspections',
      'Conducting multi-step worker medical checkups',
      'Logging safety incidents & issuing CAPAs',
      'Safety induction & certification tracking',
    ],
    badgeColor: 'bg-teal-500/10 text-teal-700 border-teal-200 dark:border-teal-800 dark:text-teal-400',
  },
  {
    role: 'PMC',
    name: 'Anil Deshmukh',
    contractor: 'All Contractors',
    username: 'anil.deshmukh',
    password: 'pmc@123',
    desc: 'Project Management Consultant providing independent monitoring, quality audit, and compliance oversight.',
    responsibilities: [
      'Multi-site independent compliance monitoring',
      'Contractor safety scorecard & benchmark review',
      'Incident investigation & severity approval',
      'Executive compliance dossiers evaluation',
    ],
    badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-800 dark:text-blue-400',
  },
  {
    role: 'HR_COORDINATOR',
    name: 'Meera Joshi',
    contractor: 'Clove Constructions Pvt. Ltd.',
    username: 'meera.joshi',
    password: 'hr@123',
    desc: 'Manages worker lifecycle, biometric muster rolls, camp welfare, and labor grievance resolution.',
    responsibilities: [
      'Worker onboarding & Aadhaar identity verification',
      'Biometric attendance muster roll & shift roster',
      'Camp accommodation capacity & hygiene inspections',
      'Labor grievance handling & wage compliance',
    ],
    badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-200 dark:border-purple-800 dark:text-purple-400',
  },
  {
    role: 'LEGAL_ADVISOR',
    name: 'Vikram Sharma',
    contractor: 'All Contractors',
    username: 'vikram.sharma',
    password: 'legal@123',
    desc: 'Statutory legal counsel overseeing statutory regulations, BOCW labor laws, and POSH cases.',
    responsibilities: [
      'BOCW Act & Contract Labour statutory compliance',
      'Minimum wage, PF, and ESIC deposit verification',
      'Confidential POSH inquiry committee supervision',
      'Regulatory legal risk & statutory license renewals',
    ],
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-800 dark:text-amber-400',
  },
]

interface DemoStep {
  step: string
  title: string
  targetPage: PageId
  badge: string
  summary: string
  highlights: string[]
  presenterTip: string
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: '01',
    title: 'Executive Overview & Real-Time KPI Telemetry',
    targetPage: 'dashboard',
    badge: 'Start Here',
    summary: 'Present the high-level executive bird-eye view across all workforce, camp facilities, and safety health.',
    highlights: [
      'Live metric cards: Total Workforce, Camp Occupancy, Active Incidents, and Medical Fitness rates',
      'Workforce distribution across labour camps with interactive contractor breakdowns',
      'Recent field activities timeline with live text search and photo preview stream',
      'Quick action drawer to register workers, log incidents, or initiate inspections',
    ],
    presenterTip: 'Demonstrate the new instant search bar in the top-right to filter recent site activities in real-time.',
  },
  {
    step: '02',
    title: 'Digital Workforce & Labour Camp Governance',
    targetPage: 'workers',
    badge: 'Core Workforce',
    summary: 'Demonstrate paperless worker onboarding, biometric ID tracking, and contractor segregation.',
    highlights: [
      'Complete worker directory with trade classifications, contractor mapping, and camp rooms',
      'Digital worker ID cards with QR code verification and emergency contact info',
      'Aadhaar compliance with role-based privacy masking to protect worker identity',
      'Real-time fitness certification status and safety induction badges on each profile',
    ],
    presenterTip: 'Click into any worker row to showcase the detailed profile with fitness records and trade history.',
  },
  {
    step: '03',
    title: 'Occupational Health & Safety (OHS) & Medical Wizard',
    targetPage: 'medical',
    badge: 'Key Innovation',
    summary: 'Showcase our comprehensive 4-step wizard for periodic and pre-employment medical examinations.',
    highlights: [
      'Step 1: Examination Details (Doctor, hospital, vital signs, BP, pulse, BMI calculation)',
      'Step 2: Medical History (Respiratory, cardiovascular, diabetes, vision, audiometry)',
      'Step 3: Medications & Surgeries (Current prescriptions, dynamic surgery history logger)',
      'Step 4: Review & Fit/Unfit classification with automated remarks generation',
    ],
    presenterTip: 'Click "Add Record" on the Medical page to show the guided 4-step progress stepper and form validation.',
  },
  {
    step: '04',
    title: 'Digital E&S Field Inspection Wizards',
    targetPage: 'es-forms',
    badge: 'Compliance Engine',
    summary: 'Highlight digital field inspection checklists replacing cumbersome physical paperwork.',
    highlights: [
      'Multi-category wizards for EVM (Environment), Social Safeguards, OHS, Gender & POSH, and Labour Law',
      'Dynamic compliance scorecards with automated risk categorization (Low, Moderate, High)',
      'Summary tables with instant search, multi-column filters, and inline record editing',
      'World Bank / IFC Environmental and Social Standards (ESS 1-10) groundings',
    ],
    presenterTip: 'Open the Social Safeguard or Labour Law wizard to demonstrate how multi-step logic guides field inspectors.',
  },
  {
    step: '05',
    title: 'Incident Register & Grievance Redressal',
    targetPage: 'incidents',
    badge: 'Risk Mitigation',
    summary: 'Show how health & safety hazards and worker concerns are tracked through structured workflows.',
    highlights: [
      'Incident severity matrix (Minor, Moderate, Major, Critical, Fatal) with automated notifications',
      'Root Cause Analysis (RCA) and Corrective & Preventive Action (CAPA) tracking',
      'Worker & community grievance redressal with confidential POSH shielding',
      'SLA turnaround tracking with PMC and Admin escalation gates',
    ],
    presenterTip: 'Switch to Grievances module to explain confidential logging and multi-stakeholder resolution.',
  },
  {
    step: '06',
    title: 'Enterprise Governance, RBAC & Audit Trail',
    targetPage: 'settings',
    badge: 'Enterprise Security',
    summary: 'Conclude with system administration, customizable status pipelines, and immutable audit logs.',
    highlights: [
      'User provisioning with contractor-level and site-level multitenant isolation',
      'Interactive Role Permissions Matrix controlling access to each of the 13 modules',
      'Customizable status workflows for incidents, grievances, and training approvals',
      'Tamper-evident audit logs capturing every CREATE, UPDATE, and DELETE action with user timestamps',
    ],
    presenterTip: 'Show how switching roles instantly alters module permissions and visible actions.',
  },
]

interface ModuleSpec {
  id: PageId
  title: string
  category: 'Operations' | 'Safety & Health' | 'Governance & Legal'
  icon: React.ReactNode
  description: string
  keyFeatures: string[]
}

const ALL_MODULE_SPECS: ModuleSpec[] = [
  {
    id: 'dashboard',
    title: 'Overview Dashboard',
    category: 'Operations',
    icon: <Activity className="h-4 w-4 text-teal-600" />,
    description: 'Central command center providing real-time KPI telemetry and site supervision.',
    keyFeatures: ['Live Workforce & Camp Metrics', 'Interactive Analytics Charts', 'Searchable Field Activity Feed', 'Quick Action Triggers'],
  },
  {
    id: 'workers',
    title: 'Workforce Registry',
    category: 'Operations',
    icon: <Users className="h-4 w-4 text-teal-600" />,
    description: 'Complete digital lifecycle management for construction personnel and labor force.',
    keyFeatures: ['Biometric & Trade Profiles', 'Camp & Room Allocation', 'Digital QR Worker ID Cards', 'Aadhaar Masking Privacy'],
  },
  {
    id: 'medical',
    title: 'Medical & OHS Records',
    category: 'Safety & Health',
    icon: <HeartPulse className="h-4 w-4 text-rose-500" />,
    description: 'Comprehensive occupational health examinations and fitness classification.',
    keyFeatures: ['4-Step Guided Medical Wizard', 'Vital Signs & Health History', 'Fit/Unfit Status Classification', 'Prescriptions & Surgeries Log'],
  },
  {
    id: 'training',
    title: 'Training & Induction',
    category: 'Safety & Health',
    icon: <GraduationCap className="h-4 w-4 text-teal-600" />,
    description: 'Skill development, mandatory safety inductions, and equipment certifications.',
    keyFeatures: ['Induction Attendance Records', 'Specialized Trade Certifications', 'Certification Expiry Alerts', 'Approval Workflow Stages'],
  },
  {
    id: 'attendance',
    title: 'Attendance & Muster Roll',
    category: 'Operations',
    icon: <CalendarCheck className="h-4 w-4 text-emerald-600" />,
    description: 'Daily biometric muster rolls, shift allocations, and camp headcount tracking.',
    keyFeatures: ['Biometric Check-in Records', 'Camp Occupancy Headcounts', 'Contractor-wise Roll Call', 'Overtime & Shift Tracking'],
  },
  {
    id: 'incidents',
    title: 'Incident & Near-Miss Register',
    category: 'Safety & Health',
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    description: 'End-to-end hazard reporting, severity triage, and CAPA resolution.',
    keyFeatures: ['5-Tier Severity Matrix', 'Root Cause Analysis (RCA)', 'CAPA Assignment & Tracking', 'Time-Loss & Days-Lost Tracking'],
  },
  {
    id: 'grievance',
    title: 'Grievance Redressal',
    category: 'Governance & Legal',
    icon: <ClipboardList className="h-4 w-4 text-purple-600" />,
    description: 'Worker and community grievance submission with strict confidentiality.',
    keyFeatures: ['Anonymous Grievance Filing', 'POSH Confidential Channels', 'Escalation & SLA Timers', 'Resolution Action Records'],
  },
  {
    id: 'vehicles',
    title: 'Machinery & Vehicles',
    category: 'Operations',
    icon: <Truck className="h-4 w-4 text-blue-600" />,
    description: 'Heavy plant, earthmoving equipment, and transport vehicle compliance.',
    keyFeatures: ['Vehicle Fitness & PUC Tracking', 'Operator License Verification', 'Pre-Operational Checklists', 'Maintenance & Insurance Alerts'],
  },
  {
    id: 'hazardous',
    title: 'Hazardous Materials',
    category: 'Safety & Health',
    icon: <Flame className="h-4 w-4 text-red-500" />,
    description: 'Chemical inventory, safe storage containment, and hazardous waste disposal.',
    keyFeatures: ['Chemical Safety Data Sheets (MSDS)', 'Storage Containment Audits', 'Disposal Manifest Tracking', 'Spill Emergency Protocols'],
  },
  {
    id: 'legal',
    title: 'Legal & Statutory Compliance',
    category: 'Governance & Legal',
    icon: <Scale className="h-4 w-4 text-amber-600" />,
    description: 'Monitoring adherence to statutory labor laws and government regulations.',
    keyFeatures: ['BOCW Act Compliance Auditing', 'Minimum Wage & PF/ESIC Verification', 'Contract Labour License Status', 'Statutory Register Generator'],
  },
  {
    id: 'compliance',
    title: 'Site & Camp Compliance',
    category: 'Governance & Legal',
    icon: <Building2 className="h-4 w-4 text-teal-600" />,
    description: 'Camp hygiene, sanitation, potable water, and living standards auditing.',
    keyFeatures: ['Camp Sanitation Inspections', 'Potable Water Quality Tests', 'Fire Safety Equipment Audits', 'Contractor Compliance Ratings'],
  },
  {
    id: 'es-forms',
    title: 'E&S Digital Field Forms',
    category: 'Governance & Legal',
    icon: <FileCheck2 className="h-4 w-4 text-teal-600" />,
    description: 'Standardized digital inspection wizards for IFC / World Bank safeguards.',
    keyFeatures: ['Environmental Safeguard (EVM)', 'Social Safeguards & Labour Law', 'Gender Equality & OHS Forms', 'Auto-Scored Risk Summaries'],
  },
  {
    id: 'settings',
    title: 'Settings & Security',
    category: 'Governance & Legal',
    icon: <Sliders className="h-4 w-4 text-slate-600" />,
    description: 'System administration, user access control, and immutable audit logs.',
    keyFeatures: ['User Account Management', 'Role Permissions Matrix', 'Workflow Pipeline Builder', 'Immutable Tamper-Proof Audit Trail'],
  },
]

const COMPLIANCE_FRAMEWORKS = [
  {
    name: 'World Bank & IFC Environmental & Social Standards',
    code: 'WB / IFC ESS 1-10',
    icon: <Globe className="h-5 w-5 text-teal-600" />,
    description: 'Built-in support for Assessment & Management (ESS1), Labor & Working Conditions (ESS2), Resource Efficiency (ESS3), Community Health & Safety (ESS4), and Stakeholder Engagement (ESS10).',
  },
  {
    name: 'BOCW Act, 1996 & Central Rules',
    code: 'BOCW Compliance',
    icon: <HardHat className="h-5 w-5 text-amber-600" />,
    description: 'Building and Other Construction Workers (Regulation of Employment and Conditions of Service) Act. Automated safety officer ratios, welfare amenities, accident reporting, and register formats.',
  },
  {
    name: 'The Factories Act, 1948 & Contract Labour Act, 1970',
    code: 'Statutory Labor Code',
    icon: <Scale className="h-5 w-5 text-blue-600" />,
    description: 'Comprehensive compliance covering statutory working hours, mandatory rest intervals, overtime registers, licensed contractor verification, and mandatory health checkups.',
  },
  {
    name: 'POSH Act, 2013 (Prevention of Sexual Harassment)',
    code: 'Workplace Dignity',
    icon: <ShieldCheck className="h-5 w-5 text-purple-600" />,
    description: 'Strict confidential grievance redressal with isolated role-based access. Legal Advisor and HR coordinator channels ensure victim anonymity and statutory committee escalation.',
  },
  {
    name: 'ISO 45001:2018 & ISO 14001:2015',
    code: 'Global OHS & EMS',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    description: 'International benchmark for Occupational Health & Safety Management Systems and Environmental Management Systems. Standardized CAPA workflows and incident triage.',
  },
]

// ==================== MAIN COMPONENT ====================

export function SystemInfoDemoView() {
  const { userName, role, contractorName, login } = useAuthStore()
  const { setPage, toggleMobileView, mobileView } = useNavStore()
  const [copiedPitch, setCopiedPitch] = useState(false)

  const elevatorPitch = `AICCC Environmental & Social Management System (ESMS) is an enterprise governance platform built for mega construction and infrastructure projects. It unifies workforce onboarding, 4-step OHS medical examinations, statutory labor law compliance (BOCW/Factories Act), hazardous materials tracking, and World Bank/IFC ESS environmental safeguards into a single real-time platform with strict role-based access control and immutable audit trails.`

  const copyPitchToClipboard = () => {
    navigator.clipboard.writeText(elevatorPitch)
    setCopiedPitch(true)
    toast.success('Demo Elevator Pitch copied to clipboard!')
    setTimeout(() => setCopiedPitch(false), 2500)
  }

  const handleRoleSwitch = (persona: DemoPersona) => {
    login(persona.name, persona.role, 'all', persona.contractor, persona.siteId)
    toast.success(`Active role switched to ${roleLabels[persona.role]} (${persona.name})`, {
      description: 'Permissions and module views have been updated in real-time.',
    })
  }

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <motion.div {...fadeInUp}>
        <Card className="overflow-hidden border-teal-200/70 dark:border-teal-900/60 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent relative shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none hidden md:block">
            <Building2 className="w-48 h-48 text-teal-800 dark:text-teal-200" />
          </div>
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-2.5 py-0.5 shadow-sm">
                    AICCC ESMS v3.2
                  </Badge>
                  <Badge variant="outline" className="text-xs border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 bg-white/60 dark:bg-slate-900/60">
                    Enterprise Demo Edition
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    System Live & Operational
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  AICCC Environmental & Social Management System
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  The central digital platform for infrastructure workforce governance, occupational health & safety (OHS), environmental safeguard monitoring, statutory BOCW labor compliance, and multi-stakeholder project transparency.
                </p>
              </div>

              {/* Quick Demo Action Buttons */}
              <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
                <Button
                  onClick={copyPitchToClipboard}
                  variant="outline"
                  className="bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold gap-2 h-9"
                >
                  {copiedPitch ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-teal-600" />}
                  {copiedPitch ? 'Copied Pitch!' : 'Copy Demo Pitch'}
                </Button>
                <Button
                  onClick={toggleMobileView}
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-sm text-xs font-semibold gap-2 h-9"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  {mobileView ? 'Exit Mobile Frame' : 'Preview Mobile Field UI'}
                </Button>
                <Button
                  onClick={() => setPage('dashboard')}
                  variant="secondary"
                  className="text-xs font-semibold gap-2 h-9 shadow-sm"
                >
                  <Activity className="h-3.5 w-3.5 text-teal-600" />
                  Jump to Overview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vital KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="rounded-xl p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Functional Modules</p>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">13 Integrated</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="rounded-xl p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stakeholder Personas</p>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">5 Active RBAC</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="rounded-xl p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance Standards</p>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">5 Global & Statutory</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="rounded-xl p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stack Architecture</p>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Full-Stack Cloud</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Tabs for Detailed System Information */}
      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/80 w-full sm:w-auto">
          <TabsTrigger value="guide" className="text-xs sm:text-sm gap-1.5 font-medium">
            <BookOpen className="h-4 w-4 text-teal-600" />
            <span>Demo Walkthrough Guide</span>
          </TabsTrigger>
          <TabsTrigger value="personas" className="text-xs sm:text-sm gap-1.5 font-medium">
            <KeyRound className="h-4 w-4 text-blue-600" />
            <span>Stakeholder Personas & Logins</span>
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs sm:text-sm gap-1.5 font-medium">
            <Cpu className="h-4 w-4 text-purple-600" />
            <span>Tech Specs & Architecture</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-xs sm:text-sm gap-1.5 font-medium">
            <Layers className="h-4 w-4 text-amber-600" />
            <span>All 13 Modules Catalog</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs sm:text-sm gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Compliance Standards</span>
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: DEMO WALKTHROUGH GUIDE ================= */}
        <TabsContent value="guide" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    Presenter's 6-Step Demonstration Roadmap
                  </CardTitle>
                  <CardDescription>
                    Follow this recommended sequence to deliver an impactful, end-to-end executive demonstration.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs w-fit bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:border-teal-800 dark:text-teal-300">
                  Ideal Duration: 12 - 15 Mins
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMO_STEPS.map((step) => (
                  <div
                    key={step.step}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between gap-3 hover:border-teal-300 dark:hover:border-teal-800 transition-all hover:shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 rounded-full bg-teal-600 text-white text-xs font-bold items-center justify-center">
                            {step.step}
                          </span>
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{step.title}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {step.badge}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{step.summary}</p>

                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">What to Show:</p>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          {step.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium italic flex items-center gap-1">
                        <Zap className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{step.presenterTip}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5 shrink-0 bg-white dark:bg-slate-900 hover:text-teal-600"
                        onClick={() => setPage(step.targetPage)}
                      >
                        Open Page <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 2: STAKEHOLDER PERSONAS & 1-CLICK SWITCH ================= */}
        <TabsContent value="personas" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Stakeholder Profiles & Live Persona Switcher
                  </CardTitle>
                  <CardDescription>
                    Test role-based access control (RBAC) instantly without logging out. Click "Switch to Role" to experience how the interface changes.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                  <span>Currently logged in as:</span>
                  <Badge className="bg-teal-600 text-white text-xs">{roleLabels[role] || role}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {DEMO_PERSONAS.map((p) => {
                  const isCurrent = role === p.role
                  return (
                    <div
                      key={p.role}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                        isCurrent
                          ? 'border-teal-500 bg-teal-500/5 ring-1 ring-teal-500/30 dark:bg-teal-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-card hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">{p.name}</span>
                              <Badge variant="outline" className={`text-xs font-semibold ${p.badgeColor}`}>
                                {roleLabels[p.role]}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Contractor: {p.contractor}</p>
                          </div>

                          {isCurrent && (
                            <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wide">
                              Active
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{p.desc}</p>

                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Key Responsibilities:
                          </p>
                          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {p.responsibilities.map((res, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                <span>{res}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <div className="text-muted-foreground font-mono text-[11px]">
                          User: <span className="font-semibold text-foreground">{p.username}</span> | Pass:{' '}
                          <span className="font-semibold text-foreground">{p.password}</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={isCurrent}
                          variant={isCurrent ? 'secondary' : 'default'}
                          className={`h-8 text-xs font-medium ${
                            isCurrent
                              ? 'opacity-70 cursor-default'
                              : 'bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-sm'
                          }`}
                          onClick={() => handleRoleSwitch(p)}
                        >
                          {isCurrent ? 'Active Persona' : 'Switch to Role'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 3: TECH SPECS & ARCHITECTURE ================= */}
        <TabsContent value="specs" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tech Stack Specs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-teal-600" />
                  Software Architecture & Core Stack
                </CardTitle>
                <CardDescription>Engineered for high performance, sub-second latency, and data integrity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-teal-600" /> Web Framework
                    </span>
                    <p className="font-semibold text-sm">Next.js 16 (Turbopack)</p>
                    <p className="text-[11px] text-muted-foreground">React 19 App Router + Server Components</p>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-blue-600" /> Database Engine
                    </span>
                    <p className="font-semibold text-sm">PostgreSQL (Neon Cloud)</p>
                    <p className="text-[11px] text-muted-foreground">Serverless, SSL encryption, connection pooling</p>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-purple-600" /> ORM & Data Layer
                    </span>
                    <p className="font-semibold text-sm">Prisma ORM 6.19</p>
                    <p className="text-[11px] text-muted-foreground">Type-safe queries, automated migrations</p>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-emerald-600" /> Programming Language
                    </span>
                    <p className="font-semibold text-sm">TypeScript 5 (Strict)</p>
                    <p className="text-[11px] text-muted-foreground">Full static typing and compile-time validation</p>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-amber-600" /> Design System & UI
                    </span>
                    <p className="font-semibold text-sm">Tailwind CSS 4 + Shadcn</p>
                    <p className="text-[11px] text-muted-foreground">Radix Primitives, dark/light themes</p>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-rose-600" /> State & Data Cache
                    </span>
                    <p className="font-semibold text-sm">Zustand 5 + React Query 5</p>
                    <p className="text-[11px] text-muted-foreground">Optimistic UI updates & client-side caching</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Export & File Services</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs gap-1 py-1">
                      <FileSpreadsheet className="h-3 w-3 text-emerald-600" /> Excel (SheetJS XLSX)
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1 py-1">
                      <FileText className="h-3 w-3 text-blue-600" /> CSV Native Exporter
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1 py-1">
                      <PrinterIcon className="h-3 w-3 text-purple-600" /> Print-Ready Formats
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Security & Deployment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Enterprise Governance & Security
                </CardTitle>
                <CardDescription>Designed for strict regulatory compliance, data privacy, and field reliability.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-card">
                    <Lock className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Granular Role-Based Access Control (RBAC)</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Multi-tenant scoping isolates data between contractors while empowering PMCs and Admins with project-wide governance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-card">
                    <FileCheck2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Cryptographic-Style Tamper-Proof Audit Trail</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Every record addition, edit, or deletion is tracked with user ID, timestamps, old/new values, and entity IDs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-card">
                    <Smartphone className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Field Mobility & Device Agnostic</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Fully responsive layout tested on 14" to 27" desktop command centers, field tablets, and mobile smartphones.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-card">
                    <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Statutory Privacy & Aadhaar Masking</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Personal identification documents and POSH harassment inquiries are protected with restricted view privileges.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================= TAB 4: ALL 13 MODULES CATALOG ================= */}
        <TabsContent value="modules" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-600" />
                    Comprehensive Modules & Capabilities Catalog
                  </CardTitle>
                  <CardDescription>
                    All 13 specialized functional modules currently integrated in the AICCC E&S Management Suite.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs w-fit">
                  13 Active Modules
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_MODULE_SPECS.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card/60 hover:bg-card hover:border-teal-300 dark:hover:border-teal-800 transition-all flex flex-col justify-between gap-2.5 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
                          <div className="p-1.5 rounded-lg bg-muted shrink-0">{mod.icon}</div>
                          <span>{mod.title}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                          {mod.category}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>

                      <div className="space-y-1 pt-1">
                        {mod.keyFeatures.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                            <CheckSquare className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 p-1"
                        onClick={() => setPage(mod.id)}
                      >
                        Navigate to module <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 5: COMPLIANCE STANDARDS ================= */}
        <TabsContent value="compliance" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-600" />
                Statutory & International Compliance Frameworks
              </CardTitle>
              <CardDescription>
                Grounding the application in legal statutes, international developmental safeguards, and ISO standards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPLIANCE_FRAMEWORKS.map((fw) => (
                  <div
                    key={fw.code}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-muted/20 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-background border shadow-xs">{fw.icon}</div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{fw.name}</h4>
                          <p className="text-[11px] text-teal-600 font-mono">{fw.code}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{fw.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile & Current Session Card */}
      <motion.div {...fadeInUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-teal-600" />
              Active Session Details
            </CardTitle>
            <CardDescription>Information regarding the current logged-in demo user and tenant scope.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shrink-0">
                  {userName ? userName.slice(0, 2).toUpperCase() : 'DU'}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Operator</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{userName || 'Demo User'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Access Role</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{roleLabels[role] || role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Contractor Tenant</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{contractorName || 'All Contractors'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Database Connectivity</p>
                  <p className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected (PostgreSQL)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  )
}
