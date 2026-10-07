import { PageHeader } from "@/components/layout/page-header";
import { CaseTableSkeleton } from "@/features/cases/components/case-table-skeleton";

export default function Loading() { return <><PageHeader eyebrow="Workspace" title="Cases" description="Track and manage customer requests." /><CaseTableSkeleton /></>; }
