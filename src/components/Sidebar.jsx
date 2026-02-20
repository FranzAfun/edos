import { NavLink } from "react-router-dom";
import useRole from "../hooks/useRole";
import useUnreadCount from "../hooks/useUnreadCount";
import Can from "./security/Can";
import { NAVIGATION } from "../config/navigation.js";
import { useFeature } from "../context/useFeature";

function CloseIcon() {
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
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Sidebar({ title = "EDOS", mobileOpen = false, onCloseMobile }) {
  const { role } = useRole();
  const navItems = NAVIGATION[role] || [];
  const unreadCount = useUnreadCount(role);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 h-full w-64 md:static
          bg-gray-50 border-r border-gray-200
          text-gray-900
          [html[data-theme='dark']_&]:bg-[var(--color-surface)]
          [html[data-theme='dark']_&]:border-[var(--color-border)]
          [html[data-theme='dark']_&]:text-[var(--color-text-primary)]
          flex flex-col p-6
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:flex
        `}
      >
        <div className="mb-2 flex items-center justify-between px-4 py-4 md:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 [html[data-theme='dark']_&]:text-[var(--color-text-muted)]">
            {title}
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 [html[data-theme='dark']_&]:border-[var(--color-border)] [html[data-theme='dark']_&]:bg-[var(--color-surface-hover)] [html[data-theme='dark']_&]:text-[var(--color-text-primary)]"
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>

        <h2 className="hidden px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider [html[data-theme='dark']_&]:text-[var(--color-text-muted)] md:block">
          {title}
        </h2>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto text-sm">
          {navItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              role={role}
              unreadCount={unreadCount}
              onCloseMobile={onCloseMobile}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({ item, role, unreadCount, onCloseMobile }) {
  if (item.roles && !item.roles.includes(role)) {
    return null;
  }

  if (item.feature) {
    return <FeatureItem item={item} role={role} unreadCount={unreadCount} onCloseMobile={onCloseMobile} />;
  }

  return <PermissionItem item={item} role={role} unreadCount={unreadCount} onCloseMobile={onCloseMobile} />;
}

function FeatureItem({ item, role, unreadCount, onCloseMobile }) {
  const featureEnabled = useFeature(item.feature);

  if (!featureEnabled) {
    return null;
  }

  return <PermissionItem item={item} role={role} unreadCount={unreadCount} onCloseMobile={onCloseMobile} />;
}

function PermissionItem({ item, role, unreadCount, onCloseMobile }) {
  if (!item.permission) {
    return <NavItem item={item} role={role} unreadCount={unreadCount} onCloseMobile={onCloseMobile} />;
  }

  return (
    <Can permission={item.permission}>
      <NavItem item={item} role={role} unreadCount={unreadCount} onCloseMobile={onCloseMobile} />
    </Can>
  );
}

const isNotificationsLink = (path) => path.endsWith("/notifications");

function NavItem({ item, unreadCount, onCloseMobile }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === item.path.split("/").slice(0, 2).join("/")}
      onClick={onCloseMobile}
      className={({ isActive }) => `
flex items-center justify-between
px-4 py-2
text-sm font-medium
rounded-lg
transition-all duration-150
${isActive
  ? "bg-gray-900 text-white shadow-sm [html[data-theme='dark']_&]:bg-[var(--color-surface-hover)] [html[data-theme='dark']_&]:text-[var(--color-text-primary)]"
  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 [html[data-theme='dark']_&]:text-[var(--color-text-secondary)] [html[data-theme='dark']_&]:hover:bg-[var(--color-surface-hover)] [html[data-theme='dark']_&]:hover:text-[var(--color-text-primary)]"}
`}
    >
      {isNotificationsLink(item.path) ? (
        <div className="flex items-center justify-between">
          <span>{item.label}</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[var(--color-danger)] px-2 py-0.5 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </div>
      ) : (
        item.label
      )}
    </NavLink>
  );
}
