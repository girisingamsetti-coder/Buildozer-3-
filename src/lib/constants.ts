/**
 * Application-wide constants.
 *
 * Centralises magic strings, validation rules, and configuration
 * values that were previously scattered across API routes and
 * components.
 */

// ──────────────────── Validation Rules ────────────────────

/** Valid age range for worker registration */
export const AGE_RANGE = { min: 18, max: 55 } as const

/** Aadhaar number must be exactly 12 digits */
export const AADHAAR_REGEX = /^\d{12}$/

/** Default pagination values */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const

// ──────────────────── Domain Status Values ────────────────────

/** Incident statuses that count as "open" in dashboard queries */
export const OPEN_INCIDENT_STATUSES = ['Open', 'UnderInvestigation'] as const

/** Grievance statuses that count as "open" in dashboard queries */
export const OPEN_GRIEVANCE_STATUSES = ['Open', 'InProgress'] as const

/** Training record statuses */
export const TRAINING_STATUSES = ['Valid', 'Expiring Soon', 'Expired'] as const

/** Medical examination results */
export const MEDICAL_RESULTS = ['Fit', 'Unfit', 'Conditional', 'Pending'] as const

/** Vehicle/equipment conditions */
export const VEHICLE_CONDITIONS = ['Fit', 'NeedsRepair', 'Grounded'] as const

/** Vehicle ownership types */
export const VEHICLE_OWNERSHIPS = ['Own', 'Rented'] as const

/** Site compliance item statuses */
export const COMPLIANCE_STATUSES = ['Compliant', 'NonCompliant', 'Pending'] as const

/** Attendance statuses */
export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'HalfDay', 'Leave'] as const

/** Incident severity levels */
export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const

/** Incident types */
export const INCIDENT_TYPES = [
  'NearMiss',
  'FirstAid',
  'MedicalTreatment',
  'LostTime',
  'Fatality',
  'PropertyDamage',
  'Environmental',
  'Fire',
  'Other',
] as const

/** Police verification statuses */
export const POLICE_RECORD_STATUSES = ['Verified', 'Not Updated', 'Pending', 'Adverse'] as const

/** Skill levels */
export const SKILL_LEVELS = ['Skilled', 'Unskilled', 'Semi-Skilled'] as const

/** Fitness statuses */
export const FITNESS_STATUSES = ['Fit', 'Unfit', 'Conditional', 'Pending'] as const

// ──────────────────── User Roles ────────────────────

export const USER_ROLES = ['ADMIN', 'SAFETY_OFFICER', 'PMC', 'HR_COORDINATOR', 'LEGAL_ADVISOR'] as const

// ──────────────────── Date / Time ────────────────────

/** Number of days before training expiry to flag as "Expiring Soon" */
export const TRAINING_EXPIRY_WARNING_DAYS = 30

/** Default SLA for grievance resolution (days) */
export const DEFAULT_GRIEVANCE_SLA_DAYS = 7

/** Default medical checkup frequency (months) */
export const DEFAULT_CHECKUP_FREQUENCY_MONTHS = 12

/** Default renewal reminder lead time (days) */
export const DEFAULT_RENEWAL_REMINDER_DAYS = 30
