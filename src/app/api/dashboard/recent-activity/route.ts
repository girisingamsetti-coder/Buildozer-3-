import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// GET /api/dashboard/recent-activity?type=photos|new-entry|medical|training|incident|all
// Returns a unified ActivityItem[] array used by the dashboard's "Recent Activity" panel.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const jsonPath = path.join(process.cwd(), 'public', 'recent-activities.json')
    const fileContents = await fs.readFile(jsonPath, 'utf8')
    const data = JSON.parse(fileContents)

    let items = data.items || []

    if (type && type !== 'all') {
      if (type === 'new-entry' || type === 'entry') {
        items = items.filter((item: any) => item.kind === 'entry' || item.kind === 'new-entry')
      } else if (type === 'photos' || type === 'photo') {
        items = items.filter((item: any) => item.kind === 'photo' || item.kind === 'photos' || !!item.photo)
      } else {
        items = items.filter((item: any) => item.kind === type)
      }
    }

    return NextResponse.json({ items, count: items.length })
  } catch (error) {
    console.error('GET /api/dashboard/recent-activity error:', error)
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 })
  }
}

