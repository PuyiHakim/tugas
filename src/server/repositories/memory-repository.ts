import { CUSTOMERS, DEMO_CASES, USERS } from "@/server/seed/demo-data";
import type { CaseFilters, CasePatch, SupportCase, User } from "@/features/cases/types";

const cases = new Map(DEMO_CASES.map((item) => [item.id, structuredClone(item)]));
const priorities = { critical: 4, high: 3, medium: 2, low: 1 } as const;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function simulateRequest(request: Request, write = false) {
  await wait(320);
  const mode = request.headers.get("x-relay-demo-mode");
  if (mode === "fail_reads" && !write || mode === "fail_writes" && write) return true;
  return false;
}

function includesSearch(item: SupportCase, query: string) {
  const normalized = query.toLocaleLowerCase();
  return [item.caseNumber, item.subject, item.customer.name].some((part) => part.toLocaleLowerCase().includes(normalized));
}

export function listCases(filters: CaseFilters, empty = false) {
  if (empty) return { items: [] as SupportCase[], total: 0 };
  let items = [...cases.values()];
  if (filters.search) items = items.filter((item) => includesSearch(item, filters.search));
  if (filters.status !== "all") items = items.filter((item) => item.status === filters.status);
  if (filters.priority !== "all") items = items.filter((item) => item.priority === filters.priority);
  if (filters.assignee === "unassigned") items = items.filter((item) => item.assignee === null);
  else if (filters.assignee !== "all") items = items.filter((item) => item.assignee?.id === filters.assignee);
  const date = (value: string) => new Date(value).getTime();
  switch (filters.sort) {
    case "updated_asc": items.sort((a, b) => date(a.updatedAt) - date(b.updatedAt)); break;
    case "created_desc": items.sort((a, b) => date(b.createdAt) - date(a.createdAt)); break;
    case "created_asc": items.sort((a, b) => date(a.createdAt) - date(b.createdAt)); break;
    case "priority_desc": items.sort((a, b) => priorities[b.priority] - priorities[a.priority] || date(b.updatedAt) - date(a.updatedAt)); break;
    case "sla_asc": items.sort((a, b) => (a.slaDueAt ? date(a.slaDueAt) : Number.MAX_SAFE_INTEGER) - (b.slaDueAt ? date(b.slaDueAt) : Number.MAX_SAFE_INTEGER)); break;
    default: items.sort((a, b) => date(b.updatedAt) - date(a.updatedAt));
  }
  return { items, total: items.length };
}

export function getCase(id: string) { const item = cases.get(id); return item ? structuredClone(item) : null; }

export function createCase(input: { customerId: string; subject: string; description: string; priority: SupportCase["priority"]; assigneeId: string | null; tags: string[] }) {
  const customer = CUSTOMERS.find((item) => item.id === input.customerId)!;
  const assignee = input.assigneeId ? USERS.find((item) => item.id === input.assigneeId) ?? null : null;
  const nextNumber = Math.max(...[...cases.values()].map((item) => Number(item.caseNumber.slice(3)))) + 1;
  const now = new Date().toISOString();
  const actor = USERS[0];
  const item: SupportCase = {
    id: `case_${nextNumber}`, caseNumber: `CS-${nextNumber}`, subject: input.subject.trim(), description: input.description.trim(),
    status: "open", priority: input.priority, customer, assignee, tags: input.tags,
    createdAt: now, updatedAt: now, slaDueAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    activity: [{ id: `act_${nextNumber}_created`, type: "case_created", message: `${actor.name} created this case`, actor, createdAt: now }],
  };
  cases.set(item.id, item);
  return structuredClone(item);
}

export function updateCase(id: string, patch: CasePatch): SupportCase | null {
  const item = cases.get(id);
  if (!item) return null;
  const actor = USERS[0];
  const now = new Date().toISOString();
  const changes: SupportCase["activity"] = [];
  if (patch.status && patch.status !== item.status) changes.push({ id: `act_${crypto.randomUUID()}`, type: "status_changed", message: `Status changed to ${patch.status.replaceAll("_", " ")}`, actor, createdAt: now });
  if (patch.priority && patch.priority !== item.priority) changes.push({ id: `act_${crypto.randomUUID()}`, type: "priority_changed", message: `Priority changed to ${patch.priority}`, actor, createdAt: now });
  if ("assigneeId" in patch && patch.assigneeId !== item.assignee?.id) {
    const assignee = patch.assigneeId ? USERS.find((user) => user.id === patch.assigneeId) ?? null : null;
    changes.push({ id: `act_${crypto.randomUUID()}`, type: "assignee_changed", message: assignee ? `Assigned to ${assignee.name}` : "Case unassigned", actor, createdAt: now });
    item.assignee = assignee;
  }
  if (patch.status) item.status = patch.status;
  if (patch.priority) item.priority = patch.priority;
  if (changes.length) { item.updatedAt = now; item.activity.push(...changes); }
  return structuredClone(item);
}

export function addNote(id: string, body: string) {
  const item = cases.get(id);
  if (!item) return null;
  const activity = { id: `act_${crypto.randomUUID()}`, type: "note_added" as const, message: "Internal note added", body, actor: USERS[0], createdAt: new Date().toISOString() };
  item.activity.push(activity); item.updatedAt = activity.createdAt;
  return structuredClone(activity);
}

export function listUsers(): User[] { return structuredClone(USERS); }
export function listCustomers(search = "") { return structuredClone(CUSTOMERS.filter((item) => `${item.name} ${item.company ?? ""}`.toLowerCase().includes(search.toLowerCase()))); }
