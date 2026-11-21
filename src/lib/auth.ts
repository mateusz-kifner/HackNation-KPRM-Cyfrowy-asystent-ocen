import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { genericOAuth, anonymous } from 'better-auth/plugins'
import { db } from '#/db'
import * as schema from '#/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    tanstackStartCookies(),
    genericOAuth({
      config: [
        {
          providerId: 'hacknation',
          clientId: 'hacknation-client-id',
          clientSecret: 'hacknation-client-secret',
          discoveryUrl: 'https://hacknation.example.com/.well-known/openid-configuration',
        },
      ],
    }),
    anonymous(),
  ],
  baseURL: process.env.BETTER_AUTH_URL,
  // App name for branding: bluevoid
  // Mock auth provider name for reference: Hacknation
})
