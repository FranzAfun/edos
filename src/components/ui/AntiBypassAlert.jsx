/**
 * AntiBypassAlert - Warns about potential split-purchase bypass (F3)
 */
import { semanticStatus } from "@/theme/semanticColors";
import { detectAntiBypass } from "../../shared/services/fundRequestStore";

export default function AntiBypassAlert({ userId, departmentId }) {
  if (!userId && !departmentId) return null;
  const result = detectAntiBypass(userId, departmentId);
  if (!result.flagged) return null;

  return (
    <div
      className="rounded p-3 text-sm"
      style={{
        backgroundColor: semanticStatus.error.bg,
        color: semanticStatus.error.text,
      }}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <p className="font-semibold">Anti-Bypass Warning</p>
          <p className="mt-1 text-xs font-medium">
            {result.count} requests totaling GHS {result.total.toLocaleString()} within the last 7 days
            from this user/department exceed the GHS 3,000 threshold. Review for potential split-purchase bypass.
          </p>
        </div>
      </div>
    </div>
  );
}
