import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";

export function ReferralForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.api.referrals.$post({ json: form });
      if (!res.ok) {
        throw new Error("Failed to submit referral");
      }
      setForm({ clientName: "", clientEmail: "", clientPhone: "", notes: "" });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>New Referral</Button>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">Submit a New Referral</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Input
          placeholder="Client Full Name"
          required
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
        />
        <Input
          placeholder="Client Email"
          type="email"
          value={form.clientEmail}
          onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
        />
        <Input
          placeholder="Client Phone"
          value={form.clientPhone}
          onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
        />
        <textarea
          placeholder="Additional Notes"
          className="flex w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
