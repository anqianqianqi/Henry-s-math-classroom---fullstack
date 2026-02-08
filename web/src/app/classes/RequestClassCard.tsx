"use client";

import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RequestClassCardProps = {
  gradeRange?: string;
};

export default function RequestClassCard({ gradeRange }: RequestClassCardProps) {
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setIsSuccess(false);

    const formData = new FormData(event.currentTarget);
    const submittedGradeRange =
      gradeRange ?? formData.get("grade_range")?.toString().trim();
    const subject = formData.get("subject")?.toString().trim();
    const details = formData.get("details")?.toString().trim() || null;
    const preferredClassSize = Number.parseInt(
      formData.get("preferred_class_size")?.toString() ?? "",
      10
    );

    if (!submittedGradeRange || !subject || Number.isNaN(preferredClassSize)) {
      setErrorMessage("Please fill out the required fields.");
      setIsSubmitting(false);
      return;
    }

    const token = await getToken({ template: "supabase" });
    if (!token) {
      setErrorMessage("Unable to authenticate. Please sign in again.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createSupabaseBrowserClient(token);
    const { error } = await supabase.from("class_requests").insert({
      grade_range: submittedGradeRange,
      subject,
      details,
      preferred_class_size: preferredClassSize,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      event.currentTarget.reset();
      setIsSuccess(true);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-700">
        Request Additional Class
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {gradeRange ? `Grade range: ${gradeRange}` : "Select a grade range"}
      </div>
      <SignedOut>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          Please sign in to request a class.
          <div className="mt-2">
            <SignInButton mode="modal">
              <button className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white">
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
          {gradeRange ? (
            <input type="hidden" name="grade_range" value={gradeRange} />
          ) : (
            <label className="grid gap-1 text-sm text-slate-700">
              Grade range
              <select
                name="grade_range"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a range
                </option>
                <option value="Grade 1–2">Grade 1–2</option>
                <option value="Grade 3–4">Grade 3–4</option>
                <option value="Grade 5–6">Grade 5–6</option>
                <option value="Grade 7–8">Grade 7–8</option>
                <option value="Grade 9–10">Grade 9–10</option>
                <option value="Grade 11–12">Grade 11–12</option>
              </select>
            </label>
          )}
          <label className="grid gap-1 text-sm text-slate-700">
            Subject
            <input
              name="subject"
              required
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Algebra, Geometry, Olympiad..."
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Comment / details
            <textarea
              name="details"
              rows={3}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Share goals, timing, or learning needs."
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Preferred class size (max 10)
            <input
              name="preferred_class_size"
              type="number"
              min={1}
              max={10}
              required
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          {errorMessage ? (
            <p className="text-xs text-rose-600">{errorMessage}</p>
          ) : null}
          {isSuccess ? (
            <p className="text-xs text-emerald-600">
              Request submitted. We will follow up soon.
            </p>
          ) : null}
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </SignedIn>
    </div>
  );
}
