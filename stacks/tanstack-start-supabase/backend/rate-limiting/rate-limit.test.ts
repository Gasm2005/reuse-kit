import { describe, expect, it } from "vitest";
import { isWithinRateLimit, type RateLimitRpcClient } from "./rate-limit";

/**
 * A stand-in for the Supabase client that behaves like the real one in the way
 * that matters: `rpc` reads `this` internally. supabase-js touches `this.rest`,
 * so an unbound call throws "Cannot read properties of undefined (reading
 * 'rest')". That exact mistake took the order-confirmation page and
 * /track-order offline, so the first test below asserts the RPC actually RAN —
 * not merely that the function returned something. Because isWithinRateLimit
 * fails open, a swallowed binding error would otherwise look like success.
 */
function makeClient(result: { data: unknown; error: unknown }) {
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  const client = {
    rest: { marker: true },
    rpc(fn: string, args: Record<string, unknown>) {
      // Throws a TypeError natively if invoked with `this` undefined.
      void (this as { rest: unknown }).rest;
      calls.push({ fn, args });
      return Promise.resolve(result);
    },
  };
  return { client: client as unknown as RateLimitRpcClient, calls };
}

describe("isWithinRateLimit", () => {
  it("invokes check_rate_limit as a bound method with the expected args", async () => {
    const { client, calls } = makeClient({ data: true, error: null });

    const allowed = await isWithinRateLimit(client, "order-confirm:1.2.3.4", 20, 600);

    // If `rpc` were detached from the client, `this.rest` would throw, the
    // catch would fail open, and this array would be empty.
    expect(calls).toHaveLength(1);
    expect(calls[0].fn).toBe("check_rate_limit");
    expect(calls[0].args).toEqual({
      p_key: "order-confirm:1.2.3.4",
      p_max: 20,
      p_window_seconds: 600,
    });
    expect(allowed).toBe(true);
  });

  it("reports over-limit only on an explicit false", async () => {
    const { client } = makeClient({ data: false, error: null });
    await expect(isWithinRateLimit(client, "k", 10, 600)).resolves.toBe(false);
  });

  it("fails open when the RPC returns an error", async () => {
    const { client } = makeClient({ data: null, error: { message: "function not found" } });
    await expect(isWithinRateLimit(client, "k", 10, 600)).resolves.toBe(true);
  });

  it("fails open when the RPC returns null without an error", async () => {
    const { client } = makeClient({ data: null, error: null });
    await expect(isWithinRateLimit(client, "k", 10, 600)).resolves.toBe(true);
  });

  it("fails open when the RPC throws", async () => {
    const client = {
      rpc() {
        throw new Error("network down");
      },
    } as unknown as RateLimitRpcClient;
    await expect(isWithinRateLimit(client, "k", 10, 600)).resolves.toBe(true);
  });

  it("fails open when rpc is called unbound (documents the original outage)", async () => {
    const { client } = makeClient({ data: false, error: null });
    const detached = (client as unknown as { rpc: RateLimitRpcClient["rpc"] }).rpc;
    // This is what the buggy code did. It throws rather than rate limiting.
    await expect(async () => detached("check_rate_limit", {})).rejects.toThrow(TypeError);
  });
});
