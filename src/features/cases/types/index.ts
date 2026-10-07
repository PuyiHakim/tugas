export const CASE_STATUSES = ["open", "in_progress", "waiting_customer", "resolved"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];
export const CASE_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];
export const CASE_TAGS = ["billing", "account access", "mobile", "integrations", "reporting", "onboarding", "data import", "security", "invoices", "notifications"] as const;
export type User = { id: string; name: string; initials: string };
export type Customer = { id: string; name: string; company?: string; email?: string };
export type ActivityType = "case_created" | "status_changed" | "priority_changed" | "assignee_changed" | "note_added";
export type Activity = { id: string; type: ActivityType; message: string; actor: User; createdAt: string; body?: string };
export type SupportCase = {
  id: string; caseNumber: string; subject: string; description: string;
  status: CaseStatus; priority: CasePriority; customer: Customer; assignee: User | null;
  tags: string[]; createdAt: string; updatedAt: string; slaDueAt: string | null; activity: Activity[];
};
export type CaseSort = "updated_desc" | "updated_asc" | "created_desc" | "created_asc" | "priority_desc" | "sla_asc";
export type CaseFilters = {
  search: string; status: CaseStatus | "all"; priority: CasePriority | "all";
  assignee: string | "all"; sort: CaseSort; page: number; pageSize: number;
};
export type CasePatch = Partial<Pick<SupportCase, "status" | "priority">> & { assigneeId?: string | null };
export type ApiList<T> = { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };
