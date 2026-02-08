import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "../supabase/admin";

type ClerkUser = Awaited<ReturnType<typeof clerkClient.users.getUser>>;

type ProfileUpsert = {
  clerk_user_id: string;
  email: string;
  phone: string | null;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
};

const getPrimaryEmail = (user: ClerkUser) => {
  return (
    user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress ?? null
  );
};

const getPrimaryPhone = (user: ClerkUser) => {
  return (
    user.phoneNumbers.find(
      (phone) => phone.id === user.primaryPhoneNumberId
    )?.phoneNumber ?? null
  );
};

export const syncProfileForUser = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);

  const email = getPrimaryEmail(user);
  if (!email) {
    throw new Error("Primary email is required for profile sync.");
  }

  const profilePayload: ProfileUpsert = {
    clerk_user_id: userId,
    email,
    phone: getPrimaryPhone(user),
    name:
      user.fullName ??
      ([user.firstName, user.lastName].filter(Boolean).join(" ") || null),
    username: user.username ?? null,
    avatar_url: user.imageUrl ?? null,
  };

  const { data: existingProfile, error: existingError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingProfile) {
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(profilePayload)
      .eq("clerk_user_id", userId);

    if (updateError) {
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert(profilePayload);

    if (insertError) {
      throw insertError;
    }
  }

  const expectedAdminEmail = process.env.ADMIN_SEED_EMAIL ?? null;
  if (expectedAdminEmail) {
    const { error: seedError } = await supabaseAdmin.rpc("seed_admin_if_none", {
      p_clerk_user_id: userId,
      p_expected_admin_email: expectedAdminEmail,
      p_user_email: email,
    });

    if (seedError) {
      throw seedError;
    }
  }

  return profilePayload;
};
