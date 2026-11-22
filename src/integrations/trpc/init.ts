import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { auth } from '#/lib/auth'

export const accountRoles = ['Employee', 'Manager', 'Admin'] as const
export type AccountRole = (typeof accountRoles)[number]

export async function createTRPCContext(headers: Headers) {
  const session = await auth.api.getSession({ headers })
  return { session }
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  transformer: superjson,
})

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sign in is required.' })
  }
  return next({ ctx: { ...ctx, session: ctx.session } })
})

function requireRoles(roles: readonly AccountRole[]) {
  return t.procedure.use(isAuthenticated).use(({ ctx, next }) => {
    const role = ctx.session.user.role as AccountRole
    if (!roles.includes(role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' })
    }
    return next({ ctx: { ...ctx, user: ctx.session.user, role } })
  })
}

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
export const employeeProcedure = requireRoles(['Employee', 'Manager', 'Admin'])
export const managerProcedure = requireRoles(['Manager', 'Admin'])
export const adminProcedure = requireRoles(['Admin'])
