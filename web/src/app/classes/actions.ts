"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncProfileForUser } from "@/lib/auth/profile-sync";

const parsePreferredClassSize = (value: FormDataEntryValue | null) => {
  if (!value) return null;
  const parsed = Number.parseInt(value.toString(), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const requestClass = async (formData: FormData) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in to request a class.");
  }

  await syncProfileForUser(userId);

  const gradeRange = formData.get("grade_range")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const details = formData.get("details")?.toString().trim() ?? null;
  const preferredClassSize = parsePreferredClassSize(
    formData.get("preferred_class_size")
  );

  if (!gradeRange || !subject || !preferredClassSize) {
    throw new Error("Missing required class request fields.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("class_requests").insert({
    grade_range: gradeRange,
    subject,
    details,
    preferred_class_size: preferredClassSize,
  });

  if (error) {
    throw error;
  }
};
