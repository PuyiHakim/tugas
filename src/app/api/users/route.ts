import { NextRequest, NextResponse } from "next/server";
import { listUsers, simulateRequest } from "@/server/repositories/memory-repository";
import { apiError } from "@/lib/http";

export async function GET(request: NextRequest) {
  if (await simulateRequest(request)) return apiError("USERS_FETCH_FAILED", "We couldn't load available assignees.", 503);
  return NextResponse.json({ data: listUsers() });
}
