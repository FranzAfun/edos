import { useLocation, useNavigate } from "react-router-dom";
import useRole from "../../hooks/useRole";
import useUnreadCount from "../../hooks/useUnreadCount";
import { roles } from "../../config/roles";
import ThemeToggle from "../ui/ThemeToggle";

function formatTitle(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  // If only authority segment exists (e.g., /executive)
  if (segments.length === 1) return "Dashboard";

  const last = segments[segments.length - 1].replace(/-/g, " ");

  return last.charAt(0).toUpperCase() + last.slice(1);
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default function AuthorityHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useRole();
  const roleMeta = roles[role];
  const unreadCount = useUnreadCount(role);

  const title = formatTitle(location.pathname);

  return (
    <div className="mb-6 flex min-w-0 items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
      <div className="min-w-0">
        <div className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {roleMeta?.label}
        </div>
        <h1 className="truncate text-2xl font-bold text-[var(--color-text-primary)]">
          {title}
        </h1>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
          onClick={() => navigate(`${roleMeta?.defaultRoute || "/executive"}/notifications`)}
          aria-label="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-1 rounded-full bg-[var(--color-danger)] px-1.5 py-0.5 text-[10px] leading-none text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
