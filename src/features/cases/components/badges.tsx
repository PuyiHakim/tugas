import { Badge } from "@/components/ui/display";
import { getSlaState, formatSla } from "@/features/cases/utils/sla";
import type { CasePriority, CaseStatus } from "@/features/cases/types";

const statusLabel: Record<CaseStatus, string> = { open: "Open", in_progress: "In progress", waiting_customer: "Waiting on customer", resolved: "Resolved" };
const priorityLabel: Record<CasePriority, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

export function CaseStatusBadge({ status }: { status: CaseStatus }) { return <Badge className={`status-badge status-${status}`}><span className="badge-dot" aria-hidden="true" />{statusLabel[status]}</Badge>; }
export function CasePriorityBadge({ priority }: { priority: CasePriority }) { return <Badge className={`priority-badge priority-${priority}`}><span className="priority-indicator" aria-hidden="true">{priority === "critical" ? "↑↑" : priority === "high" ? "↑" : priority === "medium" ? "–" : "↓"}</span>{priorityLabel[priority]}</Badge>; }
export function CaseSlaBadge({ dueAt, now }: { dueAt: string | null; now?: number }) { const state = getSlaState(dueAt, now); return <Badge className={`sla-badge sla-${state}`}>{formatSla(dueAt, now)}</Badge>; }
