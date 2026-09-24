const fs = require('fs')

const path = 'src/components/modules/v3/tabs/evm-tab.tsx'
let content = fs.readFileSync(path, 'utf8')

// 1. Extract the Training cards (from {/* Participants by month */} to the end of {/* Participants by gender */} card)
// It starts at line 634 and ends around 711
const startTag = '{/* Participants by month */}'
const endTag = '          </Card>\n        </div>\n      </div>'

const startIndex = content.indexOf(startTag)
let endIndex = content.indexOf('          </Card>', content.indexOf('{/* Participants by gender */}'))
// we need to include that `          </Card>`
endIndex += '          </Card>'.length

const trainingCards = content.substring(startIndex, endIndex)

// 2. Remove the entire Environmental Training Section
const sectionStart = content.indexOf('{/* Environmental Training Section */}')
const sectionEnd = content.indexOf('      {/* Middle Split:', sectionStart)
content = content.substring(0, sectionStart) + content.substring(sectionEnd)

// 3. Insert the training cards into the Muck grid
// The muck grid ends at:
//           </Card>
//         </div>
//
//         {/* Card 3: Solid waste: generated vs disposed */}

const muckGridEnd = '          </Card>\n        </div>\n\n        {/* Card 3: Solid waste: generated vs disposed */}'
const muckGridEndIndex = content.indexOf(muckGridEnd)
if (muckGridEndIndex === -1) {
  console.log("Could not find muck grid end")
  process.exit(1)
}

// We will replace `          </Card>\n        </div>` with `          </Card>\n\n          ` + trainingCards + `\n        </div>`
content = content.replace(
  '          </Card>\n        </div>\n\n        {/* Card 3: Solid waste: generated vs disposed */}',
  '          </Card>\n\n          ' + trainingCards + '\n        </div>\n\n        {/* Card 3: Solid waste: generated vs disposed */}'
)

// 4. Update the grid classes
// `<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">` right before `{/* Card 1: How excavated muck was used */}`
content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">\n          {/* Card 1: How excavated muck was used */}',
  '<div className="grid grid-cols-1 lg:grid-cols-4 gap-3">\n          {/* Card 1: How excavated muck was used */}'
)

fs.writeFileSync(path, content)
console.log('Success')
