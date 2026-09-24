const env = require('../config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

// DEMO ONLY: shared password for seeded demo accounts.
const DEMO_PASSWORD = 'Educare@123';

const USERS = [
  { name: 'Meera Manager', email: 'manager@educare.test', role: ROLES.MANAGER, department: 'Administration' },
  { name: 'Sanjay Staff', email: 'staff1@educare.test', role: ROLES.STAFF, department: 'Student Affairs' },
  { name: 'Priya Staff', email: 'staff2@educare.test', role: ROLES.STAFF, department: 'Accounts' },
  { name: 'Arun Student', email: 'student1@educare.test', role: ROLES.STUDENT, department: 'CSE' },
  { name: 'Divya Student', email: 'student2@educare.test', role: ROLES.STUDENT, department: 'ECE' },
];

async function seed() {
  if (env.isProduction) {
    console.error('[seed] Refusing to seed demo users in production.');
    process.exit(1);
  }

  await connectDB();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`[seed] skipped (already exists): ${u.email}`);
      continue;
    }
    await User.create({ ...u, passwordHash });
    console.log(`[seed] created ${u.role}: ${u.email}`);
  }

  await mongoose.connection.close();
  console.log('[seed] done');
}

seed().catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});