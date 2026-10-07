"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, RotateCw, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, AvatarInitials, Spinner } from "@/components/ui/display";
import { Input, Select } from "@/components/ui/fields";
import { CasePriorityBadge, CaseSlaBadge, CaseStatusBadge } from "@/features/cases/components/badges";
import { CaseTableSkeleton } from "@/features/cases/components/case-table-skeleton";
import { fetchCases, fetchUsers } from "@/features/cases/api/client";
import { hasActiveCaseFilters, parseCaseFilters, serializeCaseFilters } from "@/features/cases/utils/filters";
import { queryKeys } from "@/lib/query-keys";
import type { CaseFilters, CaseSort, SupportCase } from "@/features/cases/types";

const sortLabels: Record<CaseSort, string> = { updated_desc: "Last updated", updated_asc: "Oldest update", created_desc: "Newest", created_asc: "Oldest", priority_desc: "Priority", sla_asc: "SLA" };
function useQueueFilters() {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const filters = useMemo(() => parseCaseFilters(new URLSearchParams(params.toString())), [params]);
  const update = useCallback((next: Partial<CaseFilters>, resetPage = true) => {
    const query = serializeCaseFilters({ ...filters, ...next, ...(resetPage ? { page: 1 } : {}) });
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [filters, pathname, router]);
  return { filters, update };
}

function CaseRow({ item, query }: { item: SupportCase; query: string }) {
  return <tr><td><Link className="case-title-link" href={`/cases/${item.id}${query ? `?${query}` : ""}`}><span className="case-number">{item.caseNumber}</span><span className="case-subject">{item.subject}</span></Link></td><td><span className="customer-cell">{item.customer.name}</span></td><td><CaseStatusBadge status={item.status} /></td><td><CasePriorityBadge priority={item.priority} /></td><td>{item.assignee ? <span className="assignee-cell"><AvatarInitials initials={item.assignee.initials} /><span>{item.assignee.name.split(" ")[0]}</span></span> : <span className="unassigned-cell">Unassigned</span>}</td><td><CaseSlaBadge dueAt={item.slaDueAt} /></td></tr>;
}

function CaseCard({ item, query }: { item: SupportCase; query: string }) {
  return <article className="case-card"><div className="case-card-top"><span className="case-number">{item.caseNumber}</span><CaseSlaBadge dueAt={item.slaDueAt} /></div><Link className="case-card-title" href={`/cases/${item.id}${query ? `?${query}` : ""}`}>{item.subject}</Link><p className="case-card-customer">{item.customer.name}</p><div className="case-card-badges"><CaseStatusBadge status={item.status} /><CasePriorityBadge priority={item.priority} /></div><div className="case-card-footer">{item.assignee ? <span className="assignee-cell"><AvatarInitials initials={item.assignee.initials} /><span>{item.assignee.name}</span></span> : <span className="unassigned-cell">Unassigned</span>}<Link href={`/cases/${item.id}${query ? `?${query}` : ""}`} className="card-open-link">View <span className="sr-only">{item.caseNumber}</span><ChevronRight size={15} /></Link></div></article>;
}

function QueueContent() {
  const { filters, update } = useQueueFilters();
  const [searchDraft, setSearchDraft] = useState({ source: filters.search, value: filters.search });
  const searchText = searchDraft.source === filters.search ? searchDraft.value : filters.search;
  useEffect(() => {
    if (searchText === filters.search) return;
    const timer = window.setTimeout(() => update({ search: searchText }, true), 250);
    return () => window.clearTimeout(timer);
  }, [searchText, filters.search, update]);
  const list = useQuery({ queryKey: queryKeys.cases.list(filters), queryFn: () => fetchCases(filters), placeholderData: keepPreviousData });
  const users = useQuery({ queryKey: queryKeys.users.all(), queryFn: fetchUsers });
  const activeFilters = hasActiveCaseFilters(filters);
  const serialized = serializeCaseFilters(filters);
  const clear = () => { setSearchDraft({ source: filters.search, value: "" }); routerReplaceDefaults(); };
  const { replace } = useRouter(); const pathname = usePathname();
  function routerReplaceDefaults() { replace(pathname); }
  return <>
    <PageHeader eyebrow="Workspace" title="Cases" description="Track and manage customer requests." action={<Button asChild><Link href="/cases/new"><Plus size={16} />Create case</Link></Button>} />
    <section className="case-queue" aria-label="Case queue">
      <div className="queue-toolbar"><div className="search-wrap"><Search size={17} aria-hidden="true" /><Input type="search" placeholder="Search cases" aria-label="Search by case, subject, or customer" value={searchText} onChange={(event) => setSearchDraft({ source: filters.search, value: event.target.value })} /></div>
        <label className="filter-field"><span className="sr-only">Filter by status</span><Select aria-label="Filter by status" value={filters.status} onChange={(event) => update({ status: event.target.value as CaseFilters["status"] })}><option value="all">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="waiting_customer">Waiting on customer</option><option value="resolved">Resolved</option></Select></label>
        <label className="filter-field"><span className="sr-only">Filter by priority</span><Select aria-label="Filter by priority" value={filters.priority} onChange={(event) => update({ priority: event.target.value as CaseFilters["priority"] })}><option value="all">All priorities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></Select></label>
        <label className="filter-field"><span className="sr-only">Filter by assignee</span><Select aria-label="Filter by assignee" value={filters.assignee} onChange={(event) => update({ assignee: event.target.value })} disabled={users.isPending || users.isError}><option value="all">All assignees</option><option value="unassigned">Unassigned</option>{users.data?.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select></label>
        <label className="filter-field filter-field--sort"><span className="sr-only">Sort cases</span><Select aria-label="Sort cases" value={filters.sort} onChange={(event) => update({ sort: event.target.value as CaseSort })}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
        {activeFilters && <Button variant="quiet" size="small" onClick={clear}><X size={14} />Clear filters</Button>}
      </div>
      {users.isError && <div className="inline-warning" role="status"><span>Assignees could not be loaded.</span><Button variant="quiet" size="small" onClick={() => void users.refetch()}>Retry</Button></div>}
      <div className="queue-result-bar"><p>{list.data ? <>Showing <strong>{list.data.meta.total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1}–{Math.min(filters.page * filters.pageSize, list.data.meta.total)}</strong> of <strong>{list.data.meta.total}</strong> cases</> : <span aria-live="polite">Loading cases…</span>}</p>{list.isFetching && !list.isPending && <span className="refresh-indicator"><Spinner label="Refreshing cases" />Updating</span>}</div>
      {list.isPending ? <CaseTableSkeleton /> : list.isError ? <ErrorState title="We couldn't load cases" description="Something went wrong while retrieving your case queue." reference="CASES_FETCH_FAILED" action={<Button onClick={() => void list.refetch()}><RotateCw size={15} />Try again</Button>} /> : list.data.meta.total === 0 ? activeFilters ? <EmptyState title="No cases found" description="We couldn't find cases matching your current filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} /> : <EmptyState title="No cases yet" description="Create your first customer case to get started." action={<Button asChild><Link href="/cases/new"><Plus size={15} />Create case</Link></Button>} /> : <>
        <div className="desktop-table-wrap"><table className="case-table"><thead><tr><th scope="col">Case</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col">Priority</th><th scope="col">Assignee</th><th scope="col">SLA</th></tr></thead><tbody>{list.data.data.map((item) => <CaseRow key={item.id} item={item} query={serialized} />)}</tbody></table></div>
        <div className="mobile-case-list">{list.data.data.map((item) => <CaseCard key={item.id} item={item} query={serialized} />)}</div>
        <nav className="pagination" aria-label="Case pages"><span>Page {filters.page} of {Math.max(1, list.data.meta.totalPages)}</span><div><Button variant="secondary" size="small" disabled={filters.page <= 1} onClick={() => update({ page: filters.page - 1 }, false)} aria-label="Previous page"><ChevronLeft size={15} />Previous</Button><Button variant="secondary" size="small" disabled={filters.page >= list.data.meta.totalPages} onClick={() => update({ page: filters.page + 1 }, false)} aria-label="Next page">Next<ChevronRight size={15} /></Button></div></nav>
      </>}
    </section>
  </>;
}

export function CaseQueue() { return <Suspense fallback={<><PageHeader eyebrow="Workspace" title="Cases" description="Track and manage customer requests." /><CaseTableSkeleton /></>}><QueueContent /></Suspense>; }
