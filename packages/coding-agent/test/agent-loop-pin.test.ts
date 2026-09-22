import { describe, expect, it } from "vitest";
import {
	AGENT_LOOP_PIN_KEY,
	type AgentLoopPin,
	clearAgentLoopPin,
	getAgentLoopPin,
	setAgentLoopPin,
} from "../src/core/agent-loop-pin.ts";

function stubPin(sessionId: string): AgentLoopPin {
	return {
		sessionId,
		tools: [],
		streamFn: (() => {
			throw new Error("unused");
		}) as AgentLoopPin["streamFn"],
		convertToLlm: (messages) => messages as never,
		navigateTree: async () => ({ cancelled: false }),
		continueFromLeaf: async () => {},
		setCwd: () => {},
		setSystemPromptOverride: () => {},
		getSystemPrompt: () => "",
	};
}

describe("agent-loop-pin", () => {
	it("stores and reads by session id", () => {
		setAgentLoopPin("a", stubPin("a"));
		setAgentLoopPin("b", stubPin("b"));
		expect(getAgentLoopPin("a")?.sessionId).toBe("a");
		expect(getAgentLoopPin("b")?.sessionId).toBe("b");
		clearAgentLoopPin("a");
		expect(getAgentLoopPin("a")).toBeUndefined();
		expect(getAgentLoopPin("b")?.sessionId).toBe("b");
		clearAgentLoopPin("b");
		(globalThis as Record<string, unknown>)[AGENT_LOOP_PIN_KEY] = undefined;
	});

	it("live getters see later tool updates", () => {
		const tools: { name: string }[] = [];
		setAgentLoopPin("s", {
			get sessionId() {
				return "s";
			},
			get tools() {
				return tools as AgentLoopPin["tools"];
			},
			streamFn: stubPin("s").streamFn,
			convertToLlm: stubPin("s").convertToLlm,
			navigateTree: async () => ({ cancelled: false }),
			continueFromLeaf: async () => {},
			setCwd: () => {},
			setSystemPromptOverride: () => {},
			getSystemPrompt: () => "",
		});
		expect(getAgentLoopPin("s")?.tools).toEqual([]);
		tools.push({ name: "read" });
		expect(getAgentLoopPin("s")?.tools).toEqual([{ name: "read" }]);
		clearAgentLoopPin("s");
	});
});
