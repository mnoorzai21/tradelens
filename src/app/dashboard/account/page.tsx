import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.isDemo) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
        ← Back to the dashboard
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-neutral-400">
          Signed in as <span className="text-neutral-200">{session.user.email}</span>
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <ChangePasswordForm />
      </section>
    </main>
  );
}