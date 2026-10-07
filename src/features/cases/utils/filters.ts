import { CASE_PRIORITIES, CASE_STATUSES, type CaseFilters, type CaseSort } from "@/features/cases/types";

const SORTS: CaseSort[] = ["updated_desc", "updated_asc", "created_desc", "created_asc", "priority_desc", "sla_asc"];
export const DEFAULT_FILTERS: CaseFilters = { search: "", status: "all", priority: "all", assignee: "all", sort: "updated_desc", page: 1, pageSize: 20 };

export function parseCaseFilters(params: URLSearchParams): CaseFilters {
  const status = params.get("status") ?? "all";
  const priority = params.get("priority") ?? "all";
  const sort = params.get("sort") as CaseSort | null;
  return {
    search: params.get("search")?.trim() ?? "",
    status: CASE_STATUSES.includes(status as (typeof CASE_STATUSES)[number]) ? status as CaseFilters["status"] : "all",
    priority: CASE_PRIORITIES.includes(priority as (typeof CASE_PRIORITIES)[number]) ? priority as CaseFilters["priority"] : "all",
    assignee: params.get("assignee") || "all",
    sort: sort && SORTS.includes(sort) ? sort : DEFAULT_FILTERS.sort,
    page: Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1),
    pageSize: Math.min(100, Math.max(1, Number.parseInt(params.get("pageSize") ?? "20", 10) || 20)),
  };
}

export function serializeCaseFilters(filters: CaseFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.assignee !== "all") params.set("assignee", filters.assignee);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== DEFAULT_FILTERS.pageSize) params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export function hasActiveCaseFilters(filters: CaseFilters): boolean {
  return Boolean(filters.search || filters.status !== "all" || filters.priority !== "all" || filters.assignee !== "all");
}
