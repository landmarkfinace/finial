// One-off backfill: set iqama/passport expiry for existing staff (R9 feature).
// Deterministic by index: i % 10 === 0 → expired, i % 10 === 1 (or i === 2) → expiring ≤90d, rest valid.
// Run: bun run scripts/backfill-expiry.ts  (redistributes ALL staff — idempotent by design)
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const DAY = 24 * 60 * 60 * 1000

async function main() {
  const staff = await db.staff.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, fullName: true },
  })
  let expired = 0
  let soon = 0
  let valid = 0
  for (let i = 0; i < staff.length; i += 1) {
    const s = staff[i]
    const m = i % 10
    let iqamaDays: number
    if (m === 0) {
      iqamaDays = -(12 + i * 6) // expired 12–246 days ago
      expired += 1
    } else if (m === 1 || i === 2) {
      iqamaDays = 14 + i // 15–53 days out → inside the 90-day alert window
      soon += 1
    } else {
      iqamaDays = 180 + m * 40 + i // 254–459 days out
      valid += 1
    }
    const iqamaExpiry = new Date(Date.now() + iqamaDays * DAY)
    // Passports generally expire later than iqamas (5–10 yr documents)
    const passportDays = iqamaDays < 0 ? 300 + i * 7 : iqamaDays + 400 + (i % 5) * 90
    const passportExpiry = new Date(Date.now() + Math.min(passportDays, 1500) * DAY)
    await db.staff.update({
      where: { id: s.id },
      data: { iqamaExpiry, passportExpiry },
    })
  }
  console.log(`Distributed ${staff.length} staff (expired=${expired}, soon=${soon}, valid=${valid}).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
