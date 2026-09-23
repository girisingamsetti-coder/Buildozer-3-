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

// 1. Incidents reported by month Chart Card
const card1 = extractBetween(
  '{/* Incidents reported by month Chart Card */}',
  '        </Card>\n'
)

// 2. Incident types
const card2 = extractBetween(
  '{/* Incident types */}',
  '          </Card>\n'
)

// 3. Near Miss / Incident Report Log
const card3 = extractBetween(
  '{/* Visual D: Table: Near Miss / Incident Report */}',
  '      </Card>\n'
)

const combinedRow3 = `
      {/* Combined Requested Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
${card1}
${card2}
${card3}
      </div>
`

// Insert it where Incidents reported by month Chart Card was. 
// We removed it from the beginning of its original position.
// Let's insert it right after the Incidents Section heading.
const insertMarker = '{/* Middle Split: Incident types */}'
const insertPoint = content.indexOf(insertMarker)
content = content.substring(0, insertPoint) + combinedRow3 + '\n' + content.substring(insertPoint)

// Clean up leftover empty wrappers
content = content.replace(
  '{/* Middle Split: Incident types */}\n        <div className="grid grid-cols-1 gap-3">\n          \n\n                  </div>\n',
  ''
)

fs.writeFileSync(path, content)
console.log('Success')
