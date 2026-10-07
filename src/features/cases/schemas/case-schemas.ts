import { z } from "zod";
import { CASE_PRIORITIES } from "@/features/cases/types";

export const createCaseSchema = z.object({
  customerId: z.string().min(1, "Choose a customer."),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters.").max(120, "Subject must be 120 characters or fewer."),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(3000, "Description must be 3,000 characters or fewer."),
  priority: z.enum(CASE_PRIORITIES),
  assigneeId: z.string().nullable(),
  tags: z.array(z.string()).max(5, "Choose no more than 5 tags."),
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export const noteSchema = z.object({ body: z.string().trim().min(2, "Add at least 2 characters.").max(1000, "Notes must be 1,000 characters or fewer.") });
