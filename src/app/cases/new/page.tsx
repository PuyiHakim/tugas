import type { Metadata } from "next";
import { CreateCaseForm } from "@/features/cases/components/create-case-form";

export const metadata: Metadata = { title: "Create a case" };
export default function NewCasePage() { return <CreateCaseForm />; }
