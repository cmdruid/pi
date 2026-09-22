import { describe, expect, it } from "vitest";
import { injectSlotPinIntoRequestInit, readSlotPin, SLOT_PIN_KEY } from "../src/extensions/llama/slot-pin.ts";

describe("injectSlotPinIntoRequestInit", () => {
	it("adds id_slot to a JSON body", () => {
		const next = injectSlotPinIntoRequestInit(
			{ method: "POST", body: JSON.stringify({ model: "m", messages: [] }) },
			1,
		);
		expect(JSON.parse(String(next?.body))).toEqual({ model: "m", messages: [], id_slot: 1 });
	});

	it("does not overwrite an existing id_slot", () => {
		const next = injectSlotPinIntoRequestInit({ method: "POST", body: JSON.stringify({ id_slot: 0 }) }, 1);
		expect(JSON.parse(String(next?.body)).id_slot).toBe(0);
	});

	it("leaves non-JSON bodies alone", () => {
		const init = { body: "not-json" };
		expect(injectSlotPinIntoRequestInit(init, 1)).toBe(init);
	});
});

describe("readSlotPin", () => {
	it("reads the house globalThis pin", () => {
		(globalThis as Record<string, unknown>)[SLOT_PIN_KEY] = { sessionId: "s", slot: 1 };
		expect(readSlotPin()).toBe(1);
		(globalThis as Record<string, unknown>)[SLOT_PIN_KEY] = undefined;
		expect(readSlotPin()).toBeUndefined();
	});
});
