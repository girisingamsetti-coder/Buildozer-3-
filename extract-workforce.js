const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/e&s-forms.json', 'utf8'));

let highlySkilled = 0;
let skilled = 0;
let semiSkilled = 0;
let unskilled = 0;

function traverse(obj) {
  if (Array.isArray(obj)) {
    for (const item of obj) traverse(item);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.inputType === 'TABLE' && obj.columns) {
       let isWorkforceTable = obj.fieldName && (obj.fieldName.toLowerCase().includes('workforce') || obj.fieldName.toLowerCase().includes('manpower') || obj.fieldName.toLowerCase().includes('labour'));
       
       if (isWorkforceTable && obj.cells) {
          const colNames = obj.columns.map(c => c.fieldName ? c.fieldName.toLowerCase() : '');
          
          let hsMaleIdx = -1, hsFemaleIdx = -1;
          let sMaleIdx = -1, sFemaleIdx = -1;
          let ssMaleIdx = -1, ssFemaleIdx = -1;
          let uMaleIdx = -1, uFemaleIdx = -1;

          for (let i = 0; i < colNames.length; i++) {
             const name = colNames[i];
             if (name.includes('highly skilled - male')) hsMaleIdx = i;
             else if (name.includes('highly skilled - female')) hsFemaleIdx = i;
             else if (name.includes('skilled - male') && !name.includes('semi') && !name.includes('highly')) sMaleIdx = i;
             else if (name.includes('skilled - female') && !name.includes('semi') && !name.includes('highly')) sFemaleIdx = i;
             else if (name.includes('semi-skilled - male')) ssMaleIdx = i;
             else if (name.includes('semi-skilled - female')) ssFemaleIdx = i;
             else if (name.includes('unskilled - male')) uMaleIdx = i;
             else if (name.includes('unskilled - female')) uFemaleIdx = i;
          }

          const colSize = obj.columnSize;
          for (let r = 0; r < obj.rowSize; r++) {
             if (hsMaleIdx !== -1 && obj.cells[r * colSize + hsMaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + hsMaleIdx].value);
                if (!isNaN(v)) highlySkilled += v;
             }
             if (hsFemaleIdx !== -1 && obj.cells[r * colSize + hsFemaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + hsFemaleIdx].value);
                if (!isNaN(v)) highlySkilled += v;
             }
             if (sMaleIdx !== -1 && obj.cells[r * colSize + sMaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + sMaleIdx].value);
                if (!isNaN(v)) skilled += v;
             }
             if (sFemaleIdx !== -1 && obj.cells[r * colSize + sFemaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + sFemaleIdx].value);
                if (!isNaN(v)) skilled += v;
             }
             if (ssMaleIdx !== -1 && obj.cells[r * colSize + ssMaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + ssMaleIdx].value);
                if (!isNaN(v)) semiSkilled += v;
             }
             if (ssFemaleIdx !== -1 && obj.cells[r * colSize + ssFemaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + ssFemaleIdx].value);
                if (!isNaN(v)) semiSkilled += v;
             }
             if (uMaleIdx !== -1 && obj.cells[r * colSize + uMaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + uMaleIdx].value);
                if (!isNaN(v)) unskilled += v;
             }
             if (uFemaleIdx !== -1 && obj.cells[r * colSize + uFemaleIdx]) {
                const v = parseInt(obj.cells[r * colSize + uFemaleIdx].value);
                if (!isNaN(v)) unskilled += v;
             }
          }
       }
    }
    for (const key of Object.keys(obj)) {
      traverse(obj[key]);
    }
  }
}
traverse(data);

console.log('Highly Skilled:', highlySkilled);
console.log('Skilled:', skilled);
console.log('Semi Skilled:', semiSkilled);
console.log('Unskilled:', unskilled);
