"use client";

import { useState } from "react";
import type { DimensionId } from "@/lib/nti-scoring";

interface ResultData {
  archetype_id: string;
  microtype_id: string;
  microtype_tags: string[];
  user_vector: Record<DimensionId, number>;
  nti_type?: {
    name: string;
    short_label: string;
    description?: string;
  };
}

interface EmailCaptureFormProps {
  resultData: ResultData | null;
  existingEmail?: string;
}

export function EmailCaptureForm({
  resultData,
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

    if (!resultData) {
      setError("No results available to send.");
      return;
    }

    setStatus("saving");

    try {
      const res = await fetch("/api/email/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          resultData 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setStatus("saved");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err.message || "Something went wrong. Please try again.");
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
