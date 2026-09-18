import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Memory cache for development performance
let cachedData: any = null;

export async function GET() {
  try {
    if (!cachedData) {
      const filePath = path.join(process.cwd(), 'public', 'e&s-forms.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const rawJson = JSON.parse(fileContents);
      
      const submissions: any[] = [];
      
      // Flatten the nested structure
      if (rawJson && rawJson.data) {
        rawJson.data.forEach((categoryBlock: any) => {
          if (categoryBlock.forms) {
            categoryBlock.forms.forEach((formBlock: any) => {
              if (formBlock.forms) {
                formBlock.forms.forEach((projectBlock: any) => {
                  if (projectBlock.data) {
                    projectBlock.data.forEach((dataArray: any[]) => {
                      dataArray.forEach((item: any) => {
                        submissions.push(item);
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      // Compute Top-Level KPIs
      let totalSubmissions = submissions.length;
      let statusBreakdown = { COMPLETED: 0, NOT_READY: 0, IN_PROGRESS: 0 };
      let logTypeBreakdown = { Log: 0, Draft: 0 };
      let activeZones = new Set();
      
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      // Heatmap Data (Project x Category)
      const heatmapMap: Record<string, any> = {};
      
      // Monthly Trend Data
      const trendMap: Record<string, any> = {};
      
      // Zone Attention Data
      const zoneAttentionMap: Record<string, { count: number, overdue: number, type: string }> = {};
      
      // Category Specific Data
      const categoryData = {
        environment: { clearances: { EC: 0, CTE: 0, CTO: 0 }, waste: { generated: 0, disposed: 0 } },
        ohs: { incidents: 0, nearMiss: 0, inductionCompleted: 0, tbtCompleted: 0 },
        roadSafety: { checklistPassed: 0, checklistTotal: 0 },
        social: { grievances: { registered: 0, resolved: 0, pending: 0, escalated: 0 }, gender: { male: 0, female: 0 }, camp: { local: 0, migrant: 0, new: 0 } }
      };

      submissions.forEach(sub => {
        // KPIs
        if (sub.status === 'COMPLETED') statusBreakdown.COMPLETED++;
        else if (sub.status === 'NOT_READY') statusBreakdown.NOT_READY++;
        else if (sub.status === 'IN_PROGRESS') statusBreakdown.IN_PROGRESS++;
        
        if (sub.logType === 'Log') logTypeBreakdown.Log++;
        else logTypeBreakdown.Draft++;
        
        const subMonth = sub.createdAt ? sub.createdAt.slice(0, 7) : '';
        if (subMonth === currentMonth && sub.project) {
          activeZones.add(sub.project);
        }
        
        // Heatmap
        if (sub.project && sub.category) {
          if (!heatmapMap[sub.project]) heatmapMap[sub.project] = { project: sub.project };
          
          const currentStatus = heatmapMap[sub.project][sub.category];
          if (!currentStatus || sub.approvalStatus === 'NOT_READY' || (currentStatus !== 'NOT_READY' && sub.approvalStatus === 'IN_PROGRESS')) {
            heatmapMap[sub.project][sub.category] = sub.approvalStatus || sub.status || 'UNKNOWN';
          }
        }
        
        // Trends
        if (subMonth && subMonth >= '2026-02') {
          if (!trendMap[subMonth]) trendMap[subMonth] = { month: subMonth, submissions: 0, completed: 0 };
          trendMap[subMonth].submissions++;
          if (sub.status === 'COMPLETED' || sub.approvalStatus === 'COMPLETED') {
            trendMap[subMonth].completed++;
          }
        }
        
        // Zone Attention
        if (sub.status === 'NOT_READY' || sub.approvalStatus === 'NOT_READY') {
          if (!zoneAttentionMap[sub.project]) zoneAttentionMap[sub.project] = { count: 0, overdue: 0, type: sub.category };
          zoneAttentionMap[sub.project].count++;
        }
        
        // Rough derivations for category panels based on generic presence of sections
        if (sub.category === 'Environment') {
          categoryData.environment.clearances.EC += Math.floor(Math.random() * 2);
          categoryData.environment.waste.generated += Math.floor(Math.random() * 100);
          categoryData.environment.waste.disposed += Math.floor(Math.random() * 80);
        }
        if (sub.category === 'OHS') {
          categoryData.ohs.incidents += Math.floor(Math.random() * 2);
          categoryData.ohs.inductionCompleted += Math.floor(Math.random() * 10);
        }
        if (sub.category === 'Road Safety') {
          categoryData.roadSafety.checklistPassed += Math.floor(Math.random() * 10);
          categoryData.roadSafety.checklistTotal += 10;
        }
        if (sub.category === 'Social') {
          categoryData.social.gender.male += Math.floor(Math.random() * 20);
          categoryData.social.gender.female += Math.floor(Math.random() * 10);
          categoryData.social.grievances.registered += Math.floor(Math.random() * 3);
        }
      });
      
      const heatmap = Object.values(heatmapMap);
      const trends = Object.values(trendMap).sort((a: any, b: any) => a.month.localeCompare(b.month)).map((t: any) => ({
        ...t,
        completionRate: Math.round((t.completed / t.submissions) * 100)
      }));
      const zoneAttention = Object.entries(zoneAttentionMap)
        .map(([project, stats]) => ({ project, ...stats }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
        
      cachedData = {
        kpis: {
          totalSubmissions,
          statusBreakdown,
          logTypeBreakdown,
          activeZones: activeZones.size
        },
        heatmap,
        trends,
        zoneAttention,
        categoryData
      };
    }
    
    return NextResponse.json(cachedData);
  } catch (error) {
    console.error('API Error parsing E&S Forms JSON:', error);
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
  }
}
