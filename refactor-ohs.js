const fs = require('fs')

const path = 'src/components/modules/v3/tabs/ohs-tab.tsx'
let content = fs.readFileSync(path, 'utf8')

function extractCard(titleSubstring) {
  const titleIndex = content.indexOf(titleSubstring)
  if (titleIndex === -1) throw new Error("Could not find " + titleSubstring)
  
  // step back to find `<Card`
  const startIndex = content.lastIndexOf('<Card', titleIndex)
  
  // also, we want to extract the comment before it if it exists. Let's just step back to the comment
  const commentIndex = content.lastIndexOf('{/*', startIndex)
  
  // decide the real start
  // if the comment is close to `<Card` (e.g. within 100 chars), we include it
  let actualStart = startIndex
  if (startIndex - commentIndex < 100) {
    actualStart = content.lastIndexOf('\n', commentIndex) + 1
  } else {
    actualStart = content.lastIndexOf('\n', startIndex) + 1
  }

  const endIndex = content.indexOf('</Card>', startIndex) + '</Card>'.length
  
  const card = content.substring(actualStart, endIndex)
  content = content.substring(0, actualStart) + content.substring(endIndex)
  return card
}

const card1 = extractCard('OHS Policies & Plans Availability')
const card2 = extractCard('Checklist compliance by month')
const card3 = extractCard('Projects reporting the most incidents')

const combinedRow = `
      {/* Combined Requested Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
${card1}
${card2}
${card3}
      </div>
`

// Insert combinedRow right after the KPI cards which end around line 255.
const insertPoint = content.indexOf('      {/* Top Split:')
content = content.substring(0, insertPoint) + combinedRow + '\n\n' + content.substring(insertPoint)

// Fix the lg:grid-cols-2 where we removed the cards
content = content.replace(
  '{/* Top Split: Visual A (Compliance by OHS Group) + Visual E (Policies & Plans Availability) */}\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">',
  '{/* Top Split: Visual A (Compliance by OHS Group) */}\n      <div className="grid grid-cols-1 gap-3">'
)

content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          {/* Card 2: Projects with the lowest checklist compliance */',
  '<div className="grid grid-cols-1 gap-3">\n          {/* Card 2: Projects with the lowest checklist compliance */'
)

content = content.replace(
  '{/* Middle Split: Incident types + Projects reporting the most incidents */}\n        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          {/* Incident types */',
  '{/* Middle Split: Incident types */}\n        <div className="grid grid-cols-1 gap-3">\n          {/* Incident types */'
)

// One more attempt for Card 2 replacement just in case
content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          \n          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 flex flex-col">\n            <CardHeader className="p-4 border-b bg-muted/20">\n              <CardTitle className="text-sm font-bold text-foreground">\n                Projects with the lowest checklist compliance',
  '<div className="grid grid-cols-1 gap-3">\n          \n          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 flex flex-col">\n            <CardHeader className="p-4 border-b bg-muted/20">\n              <CardTitle className="text-sm font-bold text-foreground">\n                Projects with the lowest checklist compliance'
)

// One more attempt for Incident types replacement just in case
content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          {/* Incident types */}\n          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 flex flex-col">\n            <CardHeader className="p-4 border-b bg-muted/20">\n              <CardTitle className="text-sm font-bold text-foreground">\n                Incident types',
  '<div className="grid grid-cols-1 gap-3">\n          {/* Incident types */}\n          <Card className="border shadow-xs rounded-xl shadow-sm border-border/40 flex flex-col">\n            <CardHeader className="p-4 border-b bg-muted/20">\n              <CardTitle className="text-sm font-bold text-foreground">\n                Incident types'
)


fs.writeFileSync(path, content)
console.log('Success')
