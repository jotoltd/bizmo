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

const addMemberToBusiness = async (businessId: string, userId: string, role: string, invitedBy: string) => {
  if (!adminClient) {
    throw new Error("Supabase admin client is not available.");
  }

  const { error } = await adminClient.from("business_memberships").upsert(
    {
      business_id: businessId,
      user_id: userId,
      role,
      invited_by: invitedBy,
    },
    { onConflict: "business_id,user_id" }
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

test.describe("Member management", () => {
  test("owner can change member role and remove member", async ({ page }) => {
    test.skip(!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY, "Supabase env missing");
    test.setTimeout(120_000);

    const ownerEmail = `qa-owner+${Date.now()}@bizno.dev`;
    const memberEmail = `qa-member+${Date.now()}@bizno.dev`;
    const ownerPassword = `Bizno!${Math.random().toString(36).slice(2, 8)}`;
    const memberPassword = `Bizno!${Math.random().toString(36).slice(2, 8)}`;
    const businessName = `QA Studio ${Date.now()}`;

    try {
      const ownerUserId = await createConfirmedUser(ownerEmail, ownerPassword);
      const memberUserId = await createConfirmedUser(memberEmail, memberPassword);
      const businessId = await createBusinessForUser(ownerUserId, businessName);
      
      // Add member directly (skip invitation flow)
      await addMemberToBusiness(businessId, memberUserId, "member", ownerUserId);

      await signIn(page, ownerEmail, ownerPassword);
      await page.goto(`/business/${businessId}`);
      await page.waitForURL(new RegExp(`/business/${businessId}`), { timeout: 30_000 });

      // Verify both members are shown
      await expect(page.getByText(ownerEmail).first()).toBeVisible();
      await expect(page.getByText(memberEmail).first()).toBeVisible();
      await expect(page.getByText("owner").first()).toBeVisible();
      await expect(page.getByText("member").first()).toBeVisible();

      // Change member role to admin
      const memberRow = page.locator("div", { has: page.locator(`text=${memberEmail}`) });
      await memberRow.locator("select").selectOption("admin");
      
      // Verify role change message
      await expect(page.getByText(/Member role updated/i)).toBeVisible();

      // Reload and verify role persisted
      await page.reload();
      await expect(page.getByText(memberEmail).first()).toBeVisible();
      await expect(page.getByText("admin").first()).toBeVisible();

      // Remove member
      const removeButton = page.getByRole("button", { name: /^Remove$/i }).first();
      await removeButton.click();
      
      // Verify member removed
      await expect(page.getByText(memberEmail)).toHaveCount(0);
      await expect(page.getByText(/Team member removed/i)).toBeVisible();
    } finally {
      await deleteUserByEmail(ownerEmail);
      await deleteUserByEmail(memberEmail);
    }
  });

  test("owner can transfer ownership to another member", async ({ page, browser }) => {
    test.skip(!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY, "Supabase env missing");
    test.setTimeout(120_000);

    const ownerEmail = `qa-owner+${Date.now()}@bizno.dev`;
    const memberEmail = `qa-member+${Date.now()}@bizno.dev`;
    const ownerPassword = `Bizno!${Math.random().toString(36).slice(2, 8)}`;
    const memberPassword = `Bizno!${Math.random().toString(36).slice(2, 8)}`;
    const businessName = `QA Studio ${Date.now()}`;

    let memberContext: Awaited<ReturnType<typeof browser.newContext>> | null = null;

    try {
      const ownerUserId = await createConfirmedUser(ownerEmail, ownerPassword);
      const memberUserId = await createConfirmedUser(memberEmail, memberPassword);
      const businessId = await createBusinessForUser(ownerUserId, businessName);
      
      // Add member directly
      await addMemberToBusiness(businessId, memberUserId, "admin", ownerUserId);

      await signIn(page, ownerEmail, ownerPassword);
      await page.goto(`/business/${businessId}`);
      await page.waitForURL(new RegExp(`/business/${businessId}`), { timeout: 30_000 });

      // Transfer ownership
      const makeOwnerButton = page.getByRole("button", { name: /^Make owner$/i }).first();
      await makeOwnerButton.click();

      // Verify ownership transfer message
      await expect(page.getByText(/Ownership transferred/i)).toBeVisible();

      // Original owner should now see member as owner
      await page.reload();
      await expect(page.getByText(memberEmail).first()).toBeVisible();

      // Sign in as new owner and verify they have owner controls
      memberContext = await browser.newContext();
      const memberPage = await memberContext.newPage();
      await signIn(memberPage, memberEmail, memberPassword);
      await memberPage.goto(`/business/${businessId}`);
      await memberPage.waitForURL(new RegExp(`/business/${businessId}`), { timeout: 30_000 });

      // New owner should see role change dropdown for old owner
      await expect(memberPage.getByText(ownerEmail).first()).toBeVisible();
      // Should have management controls (select for role, remove button, make owner button)
      await expect(memberPage.locator("select").first()).toBeVisible();
    } finally {
      if (memberContext) {
        await memberContext.close().catch(() => undefined);
      }
      await deleteUserByEmail(ownerEmail);
      await deleteUserByEmail(memberEmail);
    }
  });
});
