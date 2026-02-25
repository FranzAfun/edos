import { useState, useCallback, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useRole from "../hooks/useRole";
import useUnreadCount from "../hooks/useUnreadCount";
import Can from "./security/Can";
import { NAVIGATION } from "../config/navigation.js";
import { useFeature } from "../context/FeatureContext";

export default function Sidebar({ title = "EDOS" }) {
  const { role } = useRole();
  const navItems = NAVIGATION[role] || [];
  const unreadCount = useUnreadCount(role);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  return (
    <>
      {/* F33: Mobile hamburger button */}
      <button
        onClick={toggleMobile}
        className="md:hidden fixed top-4 left-4 z-50 rounded bg-[var(--color-primary)] p-2 text-white"
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {mobileOpen ? (
            <>
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </>
          ) : (
            <>
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-40 top-0 left-0 h-full w-64
          bg-[var(--color-primary)] text-white flex flex-col p-6
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:flex
        `}
      >
        <h2 className="text-xl font-semibold tracking-wide mb-8">
          {title}
        </h2>

        <nav className="flex flex-col gap-4 text-sm overflow-y-auto flex-1">
          {navItems.map((item) => (
            <SidebarItem key={item.path} item={item} role={role} unreadCount={unreadCount} />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({ item, role, unreadCount }) {
  if (item.roles && !item.roles.includes(role)) {
    return null;
  }

  if (item.feature) {
    return <FeatureItem item={item} role={role} unreadCount={unreadCount} />;
  }

  return <PermissionItem item={item} role={role} unreadCount={unreadCount} />;
}

function FeatureItem({ item, role, unreadCount }) {
  const featureEnabled = useFeature(item.feature);

  if (!featureEnabled) {
    return null;
  }

  return <PermissionItem item={item} role={role} unreadCount={unreadCount} />;
}

function PermissionItem({ item, role, unreadCount }) {
  if (!item.permission) {
    return <NavItem item={item} role={role} unreadCount={unreadCount} />;
  }

  return (
    <Can permission={item.permission}>
      <NavItem item={item} role={role} unreadCount={unreadCount} />
    </Can>
  );
}

const isNotificationsLink = (path) => path === "/notifications";

function NavItem({ item, unreadCount }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === item.path.split("/").slice(0, 2).join("/")}
      className={({ isActive }) =>
        isActive
          ? "text-blue-500"
          : "text-gray-400"
      }
    >
      {isNotificationsLink(item.path) ? (
        <div className="flex items-center justify-between">
          <span>{item.label}</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
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
