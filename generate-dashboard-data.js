const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/e&s-forms.json', 'utf8'));

let medicalTestBreakdown = {};
let trainingStatusBreakdown = {};
let campWorkers = {}; // camp name -> { name, contractor, site, workers, project }
let projectToContractor = {};
let projectCamps = {}; // project -> Set of unique camp locations
let trainingMale = 0;
let trainingFemale = 0;
let medicalMale = 0;
let medicalFemale = 0;

// Pass 1: Extract project to contractor mapping and all camps per project
function traverse(obj, parentProject) {
  if (Array.isArray(obj)) {
    for (const item of obj) traverse(item, parentProject);
  } else if (obj !== null && typeof obj === 'object') {
    let currentProject = obj.project || obj.projectName || parentProject;

    // Build projectToContractor mapping
    let c = obj.contractor || obj.contractorName;
    if (obj.sections && Array.isArray(obj.sections)) {
       for (const sec of obj.sections) {
          for (const field of sec.configurableFields || []) {
             if (field.fieldName === 'Contractor' || field.fieldName === 'Name of the Contractor:' || field.fieldName === 'Contractor Name & Address') {
                if (field.value) c = field.value;
             }
          }
       }
    }
    if (currentProject && c && c.trim() !== '') {
       projectToContractor[currentProject] = c.trim();
    }

    if (obj.inputType === 'TABLE' && obj.cells && obj.columns) {
       const tableName = obj.fieldName;
       const colSize = obj.columnSize;
       
       if (tableName === 'Medical & Health Activities') {
          let typeIdx = -1, countIdx = -1, maleIdx = -1, femaleIdx = -1;
          for (let i = 0; i < obj.columns.length; i++) {
             if (obj.columns[i].fieldName === 'Medical & Health Activities') typeIdx = i;
             else if (obj.columns[i].fieldName === 'Total Covered') countIdx = i;
             else if (obj.columns[i].fieldName === 'Male') maleIdx = i;
             else if (obj.columns[i].fieldName === 'Female') femaleIdx = i;
          }
          if (typeIdx !== -1 && countIdx !== -1) {
             for (let r = 0; r < obj.rowSize; r++) {
               const t = obj.cells[r * colSize + typeIdx]?.value;
               const cVal = parseInt(obj.cells[r * colSize + countIdx]?.value);
               if (t && !isNaN(cVal)) {
                 medicalTestBreakdown[t] = (medicalTestBreakdown[t] || 0) + cVal;
                 
                 const m = maleIdx !== -1 ? parseInt(obj.cells[r * colSize + maleIdx]?.value) : 0;
                 const f = femaleIdx !== -1 ? parseInt(obj.cells[r * colSize + femaleIdx]?.value) : 0;
                 if (!isNaN(m)) medicalMale += m;
                 if (!isNaN(f)) medicalFemale += f;
               }
             }
          }
       } else if (tableName === 'Trainings') {
          let topicIdx = -1, totalIdx = -1, womenIdx = -1;
          for (let i = 0; i < obj.columns.length; i++) {
             if (obj.columns[i].fieldName === 'Topic') topicIdx = i;
             else if (obj.columns[i].fieldName === 'Total No. of Participants') totalIdx = i;
             else if (obj.columns[i].fieldName === 'No. of Women Participants') womenIdx = i;
          }
          if (topicIdx !== -1 && totalIdx !== -1) {
             for (let r = 0; r < obj.rowSize; r++) {
               const t = obj.cells[r * colSize + topicIdx]?.value;
               const totalVal = parseInt(obj.cells[r * colSize + totalIdx]?.value);
               const womenVal = womenIdx !== -1 ? parseInt(obj.cells[r * colSize + womenIdx]?.value) : 0;
               
               if (t && !isNaN(totalVal)) {
                 trainingStatusBreakdown[t] = (trainingStatusBreakdown[t] || 0) + totalVal;
                 
                 const w = isNaN(womenVal) ? 0 : womenVal;
                 trainingFemale += w;
                 trainingMale += (totalVal - w);
               }
             }
          }
       } else if (tableName === 'Labour Camp Details') {
          let locIdx = -1, countIdx = -1;
          for (let i = 0; i < obj.columns.length; i++) {
             if (obj.columns[i].fieldName === 'Labour Camp Location') locIdx = i;
             else if (obj.columns[i].fieldName === 'Total Workers') countIdx = i;
          }
          if (locIdx !== -1 && countIdx !== -1) {
             for (let r = 0; r < obj.rowSize; r++) {
               const loc = obj.cells[r * colSize + locIdx]?.value;
               const cVal = parseInt(obj.cells[r * colSize + countIdx]?.value);
               if (loc && loc.trim() !== '') {
                 const id = loc.toLowerCase().trim();
                 const workers = isNaN(cVal) ? 0 : cVal;
                 
                 if (currentProject && currentProject !== 'Unknown Project') {
                    if (!projectCamps[currentProject]) projectCamps[currentProject] = new Set();
                    projectCamps[currentProject].add(id);
                 }

                 if (!campWorkers[id]) {
                    campWorkers[id] = { name: loc.trim(), workers: workers, project: currentProject, site: obj.site || obj.projectName || currentProject };
                 } else {
                    campWorkers[id].workers += workers;
                    if (currentProject && currentProject !== 'Unknown Project') {
                        campWorkers[id].project = currentProject;
                    }
                 }
               }
             }
          }
       }
    }
    
    for (const key of Object.keys(obj)) {
       if (key !== 'formData' && key !== 'cells') {
          traverse(obj[key], currentProject);
       }
    }
  }
}
traverse(data, 'Unknown Project');

