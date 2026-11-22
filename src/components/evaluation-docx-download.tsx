import { IconDownload } from "@tabler/icons-react";
import { Button } from "#/components/ui/button";
import { useEvaluationExportDocx } from "#/hooks/api/evaluations/useEvaluationExportDocx";

function saveBase64File(filename: string, contentBase64: string) {
	const binary = window.atob(contentBase64);
	const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
	const url = URL.createObjectURL(
		new Blob([bytes], {
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		}),
	);
	const anchor = window.document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

export function EvaluationDocxDownload({
	assessmentId,
}: {
	assessmentId: string;
}) {
	const exportDocx = useEvaluationExportDocx({
		onSuccess: ({ filename, contentBase64 }) =>
			saveBase64File(filename, contentBase64),
	});

	return (
		<Button
			variant="outline"
			size="sm"
			disabled={exportDocx.isPending}
			onClick={() => exportDocx.mutate({ id: assessmentId })}
		>
			<IconDownload aria-hidden="true" />
			{exportDocx.isPending ? "Generating…" : "DOCX"}
		</Button>
	);
}
