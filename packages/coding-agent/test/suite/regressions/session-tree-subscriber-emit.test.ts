import { afterEach, describe, expect, it } from "vitest";
import { assistantMsg, userMsg } from "../../utilities.ts";
import { createHarness, type Harness } from "../harness.ts";

describe("navigateTree emits session_tree to session subscribers", () => {
	let harness: Harness | undefined;

	afterEach(() => harness?.cleanup());

	it("emits session_tree with old and new leaf ids", async () => {
		harness = await createHarness();
		harness.sessionManager.appendMessage(userMsg("first"));
		const targetId = harness.sessionManager.appendMessage(assistantMsg("reply"));
		harness.sessionManager.appendMessage(userMsg("second"));
		const oldLeafId = harness.sessionManager.appendMessage(assistantMsg("later"));
		harness.session.agent.state.messages = harness.sessionManager.buildSessionContext().messages;

		const result = await harness.session.navigateTree(targetId, { summarize: false });
		expect(result.cancelled).toBe(false);

		const events = harness.eventsOfType("session_tree");
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: "session_tree",
			oldLeafId,
			newLeafId: targetId,
		});
		expect(harness.sessionManager.getLeafId()).toBe(targetId);
	});

	it("does not emit when already at the target", async () => {
		harness = await createHarness();
		harness.sessionManager.appendMessage(userMsg("first"));
		const leafId = harness.sessionManager.appendMessage(assistantMsg("reply"));
		harness.session.agent.state.messages = harness.sessionManager.buildSessionContext().messages;

		const result = await harness.session.navigateTree(leafId, { summarize: false });
		expect(result.cancelled).toBe(false);
		expect(harness.eventsOfType("session_tree")).toHaveLength(0);
	});
});
