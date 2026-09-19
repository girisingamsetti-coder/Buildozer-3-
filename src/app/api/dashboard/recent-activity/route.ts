import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// GET /api/dashboard/recent-activity?type=photos|new-entry|medical|training|incident|all
// Returns a unified ActivityItem[] array used by the dashboard's "Recent Activity" panel.
export async function GET(req: NextRequest) {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'recent-activities.json')
    const fileContents = await fs.readFile(jsonPath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/dashboard/recent-activity error:', error)
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 })
  }
}

