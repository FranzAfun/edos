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

function ToggleIcon({ collapsed }) {
  const openPath = "M13 5V19M16 8H18M16 11H18M16 14H18M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z";
  const closePath = "M11 5V19M6 8H8M6 11H8M6 14H8M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-300"
    >
      <path d={collapsed ? openPath : closePath} />
    </svg>
  );
}

export default function AuthorityHeader({ onToggleSidebar, collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useRole();
  const roleMeta = roles[role];
  const unreadCount = useUnreadCount(role);

  const title = formatTitle(location.pathname);

  return (
    <div className="mb-6 flex min-w-0 items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
      <div className="min-w-0 flex items-start gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:inline-flex icon-btn h-9 w-9 shadow-sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <ToggleIcon collapsed={collapsed} />
          </button>
        )}

        <div className="min-w-0">
        <div className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {roleMeta?.label}
        </div>
        <h1 className="truncate text-2xl font-bold text-[var(--color-text-primary)]">
          {title}
        </h1>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          className="relative icon-btn h-8 w-8"
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
