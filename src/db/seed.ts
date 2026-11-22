import { db } from './index'
import {
  assessmentFiles,
  assessments,
  employees,
  user,
  account,
  session,
  verification,
} from './schema'
import { hashPassword } from 'better-auth/crypto'
import { randomUUID } from 'crypto'

const MOCK_PASSWORD = 'password123'

const mockUsers = [
  {
    id: 'admin_admin',
    name: 'Admin Admin',
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
  {
    id: 'Katarzyna_Nowak_Employee',
    name: 'Katarzyna Nowak',
    email: 'katarzyna.nowak@example.com',
    position: 'Employee',
    department: 'Finance',
    hireDate: new Date('2023-02-06'),
  },
  {
    id: 'Piotr_Zielinski_Employee',
    name: 'Piotr Zielinski',
    email: 'piotr.zielinski@example.com',
    position: 'Employee',
    department: 'Engineering',
    hireDate: new Date('2022-11-14'),
  },
  {
    id: 'Marta_Wisniewska_Manager',
    name: 'Marta Wisniewska',
    email: 'marta.wisniewska@example.com',
    position: 'Manager',
    department: 'Customer Success',
    hireDate: new Date('2020-08-03'),
  },
]

async function seed() {
  console.log('Seeding database...')

  // Clear existing data
  await db.delete(account)
  await db.delete(session)
  await db.delete(verification)
  await db.delete(assessments)
  await db.delete(user)
  await db.delete(employees)

  // Seed users and accounts
  for (const u of mockUsers) {
    const hashed = await hashPassword(MOCK_PASSWORD)
    console.log('[seed] Inserting into user')
    await db.insert(user).values({
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: false,
      isAnonymous: false,
      role: u.position === 'Admin' ? 'Admin' : u.position === 'Manager' ? 'Manager' : 'Employee',
    })
    console.log('[seed] Inserting into account')
    await db.insert(account).values({
      id: randomUUID(),
      accountId: u.id,
      providerId: 'credential',
      userId: u.id,
      password: hashed,
    })
    console.log('[seed] Inserting into employees')
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

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), 0, 1)
  const periodEnd = new Date(now.getFullYear(), 11, 31)
  const mockEvaluations: Array<{
    id: string
    evaluatedUserId: string
    evaluatorUserId: string
    form: 'A' | 'B' | 'C'
    status:
      | 'draft'
      | 'criteria_setting'
      | 'ready_for_assessment'
      | 'assessment_in_progress'
      | 'awaiting_employee_acknowledgement'
      | 'completed'
      | 'cancelled'
    name: [string, string]
    completed?: boolean
    overallOutcome?: 'positive' | 'negative'
    overallLevel?:
      | 'far_below_expectations'
      | 'below_expectations'
      | 'meets_expectations'
      | 'above_expectations'
      | 'far_above_expectations'
    averagePoints?: number
  }> = [
    {
      id: 'mock-evaluation-started',
      evaluatedUserId: 'Anna_Lewandowska_Emploee',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'C' as const,
      status: 'assessment_in_progress' as const,
      name: ['Anna', 'Lewandowska'],
    },
    {
      id: 'mock-evaluation-almost-complete',
      evaluatedUserId: 'Mateusz_Kifner_Emploee',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'C' as const,
      status: 'awaiting_employee_acknowledgement' as const,
      name: ['Mateusz', 'Kifner'],
    },
    {
      id: 'mock-evaluation-anna-follow-up',
      evaluatedUserId: 'Anna_Lewandowska_Emploee',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'B' as const,
      status: 'ready_for_assessment' as const,
      name: ['Anna', 'Lewandowska'],
    },
    {
      id: 'mock-evaluation-mateusz-follow-up',
      evaluatedUserId: 'Mateusz_Kifner_Emploee',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'C' as const,
      status: 'assessment_in_progress' as const,
      name: ['Mateusz', 'Kifner'],
    },
    {
      id: 'mock-evaluation-anna-completed-2025',
      evaluatedUserId: 'Anna_Lewandowska_Emploee',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'C' as const,
      status: 'completed' as const,
      name: ['Anna', 'Lewandowska'],
      completed: true,
      overallOutcome: 'positive' as const,
      overallLevel: 'above_expectations' as const,
      averagePoints: 4.4,
    },
    {
      id: 'mock-evaluation-mateusz-completed-2025',
      evaluatedUserId: 'Mateusz_Kifner_Emploee',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'B' as const,
      status: 'completed' as const,
      name: ['Mateusz', 'Kifner'],
      completed: true,
      overallOutcome: 'positive' as const,
      overallLevel: 'meets_expectations' as const,
      averagePoints: 3.6,
    },
    {
      id: 'mock-evaluation-anna-completed-2024',
      evaluatedUserId: 'Anna_Lewandowska_Emploee',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'B' as const,
      status: 'completed' as const,
      name: ['Anna', 'Lewandowska'],
      completed: true,
      overallOutcome: 'positive' as const,
      overallLevel: 'meets_expectations' as const,
      averagePoints: 3.8,
    },
    {
      id: 'mock-evaluation-admin-in-progress',
      evaluatedUserId: 'admin_admin',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'A' as const,
      status: 'assessment_in_progress' as const,
      name: ['Admin', 'Admin'],
    },
    {
      id: 'mock-evaluation-admin-completed-2025',
      evaluatedUserId: 'admin_admin',
      evaluatorUserId: 'Marta_Wisniewska_Manager',
      form: 'B' as const,
      status: 'completed' as const,
      name: ['Admin', 'Admin'],
      completed: true,
      overallOutcome: 'positive' as const,
      overallLevel: 'meets_expectations' as const,
      averagePoints: 3.9,
    },
    {
      id: 'mock-evaluation-admin-follow-up',
      evaluatedUserId: 'admin_admin',
      evaluatorUserId: 'Jan_Kowalski_Manager',
      form: 'A' as const,
      status: 'ready_for_assessment' as const,
      name: ['Admin', 'Admin'],
    },
  ]

  for (const evaluation of mockEvaluations) {
    const evaluatedUser = mockUsers.find((u) => u.id === evaluation.evaluatedUserId)!
    const evaluatorUser = mockUsers.find((u) => u.id === evaluation.evaluatorUserId)!
    const [evaluatorFirstName, ...evaluatorLastName] = evaluatorUser.name.split(' ')
    console.log('[seed] Inserting into assessments')
    await db.insert(assessments).values({
      id: evaluation.id,
      evaluatedUserId: evaluation.evaluatedUserId,
      evaluatorUserId: evaluation.evaluatorUserId,
      appointedByUserId: 'admin_admin',
      form: evaluation.form,
      status: evaluation.status,
      periodStart: evaluation.completed
        ? new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 2 : 1), 0, 1)
        : periodStart,
      periodEnd: evaluation.completed
        ? new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 1 : 0), 0, 0)
        : periodEnd,
      assessmentDate: evaluation.completed
        ? new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 1 : 0), 5, 15)
        : now,
      dueAt: evaluation.completed
        ? new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 1 : 0), 5, 30)
        : new Date(now.getFullYear(), 11, 31),
      ...(evaluation.completed
        ? {
            submittedAt: new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 1 : 0), 5, 15),
            completedAt: new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 1 : 0), 5, 20),
          }
        : {}),
      ...(evaluation.status === 'awaiting_employee_acknowledgement'
        ? { submittedAt: now }
        : {}),
    })
    console.log('[seed] Inserting into assessment_files')
    await db.insert(assessmentFiles).values({
      id: `${evaluation.id}-file`,
      assessmentId: evaluation.id,
      evaluatedFirstName: evaluation.name[0],
      evaluatedLastName: evaluation.name[1],
      evaluatedPosition: evaluatedUser.position,
      evaluatedOrganizationalUnit: evaluatedUser.department,
      evaluatorFirstName,
      evaluatorLastName: evaluatorLastName.join(' '),
      evaluatorPosition: evaluatorUser.position,
      evaluatorOrganizationalUnit: evaluatorUser.department,
      assessmentPeriodStart: evaluation.completed
        ? new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 2 : 1), 0, 1)
        : periodStart,
      assessmentPeriodEnd: evaluation.completed
        ? new Date(now.getFullYear() - (evaluation.id.endsWith('2024') ? 1 : 0), 0, 0)
        : periodEnd,
      ...(evaluation.completed
        ? {
            overallOutcome: evaluation.overallOutcome,
            overallLevel: evaluation.overallLevel,
            averagePoints: evaluation.averagePoints,
            assessmentRationale: 'Consistently met the expectations for the role and contributed to team goals.',
            developmentPlanRecommendations: 'Continue developing role-specific expertise and share practices with the team.',
          }
        : {}),
    })
  }

  console.log('Seed complete')
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
