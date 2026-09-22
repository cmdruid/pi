import { beforeAll, describe, expect, test, vi } from "vitest";
import type { AgentSessionEvent } from "../../../src/core/agent-session.ts";
import { InteractiveMode } from "../../../src/modes/interactive/interactive-mode.ts";
import { initTheme } from "../../../src/modes/interactive/theme/theme.ts";

type HandleEvent = (this: SessionTreeHandleThis, event: AgentSessionEvent) => Promise<void>;

type SessionTreeHandleThis = {
	isInitialized: boolean;
	footer: { invalidate(): void };
	ui: { requestRender(): void };
	rebuildChatFromMessages(): void;
};

describe("InteractiveMode.handleEvent session_tree", () => {
	beforeAll(() => {
		initTheme("dark");
	});

	test("rebuilds the transcript when the leaf changes", async () => {
		const rebuildChatFromMessages = vi.fn();
		const requestRender = vi.fn();
		const fakeThis: SessionTreeHandleThis = {
			isInitialized: true,
			footer: { invalidate: vi.fn() },
			ui: { requestRender },
			rebuildChatFromMessages,
		};
		const handleEvent = (InteractiveMode.prototype as unknown as { handleEvent: HandleEvent }).handleEvent;

		await handleEvent.call(fakeThis, {
			type: "session_tree",
			newLeafId: "new",
			oldLeafId: "old",
		});

		expect(rebuildChatFromMessages).toHaveBeenCalledOnce();
		expect(requestRender).toHaveBeenCalledOnce();
	});
});
