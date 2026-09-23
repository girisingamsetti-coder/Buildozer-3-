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

// 1. Projects with the lowest checklist compliance
const card1 = extractBetween(
  '{/* Card 2: Projects with the lowest checklist compliance */}',
  '        </Card>\n'
)

// 2. 15 Statutory Checklist Items
const card2 = extractBetween(
  '{/* Visual B: Horizontal Bar Chart: Checklist-Item-Wise Compliance (Sorted Worst-First) */}',
  '      </Card>\n'
)

const combinedRow = `
      {/* Combined Requested Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
${card1}
${card2}
      </div>
`

// Insert it where Visual B used to be (which we just removed, so we'll just append it before Visual D)
const insertMarker = '{/* Visual D: Exception Table: Projects with "No" Responses */}'
const insertPoint = content.indexOf(insertMarker)
content = content.substring(0, insertPoint) + combinedRow + '\n' + content.substring(insertPoint)

// Clean up leftovers from Card 1's old wrapper
content = content.replace(
  '{/* 2-Card Row: Checklist compliance by month + Projects with lowest compliance */}\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n        \n        \n      </div>\n',
  ''
)

fs.writeFileSync(path, content)
console.log('Success')
