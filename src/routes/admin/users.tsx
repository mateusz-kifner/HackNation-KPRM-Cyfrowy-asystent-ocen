import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTRPC } from '#/integrations/trpc/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

function UsersPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery(trpc.users.list.queryOptions())

  const createUser = useMutation({
    mutationFn: trpc.users.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      toast.success('User created')
    },
  })

  const updateUser = useMutation({
    mutationFn: trpc.users.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      toast.success('User updated')
    },
  })

  const deleteUser = useMutation({
    mutationFn: trpc.users.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      toast.success('User deleted')
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1 p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateUser.mutate({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role === 'admin' ? 'normal' : 'admin',
                              })
                            }
                          >
                            Toggle Role
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser.mutate({ id: user.id })}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
