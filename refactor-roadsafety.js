const fs = require('fs')

const path = 'src/components/modules/v3/tabs/road-safety-tab.tsx'
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n')

function extractBetween(startMarker, endMarker) {
  const start = content.indexOf(startMarker)
  if (start === -1) throw new Error("Could not find start: " + startMarker)
  const end = content.indexOf(endMarker, start) + endMarker.length
  const str = content.substring(start, end)
  content = content.substring(0, start) + content.substring(end)
  return str
}

// 1. Checklist compliance by month (8 spaces indent for closing tag)
const card1 = extractBetween(
  '{/* Card 1: Checklist compliance by month */}',
  '        </Card>\n'
)

// 2. Checklist Response Mix (8 spaces indent for closing tag)
const card2 = extractBetween(
  '{/* Visual A: Doughnut Chart: Checklist Response Mix */}',
  '        </Card>\n'
)

// 3. Monthly Road Safety Compliance Trend (8 spaces indent for closing tag)
let card3 = extractBetween(
  '{/* Visual C: Monthly Road Safety Compliance Trend (6 Months) */}',
  '        </Card>\n'
)
card3 = card3.replace(' className="lg:col-span-2 ', ' className="')

const combinedRow = `
      {/* Combined Requested Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
${card1}
${card2}
${card3}
      </div>
`

// Insert at the top of the tab contents
const insertMarker = '{/* 2-Card Row: Checklist compliance by month + Projects with lowest compliance */}'
const insertPoint = content.indexOf(insertMarker)
content = content.substring(0, insertPoint) + combinedRow + '\n' + content.substring(insertPoint)

// Clean up leftovers
content = content.replace(
  '{/* Top Split: Checklist Mix Doughnut + Monthly Compliance Trend */}\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">\n\n\n      </div>\n',
  ''
)

content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n\n        {/* Card 2: Projects with the lowest checklist compliance */}',
  '<div className="grid grid-cols-1 gap-3">\n        {/* Card 2: Projects with the lowest checklist compliance */}'
)

content = content.replace(
  '{/* 2-Card Row: Checklist compliance by month + Projects with lowest compliance */}\n      <div className="grid grid-cols-1 gap-3">',
  '{/* Card: Projects with lowest compliance */}\n      <div className="grid grid-cols-1 gap-3">'
)

fs.writeFileSync(path, content)
console.log('Success')
