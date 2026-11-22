import { IconArrowLeft } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { EvaluationDocumentPreview } from "#/components/evaluation-document-preview";
import { EvaluationDocxDownload } from "#/components/evaluation-docx-download";
import { PageBreadcrumb } from "#/components/page-breadcrumb";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/evaluation/preview/$id")({
	component: EvaluationDocumentPreviewPage,
});

function EvaluationDocumentPreviewPage() {
	const { id } = Route.useParams();

	return (
		<main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
			<header className="space-y-3">
				<PageBreadcrumb
					items={[
						{ label: "Evaluations", href: "/evaluation" },
						{ label: "Assessment document preview" },
					]}
				/>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/evaluation">
							<IconArrowLeft /> Back to evaluations
						</Link>
					</Button>
					<EvaluationDocxDownload assessmentId={id} />
				</div>
				<p className="text-sm text-muted-foreground">
					Preview uses the saved assessment details and ratings.
				</p>
			</header>
			<EvaluationDocumentPreview assessmentId={id} />
		</main>
	);
}
