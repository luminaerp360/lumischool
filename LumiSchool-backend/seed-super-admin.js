require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SUPER_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@lumischool.co.ke";
const SUPER_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD || "LumiSchool@2026";
const SUPER_ADMIN_FIRST_NAME = process.env.DEFAULT_ADMIN_FIRST_NAME || "Super";
const SUPER_ADMIN_LAST_NAME = process.env.DEFAULT_ADMIN_LAST_NAME || "Admin";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const userSchema = new mongoose.Schema(
    {},
    { strict: false, collection: "users" },
  );
  const User = mongoose.model("SuperAdminSeed", userSchema);

  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log("Super admin already exists.");
    console.log("  Email:   ", SUPER_ADMIN_EMAIL);
    console.log("  Password:", SUPER_ADMIN_PASSWORD);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  await User.create({
    firstName: SUPER_ADMIN_FIRST_NAME,
    lastName: SUPER_ADMIN_LAST_NAME,
    email: SUPER_ADMIN_EMAIL,
    passwordHash,
    role: "SUPER_ADMIN",
    tenantId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("LumiSchool Super Admin created successfully!");
  console.log("  Email:   ", SUPER_ADMIN_EMAIL);
  console.log("  Password:", SUPER_ADMIN_PASSWORD);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
