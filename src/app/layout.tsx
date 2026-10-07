import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Relay — Customer Operations Workspace", template: "%s · Relay" },
  description: "A calm workspace for customer operations teams to prioritize, manage, and resolve support cases.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><AppShell>{children}</AppShell></Providers></body></html>;
}
