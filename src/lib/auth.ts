import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { anonymous } from 'better-auth/plugins'
import { db } from '#/db'
import * as schema from '#/db/schema'

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: { type: 'string', required: true, defaultValue: 'Employee', input: false },
      position: { type: 'string', required: false, input: false },
      department: { type: 'string', required: false, input: false },
      organizationalUnit: { type: 'string', required: false, input: false },
      employmentStatus: { type: 'string', required: false, input: false },
      employmentType: { type: 'string', required: false, input: false },
      hireDate: { type: 'number', required: false, input: false },
    },
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    anonymous(),
    tanstackStartCookies(),
  ],
  baseURL: process.env.BETTER_AUTH_URL,
  // App name for branding: bluevoid
})
