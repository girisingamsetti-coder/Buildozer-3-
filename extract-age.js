const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/e&s-forms.json', 'utf8'));

let group18_30 = 0;
let group31_45 = 0;
let group46_55 = 0;
let group55_plus = 0;
let invalid = 0;

function calculateAge(dobString) {
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return -1;
  const today = new Date('2026-09-19'); // assume today is the mock date
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function traverse(obj) {
  if (Array.isArray(obj)) {
    for (const item of obj) traverse(item);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.inputType === 'TABLE' && obj.columns && obj.cells) {
       let dobIdx = -1;
       for (let i = 0; i < obj.columns.length; i++) {
          if (obj.columns[i].fieldName) {
             const name = obj.columns[i].fieldName.toLowerCase();
             if (name.includes('date of birth') || name.includes('dob')) {
                dobIdx = i;
                break;
             }
          }
       }
       if (dobIdx !== -1) {
          const colSize = obj.columnSize;
          for (let r = 0; r < obj.rowSize; r++) {
             const cell = obj.cells[r * colSize + dobIdx];
             if (cell && cell.value) {
                const age = calculateAge(cell.value);
                if (age >= 18 && age <= 30) group18_30++;
                else if (age >= 31 && age <= 45) group31_45++;
                else if (age >= 46 && age <= 55) group46_55++;
                else if (age > 55) group55_plus++;
                else invalid++;
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

console.log('18-30:', group18_30);
console.log('31-45:', group31_45);
console.log('46-55:', group46_55);
console.log('55+:', group55_plus);
console.log('Invalid/Out of range:', invalid);
