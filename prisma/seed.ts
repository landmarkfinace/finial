// Seed CLI: Landmark Inter Gulf — realistic demo data
// Run: bun prisma/seed.ts   (or bun run db:seed)
// The actual data generation lives in src/lib/seed-data.ts (shared with /api/bootstrap).
import { PrismaClient } from '@prisma/client'
import { runSeed } from '../src/lib/seed-data'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Landmark Inter Gulf demo data...')
  const summary = await runSeed(db)
  console.log(
    `✅ Seed complete: ${summary.projects} projects, ${summary.staffCategories} categories, ` +
    `${summary.staff} staff, ${summary.payrolls} payrolls (${summary.paidPayrolls} paid), ` +
    `${summary.attendance} attendance, ${summary.transactions} transactions, ` +
    `${summary.roles} roles + ${summary.users} users.`
  )
  console.log('   Login: admin@example.com / password')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
