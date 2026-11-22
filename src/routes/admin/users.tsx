import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '#/integrations/trpc/react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const Route = createFileRoute('/admin/users')({ component: UsersPage })

type UserProfile = {
  id: string
  name: string
  email: string
  role: 'Employee' | 'Manager' | 'Admin'
  position: string | null
  department: string | null
  organizationalUnit: string | null
  employmentStatus: string | null
  employmentType: string | null
  hireDate: Date | null
}

const blankForm = {
  name: '', email: '', role: 'Employee' as UserProfile['role'], password: '',
  position: '', department: '', organizationalUnit: '', employmentStatus: '', employmentType: '', hireDate: '',
}

function UsersPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [form, setForm] = useState(blankForm)
  const usersQuery = useQuery(trpc.users.list.queryOptions())
  const refreshUsers = () => queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
  const createUser = useMutation(trpc.users.create.mutationOptions({
    onSuccess: () => { toast.success('User created'); setForm(blankForm); refreshUsers() },
    onError: (error) => toast.error(error.message),
  }))
  const updateUser = useMutation(trpc.users.update.mutationOptions({
    onSuccess: () => { toast.success('User updated'); setEditing(null); setForm(blankForm); refreshUsers() },
    onError: (error) => toast.error(error.message),
  }))
  const deleteUser = useMutation(trpc.users.delete.mutationOptions({
    onSuccess: () => { toast.success('User deleted'); refreshUsers() },
    onError: (error) => toast.error(error.message),
  }))

  function beginEdit(user: UserProfile) {
    setEditing(user)
    setForm({
      name: user.name, email: user.email, role: user.role, password: '',
      position: user.position ?? '', department: user.department ?? '',
      organizationalUnit: user.organizationalUnit ?? '', employmentStatus: user.employmentStatus ?? '',
      employmentType: user.employmentType ?? '',
      hireDate: user.hireDate ? new Date(user.hireDate).toISOString().slice(0, 10) : '',
    })
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const profile = {
      name: form.name, email: form.email, role: form.role,
      position: form.position || null, department: form.department || null,
      organizationalUnit: form.organizationalUnit || null, employmentStatus: form.employmentStatus || null,
      employmentType: form.employmentType || null, hireDate: form.hireDate ? new Date(form.hireDate) : null,
    }
    if (editing) updateUser.mutate({ id: editing.id, ...profile })
    else createUser.mutate({ ...profile, password: form.password })
  }

  const setField = (key: keyof typeof blankForm, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const busy = createUser.isPending || updateUser.isPending

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full"><AppSidebar /><main className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit user' : 'Create user account'}</CardTitle></CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submitForm}>
              <FormField label="Name" value={form.name} onChange={(v) => setField('name', v)} required />
              <FormField label="Email" type="email" value={form.email} onChange={(v) => setField('email', v)} required />
              <label className="grid gap-2 text-sm">Account role
                <select className="h-9 rounded-md border bg-background px-3" value={form.role} onChange={(e) => setField('role', e.target.value)}>
                  <option>Employee</option><option>Manager</option><option>Admin</option>
                </select>
              </label>
              {!editing && <FormField label="Temporary password" type="password" value={form.password} onChange={(v) => setField('password', v)} required minLength={8} />}
              <FormField label="Position" value={form.position} onChange={(v) => setField('position', v)} />
              <FormField label="Department" value={form.department} onChange={(v) => setField('department', v)} />
              <FormField label="Organizational unit" value={form.organizationalUnit} onChange={(v) => setField('organizationalUnit', v)} />
              <FormField label="Employment status" value={form.employmentStatus} onChange={(v) => setField('employmentStatus', v)} />
              <FormField label="Employment type" value={form.employmentType} onChange={(v) => setField('employmentType', v)} />
              <FormField label="Hire date" type="date" value={form.hireDate} onChange={(v) => setField('hireDate', v)} />
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={busy}>{editing ? 'Save changes' : 'Create account'}</Button>
                {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(blankForm) }}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>User accounts</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {usersQuery.isLoading ? <p>Loading users…</p> : usersQuery.isError ? <p role="alert">{usersQuery.error.message}</p> : (
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Position</TableHead><TableHead>Department</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>{usersQuery.data?.map((user) => <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.role}</TableCell>
                  <TableCell>{user.position ?? '—'}</TableCell><TableCell>{user.department ?? '—'}</TableCell>
                  <TableCell className="space-x-2"><Button size="sm" variant="outline" onClick={() => beginEdit(user as UserProfile)}>Edit</Button>
                    <Button size="sm" variant="destructive" disabled={deleteUser.isPending} onClick={() => {
                      if (window.confirm(`Delete ${user.name}'s account?`)) deleteUser.mutate({ id: user.id })
                    }}>Delete</Button></TableCell>
                </TableRow>)}</TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main></div>
    </SidebarProvider>
  )
}

function FormField({ label, value, onChange, type = 'text', required = false, minLength }: {
  label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; minLength?: number
}) {
  const id = label.toLowerCase().replaceAll(' ', '-')
  return <div className="grid gap-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} minLength={minLength} /></div>
}
