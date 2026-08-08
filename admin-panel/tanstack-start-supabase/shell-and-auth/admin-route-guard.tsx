import { createFileRoute, Outlet, useRouter, useLocation, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  // Visible error boundary: a failure in any admin route now surfaces an actual
  // message instead of a blank cream screen (the original bug produced no
  // console output and would never have alerted anyone).
  errorComponent: AdminErrorBoundary,
});

function AdminErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h1 className="font-display text-[20px] text-forest font-medium">
          Something went wrong in the admin panel
        </h1>
        <p className="font-body text-[13px] text-stone mt-2">
          The page failed to load. Try again, or sign in once more.
        </p>
        <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-cream/60 p-3 font-mono text-[11px] text-stone whitespace-pre-wrap">
          {error?.message ?? "Unknown error"}
        </pre>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="h-[40px] px-4 rounded-xl bg-forest text-white font-body font-bold text-[12px]"
          >
            Reload
          </button>
          <Link
            to="/admin/login"
            className="h-[40px] px-4 rounded-xl border border-border font-body font-bold text-[12px] text-forest inline-flex items-center"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminLayout() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  // REACTIVE pathname. This previously read `router.state.location.pathname`,
  // a non-reactive snapshot — useRouter() does not subscribe the component to
  // router state. So after the client-side redirect /admin → /admin/login, this
  // layout kept the stale "/admin" pathname, never re-rendered, and stayed on
  // the old `return null` branch: a blank cream screen until a manual refresh.
  // useLocation() subscribes properly (the pattern already used in Header.tsx).
  const { pathname } = useLocation();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isAdmin && !isLoginPage) {
      router.navigate({ to: "/admin/login" });
    }
  }, [isLoading, isAdmin, isLoginPage, router]);

  if (isLoginPage) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream">
        <div className="font-body text-stone">Loading admin panel…</div>
      </div>
    );
  }

  // Not an admin: show a VISIBLE redirecting state, never a bare `null`. Even if
  // the redirect above were to fail, the operator sees an explanation and a way
  // forward instead of an unexplained blank page. (This guard is UX only — the
  // real enforcement is Supabase RLS via is_admin_user(), so rendering this
  // instead of nothing exposes no admin data.)
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="text-center">
          <p className="font-body text-[13px] text-stone">Taking you to sign in…</p>
          <Link
            to="/admin/login"
            className="mt-3 inline-block font-body text-[13px] font-semibold text-forest underline"
          >
            Continue to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 w-full pb-24 md:pb-6 overflow-x-hidden">
          <Outlet />
        </main>
        {/* Mobile bottom nav */}
        <AdminMobileNav />
      </div>
    </div>
  );
}
