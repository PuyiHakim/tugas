import { NextRequest, NextResponse } from "next/server";
import { noteSchema } from "@/features/cases/schemas/case-schemas";
import { addNote, getCase, simulateRequest } from "@/server/repositories/memory-repository";
import { apiError } from "@/lib/http";

type RouteContext = { params: Promise<{ caseId: string }> };
export async function POST(request: NextRequest, context: RouteContext) {
  if (await simulateRequest(request, true)) return apiError("NOTE_CREATE_FAILED", "We couldn't add this note. Your draft is still here.", 503);
  const { caseId } = await context.params;
  if (!getCase(caseId)) return apiError("CASE_NOT_FOUND", "The requested case could not be found.", 404);
  const parsed = noteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_NOTE", "Enter an internal note between 2 and 1,000 characters.", 400);
  return NextResponse.json({ data: addNote(caseId, parsed.data.body) }, { status: 201 });
}
