// One-off (R9): insert demo login events into the activity log (mirrors seed.ts).
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany({ select: { id: true, name: true }, orderBy: { createdAt: 'asc' } })
  if (users.length === 0) throw new Error('No users found')
  const now = Date.now()
  let added = 0
  for (let d = 5; d >= 1; d--) {
    const u = users[d % users.length]
    const exists = await db.activityLog.findFirst({
      where: { userId: u.id, action: 'login', module: 'user', description: `${u.name} signed in` },
    })
    if (exists) continue
    await db.activityLog.create({
      data: {
        userId: u.id,
        userName: u.name,
        action: 'login',
        module: 'user',
        description: `${u.name} signed in`,
        createdAt: new Date(now - d * 86_400_000 - ((d * 3 + 1) % 8) * 3_600_000),
      },
    })
    added++
  }
  console.log(`Inserted ${added} login events.`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
