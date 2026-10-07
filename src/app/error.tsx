"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/display";
import { RotateCw } from "lucide-react";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState title="Something went wrong" description="Relay hit an unexpected problem. You can retry this screen or return to your overview." reference={error.digest ? `REFERENCE ${error.digest}` : undefined} action={<div className="state-actions"><Button onClick={retry}><RotateCw size={14} />Try again</Button><Button asChild variant="quiet"><Link href="/dashboard">Back to overview</Link></Button></div>} />;
}
