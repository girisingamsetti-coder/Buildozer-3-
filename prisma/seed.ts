import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seed() {
  console.log('Clearing database...')
  // Clear tables to prevent unique constraint errors during re-seeding
  await db.medicalRecord.deleteMany()
  await db.trainingRecord.deleteMany()
  await db.incidentWorker.deleteMany()
  await db.incidentFollowUp.deleteMany()
  await db.incident.deleteMany()
  await db.grievance.deleteMany()
  await db.vehicleDocument.deleteMany()
  await db.vehicle.deleteMany()
  await db.hazardousMaterial.deleteMany()
  await db.legalCompliance.deleteMany()
  await db.workerFitness.deleteMany()
  await db.worker.deleteMany()

  // --- Contractors ---
  const contractors = [
    { name: 'BSR', code: 'BSR' },
    { name: 'NCC', code: 'NCC' },
    { name: 'L&T', code: 'LNT' },
    { name: 'MEIL', code: 'MEIL' },
    { name: 'RVR', code: 'RVR' },
  ]

  for (const c of contractors) {
    await db.contractor.upsert({
      where: { code: c.code },
      update: { name: c.name },
      create: { name: c.name, code: c.code },
    })
  }

  // --- Sites (Projects) ---
  const sites = [
    { name: 'Assembly', code: 'ASM' },
    { name: 'High Court', code: 'HC' },
    { name: 'GAD Tower', code: 'GAD' },
    { name: 'Zone 7', code: 'Z7' },
    { name: 'Zone 9', code: 'Z9' },
    { name: 'E3 Phase 1', code: 'E3P1' },
    { name: 'E5 Road', code: 'E5R' },
    { name: 'N5', code: 'N5' },
    { name: 'N13', code: 'N13' },
  ]

  for (const s of sites) {
    await db.site.upsert({
      where: { code: s.code },
      update: { name: s.name },
      create: { name: s.name, code: s.code },
    })
  }

  // --- Labour Camps ---
  const allContractors = await db.contractor.findMany()
  const allSites = await db.site.findMany()

  for (const contractor of allContractors) {
    for (const site of allSites) {
      const campName = `${contractor.code} Camp ${site.name}`
      await db.labourCamp.upsert({
        where: { id: `camp-${contractor.code.toLowerCase()}-${site.code.toLowerCase()}` },
        update: {},
        create: {
          id: `camp-${contractor.code.toLowerCase()}-${site.code.toLowerCase()}`,
          name: campName,
          contractorId: contractor.id,
          siteId: site.id,
          capacity: 50 + Math.floor(Math.random() * 200),
          currentOccupancy: Math.floor(Math.random() * 80),
        },
      })
    }
  }

  // --- Designations ---
  const designations = [
    'Mason', 'Electrician', 'Rigger', 'Plumber', 'Carpenter',
    'Welder', 'Painter', 'Fitter', 'Helper', 'Supervisor',
    'Safety Officer', 'Crane Operator', 'JCB Operator', 'Dumper Driver',
    'Steel Fixer', 'Bar Bender', 'Shuttering Carpenter', 'Concreting Worker',
    'Surveyor', 'QC Inspector', 'Site Engineer', 'Foreman',
  ]

  for (const name of designations) {
    await db.designation.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  const allDesignations = await db.designation.findMany()

  // --- Workers (Generate 100) ---
  console.log('Generating workers...')
  const names = ['Amit', 'Rahul', 'Suresh', 'Ramesh', 'Prakash', 'Vijay', 'Sanjay', 'Rajesh', 'Manoj', 'Deepak', 'Arun', 'Raju', 'Kamal', 'Babu', 'Vinod', 'Anil', 'Sunil', 'Gopal', 'Naresh', 'Hari']
  const surnames = ['Kumar', 'Singh', 'Sharma', 'Verma', 'Patel', 'Yadav', 'Das', 'Gupta', 'Prasad', 'Rao', 'Reddy', 'Chauhan', 'Nath', 'Mishra']
  
  const workers = []
  for (let i = 1; i <= 100; i++) {
    const c = allContractors[i % allContractors.length]
    const s = allSites[i % allSites.length]
    const d = allDesignations[i % allDesignations.length]
    const camp = await db.labourCamp.findFirst({ where: { contractorId: c.id, siteId: s.id } })

    const w = await db.worker.create({
      data: {
        employeeNumber: `APCRDA-${2000 + i}`,
        fullName: `${names[i % names.length]} ${surnames[i % surnames.length]}`,
        dateOfBirth: new Date(1980 + (i % 20), (i % 12), (i % 28) + 1),
        age: 30 + (i % 15),
        gender: 'Male',
        aadhaarNumber: `1234567890${(i % 100).toString().padStart(2, '0')}`,
        permanentAddress: 'Village Post, District, State',
        bloodGroup: ['O+', 'A+', 'B+', 'AB+'][i % 4],
        qualification: '10th',
        designationId: d.id,
        contractorId: c.id,
        siteId: s.id,
        labourCampId: camp?.id,
        policeRecords: i % 3 === 0 ? 'Updated' : 'Not Updated',
        isActive: i % 10 !== 0,
      }
    })
    workers.push(w)
  }

  // --- Medical Records (Generate 50) ---
  console.log('Generating medical records...')
  for (let i = 0; i < 50; i++) {
    await db.medicalRecord.create({
      data: {
        workerId: workers[i].id,
        examinationDate: new Date(),
        examinationType: i % 2 === 0 ? 'PreEmployment' : 'Periodic',
        examiningDoctor: 'Dr. Sharma',
        result: i % 10 === 0 ? 'Unfit' : 'Fit',
      }
    })
  }

  // --- Training Records (Generate 50) ---
  console.log('Generating training records...')
  for (let i = 0; i < 50; i++) {
    await db.trainingRecord.create({
      data: {
        workerId: workers[i + 20].id,
        trainingType: 'SafetyInduction',
        trainingTitle: 'Site Safety Rules & Hazards',
        dateConducted: new Date(),
        durationHours: 2,
        trainerName: 'Safety Officer Ramesh',
        status: 'Valid',
        isCompleted: true,
      }
    })
  }

  // --- Vehicles (Generate 50) ---
  console.log('Generating vehicles...')
  for (let i = 1; i <= 50; i++) {
    const c = allContractors[i % allContractors.length]
    await db.vehicle.create({
      data: {
        vehicleNumber: `AP${(10 + (i%20))}X${1000 + i}`,
        vehicleType: ['Dumper', 'JCB', 'Crane', 'Transit Mixer', 'Excavator'][i % 5],
        owner: i % 3 === 0 ? 'Rented' : 'Contractor',
        condition: i % 8 === 0 ? 'NeedsRepair' : 'Fit',
        contractorId: c.id,
        siteId: allSites[i % allSites.length].id,
      }
    })
  }

  // --- Incidents (Generate 30) ---
  console.log('Generating incidents...')
  for (let i = 1; i <= 30; i++) {
    const s = allSites[i % allSites.length]
    const inc = await db.incident.create({
      data: {
        incidentNumber: `INC-${1000 + i}`,
        incidentType: ['MinorInjury', 'FireInjury', 'PropertyDamage', 'NearMiss'][i % 4],
        date: new Date(Date.now() - i * 86400000),
        description: `Worker slipped and fell during material handling.`,
        severity: ['Low', 'Medium', 'High', 'Critical'][i % 4],
        status: i % 3 === 0 ? 'Closed' : 'Open',
        siteId: s.id,
        contractorId: allContractors[i % allContractors.length].id,
      }
    })
    await db.incidentWorker.create({
      data: {
        incidentId: inc.id,
        workerId: workers[i].id,
        workerName: workers[i].fullName,
      }
    })
  }

  // --- Grievances (Generate 30) ---
  console.log('Generating grievances...')
  for (let i = 1; i <= 30; i++) {
    await db.grievance.create({
      data: {
        grievanceNumber: `GRV-${2000 + i}`,
        raisedBy: workers[i].id,
        raisedByName: workers[i].fullName,
        category: ['Wage', 'Safety', 'Facility', 'Harassment'][i % 4],
        description: `Delay in wage payment for the last month.`,
        severity: 'Medium',
        status: i % 2 === 0 ? 'Resolved' : 'Open',
      }
    })
  }

  // --- Hazardous Materials (Generate 20) ---
  console.log('Generating hazardous materials...')
  for (let i = 1; i <= 20; i++) {
    await db.hazardousMaterial.create({
      data: {
        materialName: ['Diesel', 'Paint Thinner', 'Acetylene Gas', 'Oxygen Cylinders', 'Cleaning Acid'][i % 5],
        category: 'Hazardous',
        hazardClassification: ['Flammable', 'Toxic', 'Corrosive'][i % 3],
        quantityCurrent: 100 + i * 10,
        unit: 'Liters',
        siteId: allSites[i % allSites.length].id,
      }
    })
  }

  // --- Legal Compliance (Generate 20) ---
  console.log('Generating legal compliances...')
  for (let i = 1; i <= 20; i++) {
    await db.legalCompliance.create({
      data: {
        documentName: ['Labour License', 'BOCW Registration', 'PF Registration', 'ESI Registration'][i % 4],
        category: 'Statutory',
        status: i % 5 === 0 ? 'Expired' : 'Valid',
        expiryDate: new Date(Date.now() + i * 30 * 86400000),
        contractorId: allContractors[i % allContractors.length].id,
      }
    })
  }

  // --- System Users ---
  await db.systemUser.upsert({
    where: { username: 'admin' },
    update: { role: 'ADMIN', fullName: 'Admin' },
    create: {
      username: 'admin',
      password: 'admin123',
      fullName: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Seed complete')
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
