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

// 1. Projects with the lowest checklist compliance (8 spaces)
const card1 = extractBetween(
  '{/* Card 2: Projects with the lowest checklist compliance */}',
  '        </Card>\n'
)

// 2. 15 Statutory Checklist Items (6 spaces)
const card2 = extractBetween(
  '{/* Visual B: Horizontal Bar Chart: Checklist-Item-Wise Compliance (Sorted Worst-First) */}',
  '      </Card>\n'
)

// 3. Exception Table (6 spaces)
const card3 = extractBetween(
  '{/* Visual D: Exception Table: Projects with "No" Responses */}',
  '      </Card>\n'
)

const combinedRow = `
      {/* Combined Requested Row 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
${card3}
${card2}
${card1}
      </div>
`
// Notice I put card3 (Exception List) first, then card2, then card1, as per user's list: "Exception List, 15 Statutory, Projects with lowest".
// Actually the user said: "show Exception List..., 15 Statutory..., Projects with lowest... in single row". I will just follow that order exactly.

const insertMarker = '{/* Combined Requested Row 2 */}'
const insertPoint = content.indexOf(insertMarker)
content = content.substring(0, insertPoint) + combinedRow + '\n' + content.substring(insertPoint)

// Clean up leftovers from Combined Requested Row 2
content = content.replace(
  '{/* Combined Requested Row 2 */}\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">\n\n\n      </div>\n',
  ''
)

fs.writeFileSync(path, content)
console.log('Success')
