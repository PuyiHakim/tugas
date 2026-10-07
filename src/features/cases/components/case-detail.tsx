"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RotateCw, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AvatarInitials, ErrorState, Skeleton } from "@/components/ui/display";
import { Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toast";
import { CasePriorityBadge, CaseSlaBadge, CaseStatusBadge } from "@/features/cases/components/badges";
import { fetchCase, fetchUsers, createNote } from "@/features/cases/api/client";
import { useCaseUpdate } from "@/features/cases/hooks/use-case-update";
import { noteSchema } from "@/features/cases/schemas/case-schemas";
import { queryKeys } from "@/lib/query-keys";
import type { Activity, CasePatch, CasePriority, CaseStatus, SupportCase } from "@/features/cases/types";

function DetailSkeleton() {
  return <div className="detail-skeleton" role="status" aria-label="Loading case details"><span className="sr-only">Loading case details</span><div><Skeleton className="skeleton-heading" /><Skeleton className="skeleton-case" /><Skeleton className="skeleton-paragraph" /><Skeleton className="skeleton-paragraph short" /><Skeleton className="skeleton-heading" /><Skeleton className="skeleton-foot" /></div><aside><Skeleton className="skeleton-heading" />{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="skeleton-control" />)}</aside></div>;
}

function ActivityEntry({ activity }: { activity: Activity }) {
  const date = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(activity.createdAt));
  return <li className="timeline-item"><span className={`timeline-icon timeline-icon--${activity.type}`} aria-hidden="true">{activity.type === "note_added" ? "N" : activity.type === "case_created" ? "+" : "↗"}</span><div className="timeline-body"><div className="timeline-heading"><strong>{activity.message}</strong><time dateTime={activity.createdAt}>{date}</time></div><span className="timeline-actor"><AvatarInitials initials={activity.actor.initials} />{activity.actor.name}</span>{activity.body && <p className="timeline-note">{activity.body}</p>}</div></li>;
}

function NoteForm({ item }: { item: SupportCase }) {
  const [body, setBody] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (text: string) => createNote(item.id, text),
    onSuccess: (activity) => {
      queryClient.setQueryData<SupportCase>(queryKeys.cases.detail(item.id), (current) => current ? { ...current, activity: [...current.activity, activity], updatedAt: activity.createdAt } : current);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
      setBody(""); setValidation(null); toast("Internal note added", undefined, "success");
    },
    onError: () => toast("Couldn't add this note", "Your draft is still here. Try again when you're ready.", "error"),
  });
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = noteSchema.safeParse({ body });
    if (!parsed.success) { setValidation(parsed.error.issues[0]?.message ?? "Check this note."); return; }
    setValidation(null); mutation.mutate(parsed.data.body);
  };
  return <form className="note-form" onSubmit={submit} noValidate><label htmlFor="internal-note">Add an internal note</label><p className="field-hint" id="note-help">Only your operations team can see this note.</p><Textarea id="internal-note" rows={4} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Share context with your team…" aria-describedby={`note-help${validation ? " note-error" : ""}`} aria-invalid={Boolean(validation)} disabled={mutation.isPending} />{validation && <p className="field-error" id="note-error">{validation}</p>}<div className="note-form-footer"><span>{body.trim().length}/1,000</span><Button type="submit" size="small" disabled={mutation.isPending}>{mutation.isPending ? <><span className="button-spinner" />Adding…</> : <><Send size={14} />Add note</>}</Button></div></form>;
}

