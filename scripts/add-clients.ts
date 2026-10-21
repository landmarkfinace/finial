// One-off backfill: insert demo clients into the LIVE database and link the
// existing projects to them (non-destructive — no wipe, preserves all rows).
// Also grants the new `clients.*` permissions to the existing seeded roles.
// Run: bun scripts/add-clients.ts
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

type ClientSeed = {
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  city: string
  crNumber: string
  status: string
  notes: string | null
  /** Substrings of existing project names to link to this client */
  projectMatches: string[]
}

const CLIENTS: ClientSeed[] = [
  {
    name: 'Gulf Crescent Contracting Co.',
    contactPerson: 'Bandar Al-Suwailem',
    phone: '+966 11 461 7300',
    email: 'projects@gulfcrescent.sa',
    address: 'King Fahd Road, Al Olaya District',
    city: 'Riyadh',
    crNumber: '1010234781',
    status: 'active',
    notes: 'Preferred client — quarterly manpower contracts since 2022.',
    projectMatches: ['Riyadh Metro'],
  },
  {
    name: 'Eastern Province Industrial Services',
    contactPerson: 'Nasser Al-Dosari',
    phone: '+966 13 812 4460',
    email: 'nasser.dosari@epis.com.sa',
    address: '1st Industrial Street, 2nd Industrial City',
    city: 'Dammam',
    crNumber: '2050188364',
    status: 'active',
    notes: null,
    projectMatches: ['Aramco Rig'],
  },
  {
    name: 'Al Waha Engineering Group',
    contactPerson: 'Rami Haddad',
    phone: '+966 13 959 2011',
    email: 'rami@alwahaeng.com',
    address: 'Jubail Industrial City, Madinat Al Jubail',
    city: 'Jubail',
    crNumber: '2050229177',
    status: 'active',
    notes: 'Requires monthly QHSE compliance reports with invoices.',
    projectMatches: ['SABIC'],
  },
  {
    name: 'Red Sea Marine & Contracting',
    contactPerson: 'Yousef Al-Ghamdi',
    phone: '+966 17 722 8654',
    email: 'y.ghamdi@redseamarine.sa',
    address: 'Corniche Road, Al Baghdadiyah Al Gharbiyah',
    city: 'Jeddah',
    crNumber: '4030115620',
    status: 'active',
    notes: null,
    projectMatches: ['Jazan', 'Yanbu'],
  },
  {
    name: 'Tabuk Northern Partners',
    contactPerson: 'Majed Al-Balawi',
    phone: '+966 14 423 9087',
    email: 'majed@tnp.sa',
    address: 'Prince Sultan Road, Tabuk 71411',
    city: 'Tabuk',
    crNumber: '4040997325',
    status: 'inactive',
    notes: 'NEOM-related framework agreement on hold pending scope revision.',
    projectMatches: ['NEOM'],
  },
  {
    name: 'Jeddah Coastal Facilities Management',
    contactPerson: 'Omar Shalabi',
    phone: '+966 12 651 3390',
    email: 'omar.shalabi@jcfm.sa',
    address: 'Al Andalus District, Ibrahim Al Angari Street',
    city: 'Jeddah',
    crNumber: '4030448173',
    status: 'active',
    notes: 'Prospective client for facilities maintenance crews.',
    projectMatches: [],
  },
]

/** Existing seeded roles → clients permissions to grant (mirrors seed-data.ts) */
const ROLE_GRANTS: { role: string; perms: string[] }[] = [
  { role: 'Accountant', perms: ['clients.view'] },
  { role: 'HR Manager', perms: ['clients.view', 'clients.create', 'clients.edit', 'clients.delete'] },
  { role: 'Viewer', perms: ['clients.view'] },
]

async function main() {
  // 1. Upsert clients (idempotent by unique name)
  const clientIds = new Map<string, string>()
  for (const c of CLIENTS) {
    const existing = await db.client.findUnique({ where: { name: c.name } })
    const row =
      existing ??
      (await db.client.create({
        data: {
          name: c.name,
          contactPerson: c.contactPerson,
          phone: c.phone,
          email: c.email,
          address: c.address,
          city: c.city,
          crNumber: c.crNumber,
          status: c.status,
          notes: c.notes,
        },
      }))
    clientIds.set(c.name, row.id)
    console.log(`client ok: ${c.name}`)
  }

  // 2. Link projects (only projects that have no client yet)
  let linked = 0
  for (const c of CLIENTS) {
    const clientId = clientIds.get(c.name)!
    for (const match of c.projectMatches) {
      const projects = await db.project.findMany({
        where: { name: { contains: match }, clientId: null },
      })
      for (const p of projects) {
        await db.project.update({ where: { id: p.id }, data: { clientId } })
        linked++
        console.log(`linked: ${p.name} → ${c.name}`)
      }
    }
  }

  // 3. Grant clients permissions to existing roles
  for (const g of ROLE_GRANTS) {
    const role = await db.role.findUnique({ where: { name: g.role } })
    if (!role) continue
    if (role.permissions.includes('*')) continue
    const perms: string[] = JSON.parse(role.permissions)
    const merged = Array.from(new Set([...perms, ...g.perms]))
    await db.role.update({
      where: { id: role.id },
      data: { permissions: JSON.stringify(merged) },
    })
    console.log(`role ${g.role}: +${g.perms.join(', ')}`)
  }

  const totals = await db.client.count()
  const unlinked = await db.project.count({ where: { clientId: null } })
  console.log(`\nDone. clients=${totals}, projects linked this run=${linked}, projects without client=${unlinked}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
