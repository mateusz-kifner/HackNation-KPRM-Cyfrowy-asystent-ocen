import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { useFormTool } from "#/components/form-tool-context";
import { useTRPC } from "#/integrations/trpc/react";
import type { ManagedUser, UserFormValues } from "@/components/admin/user-form-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/users/$id")({ component: EditUserPage });

function EditUserPage() {
  const formRef = useFormTool("Edit user account");
  const { id } = Route.useParams();
  const session = authClient.useSession();
  const user = session.data?.user as { role?: string } | undefined;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const accountQuery = useQuery(trpc.users.get.queryOptions({ id }));
  const update = useMutation(trpc.users.update.mutationOptions({
    onSuccess: async () => { toast.success("Account updated"); await queryClient.invalidateQueries({ queryKey: [["users", "list"]] }); await navigate({ to: "/admin/users" }); },
    onError: (error) => toast.error(error.message),
  }));
  if (session.isPending || accountQuery.isPending) return <Skeleton className="h-40 w-full" />;
  if (!user || user.role !== "Admin") return <Alert variant="destructive"><AlertTitle>Administrator access required</AlertTitle><AlertDescription>Your account does not have permission to manage users.</AlertDescription></Alert>;
  if (!accountQuery.data) return <Alert variant="destructive"><AlertTitle>User not found</AlertTitle><AlertDescription>This account could not be loaded.</AlertDescription></Alert>;
  const account = accountQuery.data as ManagedUser;
  function save(values: UserFormValues) {
    const { password: _password, ...profile } = values;
    update.mutate({ id, ...profile });
  }
  return <Card><CardHeader><CardTitle>Edit user account</CardTitle></CardHeader><CardContent className="space-y-4">
    <p className="text-sm text-muted-foreground">Account ID: <code>{id}</code> (read only)</p>
    <form ref={formRef} className="grid gap-4 sm:grid-cols-2" action={undefined} onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); save({ name: String(form.get("name")), email: String(form.get("email")), role: String(form.get("role")) as ManagedUser["role"], position: String(form.get("position")) || null, department: String(form.get("department")) || null, organizationalUnit: String(form.get("organizationalUnit")) || null, employmentStatus: String(form.get("employmentStatus")) || null, employmentType: String(form.get("employmentType")) || null, hireDate: form.get("hireDate") ? new Date(`${form.get("hireDate")}T00:00:00`) : null }); }}>
      <label>Name<input className="h-9 rounded-md border bg-background px-3" name="name" defaultValue={account.name} required /></label><label>Email<input className="h-9 rounded-md border bg-background px-3" name="email" type="email" defaultValue={account.email} required /></label>
      <label>Role<select className="h-9 rounded-md border bg-background px-3" name="role" defaultValue={account.role}><option>Employee</option><option>Manager</option><option>Admin</option></select></label>
      <label>Position<input className="h-9 rounded-md border bg-background px-3" name="position" defaultValue={account.position ?? ""} /></label><label>Department<input className="h-9 rounded-md border bg-background px-3" name="department" defaultValue={account.department ?? ""} /></label><label>Organizational unit<input className="h-9 rounded-md border bg-background px-3" name="organizationalUnit" defaultValue={account.organizationalUnit ?? ""} /></label><label>Employment status<input className="h-9 rounded-md border bg-background px-3" name="employmentStatus" defaultValue={account.employmentStatus ?? ""} /></label><label>Employment type<input className="h-9 rounded-md border bg-background px-3" name="employmentType" defaultValue={account.employmentType ?? ""} /></label><label>Hire date<input className="h-9 rounded-md border bg-background px-3" type="date" name="hireDate" defaultValue={account.hireDate ? new Date(account.hireDate).toISOString().slice(0,10) : ""} /></label>
      <div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={update.isPending}>{update.isPending ? "Saving…" : "Save changes"}</Button><Button asChild variant="outline"><Link to="/admin/users">Cancel</Link></Button></div>
    </form>
  </CardContent></Card>;
}
