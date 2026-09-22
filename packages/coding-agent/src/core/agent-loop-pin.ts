/**
 * Process-wide pin of the live AgentSession loop bindings.
 * Writer: AgentSession. Reader: house aside (globalThis; jiti moduleCache: false).
 * Keyed by session id so a nested createAgentSession (subagent) cannot clobber the parent.
 */
import type {
	AfterToolCallContext,
	AfterToolCallResult,
	AgentMessage,
	AgentTool,
	BeforeToolCallContext,
	BeforeToolCallResult,
	StreamFn,
	ToolExecutionMode,
} from "@earendil-works/pi-agent-core";
import type { Message, SimpleStreamOptions, ThinkingBudgets, Transport } from "@earendil-works/pi-ai";

export const AGENT_LOOP_PIN_KEY = "__piAgentLoopPin";

export interface AgentLoopPin {
	readonly sessionId: string;
	readonly tools: AgentTool[];
	readonly streamFn: StreamFn;
	readonly convertToLlm: (messages: AgentMessage[]) => Message[] | Promise<Message[]>;
	readonly beforeToolCall?: (
		context: BeforeToolCallContext,
		signal?: AbortSignal,
	) => Promise<BeforeToolCallResult | undefined>;
	readonly afterToolCall?: (
		context: AfterToolCallContext,
		signal?: AbortSignal,
	) => Promise<AfterToolCallResult | undefined>;
	readonly onPayload?: SimpleStreamOptions["onPayload"];
	readonly onResponse?: SimpleStreamOptions["onResponse"];
	readonly getApiKey?: (provider: string) => Promise<string | undefined> | string | undefined;
	readonly thinkingBudgets?: ThinkingBudgets;
	readonly toolExecution?: ToolExecutionMode;
	readonly transport?: Transport;
	readonly maxRetryDelayMs?: number;
	navigateTree: (
		targetId: string,
		options?: { summarize?: boolean; customInstructions?: string; replaceInstructions?: boolean; label?: string },
	) => Promise<{ cancelled: boolean; aborted?: boolean }>;
	continueFromLeaf: () => Promise<void>;
	setCwd: (cwd: string) => void;
	setSystemPromptOverride: (prompt: string | undefined) => void;
	getSystemPrompt: () => string;
}

interface GlobalPin {
	[AGENT_LOOP_PIN_KEY]?: Record<string, AgentLoopPin>;
}

function store(): Record<string, AgentLoopPin> {
	const g = globalThis as unknown as GlobalPin;
	if (!g[AGENT_LOOP_PIN_KEY]) g[AGENT_LOOP_PIN_KEY] = {};
	return g[AGENT_LOOP_PIN_KEY];
}

export function setAgentLoopPin(sessionId: string, pin: AgentLoopPin): void {
	if (!sessionId) return;
	store()[sessionId] = pin;
}

export function clearAgentLoopPin(sessionId: string): void {
	if (!sessionId) return;
	const pins = (globalThis as unknown as GlobalPin)[AGENT_LOOP_PIN_KEY];
	if (!pins) return;
	delete pins[sessionId];
}

export function getAgentLoopPin(sessionId: string): AgentLoopPin | undefined {
	if (!sessionId) return undefined;
	return (globalThis as unknown as GlobalPin)[AGENT_LOOP_PIN_KEY]?.[sessionId];
}
