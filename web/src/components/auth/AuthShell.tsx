type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hostedPath?: "/sign-in" | "/sign-up";
};

export default function AuthShell({
  title,
  description,
  children,
  footer,
  hostedPath,
}: AuthShellProps) {
  const hostedUrl = (() => {
    if (!hostedPath) return null;
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!key) return null;
    const parts = key.split("_");
    if (parts.length < 3) return null;
    const encoded = parts.slice(2).join("_");
    const padded = encoded + "===".slice((encoded.length + 3) % 4);
    try {
      const decoded = Buffer.from(padded, "base64").toString("utf-8");
      const domain = decoded.replace(/\$+$/, "");
      if (!domain.includes("clerk.accounts")) return null;
      return `https://${domain}${hostedPath}`;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Henry’s Math Classroom
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Why create an account?</p>
            <ul className="mt-2 list-disc pl-5">
              <li>Request new classes for your student</li>
              <li>Enroll and manage class schedules</li>
              <li>Track progress and daily challenges</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Verification steps</p>
            <p className="mt-2">
              Clerk will guide you through email verification or additional
              checks when required. The form below will expand to handle those
              steps.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="w-full">{children}</div>
          {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
          {hostedUrl ? (
            <div className="mt-4 text-xs text-slate-500">
              Having trouble loading the embedded form?{" "}
              <a className="font-semibold text-indigo-600" href={hostedUrl}>
                Open the hosted page
              </a>
              .
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
