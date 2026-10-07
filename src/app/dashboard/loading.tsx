import { PageHeader } from "@/components/layout/page-header";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";

export default function Loading() { return <><PageHeader eyebrow="Workspace" title="Overview" description="Monitor current customer operations and SLA risk." /><DashboardSkeleton /></>; }
