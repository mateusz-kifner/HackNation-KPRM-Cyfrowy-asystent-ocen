import { db } from './index'
import { employees, user, account, session, verification } from './schema'
import { hashPassword } from 'better-auth/crypto'
import { randomUUID } from 'crypto'

const MOCK_PASSWORD = 'password123'

const mockUsers = [
  {
    id: 'Admin_admin',
    name: 'Admin_admin',
    email: 'admin.admin@example.com',
    position: 'Admin',
    department: 'Administration',
    hireDate: new Date('2019-01-01'),
  },
  {
    id: 'Jan_Kowalski_Manager',
    name: 'Jan_Kowalski_Manager',
    email: 'jan.kowalski.manager@example.com',
    position: 'Manager',
    department: 'Management',
    hireDate: new Date('2020-01-15'),
  },
  {
    id: 'Anna_Lewandowska_Emploee',
    name: 'Anna_Lewandowska_Emploee',
    email: 'anna.lewandowska.emploee@example.com',
    position: 'Employee',
    department: 'Operations',
    hireDate: new Date('2021-03-20'),
  },
  {
    id: 'Mateusz_Kifner_Emploee',
    name: 'Mateusz_Kifner_Emploee',
    email: 'mateusz.kifner.emploee@example.com',
    position: 'Employee',
    department: 'Operations',
    hireDate: new Date('2022-07-10'),
  },
]

async function seed() {
  console.log('Seeding database...')

  // Clear existing data
  await db.delete(account)
  await db.delete(session)
  await db.delete(verification)
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
      role: u.id === 'Admin_admin' ? 'Admin' : 'Employee',
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
