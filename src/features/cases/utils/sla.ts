export type SlaState = "none" | "on_track" | "due_soon" | "breached";

export function getSlaState(slaDueAt: string | null, now = Date.now()): SlaState {
  if (!slaDueAt) return "none";
  const remaining = new Date(slaDueAt).getTime() - now;
  if (remaining < 0) return "breached";
  if (remaining <= 2 * 60 * 60 * 1000) return "due_soon";
  return "on_track";
}

export function formatSla(slaDueAt: string | null, now = Date.now()): string {
  const state = getSlaState(slaDueAt, now);
  if (state === "none") return "No SLA";
  if (state === "breached") return "SLA breached";
  const minutes = Math.max(0, Math.round((new Date(slaDueAt!).getTime() - now) / 60_000));
  if (minutes < 60) return `Due in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `Due in ${hours}h${remainder ? ` ${remainder}m` : ""}`;
}
