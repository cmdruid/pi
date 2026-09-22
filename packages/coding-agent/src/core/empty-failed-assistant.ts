/**
 * Empty error/aborted assistants must not enter JSONL or the next LLM
 * prompt: they change the token prefix vs a restored GPU KV snapshot
 * (issues-2 / 90k cold re-prefill after llama death or owner abort).
 */
export function isEmptyFailedAssistant(message: {
	role?: string;
	stopReason?: string;
	content?: readonly unknown[];
	usage?: {
		input?: number;
		output?: number;
		cacheRead?: number;
		totalTokens?: number;
	};
}): boolean {
	if (message.role !== "assistant") return false;
	if (message.stopReason !== "error" && message.stopReason !== "aborted") return false;
	if ((message.content?.length ?? 0) > 0) return false;
	const u = message.usage;
	if (!u) return true;
	const input = u.input ?? 0;
	const output = u.output ?? 0;
	const cacheRead = u.cacheRead ?? 0;
	const total = u.totalTokens ?? 0;
	return input === 0 && output === 0 && cacheRead === 0 && total === 0;
}
