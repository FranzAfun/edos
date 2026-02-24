import { NavLink } from "react-router-dom";
import useRole from "../hooks/useRole";
import useUnreadCount from "../hooks/useUnreadCount";
import Can from "./security/Can";
import { NAVIGATION } from "../config/navigation.js";
import { useFeature } from "../context/FeatureContext";

export default function Sidebar({ title = "EDOS" }) {
  const { role } = useRole();
  const navItems = NAVIGATION[role] || [];
  const unreadCount = useUnreadCount(role);

  return (
    <aside className="w-64 hidden md:flex bg-[var(--color-primary)] text-white flex-col p-6">
      <h2 className="text-xl font-semibold tracking-wide mb-8">
        {title}
      </h2>

      <nav className="flex flex-col gap-4 text-sm">
        {navItems.map((item) => (
          <SidebarItem key={item.path} item={item} role={role} unreadCount={unreadCount} />
        ))}
      </nav>
    </aside>
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
