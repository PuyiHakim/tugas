import { describe, expect, it } from "vitest";
import { createCaseSchema, noteSchema } from "@/features/cases/schemas/case-schemas";

const validCase = { customerId: "customer_01", subject: "  Billing portal error  ", description: "  Customer cannot open the latest invoice from their account.  ", priority: "medium", assigneeId: null, tags: ["billing"] };

describe("case input validation", () => {
  it("trims valid case text before submission", () => {
    const result = createCaseSchema.parse(validCase);
    expect(result.subject).toBe("Billing portal error"); expect(result.description.startsWith("Customer")).toBe(true);
  });
  it("rejects short subject and description, missing customer, and more than five tags", () => {
    expect(createCaseSchema.safeParse({ ...validCase, customerId: "", subject: "help", description: "broken" }).success).toBe(false);
    expect(createCaseSchema.safeParse({ ...validCase, tags: ["one", "two", "three", "four", "five", "six"] }).success).toBe(false);
  });
  it("requires a trimmed internal note between 2 and 1,000 characters", () => {
    expect(noteSchema.safeParse({ body: "  ok  " }).success).toBe(true);
    expect(noteSchema.safeParse({ body: "  " }).success).toBe(false);
    expect(noteSchema.safeParse({ body: "x".repeat(1001) }).success).toBe(false);
  });
});
