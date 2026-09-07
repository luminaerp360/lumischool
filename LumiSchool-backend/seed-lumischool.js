/**
 * LumiSchool Database Seed Script
 *
 * Seeds: Super Admin, Demo Tenant (school), School Admin, Teachers,
 *        Classes, Streams, Students, Guardians, Subjects
 *
 * Run: node seed-lumischool.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGODB_URI = process.env.MONGODB_URI;

// ── Schema helpers (strict: false lets us insert any fields) ──
const makeModel = (name, collection) =>
  mongoose.model(
    name,
    new mongoose.Schema({}, { strict: false, timestamps: true, collection }),
  );

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const User = makeModel("SeedUser", "users");
  const Tenant = makeModel("SeedTenant", "tenants");
  const Student = makeModel("SeedStudent", "students");
  const Guardian = makeModel("SeedGuardian", "guardians");
  const Class = makeModel("SeedClass", "classes");
  const Stream = makeModel("SeedStream", "streams");
  const Subject = makeModel("SeedSubject", "subjects");

  // ─────────────────────────────────────────────
  // 1. SUPER ADMIN
  // ─────────────────────────────────────────────
  const adminEmail = "admin@lumischool.co.ke";
  const adminPassword = "LumiSchool@2026";
  let superAdmin = await User.findOne({ email: adminEmail });
  if (!superAdmin) {
    superAdmin = await User.create({
      firstName: "Super",
      lastName: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
      tenantId: null,
      isActive: true,
    });
    console.log("👤 Super Admin created");
  } else {
    console.log("👤 Super Admin already exists");
  }
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}\n`);

  // ─────────────────────────────────────────────
  // 2. DEMO TENANT (SCHOOL)
  // ─────────────────────────────────────────────
  const tenantSlug = "greenfield-academy";
  let tenant = await Tenant.findOne({ slug: tenantSlug });
  if (!tenant) {
    tenant = await Tenant.create({
      name: "Greenfield Academy",
      slug: tenantSlug,
      schoolType: "MIXED",
      county: "Nairobi",
      subCounty: "Westlands",
      address: "P.O. Box 12345-00100, Nairobi",
      phone: "+254712345678",
      email: "info@greenfieldacademy.co.ke",
      subscriptionPlan: "PROFESSIONAL",
      subscriptionExpiresAt: new Date("2027-12-31"),
      isActive: true,
      settings: {
        smsProvider: "AFRICASTALKING",
        enableRanking: true,
        enableBoarding: true,
        enableTransport: false,
        academicYear: "2026",
        currentTerm: "TERM_1",
      },
    });
    console.log("🏫 Demo Tenant created: Greenfield Academy");
  } else {
    console.log("🏫 Demo Tenant already exists: Greenfield Academy");
  }
  const tenantId = tenant._id;

  // ─────────────────────────────────────────────
  // 3. SCHOOL ADMIN + TEACHERS
  // ─────────────────────────────────────────────
  const schoolAdminEmail = "principal@greenfieldacademy.co.ke";
  const staffPassword = "Staff@2026";
  let schoolAdmin = await User.findOne({ email: schoolAdminEmail, tenantId });
  if (!schoolAdmin) {
    schoolAdmin = await User.create({
      firstName: "Margaret",
      lastName: "Wanjiku",
      email: schoolAdminEmail,
      passwordHash: await bcrypt.hash(staffPassword, 12),
      role: "SCHOOL_ADMIN",
      tenantId,
      isActive: true,
      phone: "+254722111222",
    });
    console.log("👩‍💼 School Admin created: Margaret Wanjiku");
  } else {
    console.log("👩‍💼 School Admin already exists");
  }

  const teacherData = [
    {
      firstName: "James",
      lastName: "Ochieng",
      email: "j.ochieng@greenfieldacademy.co.ke",
      phone: "+254733111001",
      role: "TEACHER",
    },
    {
      firstName: "Faith",
      lastName: "Muthoni",
      email: "f.muthoni@greenfieldacademy.co.ke",
      phone: "+254733111002",
      role: "TEACHER",
    },
    {
      firstName: "Peter",
      lastName: "Kamau",
      email: "p.kamau@greenfieldacademy.co.ke",
      phone: "+254733111003",
      role: "TEACHER",
    },
    {
      firstName: "Sarah",
      lastName: "Akinyi",
      email: "s.akinyi@greenfieldacademy.co.ke",
      phone: "+254733111004",
      role: "TEACHER",
    },
    {
      firstName: "David",
      lastName: "Kipchoge",
      email: "d.kipchoge@greenfieldacademy.co.ke",
      phone: "+254733111005",
      role: "TEACHER",
    },
    {
      firstName: "John",
      lastName: "Mwangi",
      email: "j.mwangi@greenfieldacademy.co.ke",
      phone: "+254733111006",
      role: "BURSAR",
    },
  ];

  const teachers = [];
  for (const t of teacherData) {
    let user = await User.findOne({ email: t.email, tenantId });
    if (!user) {
      user = await User.create({
        ...t,
        passwordHash: await bcrypt.hash(staffPassword, 12),
        tenantId,
        isActive: true,
      });
    }
    teachers.push(user);
  }
  console.log(`👨‍🏫 ${teachers.length} staff members ready`);
  console.log(`   Staff password: ${staffPassword}\n`);

  // ─────────────────────────────────────────────
  // 4. SUBJECTS
  // ─────────────────────────────────────────────
  const subjectData = [
    {
      name: "Mathematics",
      code: "MATH",
      category: "CORE",
      applicableLevels: ["PRIMARY", "JSS", "SENIOR"],
    },
    {
      name: "English",
      code: "ENG",
      category: "CORE",
      applicableLevels: ["PRIMARY", "JSS", "SENIOR"],
    },
    {
      name: "Kiswahili",
      code: "KIS",
      category: "CORE",
      applicableLevels: ["PRIMARY", "JSS", "SENIOR"],
    },
    {
      name: "Science",
      code: "SCI",
      category: "CORE",
      applicableLevels: ["PRIMARY"],
    },
    {
      name: "Social Studies",
      code: "SOC",
      category: "CORE",
      applicableLevels: ["PRIMARY"],
    },
    {
      name: "Biology",
      code: "BIO",
      category: "CORE",
      applicableLevels: ["JSS", "SENIOR"],
    },
    {
      name: "Chemistry",
      code: "CHEM",
      category: "CORE",
      applicableLevels: ["JSS", "SENIOR"],
    },
    {
      name: "Physics",
      code: "PHY",
      category: "CORE",
      applicableLevels: ["JSS", "SENIOR"],
    },
    {
      name: "History",
      code: "HIS",
      category: "ELECTIVE",
      applicableLevels: ["JSS", "SENIOR"],
    },
    {
      name: "Geography",
      code: "GEO",
      category: "ELECTIVE",
      applicableLevels: ["JSS", "SENIOR"],
    },
    {
      name: "Computer Science",
      code: "CS",
      category: "ELECTIVE",
      applicableLevels: ["JSS", "SENIOR"],
    },
    {
      name: "CRE",
      code: "CRE",
      category: "ELECTIVE",
      applicableLevels: ["PRIMARY", "JSS", "SENIOR"],
    },
    {
      name: "Physical Education",
      code: "PE",
      category: "CO_CURRICULAR",
      applicableLevels: ["PRIMARY", "JSS", "SENIOR"],
    },
    {
      name: "Art & Craft",
      code: "ART",
      category: "CO_CURRICULAR",
      applicableLevels: ["PRIMARY", "JSS"],
    },
  ];

  const subjects = [];
  for (const s of subjectData) {
    let subj = await Subject.findOne({ tenantId, code: s.code });
    if (!subj) {
      subj = await Subject.create({ ...s, tenantId, isActive: true });
    }
    subjects.push(subj);
  }
  console.log(`📚 ${subjects.length} subjects ready`);

  // ─────────────────────────────────────────────
  // 5. CLASSES & STREAMS
  // ─────────────────────────────────────────────
  const classData = [
    { name: "Grade 4", level: "PRIMARY", grade: 4, academicYear: "2026" },
    { name: "Grade 5", level: "PRIMARY", grade: 5, academicYear: "2026" },
    { name: "Grade 6", level: "PRIMARY", grade: 6, academicYear: "2026" },
    { name: "Grade 7", level: "JSS", grade: 7, academicYear: "2026" },
    { name: "Grade 8", level: "JSS", grade: 8, academicYear: "2026" },
    { name: "Grade 9", level: "JSS", grade: 9, academicYear: "2026" },
  ];

  const streamNames = ["East", "West"];
  const classes = [];

  for (let i = 0; i < classData.length; i++) {
    const cd = classData[i];
    let cls = await Class.findOne({
      tenantId,
      name: cd.name,
      academicYear: cd.academicYear,
    });
    if (!cls) {
      cls = await Class.create({
        ...cd,
        tenantId,
        classTeacherId: teachers[i % teachers.length]._id,
        capacity: 80,
        isActive: true,
        streamIds: [],
      });
    }

    const classStreams = [];
    for (const sn of streamNames) {
      let stream = await Stream.findOne({
        tenantId,
        classId: cls._id,
        name: sn,
      });
      if (!stream) {
        stream = await Stream.create({
          tenantId,
          classId: cls._id,
          name: sn,
          streamTeacherId: teachers[(i + 1) % teachers.length]._id,
          capacity: 40,
          isActive: true,
        });
      }
      classStreams.push(stream);
    }

    // Update class with stream references
    await Class.updateOne(
      { _id: cls._id },
      { $set: { streamIds: classStreams.map((s) => s._id) } },
    );

    classes.push({ cls, streams: classStreams });
  }
  console.log(
    `🏛️  ${classes.length} classes with ${streamNames.length} streams each`,
  );

  // ─────────────────────────────────────────────
  // 6. GUARDIANS
  // ─────────────────────────────────────────────
  const guardianData = [
    {
      firstName: "Joseph",
      lastName: "Maina",
      phone: "+254711100001",
      email: "j.maina@gmail.com",
      idNumber: "12345678",
      relationship: "FATHER",
      occupation: "Engineer",
      county: "Nairobi",
    },
    {
      firstName: "Grace",
      lastName: "Maina",
      phone: "+254711100002",
      email: "g.maina@gmail.com",
      idNumber: "12345679",
      relationship: "MOTHER",
      occupation: "Teacher",
      county: "Nairobi",
    },
    {
      firstName: "Michael",
      lastName: "Otieno",
      phone: "+254711100003",
      email: "m.otieno@gmail.com",
      idNumber: "22345678",
      relationship: "FATHER",
      occupation: "Banker",
      county: "Nairobi",
    },
    {
      firstName: "Lucy",
      lastName: "Otieno",
      phone: "+254711100004",
      email: "l.otieno@gmail.com",
      idNumber: "22345679",
      relationship: "MOTHER",
      occupation: "Nurse",
      county: "Nairobi",
    },
    {
      firstName: "Paul",
      lastName: "Njoroge",
      phone: "+254711100005",
      email: "p.njoroge@gmail.com",
      idNumber: "32345678",
      relationship: "FATHER",
      occupation: "Doctor",
      county: "Kiambu",
    },
    {
      firstName: "Mary",
      lastName: "Wambui",
      phone: "+254711100006",
      email: "m.wambui@gmail.com",
      idNumber: "42345678",
      relationship: "GUARDIAN",
      occupation: "Business",
      county: "Nairobi",
    },
    {
      firstName: "Daniel",
      lastName: "Kiprop",
      phone: "+254711100007",
      email: "d.kiprop@gmail.com",
      idNumber: "52345678",
      relationship: "FATHER",
      occupation: "Lawyer",
      county: "Uasin Gishu",
    },
    {
      firstName: "Elizabeth",
      lastName: "Wangari",
      phone: "+254711100008",
      email: "e.wangari@gmail.com",
      idNumber: "62345678",
      relationship: "MOTHER",
      occupation: "Pharmacist",
      county: "Nairobi",
    },
  ];

  const guardians = [];
  for (const g of guardianData) {
    let guardian = await Guardian.findOne({ tenantId, phone: g.phone });
    if (!guardian) {
      guardian = await Guardian.create({
        ...g,
        tenantId,
        isPrimaryGuardian: true,
        studentIds: [],
      });
    }
    guardians.push(guardian);
  }
  console.log(`👨‍👩‍👧 ${guardians.length} guardians ready`);

  // ─────────────────────────────────────────────
  // 7. STUDENTS
  // ─────────────────────────────────────────────
  const firstNames = {
    MALE: [
      "Brian",
      "Kevin",
      "Dennis",
      "Victor",
      "Alex",
      "Ian",
      "Ryan",
      "Emmanuel",
      "Collins",
      "Felix",
      "Mark",
      "Samuel",
    ],
    FEMALE: [
      "Sharon",
      "Mercy",
      "Joy",
      "Esther",
      "Angela",
      "Catherine",
      "Diana",
      "Florence",
      "Hannah",
      "Irene",
      "Janet",
      "Lydia",
    ],
  };
  const lastNames = [
    "Maina",
    "Otieno",
    "Njoroge",
    "Kamau",
    "Odhiambo",
    "Wafula",
    "Kiprop",
    "Mutua",
    "Ndung'u",
    "Chebet",
    "Wangari",
    "Achieng",
  ];

  let studentCount = 0;
  let admissionCounter = 1;

  for (const { cls, streams } of classes) {
    for (const stream of streams) {
      // 8 students per stream
      for (let s = 0; s < 8; s++) {
        const gender = s % 2 === 0 ? "MALE" : "FEMALE";
        const fn = firstNames[gender][s % firstNames[gender].length];
        const ln = lastNames[(admissionCounter - 1) % lastNames.length];
        const admNo = `GFA/2026/${String(admissionCounter).padStart(4, "0")}`;

        let student = await Student.findOne({
          tenantId,
          admissionNumber: admNo,
        });
        if (!student) {
          const guardianIdx = (admissionCounter - 1) % guardians.length;
          student = await Student.create({
            tenantId,
            admissionNumber: admNo,
            upiNumber: `UPI${String(admissionCounter).padStart(6, "0")}`,
            firstName: fn,
            lastName: ln,
            gender,
            dateOfBirth: new Date(
              2026 - (cls.grade + 6),
              admissionCounter % 12,
              10,
            ),
            currentLevel: cls.level,
            currentGrade: cls.grade,
            currentClassId: cls._id,
            currentStreamId: stream._id,
            boardingStatus: s < 2 ? "BOARDER" : "DAY_SCHOLAR",
            status: "ACTIVE",
            guardianIds: [guardians[guardianIdx]._id],
            admissionDate: new Date("2026-01-06"),
            medicalInfo: {
              bloodGroup: ["A+", "B+", "O+", "AB+"][s % 4],
              allergies: "",
              conditions: "",
            },
          });

          // Link student to guardian
          await Guardian.updateOne(
            { _id: guardians[guardianIdx]._id },
            { $addToSet: { studentIds: student._id } },
          );
        }
        studentCount++;
        admissionCounter++;
      }
    }
  }
  console.log(`🎓 ${studentCount} students ready`);

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  console.log("  LumiSchool Database Seeded Successfully!");
  console.log("═══════════════════════════════════════════");
  console.log(`  Database:     lumischool`);
  console.log(`  Tenant:       Greenfield Academy (${tenantSlug})`);
  console.log(`  Super Admin:  ${adminEmail} / ${adminPassword}`);
  console.log(`  School Admin: ${schoolAdminEmail} / ${staffPassword}`);
  console.log(
    `  Teachers:     5 teachers + 1 bursar (password: ${staffPassword})`,
  );
  console.log(`  Classes:      ${classes.length} (Grade 4–9)`);
  console.log(
    `  Streams:      ${classes.length * streamNames.length} (East & West per class)`,
  );
  console.log(`  Students:     ${studentCount}`);
  console.log(`  Guardians:    ${guardians.length}`);
  console.log(`  Subjects:     ${subjects.length}`);
  console.log("═══════════════════════════════════════════\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
