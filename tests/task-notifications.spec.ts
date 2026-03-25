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

const createBusinessForUser = async (userId: string, name: string) => {
  if (!adminClient) {
    throw new Error("Supabase admin client is not available.");
  }

  const { data: business, error: businessError } = await adminClient
    .from("businesses")
    .insert({
      user_id: userId,
      name,
      type: "Restaurant",
      status: "active",
    })
    .select("id")
    .single();

  if (businessError || !business?.id) {
    throw new Error(businessError?.message ?? "Could not create test business.");
  }

  const { error: membershipError } = await adminClient.from("business_memberships").upsert(
    {
      business_id: business.id,
      user_id: userId,
      role: "owner",
      invited_by: userId,
    },
    { onConflict: "business_id,user_id" }
  );

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  return business.id;
};

const createTaskCompletedNotification = async ({
  userId,
  businessId,
}: {
  userId: string;
  businessId: string;
}) => {
  if (!adminClient) {
    throw new Error("Supabase admin client is not available.");
  }

  const { error } = await adminClient.from("user_notifications").insert({
    user_id: userId,
    type: "task_completed",
    title: "Task completed",
    body: 'You completed "Seeded test task".',
    data: {
      business_id: businessId,
      task_id: "seeded-task",
    },
  });

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

test.describe("Task notifications", () => {
  test("completing a task appears in notifications", async ({ page }) => {
    test.skip(!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY, "Supabase env missing");
    test.setTimeout(120_000);

    const email = `qa-task+${Date.now()}@bizno.dev`;
    const password = `Bizno!${Math.random().toString(36).slice(2, 8)}`;
    const businessName = `QA Studio ${Date.now()}`;

    try {
      const userId = await createConfirmedUser(email, password);
      const businessId = await createBusinessForUser(userId, businessName);
      await createTaskCompletedNotification({ userId, businessId });

      await signIn(page, email, password);

      await page.goto("/notifications");
      await expect(page.getByText("Task completed")).toBeVisible();
      await expect(page.getByText(/You completed/i).first()).toBeVisible();
    } finally {
      await deleteUserByEmail(email);
    }
  });
});
