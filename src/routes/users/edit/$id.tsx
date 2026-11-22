import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { useFormTool } from "#/components/form-tool-context";
import { PageBreadcrumb } from "#/components/page-breadcrumb";
import { useUserEdit } from "#/hooks/api/users/useUserEdit";
import { useUserGet } from "#/hooks/api/users/useUserGet";
import type {
	ManagedUser,
	UserFormValues,
} from "@/components/admin/user-form-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/users/edit/$id")({
	component: EditUserPage,
});

function EditUserPage() {
	const formRef = useFormTool("Edit user account");
	const { id } = Route.useParams();
	const session = authClient.useSession();
	const user = session.data?.user as { role?: string } | undefined;
	const navigate = useNavigate();
	const accountQuery = useUserGet(id);
	const update = useUserEdit({
		onSuccess: async () => {
			toast.success("Account updated");
			await navigate({ to: "/users" });
		},
		onError: (error) => toast.error(error.message),
	});

	if (session.isPending || accountQuery.isPending)
		return <Skeleton className="h-40 w-full" />;
	if (!user || user.role !== "Admin")
		return (
			<Alert variant="destructive">
				<AlertTitle>Administrator access required</AlertTitle>
				<AlertDescription>
					Your account does not have permission to manage users.
				</AlertDescription>
			</Alert>
		);
	if (!accountQuery.data)
		return (
			<Alert variant="destructive">
				<AlertTitle>User not found</AlertTitle>
				<AlertDescription>This account could not be loaded.</AlertDescription>
			</Alert>
		);

	const account = accountQuery.data as ManagedUser;
	function save(values: UserFormValues) {
		const { password: _password, ...profile } = values;
		update.mutate({ id, ...profile });
	}

	return (
		<main className="mx-auto min-w-0 w-full max-w-4xl space-y-6 p-4 sm:p-6">
			<PageBreadcrumb
				items={[
					{ label: "User accounts", href: "/users" },
					{ label: "Edit account" },
				]}
			/>
			<header className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Edit account</h1>
				<p className="text-sm text-muted-foreground">
					Update account access and employee details.
				</p>
			</header>
			<Card className="overflow-hidden">
				<div className="border-b bg-muted/20 px-6 py-4">
					<p className="text-sm font-medium">Account details</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Account ID: <code className="break-all">{id}</code> · Read only
					</p>
				</div>
				<CardContent className="pt-6">
					<form
						ref={formRef}
						className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							save({
								name: String(form.get("name")).trim(),
								email: String(form.get("email")).trim(),
								role: String(form.get("role")) as ManagedUser["role"],
								position: String(form.get("position")).trim() || null,
								department: String(form.get("department")).trim() || null,
								organizationalUnit:
									String(form.get("organizationalUnit")).trim() || null,
								employmentStatus:
									String(form.get("employmentStatus")).trim() || null,
								employmentType:
									String(form.get("employmentType")).trim() || null,
								hireDate: form.get("hireDate")
									? new Date(`${form.get("hireDate")}T00:00:00`)
									: null,
							});
						}}
					>
						<FormField label="Name">
							<Input name="name" defaultValue={account.name} required />
						</FormField>
						<FormField label="Email">
							<Input
								name="email"
								type="email"
								defaultValue={account.email}
								required
							/>
						</FormField>
						<FormField label="Role">
							<Select name="role" defaultValue={account.role}>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Employee">Employee</SelectItem>
									<SelectItem value="Manager">Manager</SelectItem>
									<SelectItem value="Admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</FormField>
						<FormField label="Position">
							<Input name="position" defaultValue={account.position ?? ""} />
						</FormField>
						<FormField label="Department">
							<Input
								name="department"
								defaultValue={account.department ?? ""}
							/>
						</FormField>
						<FormField label="Organizational unit">
							<Input
								name="organizationalUnit"
								defaultValue={account.organizationalUnit ?? ""}
							/>
						</FormField>
						<FormField label="Employment status">
							<Input
								name="employmentStatus"
								defaultValue={account.employmentStatus ?? ""}
							/>
						</FormField>
						<FormField label="Employment type">
							<Input
								name="employmentType"
								defaultValue={account.employmentType ?? ""}
							/>
						</FormField>
						<FormField label="Hire date">
							<Input
								type="date"
								name="hireDate"
								defaultValue={
									account.hireDate
										? new Date(account.hireDate).toISOString().slice(0, 10)
										: ""
								}
							/>
						</FormField>
						<div className="flex flex-col-reverse gap-2 border-t pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
							<Button type="submit" disabled={update.isPending}>
								{update.isPending ? "Saving…" : "Save changes"}
							</Button>
							<Button asChild variant="outline">
								<Link to="/users">Cancel</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}

function FormField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	const id = label.toLowerCase().replaceAll(" ", "-");
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			{React.cloneElement(children, {
				id,
			} as React.HTMLAttributes<HTMLElement>)}
		</div>
	);
}
