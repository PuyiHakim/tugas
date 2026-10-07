"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { CircleAlert, RotateCw, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, ErrorState, Skeleton, Spinner } from "@/components/ui/display";
import { Input, Select } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toast";
import { CasePriorityBadge, CaseSlaBadge, CaseStatusBadge } from "@/features/cases/components/badges";

type DemoMode = "off" | "fail_reads" | "fail_writes" | "empty";
const modeLabels: Record<DemoMode, string> = { off: "Normal demo", fail_reads: "Fail next read flows", fail_writes: "Fail next changes", empty: "Show empty queue" };
const subscribeMode = (callback: () => void) => { window.addEventListener("relay:demo-mode-change", callback); window.addEventListener("storage", callback); return () => { window.removeEventListener("relay:demo-mode-change", callback); window.removeEventListener("storage", callback); }; };
const getMode = (): DemoMode => {
  const stored = window.localStorage.getItem("relay:demo-mode");
  return stored === "fail_reads" || stored === "fail_writes" || stored === "empty" ? stored : "off";
};
const getServerMode = (): DemoMode => "off";

export function QualityShowcase() {
  const router = useRouter();
  const { toast } = useToast();
  const mode = useSyncExternalStore(subscribeMode, getMode, getServerMode);
  const setDemoMode = (value: DemoMode) => { if (value === "off") window.localStorage.removeItem("relay:demo-mode"); else window.localStorage.setItem("relay:demo-mode", value); window.dispatchEvent(new Event("relay:demo-mode-change")); };
  return <>
    <PageHeader eyebrow="Workspace tools" title="Quality states" description="A small reference for the interface states Relay uses across the workspace." />
    <div className="quality-grid">
      <section className="quality-card"><div className="quality-card-heading"><h2>Actions and fields</h2><p>Shared controls keep keyboard behavior and focus consistent.</p></div><div className="quality-examples"><div className="quality-button-row"><Button onClick={() => toast("Primary action", "Button interaction is working.", "success")}>Primary action</Button><Button variant="secondary" onClick={() => toast("Secondary action", "Button interaction is working.")}>Secondary</Button><Button variant="quiet" onClick={() => toast("Quiet action", "Button interaction is working.")}>Quiet action</Button><Button variant="danger" onClick={() => toast("Destructive style", "This is a visual example; no case data was changed.")}><CircleAlert size={14} />Destructive</Button></div><label className="quality-label" htmlFor="quality-input">Text input</label><Input id="quality-input" placeholder="A clearly labeled input" /><label className="quality-label" htmlFor="quality-select">Select control</label><Select id="quality-select"><option>Choose a status</option><option>In progress</option></Select></div></section>
      <section className="quality-card"><div className="quality-card-heading"><h2>Domain labels</h2><p>Each state includes a text label so color is never the only cue.</p></div><div className="quality-badge-examples"><CaseStatusBadge status="open" /><CaseStatusBadge status="in_progress" /><CaseStatusBadge status="waiting_customer" /><CaseStatusBadge status="resolved" /><CasePriorityBadge priority="low" /><CasePriorityBadge priority="medium" /><CasePriorityBadge priority="high" /><CasePriorityBadge priority="critical" /><CaseSlaBadge dueAt={new Date(60 * 60_000).toISOString()} now={0} /><CaseSlaBadge dueAt={new Date(-60_000).toISOString()} now={0} /><Badge className="quality-neutral"><ShieldCheck size={12} />Internal only</Badge></div></section>
      <section className="quality-card"><div className="quality-card-heading"><h2>Loading, empty, and error</h2><p>Recovery actions keep the user moving when data is delayed or unavailable.</p></div><div className="quality-state-samples"><div className="quality-inline-state"><Spinner label="Loading cases" /><span>Loading case queue</span><Skeleton className="skeleton-pill" /></div><EmptyState title="No matching cases" description="Try clearing a filter to see more requests." action={<Button variant="secondary" size="small" onClick={() => { setDemoMode("off"); router.push("/cases"); }}>Clear filters</Button>} /><ErrorState title="We couldn't load cases" description="Something went wrong while retrieving the queue." action={<Button size="small" onClick={() => toast("Example retry", "This preview remains available on the Quality page.", "success")}><RotateCw size={14} />Try again</Button>} /></div></section>
      <section className="quality-card quality-demo-card"><div className="quality-card-heading"><h2>Demo request controls</h2><p>Simulate API states on the normal screens, without changing the seeded case data.</p></div><label className="quality-label" htmlFor="demo-mode">API demo mode</label><Select id="demo-mode" value={mode} onChange={(event) => setDemoMode(event.target.value as DemoMode)}>{Object.entries(modeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select><p className="field-hint">The selected mode is saved in this browser. Turn it off here to return to normal requests.</p>{mode !== "off" && <div className="demo-mode-callout" role="status"><strong>{modeLabels[mode]}</strong><span>{mode === "fail_reads" ? "Open the case queue to see its error and retry state." : mode === "fail_writes" ? "Open a case and change its status, priority, or assignee to see rollback." : "Open the case queue to see the no-cases empty state."}</span></div>}<div className="quality-demo-links"><Link className="button button--secondary button--small" href="/cases">Open case queue</Link><Link className="button button--secondary button--small" href="/cases/case_1048">Open a case</Link></div></section>
    </div>
  </>;
}
