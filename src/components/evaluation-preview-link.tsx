import { IconEye } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function EvaluationPreviewLink({
	evaluationId,
	children,
}: {
	evaluationId: string;
	children: ReactNode;
}) {
	return (
		<Link
			to="/evaluation/$id"
			params={{ id: evaluationId }}
			className="inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:underline"
			aria-label={`Open current preview for ${typeof children === "string" ? children : "evaluation"}`}
		>
			<IconEye aria-hidden="true" size={16} />
			{children}
		</Link>
	);
}
