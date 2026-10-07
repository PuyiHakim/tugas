import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CASE_PRIORITIES, CASE_STATUSES } from "@/features/cases/types";
import { getCase, listUsers, simulateRequest, updateCase } from "@/server/repositories/memory-repository";
import { apiError } from "@/lib/http";

type RouteContext = { params: Promise<{ caseId: string }> };
const patchSchema = z.object({
  status: z.enum(CASE_STATUSES).optional(),
  priority: z.enum(CASE_PRIORITIES).optional(),
  assigneeId: z.string().nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one mutable field.");

export async function GET(request: NextRequest, context: RouteContext) {
  if (await simulateRequest(request)) return apiError("CASE_FETCH_FAILED", "We couldn't load this case.", 503);
  const { caseId } = await context.params;
  const item = getCase(caseId);
  return item ? NextResponse.json({ data: item }) : apiError("CASE_NOT_FOUND", "The requested case could not be found.", 404);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (await simulateRequest(request, true)) return apiError("CASE_UPDATE_FAILED", "Your previous value has been restored.", 503);
  const { caseId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return apiError("INVALID_CASE_UPDATE", "Choose a valid status, priority, or assignee.", 400);
  if ("assigneeId" in parsed.data && parsed.data.assigneeId && !listUsers().some((user) => user.id === parsed.data.assigneeId)) return apiError("ASSIGNEE_NOT_FOUND", "Choose an available assignee.", 422);
  const item = updateCase(caseId, parsed.data);
  return item ? NextResponse.json({ data: item }) : apiError("CASE_NOT_FOUND", "The requested case could not be found.", 404);
}
