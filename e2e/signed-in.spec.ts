// e2e/signed-in.spec.ts — the reader's sheets. Runs only when
// E2E_CLERK_USER_EMAIL names a user of the Clerk *development* instance
// (Clerk's testing token + a ticket sign-in, no password, no Turnstile).
// Read-only by design: it never writes to the reader's shelf.
import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

const email = process.env.E2E_CLERK_USER_EMAIL;

test.describe("signed-in", () => {
  test.skip(!email, "E2E_CLERK_USER_EMAIL not set — signed-in specs skipped");

  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await clerk.signIn({ page, emailAddress: email! });
  });

  test("home becomes the Weekly Edition with the reader's nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/^The Weekly Edition · Week of/)).toBeVisible();
    for (const label of ["library/", "stats/", "profile/", "settings/"]) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "[exit]" })).toBeVisible();
  });

  test("the library and stats sheets open", async ({ page }) => {
    await page.goto("/list");
    await expect(page).toHaveURL(/\/list$/);
    await expect(page.getByText("webnovelist · library")).toBeVisible();

    await page.goto("/stats");
    await expect(page).toHaveURL(/\/stats$/);
    await expect(page.getByText("webnovelist · ledger")).toBeVisible();
  });

  test("the reader's own profile shows the share verb and no follow verb", async ({ page }) => {
    await page.goto("/");
    const profileHref = await page.getByRole("link", { name: "profile/" }).getAttribute("href");
    expect(profileHref).toMatch(/^\/user\//);
    await page.goto(profileHref!);
    await expect(page.getByRole("button", { name: "[share]" })).toBeVisible();
    await expect(page.getByText("[follow]")).toHaveCount(0);
  });

  test("[exit] signs out", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "[exit]" }).click();
    await expect(page.getByRole("link", { name: "[create account]" })).toBeVisible();
  });
});
