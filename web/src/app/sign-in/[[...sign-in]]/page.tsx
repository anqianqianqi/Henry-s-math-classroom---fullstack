import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue requesting classes and tracking student progress."
      footer={
        <>
          New to Henry’s Math Classroom?{" "}
          <a className="font-semibold text-indigo-600" href="/sign-up">
            Create an account
          </a>
        </>
      }
    >
      <ClerkLoading>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Loading the sign-in form…
          <p className="mt-2 text-xs">
            If it stays blank, check browser extensions or ad blockers that may
            block Clerk scripts.
          </p>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
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
