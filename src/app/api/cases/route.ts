import { NextRequest, NextResponse } from "next/server";
import { parseCaseFilters } from "@/features/cases/utils/filters";
import { createCaseSchema } from "@/features/cases/schemas/case-schemas";
import { createCase, listCases, listCustomers, simulateRequest, listUsers } from "@/server/repositories/memory-repository";
import { apiError } from "@/lib/http";

export async function GET(request: NextRequest) {
  if (await simulateRequest(request)) return apiError("CASES_FETCH_FAILED", "Something went wrong while retrieving the case queue.", 503);
  const filters = parseCaseFilters(request.nextUrl.searchParams);
  const result = listCases(filters, request.headers.get("x-relay-demo-mode") === "empty");
  const totalPages = Math.ceil(result.total / filters.pageSize);
  const page = Math.min(filters.page, Math.max(1, totalPages));
  const data = result.items.slice((page - 1) * filters.pageSize, page * filters.pageSize);
  return NextResponse.json({ data, meta: { page: filters.page, pageSize: filters.pageSize, total: result.total, totalPages } });
}

export async function POST(request: NextRequest) {
  if (await simulateRequest(request, true)) return apiError("CASE_CREATE_FAILED", "We couldn't create this case. Your entered information is safe to retry.", 503);
  const parsed = createCaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_CASE", message: "Check the highlighted fields and try again.", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  if (!listCustomers().some((customer) => customer.id === parsed.data.customerId)) return apiError("CUSTOMER_NOT_FOUND", "Choose an available customer.", 422);
  if (parsed.data.assigneeId && !listUsers().some((user) => user.id === parsed.data.assigneeId)) return apiError("ASSIGNEE_NOT_FOUND", "Choose an available assignee.", 422);
  const created = createCase(parsed.data);
  return NextResponse.json({ data: { id: created.id, caseNumber: created.caseNumber } }, { status: 201 });
}
