"use client";

import { useState } from "react";

interface EmailCaptureFormProps {
  assessmentId: string;
  existingEmail?: string;
}

export function EmailCaptureForm({
  assessmentId,
  existingEmail = ""
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState(existingEmail);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter an email address.");
      return;
    }

    setStatus("saving");

    try {
      const res = await fetch(`/api/assessment/${assessmentId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("saved");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold disabled:opacity-60"
        >
          {status === "saving" ? "Saving..." : "Email my report"}
        </button>
      </div>
      {status === "saved" && (
        <p className="text-xs text-green-700">
          Report saved. Check your inbox soon.
        </p>
      )}
      {status === "error" && error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </form>
  );
}
