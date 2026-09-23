const fs = require('fs')

const path = 'src/components/modules/v3/tabs/ohs-tab.tsx'
let content = fs.readFileSync(path, 'utf8')

content = content.replace(
  '          <CardContent className="p-4 flex flex-col gap-3">\n            {Object.entries(groups).map(([gname, gdata]) => {',
  '          <CardContent className="p-4 flex flex-col gap-3 max-h-[280px] overflow-y-auto custom-scrollbar">\n            {Object.entries(groups).map(([gname, gdata]) => {'
)

content = content.replace(
  '            <CardContent className="p-4 flex-1 flex flex-col justify-between gap-1.5">\n              {lowestComplianceProjects.map((p, idx) => {',
  '            <CardContent className="p-4 flex-1 flex flex-col justify-between gap-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">\n              {lowestComplianceProjects.map((p, idx) => {'
)

content = content.replace(
  '          <CardContent className="p-4 flex flex-col gap-2">\n            {trainingsConductedData.map((t, idx) => (',
  '          <CardContent className="p-4 flex flex-col gap-2 max-h-[280px] overflow-y-auto custom-scrollbar">\n            {trainingsConductedData.map((t, idx) => ('
)

fs.writeFileSync(path, content)
console.log('Success')
