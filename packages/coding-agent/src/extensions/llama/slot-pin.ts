/**
 * K4: read the house checkpoint slot pin and inject `id_slot` into the
 * llama.cpp request body. Server accepts it on /v1/chat/completions via
 * oaicompat remaining-property passthrough (see llama.cpp server README
 * `id_slot`). Fetch inject survives OpenAI SDK field stripping.
 *
 * Writer: ~/Projects/pi-agent/extensions/lib/slot-pin.ts (globalThis).
 */
export const SLOT_PIN_KEY = "__piLlamaSlotPin";

export function readSlotPin(): number | undefined {
	const pin = (globalThis as Record<string, unknown>)[SLOT_PIN_KEY] as
		| { sessionId?: string; slot?: number }
		| undefined;
	return typeof pin?.slot === "number" && Number.isInteger(pin.slot) && pin.slot >= 0 ? pin.slot : undefined;
}

/** Add id_slot to a JSON POST body if missing. Used by the llama provider fetch wrap. */
export function injectSlotPinIntoRequestInit(init: RequestInit | undefined, slot: number): RequestInit | undefined {
	if (!init?.body || typeof init.body !== "string") return init;
	try {
		const body = JSON.parse(init.body) as unknown;
		if (!body || typeof body !== "object" || Array.isArray(body)) return init;
		const rec = body as Record<string, unknown>;
		if (rec.id_slot != null) return init;
		return { ...init, body: JSON.stringify({ ...rec, id_slot: slot }) };
	} catch {
		return init;
	}
}

export function wrapFetchWithSlotPin(
	inner: typeof globalThis.fetch | undefined,
	slot: number | undefined,
): typeof globalThis.fetch | undefined {
	if (slot === undefined) return inner;
	const base = inner ?? globalThis.fetch;
	return ((input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) =>
		base(input, injectSlotPinIntoRequestInit(init, slot))) as typeof fetch;
}
