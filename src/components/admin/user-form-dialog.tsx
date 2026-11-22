import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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

export type UserFormValues = Omit<ManagedUser, "id"> & { password?: string };

type UserFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: ManagedUser | null;
	isPending: boolean;
	onSubmit: (values: UserFormValues) => void;
};

type FormState = {
	name: string;
	email: string;
	role: ManagedUser["role"];
	password: string;
	position: string;
	department: string;
	organizationalUnit: string;
	employmentStatus: string;
	employmentType: string;
	hireDate: string;
};

const emptyForm: FormState = {
	name: "",
	email: "",
	role: "Employee",
	password: "",
	position: "",
	department: "",
	organizationalUnit: "",
	employmentStatus: "",
	employmentType: "",
	hireDate: "",
};

function toFormState(user: ManagedUser | null): FormState {
	if (!user) return emptyForm;
	return {
		name: user.name,
		email: user.email,
		role: user.role,
		password: "",
		position: user.position ?? "",
		department: user.department ?? "",
		organizationalUnit: user.organizationalUnit ?? "",
		employmentStatus: user.employmentStatus ?? "",
		employmentType: user.employmentType ?? "",
		hireDate: user.hireDate ? new Date(user.hireDate).toISOString().slice(0, 10) : "",
	};
}

export function UserFormDialog({
	open,
	onOpenChange,
	user,
	isPending,
	onSubmit,
}: UserFormDialogProps) {
	const [values, setValues] = useState<FormState>(() => toFormState(user));
	const [formError, setFormError] = useState("");

	useEffect(() => {
		if (open) {
			setValues(toFormState(user));
			setFormError("");
		}
	}, [open, user]);

	function update<K extends keyof FormState>(key: K, value: FormState[K]) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!user && values.password.length < 8) {
			setFormError("Use a password with at least 8 characters.");
			return;
		}
		setFormError("");
		onSubmit({
			name: values.name.trim(),
			email: values.email.trim(),
			role: values.role,
			password: user ? undefined : values.password,
			position: values.position.trim() || null,
			department: values.department.trim() || null,
			organizationalUnit: values.organizationalUnit.trim() || null,
			employmentStatus: values.employmentStatus.trim() || null,
			employmentType: values.employmentType.trim() || null,
			hireDate: values.hireDate ? new Date(`${values.hireDate}T00:00:00`) : null,
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{user ? "Edit user account" : "Create user account"}</DialogTitle>
					<DialogDescription>
						{user ? "Update account and employee profile details." : "Create an account and set its initial password."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={submit} className="space-y-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField label="Name" required>
							<Input value={values.name} onChange={(event) => update("name", event.target.value)} required autoComplete="name" />
						</FormField>
						<FormField label="Email" required>
							<Input type="email" value={values.email} onChange={(event) => update("email", event.target.value)} required autoComplete="email" />
						</FormField>
						<FormField label="Role" required>
							<Select value={values.role} onValueChange={(value) => update("role", value as ManagedUser["role"])}>
								<SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="Employee">Employee</SelectItem>
									<SelectItem value="Manager">Manager</SelectItem>
									<SelectItem value="Admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</FormField>
						{!user && <FormField label="Initial password" required hint="At least 8 characters">
							<Input type="password" value={values.password} onChange={(event) => update("password", event.target.value)} minLength={8} required autoComplete="new-password" />
						</FormField>}
						<FormField label="Position"><Input value={values.position} onChange={(event) => update("position", event.target.value)} /></FormField>
						<FormField label="Department"><Input value={values.department} onChange={(event) => update("department", event.target.value)} /></FormField>
						<FormField label="Organizational unit"><Input value={values.organizationalUnit} onChange={(event) => update("organizationalUnit", event.target.value)} /></FormField>
						<FormField label="Employment status"><Input value={values.employmentStatus} onChange={(event) => update("employmentStatus", event.target.value)} placeholder="e.g. Active" /></FormField>
						<FormField label="Employment type"><Input value={values.employmentType} onChange={(event) => update("employmentType", event.target.value)} placeholder="e.g. Full-time" /></FormField>
						<FormField label="Hire date"><Input type="date" value={values.hireDate} onChange={(event) => update("hireDate", event.target.value)} /></FormField>
					</div>
					{formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
						<Button type="submit" disabled={isPending}>{isPending ? "Saving…" : user ? "Save changes" : "Create account"}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
	return <div className="space-y-2">
		<Label>{label}{required ? " *" : ""}</Label>
		{children}
		{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
	</div>;
}
