"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function signInAsDemo() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    throw new Error("The demo account is not configured.");
  }

  await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });

  redirect("/dashboard");
}