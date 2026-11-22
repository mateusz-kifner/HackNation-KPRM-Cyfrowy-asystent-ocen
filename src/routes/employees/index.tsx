import { useEffect, useState } from "react";
import { useFormTool } from "#/components/form-tool-context";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	IconPencil,
	IconPlus,
	IconSearch,
	IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { useEmployeeAccounts } from "#/hooks/api/users/useEmployeeAccounts";
import { useEmployeeAccountEdit } from "#/hooks/api/users/useEmployeeAccountEdit";
import { useEmployeeAccountCreate } from "#/hooks/api/users/useEmployeeAccountCreate";
import { CreateEmployeeDialog } from "#/components/employees/create-employee-dialog";
import { PageBreadcrumb } from "#/components/page-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/employees/")({
	component: () => <Navigate to="/users" />,
});
type Employee = NonNullable<
	ReturnType<typeof useEmployeeAccounts>["data"]
>[number];

export function EmployeeDirectoryPage() {
	const session = authClient.useSession();
	const role = (session.data?.user as { role?: string } | undefined)?.role;
	if (session.isPending)
		return (
			<main className="mx-auto max-w-7xl space-y-4 p-6">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-64 w-full" />
			</main>
		);
	if (!role || (role !== "Manager" && role !== "Admin"))
		return <Navigate to="/evaluation" />;
	return <EmployeeDirectory />;
}

