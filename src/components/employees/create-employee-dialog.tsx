import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NewEmployee = {
	name: string;
	email: string;
	password: string;
	position: string | null;
	department: string | null;
	organizationalUnit: string | null;
	employmentStatus: string | null;
	employmentType: string | null;
	hireDate: Date | null;
};

export function CreateEmployeeDialog({
	open,
	pending,
	onOpenChange,
	onSave,
}: {
	open: boolean;
	pending: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (employee: NewEmployee) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Create employee account</DialogTitle>
					<DialogDescription>
						This creates an Employee account. Managers cannot assign another
						account role here.
					</DialogDescription>
				</DialogHeader>
				<form
					id="create-employee-form"
					className="grid gap-4 sm:grid-cols-2"
					onSubmit={(event) => {
						event.preventDefault();
						const data = new FormData(event.currentTarget);
						const text = (key: string) => String(data.get(key) ?? "").trim();
						onSave({
							name: text("name"),
							email: text("email"),
							password: text("password"),
							position: text("position") || null,
							department: text("department") || null,
							organizationalUnit: text("organizationalUnit") || null,
							employmentStatus: text("employmentStatus") || null,
							employmentType: text("employmentType") || null,
							hireDate: text("hireDate")
								? new Date(`${text("hireDate")}T00:00:00`)
								: null,
						});
					}}
				>
					<Field name="name" label="Name" required />
					<Field name="email" label="Email" type="email" required />
					<Field
						name="password"
						label="Initial password"
						type="password"
						minLength={8}
						required
					/>
					<Field name="position" label="Position" />
					<Field name="department" label="Department" />
					<Field name="organizationalUnit" label="Organizational unit" />
					<Field name="employmentStatus" label="Employment status" />
					<Field name="employmentType" label="Employment type" />
					<Field name="hireDate" label="Hire date" type="date" />
				</form>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button type="submit" form="create-employee-form" disabled={pending}>
						{pending ? "Creating…" : "Create Employee"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function Field({
	name,
	label,
	type = "text",
	required = false,
	minLength,
}: {
	name: string;
	label: string;
	type?: string;
	required?: boolean;
	minLength?: number;
}) {
	return (
		<div className="grid gap-2">
			<Label htmlFor={`new-${name}`}>{label}</Label>
			<Input
				id={`new-${name}`}
				name={name}
				type={type}
				required={required}
				minLength={minLength}
			/>
		</div>
	);
}
