import type { Metadata } from "next";
import { CaseQueue } from "@/features/cases/components/case-queue";

export const metadata: Metadata = { title: "Cases" };
export default function CasesPage() { return <CaseQueue />; }
