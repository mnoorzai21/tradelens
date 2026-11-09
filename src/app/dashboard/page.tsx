import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Welcome, {session.user.name}
        </h1>
        <SignOutButton />
      </header>

      <p className="mt-6 text-zinc-400">
        Your trades will appear here.
      </p>
    </main>
  );
}