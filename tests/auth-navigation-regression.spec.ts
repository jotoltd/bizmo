import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

const createConfirmedUser = async (email: string, password: string) => {
  if (!adminClient) {
    throw new Error("Supabase admin client is not available.");
  }

  await deleteUserByEmail(email);

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user?.id) {
    throw new Error(error?.message ?? "Could not create test user.");
  }

  return data.user.id;
};

const ensureProfileRow = async (userId: string, email: string) => {
  if (!adminClient) {
    throw new Error("Supabase admin client is not available.");
  }

  const { error } = await adminClient.from("profiles").upsert(
    {
      id: userId,
      email,
      plan: "free",
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(error.message);
  }
};

const signIn = async (page: Page, email: string, password: string) => {
  await page.goto("/login");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
};

test.describe("Auth and desktop nav regressions", () => {
  test("recovers missing profile row and reaches dashboard", async ({ page }) => {
    test.skip(!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY, "Supabase env missing");

    const email = `qa-recover+${Date.now()}@bizno.dev`;
    const password = `Bizno!${Math.random().toString(36).slice(2, 8)}`;

    try {
      const userId = await createConfirmedUser(email, password);
      await adminClient?.from("profiles").delete().eq("id", userId);

      await signIn(page, email, password);
      await expect(page).toHaveURL(/\/dashboard/);

      await expect
        .poll(
          async () => {
            const { data, error } =
              (await adminClient?.from("profiles").select("id").eq("id", userId).maybeSingle()) ?? {
                data: null,
                error: null,
              };

            if (error) {
              throw new Error(error.message);
            }

            return data?.id ?? null;
          },
          {
            timeout: 15_000,
            intervals: [250, 500, 1_000],
          }
        )
        .toBe(userId);
    } finally {
      await deleteUserByEmail(email);
    }
  });

  test("desktop user menu links remain clickable", async ({ page }) => {
    test.skip(!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY, "Supabase env missing");

    const email = `qa-nav+${Date.now()}@bizno.dev`;
    const password = `Bizno!${Math.random().toString(36).slice(2, 8)}`;

    try {
      const userId = await createConfirmedUser(email, password);
      await ensureProfileRow(userId, email);

      await signIn(page, email, password);

      await page.getByRole("button", { name: /open user menu/i }).click();
      await page.getByRole("menuitem", { name: "Settings" }).click();
      await expect(page).toHaveURL(/\/settings/);

      await page.getByRole("button", { name: /open user menu/i }).click();
      await page.getByRole("button", { name: /log out/i }).click();
      await expect(page).toHaveURL(/\/login/);
    } finally {
      await deleteUserByEmail(email);
    }
  });
});
