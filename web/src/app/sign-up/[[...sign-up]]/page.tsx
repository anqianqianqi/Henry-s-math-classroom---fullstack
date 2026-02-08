import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Get started with class exploration, enrollments, and daily challenges."
      footer={
        <>
          Already have an account?{" "}
          <a className="font-semibold text-indigo-600" href="/sign-in">
            Sign in
          </a>
        </>
      }
    >
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
    </AuthShell>
  );
}
