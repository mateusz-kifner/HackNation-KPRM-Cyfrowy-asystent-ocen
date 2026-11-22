import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

export type ManagedUser = {
	id: string;
	name: string;
	email: string;
	role: "Employee" | "Manager" | "Admin";
	position: string | null;
	department: string | null;
	organizationalUnit: string | null;
	employmentStatus: string | null;
	employmentType: string | null;
	hireDate: Date | null;
};

export type UserFormValues = Omit<ManagedUser, "id" | "hireDate"> & {
	hireDate: Date | null;
	password?: string;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: ManagedUser | null;
	isPending: boolean;
	onSubmit: (values: UserFormValues) => void;
};

const emptyForm = {
	name: "",
	email: "",
	role: "Employee" as ManagedUser["role"],
	password: "",
	position: "",
	department: "",
	organizationalUnit: "",
	employmentStatus: "",
	employmentType: "",
	hireDate: "",
};

export function UserFormDialog({
	open,
	onOpenChange,
	user,
	isPending,
	onSubmit,
}: Props) {
	const [form, setForm] = useState(emptyForm);
	const editing = Boolean(user);

	useEffect(() => {
		if (!open) return;
		setForm(
			user
				? {
						name: user.name,
						email: user.email,
						role: user.role,
						password: "",
						position: user.position ?? "",
						department: user.department ?? "",
						organizationalUnit: user.organizationalUnit ?? "",
						employmentStatus: user.employmentStatus ?? "",
						employmentType: user.employmentType ?? "",
						hireDate: user.hireDate
							? new Date(user.hireDate).toISOString().slice(0, 10)
							: "",
					}
				: emptyForm,
		);
	}, [open, user]);

	function setField(key: keyof typeof emptyForm, value: string) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		onSubmit({
			name: form.name.trim(),
			email: form.email.trim(),
			role: form.role,
			position: form.position.trim() || null,
			department: form.department.trim() || null,
			organizationalUnit: form.organizationalUnit.trim() || null,
			employmentStatus: form.employmentStatus.trim() || null,
			employmentType: form.employmentType.trim() || null,
			hireDate: form.hireDate ? new Date(`${form.hireDate}T00:00:00`) : null,
			...(editing ? {} : { password: form.password }),
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{editing ? "Edit user" : "Create user"}</DialogTitle>
					<DialogDescription>
						{editing
							? "Update account access and employee profile details."
							: "Create an account and set its role and employee profile."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
					<TextField
						label="Name"
						value={form.name}
						onChange={(value) => setField("name", value)}
						required
					/>
					<TextField
						label="Email"
						type="email"
						value={form.email}
						onChange={(value) => setField("email", value)}
						required
					/>
					<div className="grid gap-2">
						<Label htmlFor="user-role">Account role</Label>
						<Select
							value={form.role}
							onValueChange={(value) => setField("role", value)}
						>
							<SelectTrigger id="user-role" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Employee">Employee</SelectItem>
								<SelectItem value="Manager">Manager</SelectItem>
								<SelectItem value="Admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{!editing && (
						<TextField
							label="Temporary password"
							type="password"
							value={form.password}
							onChange={(value) => setField("password", value)}
							minLength={8}
							required
						/>
					)}
					<TextField
						label="Position"
						value={form.position}
						onChange={(value) => setField("position", value)}
					/>
					<TextField
						label="Department"
						value={form.department}
						onChange={(value) => setField("department", value)}
					/>
					<TextField
						label="Organizational unit"
						value={form.organizationalUnit}
						onChange={(value) => setField("organizationalUnit", value)}
					/>
					<TextField
						label="Employment status"
						value={form.employmentStatus}
						onChange={(value) => setField("employmentStatus", value)}
					/>
					<TextField
						label="Employment type"
						value={form.employmentType}
						onChange={(value) => setField("employmentType", value)}
					/>
					<TextField
						label="Hire date"
						type="date"
						value={form.hireDate}
						onChange={(value) => setField("hireDate", value)}
					/>
					<DialogFooter className="sm:col-span-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending
								? "Saving…"
								: editing
									? "Save changes"
									: "Create account"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function TextField({
	label,
	value,
	onChange,
	type = "text",
	required,
	minLength,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	required?: boolean;
	minLength?: number;
}) {
	const id = `user-${label.toLowerCase().replaceAll(" ", "-")}`;
	return (
		<div className="grid gap-2">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required={required}
				minLength={minLength}
			/>
		</div>
	);
}
