import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { useFormTool } from "#/components/form-tool-context";
import { PageBreadcrumb } from "#/components/page-breadcrumb";
import { useUserCreate } from "#/hooks/api/users/useUserCreate";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/users/new")({
	component: AddUserPage,
});

function AddUserPage() {
	const formRef = useFormTool("Add user account");
	const session = authClient.useSession();
	const navigate = useNavigate();
	const create = useUserCreate({
		onSuccess: async () => {
			toast.success("Account created");
			await navigate({ to: "/users" });
		},
		onError: (error) => toast.error(error.message),
	});
	const user = session.data?.user as { role?: string } | undefined;
	if (!session.isPending && (!user || user.role !== "Admin"))
		return (
			<Alert variant="destructive">
				<AlertTitle>Administrator access required</AlertTitle>
				<AlertDescription>
					Your account does not have permission to manage users.
				</AlertDescription>
			</Alert>
		);
	function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const values = new FormData(event.currentTarget);
		create.mutate({
			name: String(values.get("name")).trim(),
			email: String(values.get("email")).trim(),
			password: String(values.get("password")),
			role: String(values.get("role")) as "Employee" | "Manager" | "Admin",
			position: String(values.get("position")) || null,
			department: String(values.get("department")) || null,
			organizationalUnit: String(values.get("organizationalUnit")) || null,
			employmentStatus: String(values.get("employmentStatus")) || null,
			employmentType: String(values.get("employmentType")) || null,
			hireDate: values.get("hireDate")
				? new Date(`${values.get("hireDate")}T00:00:00`)
				: null,
		});
	}
	return (
		<div className="space-y-4">
			<PageBreadcrumb
				items={[
					{ label: "User accounts", href: "/users" },
					{ label: "Add user" },
				]}
			/>
			<Card>
				<CardContent className="pt-6">
					<form
						ref={formRef}
						onSubmit={submit}
						className="grid gap-4 sm:grid-cols-2"
					>
						<Field label="Name">
							<Input name="name" required autoComplete="name" />
						</Field>
						<Field label="Email">
							<Input name="email" type="email" required autoComplete="email" />
						</Field>
						<Field label="Role">
							<Select name="role" defaultValue="Employee">
								<SelectTrigger id="role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Employee">Employee</SelectItem>
									<SelectItem value="Manager">Manager</SelectItem>
									<SelectItem value="Admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						<Field label="Initial password">
							<Input
								name="password"
								type="password"
								minLength={8}
								required
								autoComplete="new-password"
							/>
						</Field>
						<Field label="Position">
							<Input name="position" />
						</Field>
						<Field label="Department">
							<Input name="department" />
						</Field>
						<Field label="Organizational unit">
							<Input name="organizationalUnit" />
						</Field>
						<Field label="Employment status">
							<Input name="employmentStatus" placeholder="e.g. Active" />
						</Field>
						<Field label="Employment type">
							<Input name="employmentType" placeholder="e.g. Full-time" />
						</Field>
						<Field label="Hire date">
							<Input name="hireDate" type="date" />
						</Field>
						<div className="flex gap-2 sm:col-span-2">
							<Button type="submit" disabled={create.isPending}>
								{create.isPending ? "Creating…" : "Create account"}
							</Button>
							<Button asChild variant="outline">
								<Link to="/users">Cancel</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			{children}
		</div>
	);
}
