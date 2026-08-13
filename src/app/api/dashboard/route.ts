import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard
export async function GET() {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Basic counts
    const [
      totalWorkers,
      activeWorkers,
      openGrievances,
      openIncidents,
      pendingMedical,
      expiringTrainings,
      todayAttendance,
      allIncidents,
      allTrainingRecords,
      allWorkers,
    ] = await Promise.all([
      db.worker.count(),
      db.worker.count({ where: { isActive: true } }),
      db.grievance.count({ where: { status: { in: ['Open', 'InProgress'] } } }),
      db.incident.count({ where: { status: { in: ['Open', 'UnderInvestigation'] } } }),
      db.medicalRecord.count({ where: { result: 'Pending' } }),
      // Training expiring within 30 days
      db.trainingRecord.count({
        where: {
          validityDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          status: 'Valid',
        },
      }),
      // Attendance today
      db.attendance.count({
        where: {
          date: today,
          status: 'Present',
        },
      }),
      // Incident breakdown by type
      db.incident.findMany({
        where: { status: { in: ['Open', 'UnderInvestigation', 'Closed'] } },
        select: { incidentType: true },
      }),
      // Training status breakdown
      db.trainingRecord.findMany({
        select: { status: true },
      }),
      // Gender breakdown
      db.worker.findMany({
        select: { gender: true },
      }),
    ])

    // Incident breakdown by type
    const incidentBreakdown: Record<string, number> = {}
    for (const inc of allIncidents) {
      incidentBreakdown[inc.incidentType] = (incidentBreakdown[inc.incidentType] || 0) + 1
    }

    // Training status breakdown
    const trainingStatusBreakdown: Record<string, number> = {}
    for (const t of allTrainingRecords) {
      trainingStatusBreakdown[t.status] = (trainingStatusBreakdown[t.status] || 0) + 1
    }

    // Gender breakdown
    const genderBreakdown: Record<string, number> = {}
    for (const w of allWorkers) {
      genderBreakdown[w.gender] = (genderBreakdown[w.gender] || 0) + 1
    }

    // Compliance percentage: compliant items / total items
    const [facilityCount, facilityCompliant, securityCount, securityCompliant, medCount, medCompliant] =
      await Promise.all([
        db.siteFacility.count(),
        db.siteFacility.count({ where: { status: 'Compliant' } }),
        db.siteSecurityItem.count(),
        db.siteSecurityItem.count({ where: { status: 'Compliant' } }),
        db.medInfraItem.count(),
        db.medInfraItem.count({ where: { status: 'Compliant' } }),
      ])

    const totalComplianceItems = facilityCount + securityCount + medCount
    const totalCompliant = facilityCompliant + securityCompliant + medCompliant
    const compliancePct = totalComplianceItems > 0
      ? Math.round((totalCompliant / totalComplianceItems) * 100)
      : 100

    // Incident breakdown by type (as array)
    const incidentBreakdownArr = Object.entries(incidentBreakdown).map(([type, count]) => ({ type, count }))

    // Training status breakdown (as array)
    const trainingStatusBreakdownArr = Object.entries(trainingStatusBreakdown).map(([status, count]) => ({ status, count }))

    // Gender breakdown (as array)
    const genderBreakdownArr = Object.entries(genderBreakdown).map(([gender, count]) => ({ gender, count }))

    return NextResponse.json({
      totalWorkers,
      activeWorkers,
      expiringTrainingsCount: expiringTrainings,
      pendingMedicalCount: pendingMedical,
      openGrievancesCount: openGrievances,
      openIncidentsCount: openIncidents,
      attendanceToday: todayAttendance,
      compliancePct,
      incidentBreakdown: incidentBreakdownArr,
      trainingStatusBreakdown: trainingStatusBreakdownArr,
      genderBreakdown: genderBreakdownArr,
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
