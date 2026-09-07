import { type ReactElement } from "react";
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { SignInPage } from "@/pages/sign-in";
import { SignUpPage } from "@/pages/sign-up";
import { PendingApprovalPage } from "@/pages/pending-approval";
import { PartnerDashboardPage } from "@/pages/partner-dashboard";
import { AdminDashboardPage } from "@/pages/admin-dashboard";
import { DemosIndexPage } from "@/pages/demos";
import { AnalyticsDemoPage } from "@/pages/demos/analytics";
import { ListingsDemoPage } from "@/pages/demos/listings";
import { TeamDemoPage } from "@/pages/demos/team";
import { PipelineDemoPage } from "@/pages/demos/pipeline";

type SessionUser = { role?: string; status?: string };

function ProtectedRoute({ children, requireAdmin }: { children: ReactElement; requireAdmin?: boolean }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }
  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  const user = session.user as SessionUser;
  if (user.status !== "active") {
    return <PendingApprovalPage />;
  }
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PartnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demos"
          element={
            <ProtectedRoute>
              <DemosIndexPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demos/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demos/listings"
          element={
            <ProtectedRoute>
              <ListingsDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demos/team"
          element={
            <ProtectedRoute>
              <TeamDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demos/pipeline"
          element={
            <ProtectedRoute>
              <PipelineDemoPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
