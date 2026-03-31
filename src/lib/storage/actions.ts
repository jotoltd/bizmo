"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ensureBucket = async (bucketName: "avatars" | "logos") => {
  const admin = createSupabaseAdminClient();
  const { error: getBucketError } = await admin.storage.getBucket(bucketName);

  if (!getBucketError) {
    return;
  }

  const notFound =
    getBucketError.message.toLowerCase().includes("not found") ||
    getBucketError.message.toLowerCase().includes("does not exist");

  if (!notFound) {
    throw getBucketError;
  }

  const { error: createBucketError } = await admin.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  });

  if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
    throw createBucketError;
  }
};

export async function uploadAvatar(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    return { error: "Missing file or user ID" };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be less than 5MB" };
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  try {
    await ensureBucket("avatars");
  } catch (bucketError) {
    const message = bucketError instanceof Error ? bucketError.message : "Failed to prepare avatar bucket";
    return { error: message };
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true, url: publicUrl };
}

export async function uploadBusinessLogo(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const file = formData.get("file") as File;
  const businessId = formData.get("businessId") as string;
  const userId = formData.get("userId") as string;

  if (!file || !businessId || !userId) {
    return { error: "Missing file, business ID, or user ID" };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be less than 5MB" };
  }

  // Verify user owns the business
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("user_id")
    .eq("id", businessId)
    .single();

  if (businessError || !business || business.user_id !== userId) {
    return { error: "Unauthorized" };
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${businessId}-${Date.now()}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  try {
    await ensureBucket("logos");
  } catch (bucketError) {
    const message = bucketError instanceof Error ? bucketError.message : "Failed to prepare logo bucket";
    return { error: message };
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("logos")
    .getPublicUrl(filePath);

  // Update business
  const { error: updateError } = await supabase
    .from("businesses")
    .update({ logo_url: publicUrl })
    .eq("id", businessId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/business/${businessId}`);

  return { success: true, url: publicUrl };
}

export async function removeAvatar(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function removeBusinessLogo(businessId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  // Verify user owns the business
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("user_id")
    .eq("id", businessId)
    .single();

  if (businessError || !business || business.user_id !== userId) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("businesses")
    .update({ logo_url: null })
    .eq("id", businessId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/business/${businessId}`);

  return { success: true };
}