function CaseDetailContent() {
  const params = useParams<{ caseId: string }>();
  const searchParams = useSearchParams();
  const backQuery = searchParams.toString();
  const backHref = `/cases${backQuery ? `?${backQuery}` : ""}`;
  const itemQuery = useQuery({ queryKey: queryKeys.cases.detail(params.caseId), queryFn: () => fetchCase(params.caseId) });
  const usersQuery = useQuery({ queryKey: queryKeys.users.all(), queryFn: fetchUsers });
  const item = itemQuery.data;
  const update = useCaseUpdate(params.caseId, usersQuery.data ?? []);
  if (itemQuery.isPending) return <><Link className="back-link" href={backHref}><ArrowLeft size={15} />Back to cases</Link><DetailSkeleton /></>;
  if (itemQuery.isError) return <><Link className="back-link" href={backHref}><ArrowLeft size={15} />Back to cases</Link><ErrorState title="We couldn't load this case" description="The case may have moved, or there may be a connection issue." action={<div className="state-actions"><Button variant="secondary" onClick={() => void itemQuery.refetch()}><RotateCw size={14} />Try again</Button><Button asChild variant="quiet"><Link href={backHref}>Back to cases</Link></Button></div>} /></>;
  if (!item) return <ErrorState title="We couldn't load this case" description="The case response was incomplete." action={<Button asChild variant="secondary"><Link href={backHref}>Back to cases</Link></Button>} />;
  const choose = (patch: CasePatch) => update.mutate(patch);
  const date = (value: string) => new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
  return <>
    <Link className="back-link" href={backHref}><ArrowLeft size={15} />Back to cases</Link>
    <PageHeader eyebrow={item.caseNumber} title={item.subject} description={`${item.customer.name} · Created ${date(item.createdAt)}`} />
    {update.failedPatch && <div className="rollback-banner" role="alert"><div><strong>Couldn’t update this case</strong><p>Your previous value has been restored.</p></div><Button variant="secondary" size="small" disabled={update.isPending} onClick={update.retry}><RotateCw size={14} />Retry</Button></div>}
    <div className="case-detail-layout"><div className="detail-main-column">
      <section className="detail-section"><div className="section-heading"><h2>Description</h2></div><p className="case-description">{item.description}</p>{item.tags.length > 0 && <div className="tag-list" aria-label="Case tags">{item.tags.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</div>}</section>
      <section className="detail-section"><div className="section-heading"><h2>Activity</h2><span>{item.activity.length} updates</span></div><NoteForm item={item} /><ol className="activity-timeline">{[...item.activity].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map((activity) => <ActivityEntry activity={activity} key={activity.id} />)}</ol></section>
    </div>
    <aside className="case-details-sidebar" aria-label="Case details"><section className="detail-section detail-controls"><div className="section-heading"><h2>Case details</h2></div><div className="detail-control"><label htmlFor="detail-status">Status</label><Select id="detail-status" value={item.status} disabled={update.isPending} onChange={(event) => choose({ status: event.target.value as CaseStatus })}><option value="open">Open</option><option value="in_progress">In progress</option><option value="waiting_customer">Waiting on customer</option><option value="resolved">Resolved</option></Select><span className="detail-current"><CaseStatusBadge status={item.status} /></span></div><div className="detail-control"><label htmlFor="detail-priority">Priority</label><Select id="detail-priority" value={item.priority} disabled={update.isPending} onChange={(event) => choose({ priority: event.target.value as CasePriority })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></Select><span className="detail-current"><CasePriorityBadge priority={item.priority} /></span></div><div className="detail-control"><label htmlFor="detail-assignee">Assignee</label>{usersQuery.isError ? <div className="inline-warning"><span>Could not load assignees.</span><Button variant="quiet" size="small" onClick={() => void usersQuery.refetch()}>Retry</Button></div> : <Select id="detail-assignee" value={item.assignee?.id ?? ""} disabled={usersQuery.isPending || update.isPending} onChange={(event) => choose({ assigneeId: event.target.value || null })}><option value="">Unassigned</option>{usersQuery.data?.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}</Select>}{item.assignee && <span className="assignee-cell detail-assignee"><AvatarInitials initials={item.assignee.initials} />{item.assignee.name}</span>}</div><div className="detail-control"><span className="detail-label">SLA</span><span className="detail-current"><CaseSlaBadge dueAt={item.slaDueAt} /></span>{item.slaDueAt && <time className="detail-time" dateTime={item.slaDueAt}>{date(item.slaDueAt)}</time>}</div><div className="detail-control"><span className="detail-label">Customer</span><strong className="detail-static">{item.customer.name}</strong>{item.customer.email && <a className="detail-time" href={`mailto:${item.customer.email}`}>{item.customer.email}</a>}</div><div className="detail-control"><span className="detail-label">Last updated</span><time className="detail-static" dateTime={item.updatedAt}>{date(item.updatedAt)}</time></div></section></aside></div>
  </>;
}

export function CaseDetail() { return <Suspense fallback={<DetailSkeleton />}><CaseDetailContent /></Suspense>; }
