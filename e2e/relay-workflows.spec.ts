import { expect, test } from "@playwright/test";

test("priority filter persists in the URL and case status can be changed", async ({ page }) => {
  await page.goto("/cases");
  const priorityFilter = page.getByRole("combobox", { name: "Filter by priority" });
  await priorityFilter.selectOption("high");
  await expect(page).toHaveURL(/priority=high/);
  await expect(page.locator(".case-title-link").first()).toBeVisible();
  await page.locator(".case-title-link").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to cases" })).toHaveAttribute("href", /priority=high/);
  const status = page.getByRole("combobox", { name: "Status", exact: true });
  const current = await status.inputValue();
  const next = current === "resolved" ? "in_progress" : "resolved";
  await status.selectOption(next);
  await expect(status).toHaveValue(next);
  await expect(page.getByText("Case updated")).toBeVisible();
  await expect(page.getByText(`Status changed to ${next.replaceAll("_", " ")}`)).toBeVisible();
  const priority = page.getByRole("combobox", { name: "Priority", exact: true });
  const nextPriority = await priority.inputValue() === "critical" ? "high" : "critical";
  await priority.selectOption(nextPriority);
  await expect(page.getByText(`Priority changed to ${nextPriority}`)).toBeVisible();
  const assignee = page.getByRole("combobox", { name: "Assignee", exact: true });
  const nextAssignee = await assignee.inputValue() === "user_ahmad" ? "" : "user_ahmad";
  await assignee.selectOption(nextAssignee);
  await expect(page.getByText(nextAssignee ? "Assigned to Ahmad Ibrahim" : "Case unassigned")).toBeVisible();
});

test("URL restores pagination and filter state after reload", async ({ page }) => {
  await page.goto("/cases?priority=high&page=2");
  await expect(page.getByRole("combobox", { name: "Filter by priority" })).toHaveValue("high");
  await expect(page.getByText("Page 2 of", { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Filter by priority" })).toHaveValue("high");
  await expect(page.getByRole("button", { name: "Previous page" })).toBeEnabled();
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(page).toHaveURL(/priority=high$/);
});

test("queue read failure offers recovery and retry", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("relay:demo-mode", "fail_reads"));
  await page.goto("/cases");
  await expect(page.getByRole("heading", { name: "We couldn't load cases" })).toBeVisible();
  await page.evaluate(() => window.localStorage.removeItem("relay:demo-mode"));
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".case-title-link").first()).toBeVisible();
});

test("create case validates before sending and redirects after a valid submission", async ({ page }) => {
  let posts = 0;
  page.on("request", (request) => { if (request.method() === "POST" && request.url().endsWith("/api/cases")) posts += 1; });
  await page.goto("/cases/new");
  await expect(page.getByRole("combobox", { name: /customer/i })).toBeVisible();
  await page.getByRole("button", { name: "Create case" }).click();
  await expect(page.getByText("Choose a customer.")).toBeVisible();
  await expect(page.getByText("Subject must be at least 5 characters.")).toBeVisible();
  expect(posts).toBe(0);
  await page.getByLabel("Customer").selectOption("customer_01");
  await page.getByLabel("Subject").fill("Invoice download unavailable");
  await page.getByLabel("Description").fill("The customer cannot download the latest invoice from the account workspace.");
  await page.getByRole("button", { name: "Create case" }).click();
  await expect(page).toHaveURL(/\/cases\/case_\d+$/);
  await expect(page.getByRole("heading", { name: "Invoice download unavailable" })).toBeVisible();
  expect(posts).toBe(1);
});

test("failed case update restores its previous value and offers retry", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("relay:demo-mode", "fail_writes"));
  await page.goto("/cases/case_1048");
  const status = page.getByRole("combobox", { name: "Status", exact: true });
  await expect(status).toBeEnabled();
  const previous = await status.inputValue();
  await status.selectOption(previous === "resolved" ? "in_progress" : "resolved");
  await expect(page.locator(".rollback-banner")).toContainText("Your previous value has been restored.");
  await expect(status).toHaveValue(previous);
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("internal note is added to the activity timeline without reloading", async ({ page, browserName }) => {
  await page.goto("/cases/case_1047");
  await expect(page.getByRole("textbox", { name: "Add an internal note" })).toBeVisible();
  const note = `Confirmed the customer can now access the revised invoice in ${browserName}.`;
  await page.getByRole("textbox", { name: "Add an internal note" }).fill(note);
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.locator(".timeline-note").filter({ hasText: note })).toBeVisible();
  await expect(page.getByText("Internal note added").first()).toBeVisible();
});

test("mobile navigation closes with Escape and returns focus to its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/dashboard");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Main navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Main navigation" })).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("mobile drawer keeps keyboard focus inside while open", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog", { name: "Main navigation" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Relay, overview" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Quality" })).toBeFocused();
});

test("key viewport widths do not create global horizontal overflow", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Run the viewport sweep once in Chromium; workflow tests cover the other engines.");
  const widths = [320, 375, 430, 768, 1024, 1280, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/cases");
    await expect(page.getByRole("heading", { name: "Cases" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
  }
});

test("home redirects and primary routes have no browser runtime errors", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  for (const route of ["/cases", "/cases/new", "/cases/case_1048", "/quality"]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
  }
  expect(runtimeErrors).toEqual([]);
});
