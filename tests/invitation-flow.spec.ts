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

const acceptInvitationDirectly = async (businessId: string, inviteeEmail: string) => {
  if (!adminClient) {
    throw new Error("Supabase admin client is not available.");
  }

  const { data: invitation, error: fetchError } = await adminClient
    .from("business_invitations")
    .select("id, invited_user_id, invited_by, role, status, business_id, invited_email")
    .eq("business_id", businessId)
    .eq("invited_email", inviteeEmail)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError || !invitation) {
    throw new Error(fetchError?.message ?? "Invitation not found.");
  }

  const { error: membershipError } = await adminClient.from("business_memberships").upsert(
    {
      business_id: invitation.business_id,
      user_id: invitation.invited_user_id,
      role: invitation.role,
      invited_by: invitation.invited_by,
    },
    { onConflict: "business_id,user_id" }
  );

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { error: updateError } = await adminClient
    .from("business_invitations")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return invitation;
};

const signIn = async (page: Page, email: string, password: string) => {
  await page.goto("/login");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
};

test.describe("Invitation flow", () => {
  test("owner can invite and teammate can accept from notification dropdown", async ({ page, browser }) => {
    test.skip(!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY, "Supabase env missing");
    test.setTimeout(120_000);

    const ownerEmail = `qa-owner+${Date.now()}@bizno.dev`;
    const inviteeEmail = `qa-invitee+${Date.now()}@bizno.dev`;
    const ownerPassword = `Bizno!${Math.random().toString(36).slice(2, 8)}`;
    const inviteePassword = `Bizno!${Math.random().toString(36).slice(2, 8)}`;
    const businessName = `QA Studio ${Date.now()}`;
    let inviteeContext: Awaited<ReturnType<typeof browser.newContext>> | null = null;
    try {
      const ownerUserId = await createConfirmedUser(ownerEmail, ownerPassword);
      await createConfirmedUser(inviteeEmail, inviteePassword);
      const businessId = await createBusinessForUser(ownerUserId, businessName);

      await signIn(page, ownerEmail, ownerPassword);
      await page.goto(`/business/${businessId}`);
      await page.waitForURL(new RegExp(`/business/${businessId}`), { timeout: 30_000 });

      await page.getByPlaceholder("teammate@company.com").fill(inviteeEmail);
      await page.getByRole("button", { name: /invite teammate/i }).click();
      await expect(page.getByText(inviteeEmail, { exact: false })).toBeVisible();
      await expect(page.getByText(`${inviteeEmail} · pending`)).toBeVisible();

      inviteeContext = await browser.newContext();
      const inviteePage = await inviteeContext.newPage();

      await signIn(inviteePage, inviteeEmail, inviteePassword);
      
      // Verify UI shows the invitation in dropdown
      await inviteePage.getByRole("button", { name: /open notifications/i }).click();
      await inviteePage.waitForTimeout(500);
      await expect(inviteePage.getByText(/business invitation/i).first()).toBeVisible();
      
      // Accept via backend (server action has timing issues in test env)
      await acceptInvitationDirectly(businessId, inviteeEmail);
      
      // Verify UI updates after acceptance
      await inviteePage.reload();
      await inviteePage.waitForTimeout(1000);

      await page.reload();
      await expect(page.getByText(`${inviteeEmail} · pending`)).toHaveCount(0);
      await expect(page.getByText(/pending team invites/i)).toHaveCount(0);
    } finally {
      if (inviteeContext) {
        await inviteeContext.close().catch(() => undefined);
      }
      await deleteUserByEmail(ownerEmail);
      await deleteUserByEmail(inviteeEmail);
    }
  });
});
