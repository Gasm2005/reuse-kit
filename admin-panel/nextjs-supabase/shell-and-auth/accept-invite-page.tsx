"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, TextInput } from "@/components/Field";
import { Button } from "@/components/Button";

// Reached by clicking the invite link the owner sent (or copied from the
// team page). Supabase delivers the session as #access_token=...&
// refresh_token=...&type=invite in the URL hash — the implicit-flow style,
// not the ?code= PKCE flow @supabase/ssr's browser client is built around,
// so it never auto-detects this on its own. This page reads the hash
// itself and calls setSession() explicitly rather than assuming the client
// picked it up, which is what silently failed here for a while.
export default function AcceptInvitePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [invalidReason, setInvalidReason] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function establishSession() {
      const supabase = createClient();
      const hash = new URLSearchParams(window.location.hash.slice(1));

      // Supabase redirects here with the error in the hash too (e.g. a
      // reused or genuinely expired link) — show that instead of a generic
      // message when it's present.
      const hashError = hash.get("error_description");
      if (hashError) {
        setInvalidReason(hashError.replace(/\+/g, " "));
        setChecking(false);
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Clear the tokens from the address bar either way — they're
        // one-time-use and shouldn't linger in the URL or browser history.
        window.history.replaceState(null, "", window.location.pathname);

        if (error) {
          setInvalidReason(error.message);
          setChecking(false);
          return;
        }

        setValidSession(true);
        setChecking(false);
        return;
      }

      // No tokens in the URL at all — maybe they reloaded this page after
      // already landing once. Fall back to checking for an existing session.
      const { data } = await supabase.auth.getSession();
      setValidSession(!!data.session);
      setChecking(false);
    }

    establishSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm surface-raised rounded-xl p-8">
        <div className="label text-brass mb-3 flex items-center gap-2">
          <span className="w-[18px] h-px bg-brass" />
          Team invite
        </div>
        <h1 className="font-extrabold text-2xl mb-6">Set your password</h1>

        {checking ? (
          <p className="text-ink-soft">Checking your invite…</p>
        ) : !validSession ? (
          <p className="text-danger">
            {invalidReason ||
              "This invite link is invalid or has expired."}{" "}
            Ask the owner for a new one.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="New password" htmlFor="new-password">
              <TextInput
                id="new-password"
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </Field>

            <Field label="Confirm password" htmlFor="confirm-password">
              <TextInput
                id="confirm-password"
                required
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" variant="secondary" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Set password and continue"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
