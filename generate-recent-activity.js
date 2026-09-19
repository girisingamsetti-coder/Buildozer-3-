const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/e&s-forms.json', 'utf8'));

let activities = [];

function traverse(obj, parentFormName, parentProjectName, parentContractor) {
  if (Array.isArray(obj)) {
    for (const item of obj) traverse(item, parentFormName, parentProjectName, parentContractor);
  } else if (obj !== null && typeof obj === 'object') {
    let currentFormName = obj.formName || parentFormName;
    let currentProjectName = obj.projectName || obj.name || parentProjectName;
    let currentContractor = obj.contractor || obj.contractorName || parentContractor;
    
    if (obj.createdAt || obj.updatedAt || obj.submissionDate) {
       const date = obj.createdAt || obj.updatedAt || obj.submissionDate;
       const status = obj.status || 'IN_PROGRESS';
       const reportingMonth = obj.reportingMonth || 'Unknown Month';
       
       activities.push({
          id: `act-${activities.length + 1}`,
          kind: 'entry',
          title: currentFormName || 'Form Submission',
          subtitle: `Reporting Month: ${reportingMonth} • Status: ${status}`,
          location: currentProjectName || 'Unknown Project',
          timestamp: date,
          photo: null,
          meta: { contractor: currentContractor }
       });
    }
    
    for (const key of Object.keys(obj)) {
       if (key !== 'formData' && key !== 'sections' && key !== 'cells') {
         traverse(obj[key], currentFormName, currentProjectName, currentContractor);
       }
    }
  }
}
traverse(data, 'Unknown Form', 'Unknown Project', 'Unknown Contractor');

// Sort descending
activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// Take top 50
const top50 = activities.slice(0, 50);

fs.writeFileSync('./public/recent-activities.json', JSON.stringify({ items: top50, count: top50.length }, null, 2));
console.log('Written to public/recent-activities.json');
