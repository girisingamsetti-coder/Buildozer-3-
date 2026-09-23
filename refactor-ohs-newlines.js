const fs = require('fs')

const path = 'src/components/modules/v3/tabs/ohs-tab.tsx'
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n')

function extractBetween(startMarker, endMarker) {
  const start = content.indexOf(startMarker)
  if (start === -1) throw new Error("Could not find start: " + startMarker)
  const end = content.indexOf(endMarker, start) + endMarker.length
  const str = content.substring(start, end)
  content = content.substring(0, start) + content.substring(end)
  return str
}

// 1. OHS Policies (8 spaces indent for closing tag)
const card1 = extractBetween(
  '{/* Visual E: Horizontal Bar Chart: OHS Policies & Plans Availability */}',
  '        </Card>\n'
)

// 2. Checklist compliance (10 spaces indent for closing tag)
const card2 = extractBetween(
  '{/* Card 1: Checklist compliance by month */}',
  '          </Card>\n'
)

// 3. Projects reporting the most incidents (10 spaces indent for closing tag)
const card3 = extractBetween(
  '{/* Projects reporting the most incidents */}',
  '          </Card>\n'
)

const combinedRow = `
      {/* Combined Requested Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
${card1}
${card2}
${card3}
      </div>
`

const insertMarker = '{/* Top Split: Visual A (Compliance by OHS Group) + Visual E (Policies & Plans Availability) */}'
const insertPoint = content.indexOf(insertMarker)
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
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          {/* Card 2: Projects with the lowest checklist compliance */}',
  '<div className="grid grid-cols-1 gap-3">\n          {/* Card 2: Projects with the lowest checklist compliance */}'
)

content = content.replace(
  '{/* Middle Split: Incident types + Projects reporting the most incidents */}\n        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          {/* Incident types */}',
  '{/* Middle Split: Incident types */}\n        <div className="grid grid-cols-1 gap-3">\n          {/* Incident types */}'
)

fs.writeFileSync(path, content)
console.log('Success')
