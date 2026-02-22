import { NavLink } from "react-router-dom";
import useRole from "../hooks/useRole";
import Can from "./security/Can";
import { NAVIGATION } from "../config/navigation.js";
import { useFeature } from "../context/FeatureContext";

export default function Sidebar({ title = "EDOS" }) {
  const { role } = useRole();
  const navItems = NAVIGATION[role] || [];

  return (
    <aside className="w-64 hidden md:flex bg-[var(--color-primary)] text-white flex-col p-6">
      <h2 className="text-xl font-semibold tracking-wide mb-8">
        {title}
      </h2>

      <nav className="flex flex-col gap-4 text-sm">
        {navItems.map((item) => (
          <SidebarItem key={item.path} item={item} role={role} />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ item, role }) {
  if (item.roles && !item.roles.includes(role)) {
    return null;
  }

  if (item.feature) {
    return <FeatureItem item={item} role={role} />;
  }

  return <PermissionItem item={item} role={role} />;
}

function FeatureItem({ item, role }) {
  const featureEnabled = useFeature(item.feature);

  if (!featureEnabled) {
    return null;
  }

  return <PermissionItem item={item} role={role} />;
}

function PermissionItem({ item, role }) {
  if (!item.permission) {
    return <NavItem item={item} role={role} />;
  }

  return (
    <Can permission={item.permission}>
      <NavItem item={item} role={role} />
    </Can>
  );
}

function NavItem({ item, role }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === `/${role}`}
      className={({ isActive }) =>
        isActive
          ? "text-blue-500"
          : "text-gray-400"
      }
    >
      {item.label}
    </NavLink>
  );
}
