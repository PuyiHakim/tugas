import type { Metadata } from "next";
import { CaseDetail } from "@/features/cases/components/case-detail";

export const metadata: Metadata = { title: "Case details" };
export default function CaseDetailPage() { return <CaseDetail />; }
