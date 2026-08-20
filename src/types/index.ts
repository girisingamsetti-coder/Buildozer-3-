/**
 * Shared type definitions and enums for the Buildozer application.
 *
 * Centralises domain types that are used across both client components
 * and API routes so we have a single source of truth.
 */

// ──────────────────── Enums / Status Constants ────────────────────

/** Worker active status */
export type WorkerStatus = 'active' | 'inactive'

/** Medical examination result */
export type MedicalResult = 'Fit' | 'Unfit' | 'Conditional' | 'Pending'

/** Training record status */
export type TrainingStatus = 'Valid' | 'Expiring Soon' | 'Expired'

/** Incident lifecycle status */
export type IncidentStatus = 'Open' | 'UnderInvestigation' | 'Closed'

/** Incident severity */
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'

/** Grievance lifecycle status */
export type GrievanceStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed'

/** Grievance severity */
export type GrievanceSeverity = 'Low' | 'Medium' | 'High' | 'Critical'

/** Vehicle / equipment condition */
export type VehicleCondition = 'Fit' | 'NeedsRepair' | 'Grounded'

/** Vehicle document validity */
export type DocumentStatus = 'Valid' | 'Expiring' | 'Expired'

/** Vehicle ownership type */
export type VehicleOwnership = 'Own' | 'Rented'

/** Site compliance item status */
export type ComplianceItemStatus = 'Compliant' | 'NonCompliant' | 'Pending'

/** Legal compliance license status */
export type LegalComplianceStatus = 'Valid' | 'Expiring' | 'Expired' | 'Revoked'

/** Skill level classification */
export type SkillLevel = 'Skilled' | 'Unskilled' | 'Semi-Skilled'

/** Worker fitness status */
export type FitnessStatus = 'Fit' | 'Unfit' | 'Conditional' | 'Pending'

/** Attendance status */
export type AttendanceStatus = 'Present' | 'Absent' | 'HalfDay' | 'Leave'

/** Police verification status */
export type PoliceRecordStatus = 'Verified' | 'Not Updated' | 'Pending' | 'Adverse'

// ──────────────────── Dashboard Aggregate Types ────────────────────

export interface DashboardData {
  totalWorkers: number
  activeWorkers: number
  expiringTrainingsCount: number
  pendingMedicalCount: number
  openGrievancesCount: number
  openIncidentsCount: number
  attendanceToday: number
  compliancePct: number
  incidentBreakdown: { type: string; count: number }[]
  trainingStatusBreakdown: { status: string; count: number }[]
  genderBreakdown: { gender: string; count: number }[]
  skilledWorkers: number
  unskilledWorkers: number
  ageDistribution: { bucket: string; count: number }[]
  medicalTestBreakdown: { status: string; count: number }[]
  campsPerContractor: {
    contractorId: string
    name: string
    code: string
    camps: number
    workers: number
  }[]
  workforcePerCamp: {
    id: string
    name: string
    contractor: string
    site: string
    workers: number
    capacity: number
  }[]
  complianceCompliant: number
  complianceNonCompliant: number
  compliancePending: number
  envInspectionPassed: number
  envInspectionFailed: number
  envInspectionPending: number
  vehicleStats: {
    total: number
    active: number
    equipmentStatus: Record<'Fit' | 'NeedsRepair' | 'Grounded', number>
    inspectionStatus: Record<'Passed' | 'Failed' | 'Pending', number>
    ownership: Record<'Own' | 'Rented', number>
    approvalStatus: Record<'Approved' | 'Rejected' | 'Pending', number>
  }
}

// ──────────────────── Activity Feed ────────────────────

export type ActivityKind = 'photo' | 'entry' | 'medical' | 'training' | 'incident'

export interface ActivityItem {
  id: string
  kind: ActivityKind
  title: string
  subtitle: string
  location?: string
  timestamp: string
  photo?: string | null
  meta?: Record<string, string>
}