function EmployeeDirectory() {
	const [query, setQuery] = useState("");
	const [sortBy, setSortBy] = useState<
		"name" | "email" | "position" | "department" | "hireDate"
	>("name");
	const [selected, setSelected] = useState<Employee | null>(null);
	const [creating, setCreating] = useState(false);
	const employees = useEmployeeAccounts({
		query: query.trim() || undefined,
		sortBy,
	});
	const update = useEmployeeAccountEdit({
		onSuccess: () => {
			toast.success("Employee profile updated");
			setSelected(null);
		},
		onError: (error) => toast.error(error.message),
	});
	const create = useEmployeeAccountCreate({
		onSuccess: () => {
			toast.success("Employee account created");
			setCreating(false);
		},
		onError: (error) => toast.error(error.message),
	});

	return (
		<main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<PageBreadcrumb items={[{ label: "Users" }]} />
					<h1 className="mt-2 text-3xl font-semibold tracking-tight">Users</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Search and maintain employee accounts and HR information.
					</p>
				</div>
				<Button onClick={() => setCreating(true)}>
					<IconPlus className="mr-2 size-4" />
					Add employee
				</Button>
			</header>
			<Card>
				<CardHeader>
					<CardTitle>Employees</CardTitle>
					<CardDescription>
						{employees.data?.length ?? "—"} employee accounts
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_14rem]">
						<div className="relative">
							<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								className="pl-9"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search name, email, position…"
								aria-label="Search employees"
							/>
						</div>
						<Select
							value={sortBy}
							onValueChange={(value) => setSortBy(value as typeof sortBy)}
						>
							<SelectTrigger aria-label="Sort employees">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name">Sort by name</SelectItem>
								<SelectItem value="email">Sort by email</SelectItem>
								<SelectItem value="position">Sort by position</SelectItem>
								<SelectItem value="department">Sort by department</SelectItem>
								<SelectItem value="hireDate">Sort by hire date</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{employees.isPending ? (
						<div className="space-y-3">
							{[1, 2, 3].map((item) => (
								<Skeleton key={item} className="h-10 w-full" />
							))}
						</div>
					) : employees.isError ? (
						<Alert variant="destructive">
							<AlertTitle>Could not load employees</AlertTitle>
							<AlertDescription>{employees.error.message}</AlertDescription>
						</Alert>
					) : employees.data.length === 0 ? (
						<div className="rounded-lg border border-dashed py-14 text-center">
							<IconUsers className="mx-auto mb-3 size-6 text-muted-foreground" />
							<p className="font-medium">No matching employees</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Try another search.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Position</TableHead>
										<TableHead>Organizational unit</TableHead>
										<TableHead>Employment</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{employees.data.map((employee) => (
										<TableRow key={employee.id}>
											<TableCell className="font-medium">
												{employee.name}
											</TableCell>
											<TableCell>{employee.email}</TableCell>
											<TableCell>
												<Badge variant="outline">Employee</Badge>
											</TableCell>
											<TableCell>{employee.position ?? "—"}</TableCell>
											<TableCell>
												{employee.organizationalUnit ??
													employee.department ??
													"—"}
											</TableCell>
											<TableCell>
												{[employee.employmentStatus, employee.employmentType]
													.filter(Boolean)
													.join(" · ") || "—"}
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setSelected(employee)}
												>
													<IconPencil className="mr-2 size-4" />
													Edit profile
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
			<EmployeeProfileDialog
				employee={selected}
				open={Boolean(selected)}
				pending={update.isPending}
				onOpenChange={(open) => {
					if (!open) setSelected(null);
				}}
				onSave={(data) => {
					if (selected) update.mutate({ id: selected.id, ...data });
				}}
			/>
			<CreateEmployeeDialog
				key={creating ? "employee-create-open" : "employee-create-closed"}
				open={creating}
				pending={create.isPending}
				onOpenChange={setCreating}
				onSave={(employee) => create.mutate(employee)}
			/>
		</main>
	);
}

function EmployeeProfileDialog({
	employee,
	open,
	pending,
	onOpenChange,
	onSave,
}: {
	employee: Employee | null;
	open: boolean;
	pending: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: {
		name: string;
		email: string;
		position: string | null;
		department: string | null;
		organizationalUnit: string | null;
		employmentStatus: string | null;
		employmentType: string | null;
		hireDate: Date | null;
	}) => void;
}) {
	const formRef = useFormTool("Edit employee profile");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [position, setPosition] = useState("");
	const [department, setDepartment] = useState("");
	const [unit, setUnit] = useState("");
	const [employmentStatus, setEmploymentStatus] = useState("");
	const [employmentType, setEmploymentType] = useState("");
	const [hireDate, setHireDate] = useState("");
	useEffect(() => {
		if (!open || !employee) return;
		setName(employee.name);
		setEmail(employee.email);
		setPosition(employee.position ?? "");
		setDepartment(employee.department ?? "");
		setUnit(employee.organizationalUnit ?? "");
		setEmploymentStatus(employee.employmentStatus ?? "");
		setEmploymentType(employee.employmentType ?? "");
		setHireDate(employee.hireDate ? toInputDate(employee.hireDate) : "");
	}, [employee, open]);
	function openChange(next: boolean) {
		onOpenChange(next);
	}
	return (
		<Dialog open={open} onOpenChange={openChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit employee profile</DialogTitle>
					<DialogDescription>
						Managers can update Employee accounts only. Account roles cannot be
						changed here.
					</DialogDescription>
				</DialogHeader>
				{employee ? (
					<form
						ref={formRef}
						id="employee-profile-form"
						className="grid gap-4 sm:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							onSave({
								name: name.trim(),
								email: email.trim(),
								position: position.trim() || null,
								department: department.trim() || null,
								organizationalUnit: unit.trim() || null,
								employmentStatus: employmentStatus.trim() || null,
								employmentType: employmentType.trim() || null,
								hireDate: hireDate ? new Date(`${hireDate}T00:00:00`) : null,
							});
						}}
					>
						<ProfileField
							label="Name"
							value={name}
							onChange={setName}
							required
						/>
						<ProfileField
							label="Email"
							value={email}
							onChange={setEmail}
							type="email"
							required
						/>
						<ProfileField
							label="Account role"
							value="Employee"
							onChange={() => undefined}
							disabled
						/>
						<ProfileField
							label="Position"
							value={position}
							onChange={setPosition}
						/>
						<ProfileField
							label="Department"
							value={department}
							onChange={setDepartment}
						/>
						<ProfileField
							label="Organizational unit"
							value={unit}
							onChange={setUnit}
						/>
						<ProfileField
							label="Employment status"
							value={employmentStatus}
							onChange={setEmploymentStatus}
						/>
						<ProfileField
							label="Employment type"
							value={employmentType}
							onChange={setEmploymentType}
						/>
						<ProfileField
							label="Hire date"
							value={hireDate}
							onChange={setHireDate}
							type="date"
						/>
					</form>
				) : null}
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button type="submit" form="employee-profile-form" disabled={pending}>
						{pending ? "Saving…" : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ProfileField({
	label,
	value,
	onChange,
	type = "text",
	required = false,
	disabled = false,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	required?: boolean;
	disabled?: boolean;
}) {
	const id = `employee-${label.toLowerCase().replaceAll(" ", "-")}`;
	return (
		<div className="grid gap-2">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				type={type}
				value={value}
				disabled={disabled}
				onChange={(event) => onChange(event.target.value)}
				required={required}
			/>
		</div>
	);
}
function toInputDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
