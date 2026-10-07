import type { HTMLAttributes, ReactNode } from "react";

export function Badge({ className = "", children, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={`badge ${className}`} {...props}>{children}</span>; }
export function AvatarInitials({ initials, className = "" }: { initials: string; className?: string }) { return <span className={`avatar ${className}`} role="img" aria-label={initials}>{initials}</span>; }
export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`card ${className}`} {...props}>{children}</div>; }
export function Separator({ className = "" }: { className?: string }) { return <hr className={`separator ${className}`} />; }
export function Spinner({ label = "Loading" }: { label?: string }) { return <span className="spinner" role="status"><span className="sr-only">{label}</span></span>; }
export function Skeleton({ className = "" }: { className?: string }) { return <span className={`skeleton ${className}`} aria-hidden="true" />; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <section className="state-panel"><div className="state-icon" aria-hidden="true">—</div><h2>{title}</h2><p>{description}</p>{action}</section>; }
export function ErrorState({ title, description, action, reference }: { title: string; description: string; action?: ReactNode; reference?: string }) { return <section className="state-panel state-panel--error" role="alert"><div className="state-icon" aria-hidden="true">!</div><h2>{title}</h2><p>{description}</p>{reference && <code className="error-reference">{reference}</code>}{action}</section>; }
