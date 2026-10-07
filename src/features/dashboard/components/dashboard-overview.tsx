"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CircleAlert, Clock3, Plus, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/display";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { CasePriorityBadge, CaseSlaBadge } from "@/features/cases/components/badges";
import { fetchAllCases } from "@/features/cases/api/client";
import { getSlaState } from "@/features/cases/utils/sla";
import { queryKeys } from "@/lib/query-keys";
import type { Activity, SupportCase } from "@/features/cases/types";

function MetricCard({ label, value, foot, icon: Icon, tone = "default" }: { label: string; value: number; foot: string; icon: typeof Clock3; tone?: string }) {
  return <article className="metric-card"><div className="metric-topline"><span>{label}</span><span className={`metric-icon metric-icon--${tone}`}><Icon size={16} aria-hidden="true" /></span></div><p className="metric-value">{value}</p><p className="metric-foot">{foot}</p></article>;
}

function ActivityLine({ activity, caseNumber, subject, caseId }: { activity: Activity; caseNumber: string; subject: string; caseId: string }) {
  const time = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(activity.createdAt));
  return <li className="activity-item"><span className="activity-marker" aria-hidden="true" /><div className="activity-copy"><p><strong>{activity.actor.name.split(" ")[0]}</strong> {activity.message.toLocaleLowerCase().includes("created") ? "created" : activity.message.toLocaleLowerCase().replace("status changed to", "moved to").replace("internal note added", "added an internal note").replace("priority changed to", "changed priority to").replace("assigned to", "assigned to")} <Link href={`/cases/${caseId}`} aria-label={`${caseNumber}: ${subject}`}>{caseNumber}</Link></p><time dateTime={activity.createdAt}>{time}</time></div></li>;
}

export function DashboardOverview() {
  const query = useQuery({ queryKey: queryKeys.cases.all, queryFn: fetchAllCases });
  if (query.isPending) return <><PageHeader eyebrow="Workspace" title="Overview" description="Monitor current customer operations and SLA risk." action={<Button asChild aria-label="Create case"><Link href="/cases/new"><Plus size={16} />Create case</Link></Button>} /><DashboardSkeleton /></>;
  if (query.isError) return <><PageHeader eyebrow="Workspace" title="Overview" description="Monitor current customer operations and SLA risk." action={<Button asChild><Link href="/cases/new"><Plus size={16} />Create case</Link></Button>} /><ErrorState title="We couldn't load your overview" description="Something went wrong while retrieving current operations data." reference="DASHBOARD_FETCH_FAILED" action={<Button onClick={() => void query.refetch()}><RotateCw size={15} />Try again</Button>} /></>;
  const cases = query.data;
  const active = cases.filter((item) => item.status !== "resolved");
  const high = active.filter((item) => item.priority === "high" || item.priority === "critical");
  const near = active.filter((item) => getSlaState(item.slaDueAt) === "due_soon");
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const resolvedToday = cases.filter((item) => item.status === "resolved" && new Date(item.updatedAt) >= startOfDay);
  const priorities = { critical: 4, high: 3, medium: 2, low: 1 } as const;
  const slaRank = { breached: 0, due_soon: 1, on_track: 2, none: 3 };
  const priorityCases = [...active].sort((a, b) => slaRank[getSlaState(a.slaDueAt)] - slaRank[getSlaState(b.slaDueAt)] || priorities[b.priority] - priorities[a.priority]).slice(0, 5);
  const recent = cases.flatMap((item) => item.activity.map((activity) => ({ activity, item }))).sort((a, b) => Date.parse(b.activity.createdAt) - Date.parse(a.activity.createdAt)).slice(0, 5);
  const detailHref = (item: SupportCase) => `/cases/${item.id}`;
  return <>
    <PageHeader eyebrow="Workspace" title="Overview" description="Monitor current customer operations and SLA risk." action={<Button asChild><Link href="/cases/new"><Plus size={16} />Create case</Link></Button>} />
    <section aria-label="Case metrics" className="metrics-grid"><MetricCard label="Open cases" value={active.length} foot="Across all customer requests" icon={Clock3} /><MetricCard label="High / Critical" value={high.length} foot="Needs a closer look" icon={CircleAlert} tone="warning" /><MetricCard label="Near SLA" value={near.length} foot="Due in the next two hours" icon={Clock3} tone="urgent" /><MetricCard label="Resolved today" value={resolvedToday.length} foot="Closed since midnight" icon={ShieldCheck} tone="success" /></section>
    <div className="dashboard-panels">
      <section className="panel priority-panel" aria-labelledby="priority-heading"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2 id="priority-heading">Priority cases</h2></div><Link href="/cases?sort=priority_desc" className="text-link">View queue <ArrowRight size={14} /></Link></div>
        {priorityCases.length === 0 ? <p className="inline-empty">Everything is up to date.</p> : <ul className="priority-list">{priorityCases.map((item) => <li key={item.id}><Link href={detailHref(item)} className="priority-item"><span className="priority-case-mark"><span className="sr-only">{item.caseNumber}</span>{item.caseNumber.slice(-2)}</span><span className="priority-item-main"><strong>{item.subject}</strong><span>{item.caseNumber}<span className="meta-dot">·</span>{item.customer.name}</span></span><span className="priority-item-state"><CasePriorityBadge priority={item.priority} /><CaseSlaBadge dueAt={item.slaDueAt} /></span><ArrowRight className="priority-chevron" size={15} aria-hidden="true" /></Link></li>)}</ul>}
        <Link className="panel-footer-link" href="/cases">View all cases <ArrowRight size={14} /></Link>
      </section>
      <section className="panel activity-panel" aria-labelledby="activity-heading"><div className="panel-heading"><div><p className="eyebrow">Team pulse</p><h2 id="activity-heading">Recent activity</h2></div></div>
        <ol className="activity-list">{recent.map(({ activity, item }) => <ActivityLine key={activity.id} activity={activity} caseNumber={item.caseNumber} subject={item.subject} caseId={item.id} />)}</ol>
        <Link className="panel-footer-link" href="/cases">Browse case queue <ArrowRight size={14} /></Link>
      </section>
    </div>
  </>;
}
