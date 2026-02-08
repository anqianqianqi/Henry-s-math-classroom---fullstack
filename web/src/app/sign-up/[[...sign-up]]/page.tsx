import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Get started with class exploration, enrollments, and daily challenges."
      hostedPath="/sign-up"
      footer={
        <>
          Already have an account?{" "}
          <a className="font-semibold text-indigo-600" href="/sign-in">
            Sign in
          </a>
        </>
      }
    >
      <ClerkLoading>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Loading the sign-up form…
          <p className="mt-2 text-xs">
            If it stays blank, check browser extensions or ad blockers that may
            block Clerk scripts.
          </p>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none border-0 p-0",
              headerTitle: "text-2xl",
            },
          }}
        />
      </ClerkLoaded>
    </AuthShell>
  );
}
