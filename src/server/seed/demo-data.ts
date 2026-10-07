import type { Activity, CasePriority, CaseStatus, Customer, SupportCase, User } from "@/features/cases/types";
import { CASE_TAGS } from "@/features/cases/types";

export const USERS: User[] = [
  { id: "user_ahmad", name: "Ahmad Ibrahim", initials: "AI" },
  { id: "user_maya", name: "Maya Chen", initials: "MC" },
  { id: "user_samira", name: "Samira Patel", initials: "SP" },
  { id: "user_daniel", name: "Daniel Kim", initials: "DK" },
  { id: "user_leila", name: "Leila Hassan", initials: "LH" },
  { id: "user_jordan", name: "Jordan Lee", initials: "JL" },
];

export const CUSTOMERS: Customer[] = [
  { id: "customer_01", name: "Northstar Studio", company: "Northstar Studio", email: "ops@northstar.example" },
  { id: "customer_02", name: "Morrow Health", company: "Morrow Health", email: "support@morrow.example" },
  { id: "customer_03", name: "Juniper & Co.", company: "Juniper & Co.", email: "team@juniper.example" },
  { id: "customer_04", name: "Atlas Freight", company: "Atlas Freight", email: "it@atlas.example" },
  { id: "customer_05", name: "Solace Finance", company: "Solace Finance", email: "help@solace.example" },
  { id: "customer_06", name: "Fieldwork Labs", company: "Fieldwork Labs", email: "hello@fieldwork.example" },
  { id: "customer_07", name: "Cedar & Slate", company: "Cedar & Slate", email: "care@cedarslate.example" },
  { id: "customer_08", name: "Kiteworks", company: "Kiteworks", email: "service@kiteworks.example" },
];

export const TAGS = CASE_TAGS;
const subjectTemplates = [
  "Invoice download returns an error", "Team members cannot join the workspace", "Webhook delivery is delayed", "Monthly report has missing rows",
  "Unable to update billing contact", "Two-factor code is not arriving", "CSV import stops at 80%", "Mobile app signs out unexpectedly",
  "Duplicate charges on the latest statement", "Export shows the previous date range", "New user invitation was not received", "Need help connecting our account",
  "Dashboard totals do not match the report", "Request to restore archived records", "SAML sign-in loops back to login", "Payment method update is blocked",
];
const statusPool: CaseStatus[] = ["open", "open", "open", "in_progress", "in_progress", "in_progress", "waiting_customer", "waiting_customer", "resolved", "resolved"];
const priorityPool: CasePriority[] = ["low", "low", "low", "low", "medium", "medium", "medium", "medium", "medium", "medium", "medium", "high", "high", "high", "high", "high", "high", "critical", "critical", "critical"];
const actors = USERS;
const seedNow = Date.now();
const isoHoursAgo = (hours: number) => new Date(seedNow - hours * 3_600_000).toISOString();
const isoHoursAhead = (hours: number) => new Date(seedNow + hours * 3_600_000).toISOString();

export const DEMO_CASES: SupportCase[] = Array.from({ length: 120 }, (_, index) => {
  const number = 1048 - index;
  const id = `case_${number}`;
  const status = statusPool[(index * 7 + 2) % statusPool.length];
  const priority = priorityPool[(index * 7 + 3) % priorityPool.length];
  const customer = CUSTOMERS[(index * 5 + 1) % CUSTOMERS.length];
  const assignee = index % 11 === 0 ? null : USERS[(index * 5 + 2) % USERS.length];
  const age = (index % 28) * 8 + (index % 5) * 3;
  const dueOffset = [0.8, 1.4, 22, 46, -7, -24, 5.5, 14, 30, 60][index % 10];
  const createdAt = isoHoursAgo(age + 24);
  const updatedAt = isoHoursAgo(index % 12 === 0 ? index % 6 : Math.max(0.5, index % 94));
  const actor = actors[(index * 3 + 1) % actors.length];
  const activity: Activity[] = [{ id: `act_${number}_created`, type: "case_created", message: `${actor.name} created this case`, actor, createdAt }];
  if (index % 3 === 0) activity.push({ id: `act_${number}_status`, type: "status_changed", message: `Status changed to ${status.replaceAll("_", " ")}`, actor: actors[(index + 2) % actors.length], createdAt: updatedAt });
  if (index % 4 === 0) activity.push({ id: `act_${number}_note`, type: "note_added", message: "Internal note added", body: "Reviewed the account history and gathered the relevant context for the next follow-up.", actor: actors[(index + 3) % actors.length], createdAt: isoHoursAgo(Math.max(0.2, index % 40)) });
  return {
    id, caseNumber: `CS-${number}`, subject: subjectTemplates[index % subjectTemplates.length],
    description: `${customer.name} reported that ${subjectTemplates[index % subjectTemplates.length].toLowerCase()}. The issue is affecting their day-to-day workflow. They shared the steps they took and are looking for a clear next update from our operations team.`,
    status, priority, customer, assignee, tags: [TAGS[index % TAGS.length], TAGS[(index * 3 + 4) % TAGS.length]].filter((tag, at, all) => all.indexOf(tag) === at),
    createdAt, updatedAt, slaDueAt: index % 17 === 0 ? null : isoHoursAhead(dueOffset), activity,
  } satisfies SupportCase;
});
