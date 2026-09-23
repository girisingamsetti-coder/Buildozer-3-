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

// 1. Compliance by Statutory OHS Requirement Group (8 spaces indent for closing tag)
const card1 = extractBetween(
  '{/* Visual A: Horizontal Bar Chart: Compliance by OHS Requirement Group */}',
  '        </Card>\n'
)

// 2. Projects with the lowest checklist compliance (10 spaces indent for closing tag)
const card2 = extractBetween(
  '{/* Card 2: Projects with the lowest checklist compliance */}',
  '          </Card>\n'
)

// 3. Trainings conducted (8 spaces indent for closing tag)
const card3 = extractBetween(
  '{/* Card 3: Trainings conducted */}',
  '        </Card>\n'
)

const combinedRow2 = `
      {/* Combined Requested Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
${card1}
${card2}
${card3}
      </div>
`

const insertMarker = '{/* Top Split: Visual A (Compliance by OHS Group) */}'
const insertPoint = content.indexOf(insertMarker)
content = content.substring(0, insertPoint) + combinedRow2 + '\n' + content.substring(insertPoint)

// Clean up leftover empty wrappers
content = content.replace(
  '{/* Top Split: Visual A (Compliance by OHS Group) */}\n      <div className="grid grid-cols-1 gap-3">\n\n              </div>\n',
  ''
)

content = content.replace(
  '<div className="grid grid-cols-1 gap-3">\n        </div>\n',
  ''
)

fs.writeFileSync(path, content)
console.log('Success')
