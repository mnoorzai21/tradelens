"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type Status =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success" };

const inputClass =
  "rounded-lg border border-neutral-700 bg-transparent px-3 py-2";

export function ChangePasswordForm() {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setStatus({ type: "error", message: "The new password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "The new passwords don't match." });
      return;
    }
    if (newPassword === currentPassword) {
      setStatus({ type: "error", message: "The new password must be different from the current one." });
      return;
    }

    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);

    if (error) {
      setStatus({
        type: "error",
        message:
          error.code === "INVALID_PASSWORD"
            ? "Your current password is incorrect."
            : error.message ?? "Your password couldn't be changed. Please try again.",
      });
      return;
    }

    form.reset();
    setStatus({ type: "success" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">Current password</span>
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">New password</span>
        <input
          type="password"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">Confirm new password</span>
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-white px-5 py-2.5 font-medium text-black hover:bg-neutral-200 disabled:opacity-60"
      >
        {pending ? "Changing..." : "Change password"}
      </button>

      {status.type === "error" && (
        <p role="alert" className="text-sm text-red-400">
          {status.message}
        </p>
      )}
      {status.type === "success" && (
        <p role="status" className="text-sm text-green-400">
          Your password was changed. Your other devices were signed out.
        </p>
      )}
    </form>
  );
}