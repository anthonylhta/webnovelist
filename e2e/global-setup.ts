// e2e/global-setup.ts — fetch a Clerk testing token (bypasses bot protection)
// only when the signed-in specs are enabled; the public specs need nothing.
import { clerkSetup } from "@clerk/testing/playwright";

export default async function globalSetup() {
  if (process.env.E2E_CLERK_USER_EMAIL) await clerkSetup();
}
