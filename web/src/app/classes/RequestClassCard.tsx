"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { requestClass } from "./actions";

type RequestClassCardProps = {
  gradeRange: string;
};

export default function RequestClassCard({ gradeRange }: RequestClassCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-700">
        Request Additional Class
      </div>
      <div className="mt-1 text-xs text-slate-500">
        Grade range: {gradeRange}
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
        <form className="mt-4 grid gap-3" action={requestClass}>
          <input type="hidden" name="grade_range" value={gradeRange} />
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
          <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
            Submit request
          </button>
        </form>
      </SignedIn>
    </div>
  );
}
