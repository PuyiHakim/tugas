import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Customer, User } from "@/features/cases/types";

const mocks = vi.hoisted(() => ({ createCase: vi.fn(), fetchCustomers: vi.fn(), fetchUsers: vi.fn() }));
vi.mock("@/features/cases/api/client", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/features/cases/api/client")>()), ...mocks }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import { CreateCaseForm } from "@/features/cases/components/create-case-form";

const customers: Customer[] = [{ id: "customer_01", name: "Northstar Studio" }];
const users: User[] = [{ id: "user_ahmad", name: "Ahmad Ibrahim", initials: "AI" }];

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><CreateCaseForm /></QueryClientProvider>);
}

describe("create case form integration", () => {
  beforeEach(() => {
    mocks.createCase.mockReset(); mocks.fetchCustomers.mockResolvedValue(customers); mocks.fetchUsers.mockResolvedValue(users);
  });
  it("shows field validation and does not submit invalid values to the API", async () => {
    renderForm();
    await screen.findByRole("combobox", { name: /customer/i });
    fireEvent.click(screen.getByRole("button", { name: "Create case" }));
    expect(await screen.findByText("Choose a customer.")).toBeVisible();
    expect(screen.getByText("Subject must be at least 5 characters.")).toBeVisible();
    expect(screen.getByText("Description must be at least 10 characters.")).toBeVisible();
    expect(mocks.createCase).not.toHaveBeenCalled();
  });
});
