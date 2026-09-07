export function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-lg bg-white p-8 text-center shadow">
        <h1 className="text-lg font-semibold">Account Pending Approval</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your account is pending administrator approval.
        </p>
      </div>
    </div>
  );
}
