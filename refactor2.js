const fs = require('fs')

const path = 'src/components/modules/v3/tabs/evm-tab.tsx'
let content = fs.readFileSync(path, 'utf8')

// We need to extract Solid Waste card and Geographic Map card.

const swStartString = '{/* Card 3: Solid waste: generated vs disposed */}'
const swStartIndex = content.indexOf(swStartString)
const swEndIndex = content.indexOf('        </Card>', swStartIndex) + '        </Card>'.length

const swCard = content.substring(swStartIndex, swEndIndex)
  // Update class
  .replace('w-1/2', 'w-full lg:w-[35%] h-full')

const geoStartString = '{/* Middle Split: Visual B (SVG Geographic Map) + Station Inspection Side-Panel */}'
const geoStartIndex = content.indexOf(geoStartString)
const geoEndIndex = content.indexOf('      </Card>', geoStartIndex) + '      </Card>'.length

const geoCard = content.substring(geoStartIndex, geoEndIndex)
  // The first Card inside geoCard is the Geographic Map
  // `<Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">`
  .replace('<Card className="border shadow-xs rounded-2xl shadow-sm border-border/40">', '<Card className="border shadow-xs rounded-2xl shadow-sm border-border/40 w-full lg:w-[65%] h-full">')

const combinedHtml = `
      </div>
      
      {/* Map and Solid Waste Split Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        ${geoCard.trim()}
        
        ${swCard.trim()}
      </div>
`

// Replace the area from swStartIndex to geoEndIndex
// The area between swEndIndex and geoStartIndex contains the original </div>
content = content.substring(0, swStartIndex) + combinedHtml + content.substring(geoEndIndex)

fs.writeFileSync(path, content)
console.log('Success')
