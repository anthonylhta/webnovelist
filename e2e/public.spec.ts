// e2e/public.spec.ts — the signed-out journey: land, search, open a title,
// bounce off protected routes. Assumes the seeded catalog (prisma/seed.ts).
import { test, expect } from "@playwright/test";

test.describe("signed-out", () => {
  test("home shows the masthead and the sign-up call", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("WebNovelist");
    await expect(page.getByRole("link", { name: "[create account]" })).toBeVisible();
    await expect(page.getByRole("link", { name: "[browse the catalog]" })).toBeVisible();
  });

  test("browse lists the catalog and search finds a seeded title", async ({ page }) => {
    await page.goto("/browse");
    await expect(page.getByText(/\d+ titles/).first()).toBeVisible();
    await expect(page.locator('a[href^="/novel/"]').first()).toBeVisible();

    await page.goto("/browse?search=lord+of+the+mysteries");
    const hit = page.getByRole("link", { name: /Lord of the Mysteries/ }).first();
    await expect(hit).toBeVisible();
    await hit.click();
    await expect(page).toHaveURL(/\/novel\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Lord of the Mysteries");
  });

  test("a title page carries the synopsis and a sign-in prompt for tracking", async ({ page }) => {
    await page.goto("/browse?search=reverend+insanity");
    await page.getByRole("link", { name: /Reverend Insanity/ }).first().click();
    await expect(page.getByText("Synopsis")).toBeVisible();
    await expect(page.getByText(/A story about Fang Yuan/)).toBeVisible();
    // Signed out, the reading module offers sign-in rather than [+1].
    await expect(page.getByText("keep your place in this one")).toBeVisible();
  });

  test("an unknown title shows the not-found sheet", async ({ page }) => {
    const res = await page.goto("/novel/999999");
    expect(res?.status()).toBe(404);
  });

  test("protected sheets redirect to sign-in", async ({ page }) => {
    for (const path of ["/list", "/stats", "/settings"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test("the sign-in sheet renders Clerk's form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });

  test("the list API refuses anonymous writes", async ({ request }) => {
    const res = await request.post("/api/list", { data: { novelId: 1 } });
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: "Not logged in" });
  });
});
