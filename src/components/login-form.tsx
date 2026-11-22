import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { authClient } from "#/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useUserLoginOptions } from "#/hooks/api/users/useUserLoginOptions";

const MOCK_PASSWORD = "password123";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const navigate = useNavigate();
	const usersQuery = useUserLoginOptions();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleMockSignIn = async (email: string) => {
		setLoading(true);
		setError(null);
		try {
			await authClient.signIn.email({ email, password: MOCK_PASSWORD });
			navigate({ to: "/" });
		} catch (e: any) {
			setError(e?.message ?? "Failed to sign in");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome</CardTitle>
					<CardDescription>Sign in as a mock user</CardDescription>
				</CardHeader>
				<CardContent>
					{usersQuery.isPending ? (
						<p className="text-sm text-muted-foreground">Loading accounts…</p>
					) : null}
					{usersQuery.isError ? (
						<p role="alert" className="text-sm text-destructive">
							Could not load accounts. Please refresh the page.
						</p>
					) : null}
					{usersQuery.data?.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No accounts are available.
						</p>
					) : null}
					<div className="max-h-48 space-y-2 overflow-y-auto">
						{usersQuery.data?.map((user) => (
							<Button
								key={user.id}
								onClick={() => handleMockSignIn(user.email)}
								disabled={loading}
								className="w-full"
							>
								{loading ? "Signing in..." : `Login as ${user.name}`}
							</Button>
						))}
					</div>
					{error && (
						<p className="mt-4 text-sm text-red-600 text-center">{error}</p>
					)}
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}
