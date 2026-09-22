import { describe, expect, it } from "vitest";
import { isEmptyFailedAssistant } from "../src/core/empty-failed-assistant.ts";

describe("isEmptyFailedAssistant", () => {
	it("matches empty aborted/error with zero usage", () => {
		expect(
			isEmptyFailedAssistant({
				role: "assistant",
				stopReason: "aborted",
				content: [],
				usage: { input: 0, output: 0, cacheRead: 0, totalTokens: 0 },
			}),
		).toBe(true);
		expect(isEmptyFailedAssistant({ role: "assistant", stopReason: "error", content: [] })).toBe(true);
	});

	it("does not match partial aborts or successes", () => {
		expect(
			isEmptyFailedAssistant({
				role: "assistant",
				stopReason: "aborted",
				content: [{ type: "thinking", thinking: "x" }],
			}),
		).toBe(false);
		expect(
			isEmptyFailedAssistant({
				role: "assistant",
				stopReason: "stop",
				content: [],
				usage: { input: 0, output: 0, cacheRead: 0, totalTokens: 0 },
			}),
		).toBe(false);
		expect(
			isEmptyFailedAssistant({
				role: "user",
				stopReason: "aborted",
				content: [],
			}),
		).toBe(false);
	});
});
