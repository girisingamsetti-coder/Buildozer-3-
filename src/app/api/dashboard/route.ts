import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// GET /api/dashboard
export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'dashboard-data.json')
    const fileContents = await fs.readFile(jsonPath, 'utf8')
    const data = JSON.parse(fileContents)

    // Append some dummy values for top level counters that aren't strictly dashboard specific but might be expected
    const result = {
      ...data,
      activeWorkers: 67198,
      expiringTrainingsCount: 0,
      pendingMedicalCount: 0,
      openGrievancesCount: 0,
      openIncidentsCount: 0,
      attendanceToday: 67000,
      compliancePct: 100,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
