import { db } from './index'
import { employees, user, account } from './schema'
import { hashPassword } from 'better-auth/crypto'
import { randomUUID } from 'crypto'

const MOCK_PASSWORD = 'password123'

const mockUsers = [
  {
    id: 'Jan_Kowalski_Manager',
    name: 'Jan_Kowalski_Manager',
    email: 'jan.kowalski.manager@example.com',
    position: 'Manager',
    department: 'Management',
    hireDate: new Date('2020-01-15').getTime(),
  },
  {
    id: 'Anna_Lewandowska_Emploee',
    name: 'Anna_Lewandowska_Emploee',
    email: 'anna.lewandowska.emploee@example.com',
    position: 'Employee',
    department: 'Operations',
    hireDate: new Date('2021-03-20').getTime(),
  },
  {
    id: 'Mateusz_Kifner_Emploee',
    name: 'Mateusz_Kifner_Emploee',
    email: 'mateusz.kifner.emploee@example.com',
    position: 'Employee',
    department: 'Operations',
    hireDate: new Date('2022-07-10').getTime(),
  },
]

async function seed() {
  console.log('Seeding database...')

  // Clear existing data
  await db.delete(account)
  await db.delete(user)
  await db.delete(employees)

  // Seed users and accounts
  for (const u of mockUsers) {
    const hashed = await hashPassword(MOCK_PASSWORD)
    await db.insert(user).values({
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: false,
      isAnonymous: false,
      role: 'normal',
    })
    await db.insert(account).values({
      id: randomUUID(),
      accountId: u.id,
      providerId: 'credential',
      userId: u.id,
      password: hashed,
    })
    await db.insert(employees).values({
      id: u.id,
      name: u.name,
      email: u.email,
      position: u.position,
      department: u.department,
      hireDate: u.hireDate,
    })
    console.log(`Inserted user and employee: ${u.name}`)
  }

  console.log('Seed complete')
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
