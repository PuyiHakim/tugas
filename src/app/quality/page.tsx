import type { Metadata } from "next";
import { QualityShowcase } from "@/features/quality/components/quality-showcase";

export const metadata: Metadata = { title: "Quality states" };
export default function QualityPage() { return <QualityShowcase />; }
