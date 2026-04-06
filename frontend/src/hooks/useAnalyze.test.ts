import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAnalyze from "./useAnalyze";

describe("useAnalyze", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useAnalyze());
    expect(result.current.appState).toBe("idle");
    expect(result.current.words).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("transitions to loading then success on valid response", async () => {
    const mockWords = [
      { word: "test", weight: 0.9, sentiment: 0.5 },
      { word: "hello", weight: 0.6, sentiment: 0.1 },
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ words: mockWords, total: 2 }),
    } as Response);

    const { result } = renderHook(() => useAnalyze());

    await act(async () => {
      await result.current.analyze("https://example.com");
    });

    expect(result.current.appState).toBe("success");
    expect(result.current.words).toEqual(mockWords);
  });

  it("transitions to error on failed response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: "Server exploded" }),
    } as Response);

    const { result } = renderHook(() => useAnalyze());

    await act(async () => {
      await result.current.analyze("https://example.com");
    });

    expect(result.current.appState).toBe("error");
    expect(result.current.error).toBe("Server exploded");
  });

  it("transitions to error on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAnalyze());

    await act(async () => {
      await result.current.analyze("https://example.com");
    });

    expect(result.current.appState).toBe("error");
    expect(result.current.error).toBe("Network error");
  });

  it("resets back to idle", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ words: [{ word: "a", weight: 1, sentiment: 0 }], total: 1 }),
    } as Response);

    const { result } = renderHook(() => useAnalyze());

    await act(async () => {
      await result.current.analyze("https://example.com");
    });
    expect(result.current.appState).toBe("success");

    act(() => {
      result.current.reset();
    });

    expect(result.current.appState).toBe("idle");
    expect(result.current.words).toEqual([]);
    expect(result.current.error).toBe("");
  });
});
