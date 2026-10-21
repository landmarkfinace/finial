// One-time migration helper: derive expenseMonth/expenseYear from transactionDate
// for pre-existing expense rows (run after the schema push that added the columns).
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const txs = await db.transaction.findMany({
    where: { type: 'expense', expenseYear: null },
    select: { id: true, transactionDate: true },
  })
  let n = 0
  for (const t of txs) {
    await db.transaction.update({
      where: { id: t.id },
      data: {
        expenseMonth: t.transactionDate.getMonth() + 1,
        expenseYear: t.transactionDate.getFullYear(),
      },
    })
    n++
  }
  console.log(`Backfilled ${n} expense transactions with month/year from their dates`)
}
main().finally(() => db.$disconnect())
