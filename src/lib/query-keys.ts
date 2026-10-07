import type { CaseFilters } from "@/features/cases/types";

export const queryKeys = {
  cases: {
    all: ["cases"] as const,
    list: (filters: CaseFilters) => ["cases", "list", filters] as const,
    detail: (id: string) => ["cases", "detail", id] as const,
  },
  users: { all: () => ["users"] as const },
  customers: { search: (query: string) => ["customers", query] as const },
};
