const fs = require('fs')

const path = 'src/components/modules/v3/tabs/evm-tab.tsx'
let content = fs.readFileSync(path, 'utf8')

// Card 1: How excavated muck was used
content = content.replace(
  '<CardContent className="p-4 flex items-center gap-6">',
  '<CardContent className="p-4 flex flex-col items-center gap-6 h-full justify-center">'
)

content = content.replace(
  '<div className="flex flex-col gap-3 flex-1">',
  '<div className="flex flex-col gap-3 w-full max-w-[240px]">'
)

// Card 2: Participants by gender
content = content.replace(
  '<CardContent className="p-4 flex items-center justify-between h-[300px]">',
  '<CardContent className="p-4 flex flex-col items-center gap-6 h-full justify-center min-h-[300px]">'
)

content = content.replace(
  '<div className="w-48 h-48 relative ml-4">',
  '<div className="w-40 h-40 relative">'
)

content = content.replace(
  '<div className="flex flex-col gap-4 flex-1 max-w-[200px] mr-8">',
  '<div className="flex flex-col gap-3 w-full max-w-[240px]">'
)

fs.writeFileSync(path, content)
console.log('Success')
