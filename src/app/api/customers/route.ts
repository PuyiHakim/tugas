import { NextRequest, NextResponse } from "next/server";
import { listCustomers, simulateRequest } from "@/server/repositories/memory-repository";
import { apiError } from "@/lib/http";

export async function GET(request: NextRequest) {
  if (await simulateRequest(request)) return apiError("CUSTOMERS_FETCH_FAILED", "We couldn't load customers.", 503);
  return NextResponse.json({ data: listCustomers(request.nextUrl.searchParams.get("search") ?? "") });
}
