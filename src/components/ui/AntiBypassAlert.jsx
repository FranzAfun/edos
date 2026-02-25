/**
 * AntiBypassAlert - Warns about potential split-purchase bypass (F3)
 */
import { detectAntiBypass } from "../../shared/services/fundRequestStore";

export default function AntiBypassAlert({ userId, departmentId }) {
  if (!userId && !departmentId) return null;
  const result = detectAntiBypass(userId, departmentId);
  if (!result.flagged) return null;

  return (
    <div
      className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      <div className="flex items-start gap-2">
        <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <p className="font-semibold">Anti-Bypass Warning</p>
          <p className="text-xs mt-1">
            {result.count} requests totaling GHS {result.total.toLocaleString()} within the last 7 days
            from this user/department exceed the GHS 3,000 threshold. Review for potential split-purchase bypass.
          </p>
        </div>
      </div>
    </div>
  );
}