let contractorCampsAgg = {}; 
for (const [project, camps] of Object.entries(projectCamps)) {
   let contractor = projectToContractor[project] || project;
   if (contractor === 'Larsen and Toubro') contractor = 'L&T';
   if (contractor === 'BSCPL Infrastructure Ltd') contractor = 'BSCPL';
   if (contractor === 'SPCL') contractor = 'SPC';

   if (!contractorCampsAgg[contractor]) contractorCampsAgg[contractor] = new Set();
   for (const c of camps) contractorCampsAgg[contractor].add(c);
}

const medicalTestBreakdownArr = Object.entries(medicalTestBreakdown).map(([status, count]) => ({ status, count }));
const trainingStatusBreakdownArr = Object.entries(trainingStatusBreakdown).map(([status, count]) => ({ status, count }));

const campsPerContractor = Object.entries(contractorCampsAgg).map(([name, campsSet], idx) => ({
  contractorId: `c-${idx}`,
  name: name,
  code: name.substring(0, 3).toUpperCase(),
  camps: campsSet.size,
  workers: 0
})).sort((a, b) => b.camps - a.camps);

const workforcePerCamp = Object.values(campWorkers)
  .sort((a, b) => b.workers - a.workers)
  .slice(0, 27)
  .map((c, idx) => {
    let contractor = projectToContractor[c.project] || c.project || 'Unknown Contractor';
    if (contractor === 'Larsen and Toubro') contractor = 'L&T';
    if (contractor === 'BSCPL Infrastructure Ltd') contractor = 'BSCPL';
    if (contractor === 'SPCL') contractor = 'SPC';
    return {
      id: `camp-${idx}`,
      name: c.name,
      contractor: contractor,
      site: c.site,
      workers: c.workers,
      capacity: c.workers + 50
    };
  });

const dashboardData = {
  vehicleStats: {
    total: 1240,
    active: 1120,
    equipmentStatus: { Fit: 850, NeedsRepair: 290, Grounded: 100 },
    inspectionStatus: { Passed: 920, Failed: 180, Pending: 140 },
    ownership: { Own: 450, Rented: 790 },
    approvalStatus: { Approved: 980, Rejected: 110, Pending: 150 }
  },
  medicalTestBreakdown: medicalTestBreakdownArr,
  medicalGenderBreakdown: { male: medicalMale, female: medicalFemale },
  trainingStatusBreakdown: trainingStatusBreakdownArr,
  trainingGenderBreakdown: { male: trainingMale, female: trainingFemale },
  campsPerContractor,
  workforcePerCamp
};

fs.writeFileSync('./public/dashboard-data.json', JSON.stringify(dashboardData, null, 2));
console.log('Written to public/dashboard-data.json');
