import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationExportDocx(
	options?: Parameters<
		ReturnType<typeof useTRPC>["evaluations"]["exportDocx"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	return useMutation(trpc.evaluations.exportDocx.mutationOptions(options));
}
