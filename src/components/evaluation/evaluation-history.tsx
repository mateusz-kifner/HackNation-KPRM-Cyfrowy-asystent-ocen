import type { EvaluationDetails } from "./evaluation-types";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function EvaluationHistory({
	evaluation,
}: {
	evaluation: EvaluationDetails;
}) {
	return (
		<div className="grid gap-5 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Participation records</CardTitle>
					<CardDescription>
						Acknowledgements record participation or receipt, not agreement with
						the result.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{evaluation.acknowledgements.length ? (
						evaluation.acknowledgements.map((item) => (
							<div key={item.id} className="rounded-md border p-3">
								<p className="font-medium">{item.type.replaceAll("_", " ")}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{item.status} · {formatDate(item.acknowledgedAt)}
								</p>
								{item.explanation ? (
									<p className="mt-2 whitespace-pre-wrap text-sm">
										{item.explanation}
									</p>
								) : null}
							</div>
						))
					) : (
						<p className="text-sm text-muted-foreground">
							No acknowledgements recorded.
						</p>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Assessment history</CardTitle>
					<CardDescription>
						Changes and decisions are listed newest first.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{evaluation.history.length ? (
						evaluation.history.map((event) => (
							<div key={event.id} className="border-l-2 pl-3">
								<p className="font-medium">
									{event.action.replaceAll("_", " ")}
								</p>
								<p className="text-xs text-muted-foreground">
									{formatDate(event.createdAt)}
									{event.actorUserId ? ` · ${event.actorUserId}` : ""}
								</p>
								{event.reason ? (
									<p className="mt-1 text-sm">{event.reason}</p>
								) : null}
								{event.afterValue ? (
									<details className="mt-1 text-xs">
										<summary className="cursor-pointer text-muted-foreground">
											View recorded change
										</summary>
										<pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">
											{formatSnapshot(event.afterValue)}
										</pre>
									</details>
								) : null}
							</div>
						))
					) : (
						<p className="text-sm text-muted-foreground">
							No changes recorded yet.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function formatSnapshot(value: string) {
	try {
		return JSON.stringify(JSON.parse(value), null, 2);
	} catch {
		return value;
	}
}
function formatDate(date: Date) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}
