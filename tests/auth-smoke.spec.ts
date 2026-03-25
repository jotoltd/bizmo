import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const deleteUserByEmail = async (email: string) => {
  if (!adminClient) return;
  const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (error || !data) return;
  const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (match) {
    await adminClient.auth.admin.deleteUser(match.id);
  }
};

test.describe("Auth smoke", () => {
  test("a new founder can sign up and receive verification prompt", async ({ page }: { page: Page }) => {
    test.skip(!SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Supabase env missing");

    const email = `qa+${Date.now()}@bizno.dev`;
    const password = `Bizno!${Math.random().toString(36).slice(2, 8)}`;

    try {
      await page.goto("/login");
      await page.getByRole("button", { name: /create an account/i }).click();
      await page.getByLabel("Work email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: /create account/i }).click();

      await expect(
        page.getByText("Account created. Check your email and verify your account before signing in.")
      ).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    } finally {
      await deleteUserByEmail(email);
    }
  });
});
