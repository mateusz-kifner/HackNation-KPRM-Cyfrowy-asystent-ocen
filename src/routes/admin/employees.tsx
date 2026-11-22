import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTRPC } from '#/integrations/trpc/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/employees')({
  component: EmployeesPage,
})

function EmployeesPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: employees, isLoading } = useQuery(trpc.employees.list.queryOptions())

  const updateEmployee = useMutation({
    mutationFn: trpc.employees.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] })
      toast.success('Employee updated')
    },
  })

  const deleteEmployee = useMutation({
    mutationFn: trpc.employees.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] })
      toast.success('Employee deleted')
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <main className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employees Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{new Date(employee.hireDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEmployee.mutate({ id: employee.id })}
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
  )
}
