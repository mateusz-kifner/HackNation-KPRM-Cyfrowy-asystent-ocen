import {
	IconCircleCheck,
	IconClock,
	IconPlayerPlay,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Category } from "@/components/evaluation-category-page";

const evaluationLinks = [
	{
		label: "Running evaluations",
		to: "/evaluation/running",
		key: "running",
		icon: IconPlayerPlay,
	},
	{
		label: "Upcoming evaluations",
		to: "/evaluation/upcoming",
		key: "upcoming",
		icon: IconClock,
	},
	{
		label: "Completed evaluations",
		to: "/evaluation/completed",
		key: "completed",
		icon: IconCircleCheck,
	},
] as const;

export function EvaluationNavigation({ category }: { category: Category }) {
	return (
		<Card className="h-fit w-full shrink-0 shadow-lg shadow-black/5 md:sticky md:top-6 md:w-64">
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
					Evaluation pages
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<nav
					aria-label="Evaluation navigation"
					className="flex gap-2 overflow-x-auto md:flex-col"
				>
					{evaluationLinks.map(({ label, to, key, icon: Icon }) => {
						const active = category === key;
						return (
							<Link
								key={key}
								to={to}
								aria-current={active ? "page" : undefined}
								className={cn(
									"inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
									active
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								)}
							>
								<Icon className="size-4" aria-hidden="true" />
								{label}
							</Link>
						);
					})}
				</nav>
			</CardContent>
		</Card>
	);
}
