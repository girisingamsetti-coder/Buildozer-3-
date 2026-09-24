const fs = require('fs')

const path = 'src/components/modules/v3/tabs/ohs-tab.tsx'
let content = fs.readFileSync(path, 'utf8')

// 1. OHS Policies
const policiesStart = content.indexOf('{/* Visual E: Horizontal Bar Chart: OHS Policies & Plans Availability */}')
const policiesEnd = content.indexOf('          </Card>', policiesStart) + '          </Card>'.length
const policiesCard = content.substring(policiesStart, policiesEnd)
content = content.substring(0, policiesStart) + content.substring(policiesEnd)

// 2. Checklist compliance
const checklistStart = content.indexOf('{/* Card 1: Checklist compliance by month */}')
const checklistEnd = content.indexOf('          </Card>', checklistStart) + '          </Card>'.length
const checklistCard = content.substring(checklistStart, checklistEnd)
content = content.substring(0, checklistStart) + content.substring(checklistEnd)

// 3. Projects reporting the most incidents
const incidentsStart = content.indexOf('{/* Projects reporting the most incidents */}')
const incidentsEnd = content.indexOf('          </Card>', incidentsStart) + '          </Card>'.length
const incidentsCard = content.substring(incidentsStart, incidentsEnd)
content = content.substring(0, incidentsStart) + content.substring(incidentsEnd)

// Insert into a combined row
const combinedRow = `
      {/* Combined Requested Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
${policiesCard}
${checklistCard}
${incidentsCard}
      </div>
`

// Insert it right before the "Top Split"
const insertPoint = content.indexOf('      {/* Top Split: Visual A')
content = content.substring(0, insertPoint) + combinedRow + '\n' + content.substring(insertPoint)

// Fix wrappers
content = content.replace(
  '{/* Top Split: Visual A (Compliance by OHS Group) + Visual E (Policies & Plans Availability) */}\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">',
  '{/* Top Split: Visual A (Compliance by OHS Group) */}\n      <div className="grid grid-cols-1 gap-3">'
)

content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          \n          {/* Card 2: Projects with the lowest checklist compliance */}',
  '<div className="grid grid-cols-1 gap-3">\n          {/* Card 2: Projects with the lowest checklist compliance */}'
)

content = content.replace(
  '{/* Middle Split: Incident types + Projects reporting the most incidents */}\n        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          {/* Incident types */}',
  '{/* Middle Split: Incident types */}\n        <div className="grid grid-cols-1 gap-3">\n          {/* Incident types */}'
)

fs.writeFileSync(path, content)
console.log('Success')
