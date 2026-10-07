import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, hasActiveCaseFilters, parseCaseFilters, serializeCaseFilters } from "@/features/cases/utils/filters";

describe("case filter URL state", () => {
  it("reads shareable filters and page from query parameters", () => {
    const filters = parseCaseFilters(new URLSearchParams("search=invoice&status=in_progress&priority=high&assignee=user_ahmad&sort=sla_asc&page=2"));
    expect(filters).toEqual({ ...DEFAULT_FILTERS, search: "invoice", status: "in_progress", priority: "high", assignee: "user_ahmad", sort: "sla_asc", page: 2 });
  });
  it("serializes filters without default values and restores the same view", () => {
    const filters = { ...DEFAULT_FILTERS, search: "  invoice ", priority: "high" as const, page: 3 };
    const serialized = serializeCaseFilters(filters);
    expect(serialized).toBe("search=++invoice+&priority=high&page=3");
    expect(parseCaseFilters(new URLSearchParams(serialized))).toEqual({ ...filters, search: "invoice" });
  });
  it("falls back to defaults for invalid values and clamps pagination", () => {
    const filters = parseCaseFilters(new URLSearchParams("status=unknown&priority=urgent&sort=random&page=-3&pageSize=500"));
    expect(filters.status).toBe("all"); expect(filters.priority).toBe("all"); expect(filters.sort).toBe("updated_desc");
    expect(filters.page).toBe(1); expect(filters.pageSize).toBe(100);
  });
  it("distinguishes empty system state from active filtering", () => {
    expect(hasActiveCaseFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveCaseFilters({ ...DEFAULT_FILTERS, search: "invoice" })).toBe(true);
  });
});
