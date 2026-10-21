// One-off backfill: add the authorized-signatory settings rows to the LIVE
// database (non-destructive — upsert only, no wipe).
// Run: bun scripts/add-signatory.ts
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  await db.setting.upsert({
    where: { key: 'authorizedSignatory' },
    update: { value: 'Faisal Al-Otaibi' },
    create: { key: 'authorizedSignatory', value: 'Faisal Al-Otaibi' },
  })
  await db.setting.upsert({
    where: { key: 'signatoryTitle' },
    update: { value: 'Finance Manager' },
    create: { key: 'signatoryTitle', value: 'Finance Manager' },
  })
  const rows = await db.setting.findMany({
    where: { key: { in: ['authorizedSignatory', 'signatoryTitle'] } },
  })
  console.log('Signatory settings:', rows)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
