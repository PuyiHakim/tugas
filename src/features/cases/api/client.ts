import type { ApiList, CaseFilters, CasePatch, Customer, SupportCase, User } from "@/features/cases/types";
import type { CreateCaseInput } from "@/features/cases/schemas/case-schemas";

export class ApiRequestError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number) { super(message); this.name = "ApiRequestError"; }
}

type ApiEnvelope<T> = { data: T; meta?: ApiList<unknown>["meta"] };

async function requestEnvelope<T>(url: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  if (typeof window !== "undefined") {
    const mode = window.localStorage.getItem("relay:demo-mode");
    if (mode) headers.set("x-relay-demo-mode", mode);
  }
  const response = await fetch(url, { ...init, headers });
  const payload = await response.json().catch(() => null) as { data?: T; meta?: ApiList<unknown>["meta"]; error?: { code?: string; message?: string } } | null;
  if (!response.ok) throw new ApiRequestError(payload?.error?.message ?? "Something went wrong. Please try again.", payload?.error?.code ?? "REQUEST_FAILED", response.status);
  if (!payload || payload.data === undefined) throw new ApiRequestError("The server returned an incomplete response.", "INVALID_RESPONSE", 500);
  return payload as ApiEnvelope<T>;
}
async function request<T>(url: string, init?: RequestInit): Promise<T> { return (await requestEnvelope<T>(url, init)).data; }

export async function fetchCases(filters: CaseFilters): Promise<ApiList<SupportCase>> {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: String(filters.pageSize), sort: filters.sort });
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.assignee !== "all") params.set("assignee", filters.assignee);
  const response = await requestEnvelope<SupportCase[]>(`/api/cases?${params}`);
  if (!response.meta) throw new ApiRequestError("The server returned incomplete case page details.", "INVALID_RESPONSE", 500);
  return { data: response.data, meta: response.meta };
}
export async function fetchAllCases(): Promise<SupportCase[]> {
  const first = await fetchCases({ search: "", status: "all", priority: "all", assignee: "all", sort: "updated_desc", page: 1, pageSize: 100 });
  if (first.meta.totalPages < 2) return first.data;
  const rest = await fetchCases({ search: "", status: "all", priority: "all", assignee: "all", sort: "updated_desc", page: 2, pageSize: 100 });
  return [...first.data, ...rest.data];
}
export const fetchCase = (id: string) => request<SupportCase>(`/api/cases/${id}`);
export const fetchUsers = () => request<User[]>("/api/users");
export const fetchCustomers = (search = "") => request<Customer[]>(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const createCase = (body: CreateCaseInput) => request<{ id: string; caseNumber: string }>("/api/cases", { method: "POST", body: JSON.stringify(body) });
export const patchCase = (id: string, body: CasePatch) => request<SupportCase>(`/api/cases/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const createNote = (id: string, body: string) => request<SupportCase["activity"][number]>(`/api/cases/${id}/notes`, { method: "POST", body: JSON.stringify({ body }) });
