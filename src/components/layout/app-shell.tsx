"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Activity, BriefcaseBusiness, LayoutDashboard, Menu, Plus, X } from "lucide-react";
import { IconButton } from "@/components/ui/button";

const primaryLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/cases", label: "Cases", icon: BriefcaseBusiness },
];
const secondaryLinks = [{ href: "/quality", label: "Quality", icon: Activity }];

function isActive(pathname: string, href: string) { return href === "/cases" ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href; }

function Brand() {
  return <Link className="brand" href="/dashboard" aria-label="Relay, overview"><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-name">relay<span className="brand-period">.</span></span></Link>;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Main navigation"><p className="nav-section-label">Workspace</p><ul className="nav-list">{primaryLinks.map(({ href, label, icon: Icon }) => <li key={href}><Link href={href} onClick={onNavigate} className={`nav-link ${isActive(pathname, href) ? "is-active" : ""}`} aria-current={isActive(pathname, href) ? "page" : undefined}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span></Link></li>)}</ul><p className="nav-section-label nav-section-label--second">Workspace tools</p><ul className="nav-list">{secondaryLinks.map(({ href, label, icon: Icon }) => <li key={href}><Link href={href} onClick={onNavigate} className={`nav-link ${isActive(pathname, href) ? "is-active" : ""}`} aria-current={isActive(pathname, href) ? "page" : undefined}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span></Link></li>)}</ul></nav>;
}

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); return; }
      if (event.key !== "Tab" || !drawer.current) return;
      const focusable = [...drawer.current.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])")];
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const focusFirst = () => drawer.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    window.addEventListener("keydown", closeOnEscape);
    const timer = window.setTimeout(focusFirst, 0);
    return () => { window.removeEventListener("keydown", closeOnEscape); window.clearTimeout(timer); };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return <div className="app-shell">
    <aside className="desktop-sidebar"><Brand /><div className="sidebar-content"><NavLinks /></div><div className="sidebar-footer"><div className="workspace-avatar">R</div><div><strong>Relay workspace</strong><span>Operations team</span></div><span className="online-dot" aria-label="Workspace active" /></div></aside>
    <div className="app-main-column">
      <header className="mobile-topbar"><IconButton ref={trigger} type="button" aria-label="Open navigation" aria-expanded={open} aria-controls={open ? "mobile-navigation" : undefined} onClick={() => setOpen(true)}><Menu size={19} /></IconButton><Brand /><Link className="mobile-create" href="/cases/new" aria-label="Create case"><Plus size={18} /></Link></header>
      <main id="main-content" className="main-content">{children}</main>
    </div>
    {open && <div className="mobile-drawer-layer"><button className="drawer-scrim" type="button" aria-label="Close navigation" onClick={close} /><aside id="mobile-navigation" className="mobile-drawer" ref={drawer} role="dialog" aria-modal="true" aria-label="Main navigation"><div className="mobile-drawer-header"><Brand /><IconButton type="button" aria-label="Close navigation" onClick={close}><X size={18} /></IconButton></div><div className="sidebar-content"><NavLinks onNavigate={() => setOpen(false)} /></div><div className="sidebar-footer"><div className="workspace-avatar">R</div><div><strong>Relay workspace</strong><span>Operations team</span></div></div></aside></div>}
  </div>;
}
