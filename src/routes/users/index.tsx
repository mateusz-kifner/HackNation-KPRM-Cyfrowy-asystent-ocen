import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	IconPencil,
	IconPlus,
	IconSearch,
	IconTrash,
	IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { PageBreadcrumb } from "#/components/page-breadcrumb";
import { useUserDelete } from "#/hooks/api/users/useUserDelete";
import { useUserList } from "#/hooks/api/users/useUserList";
import type { ManagedUser } from "@/components/admin/user-form-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/users/")({ component: UsersPage });

function UsersPage() {
	const sessionQuery = authClient.useSession();
	const sessionUser = sessionQuery.data?.user as
		| { id: string; role?: string }
		| undefined;
	const role = sessionUser?.role;

	if (sessionQuery.isPending) return <PageLoading />;
	if (!sessionUser) return <AccessDenied signedOut />;
	if (role !== "Admin") return <AccessDenied />;

	return <AdminUsersPage currentUserId={sessionUser.id} />;
}

function AdminUsersPage({ currentUserId }: { currentUserId: string }) {
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
	const usersQuery = useUserList(search.trim() || undefined);

	const deleteUser = useUserDelete({
		onSuccess: () => {
			toast.success("Account deleted");
			setDeletingUser(null);
		},
		onError: (error) => toast.error(error.message),
	});

	const users = (usersQuery.data ?? []).filter(
		(user) => roleFilter === "all" || user.role === roleFilter,
	);
	return (
		<>
			<main className="mx-auto min-w-0 w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
				<header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
					<div className="space-y-2">
						<PageBreadcrumb items={[{ label: "Users" }]} />
						<div>
							<h1 className="text-3xl font-semibold tracking-tight">Users</h1>
							<p className="mt-1 text-sm text-muted-foreground">
								Manage account access, roles, and employee details.
							</p>
						</div>
					</div>
					<Button asChild>
						<Link to="/users/new">
							<IconPlus data-icon="inline-start" /> Add user
						</Link>
					</Button>
				</header>

				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-muted/20 pb-4">
						<CardTitle className="text-base">User directory</CardTitle>
						<CardDescription>
							Search accounts or filter the list by role.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5 pt-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<div className="relative flex-1">
								<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="h-10 pl-9"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Search name, email, department…"
									aria-label="Search users"
								/>
							</div>
							<Select value={roleFilter} onValueChange={setRoleFilter}>
								<SelectTrigger
									className="h-10 w-full sm:w-48"
									aria-label="Filter by account role"
								>
									<SelectValue placeholder="All roles" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All roles</SelectItem>
									<SelectItem value="Employee">Employee</SelectItem>
									<SelectItem value="Manager">Manager</SelectItem>
									<SelectItem value="Admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{usersQuery.isPending ? (
							<UsersTableSkeleton />
						) : usersQuery.isError ? (
							<Alert variant="destructive">
								<AlertTitle>Could not load accounts</AlertTitle>
								<AlertDescription>{usersQuery.error.message}</AlertDescription>
							</Alert>
						) : users.length === 0 ? (
							<div className="rounded-lg border border-dashed bg-muted/10 px-6 py-14 text-center">
								<div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
									<IconUsers className="size-5" />
								</div>
								<p className="font-medium">
									{search || roleFilter !== "all"
										? "No matching accounts"
										: "No user accounts yet"}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{search || roleFilter !== "all"
										? "Change the search or role filter."
										: "Create an account to get started."}
								</p>
							</div>
						) : (
							<div className="overflow-x-auto rounded-lg border">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/40 hover:bg-muted/40">
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Role</TableHead>
											<TableHead>Position</TableHead>
											<TableHead>Department</TableHead>
											<TableHead>Hire date</TableHead>
											<TableHead className="w-24 text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{users.map((user) => (
											<TableRow
												key={user.id}
												className="transition-colors hover:bg-muted/30"
											>
												<TableCell className="font-medium">
													<span className="block min-w-32">{user.name}</span>
												</TableCell>
												<TableCell>
													{user.email}
												</TableCell>
												<TableCell className="text-muted-foreground">
													<RoleBadge role={user.role} />
												</TableCell>
												<TableCell>{user.position || "—"}</TableCell>
												<TableCell className="whitespace-nowrap text-muted-foreground">
													{user.department || user.organizationalUnit || "—"}
												</TableCell>
												<TableCell>
													{user.hireDate
														? new Date(user.hireDate).toLocaleDateString()
														: "—"}
												</TableCell>
												<TableCell>
													<div className="flex justify-end gap-1">
														<Button
															variant="ghost"
															size="icon-sm"
															asChild
															aria-label={`Edit ${user.name}`}
														>
															<Link
																to="/users/edit/$id"
																params={{ id: user.id }}
															>
																<IconPencil />
															</Link>
														</Button>
														<Button
															variant="ghost"
															size="icon-sm"
															aria-label={`Delete ${user.name}`}
															disabled={user.id === currentUserId}
															onClick={() =>
																setDeletingUser(user as ManagedUser)
															}
														>
															<IconTrash className="text-destructive" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
						{!usersQuery.isPending && !usersQuery.isError && (
							<p className="border-t pt-4 text-xs text-muted-foreground">
								Showing {users.length} of {usersQuery.data?.length ?? 0}{" "}
								accounts
							</p>
						)}
					</CardContent>
				</Card>
			</main>

			<AlertDialog
				open={Boolean(deletingUser)}
				onOpenChange={(open) => {
					if (!open) setDeletingUser(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this account?</AlertDialogTitle>
						<AlertDialogDescription>
							{deletingUser
								? `${deletingUser.name} (${deletingUser.email}) will lose access. This action cannot be undone.`
								: ""}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deleteUser.isPending}
							onClick={(event) => {
								event.preventDefault();
								if (deletingUser) deleteUser.mutate({ id: deletingUser.id });
							}}
						>
							{deleteUser.isPending ? "Deleting…" : "Delete account"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function RoleBadge({ role }: { role: string }) {
	const variant =
		role === "Admin" ? "default" : role === "Manager" ? "secondary" : "outline";
	return <Badge variant={variant}>{role}</Badge>;
}

function UsersTableSkeleton() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 5 }, (_, index) => (
				<Skeleton key={index} className="h-11 w-full" />
			))}
		</div>
	);
}

function PageLoading() {
	return (
		<div className="mx-auto max-w-md space-y-3 p-8">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-24 w-full" />
		</div>
	);
}

function AccessDenied({ signedOut = false }: { signedOut?: boolean }) {
	return (
		<div className="mx-auto max-w-lg p-6 pt-16">
			<Alert variant="destructive">
				<AlertTitle>
					{signedOut ? "Sign in required" : "Administrator access required"}
				</AlertTitle>
				<AlertDescription>
					{signedOut
						? "Sign in with an administrator account to manage users."
						: "Your account does not have permission to manage users."}
				</AlertDescription>
			</Alert>
			{signedOut && (
				<Button className="mt-4" asChild>
					<Link to="/login">Go to sign in</Link>
				</Button>
			)}
		</div>
	);
}
