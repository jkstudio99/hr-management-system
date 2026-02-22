// ─────────────────────────────────────────────────────────────────────────────
// Prisma Seed Script
// ─────────────────────────────────────────────────────────────────────────────
// Seeds the database with:
//   1. Default roles      : ADMIN, HR, EMPLOYEE
//   2. Root admin user    : admin / password (bcrypt-hashed)
//   3. Sample departments : Engineering, Human Resources, Finance, Marketing
//   4. Sample job titles  : Software Engineer, HR Manager, Accountant, etc.
//
// Usage:  npx prisma db seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** BCrypt cost factor — 12 rounds is the industry-recommended minimum. */
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Idempotent seed function — safe to run multiple times.
 * Uses `upsert` to avoid duplicate-key errors on re-runs.
 */
async function main(): Promise<void> {
  console.log('🌱 Seeding database...\n');

  // ── 1. Roles ────────────────────────────────────────────────────────────
  const roles = ['ADMIN', 'HR', 'EMPLOYEE'] as const;

  const createdRoles = await Promise.all(
    roles.map((roleName) =>
      prisma.role.upsert({
        where: { roleName },
        update: {},
        create: { roleName },
      }),
    ),
  );

  const adminRole = createdRoles.find((r) => r.roleName === 'ADMIN')!;
  console.log(`✅ Roles seeded: ${roles.join(', ')}`);

  // ── 2. Root Admin User ──────────────────────────────────────────────────
  const adminUsername = 'admin';
  const adminPassword = 'password';
  const hashedPassword = await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash: hashedPassword,
      role: { connect: { id: adminRole.id } },
    },
    create: {
      username: adminUsername,
      passwordHash: hashedPassword,
      email: 'admin@hrms.local',
      isActive: true,
      roleId: adminRole.id,
    },
  });

  console.log(
    `✅ Root admin user seeded: "${adminUsername}" (password: "${adminPassword}")`,
  );

  // ── 3. Departments ─────────────────────────────────────────────────────
  const departments = [
    'Engineering',
    'Human Resources',
    'Finance',
    'Marketing',
    'Operations',
  ];

  await Promise.all(
    departments.map((departmentName) =>
      prisma.department.upsert({
        where: { departmentName },
        update: {},
        create: { departmentName },
      }),
    ),
  );

  console.log(`✅ Departments seeded: ${departments.join(', ')}`);

  // ── 4. Job Titles ──────────────────────────────────────────────────────
  const jobTitles = [
    'Software Engineer',
    'HR Manager',
    'Accountant',
    'Marketing Specialist',
    'Operations Manager',
    'Senior Developer',
    'Junior Developer',
  ];

  await Promise.all(
    jobTitles.map((titleName) =>
      prisma.jobTitle.upsert({
        where: { titleName },
        update: {},
        create: { titleName },
      }),
    ),
  );

  console.log(`✅ Job titles seeded: ${jobTitles.join(', ')}`);

  console.log('\n🎉 Database seeding completed successfully!');
}

// ── Execute & Cleanup ──────────────────────────────────────────────────────
main()
  .catch((error: Error) => {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
