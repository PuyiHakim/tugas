import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryKeys } from "@/lib/query-keys";
import type { SupportCase } from "@/features/cases/types";

const mocks = vi.hoisted(() => ({ patchCase: vi.fn() }));
vi.mock("@/features/cases/api/client", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/features/cases/api/client")>()), patchCase: mocks.patchCase }));
import { useCaseUpdate } from "@/features/cases/hooks/use-case-update";

const initial: SupportCase = {
  id: "case_1048", caseNumber: "CS-1048", subject: "Invoice download returns an error", description: "Customer cannot download an invoice from the portal.",
  status: "open", priority: "medium", customer: { id: "customer_01", name: "Northstar Studio" }, assignee: null, tags: ["billing"],
  createdAt: "2026-10-01T10:00:00.000Z", updatedAt: "2026-10-01T11:00:00.000Z", slaDueAt: null, activity: [],
};

describe("optimistic case mutation rollback", () => {
  beforeEach(() => { mocks.patchCase.mockReset(); });
  it("shows the optimistic status, then restores the previous value after API failure", async () => {
    let rejectRequest!: (error: Error) => void;
    mocks.patchCase.mockImplementation(() => new Promise((_resolve, reject) => { rejectRequest = reject; }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    client.setQueryData(queryKeys.cases.detail(initial.id), initial);
    const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useCaseUpdate(initial.id, []), { wrapper });
    act(() => result.current.mutate({ status: "resolved" }));
    await waitFor(() => expect(client.getQueryData<SupportCase>(queryKeys.cases.detail(initial.id))?.status).toBe("resolved"));
    await act(async () => { rejectRequest(new Error("offline")); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<SupportCase>(queryKeys.cases.detail(initial.id))?.status).toBe("open");
    expect(result.current.failedPatch).toEqual({ status: "resolved" });
  });
});
