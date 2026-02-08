import { SignIn } from "@clerk/nextjs";
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
      <SignIn />
    </AuthShell>
  );
}
