import { NavLink } from "react-router-dom";
import useRole from "../hooks/useRole";
import usePermission from "../hooks/usePermission";

import executiveNav from "../config/navigation/executiveNav";
import financeNav from "../config/navigation/financeNav";
import ceoNav from "../config/navigation/ceoNav";

const navMap = {
  executive: executiveNav,
  finance: financeNav,
  ceo: ceoNav
};

export default function Sidebar({ title = "EDOS" }) {
  const { role } = useRole();
  const { can } = usePermission();
  const navItems = (navMap[role] || []).filter((item) => can(item.permission));

  return (
    <aside className="w-64 hidden md:flex bg-[var(--color-primary)] text-white flex-col p-6">
      <h2 className="text-xl font-semibold tracking-wide mb-8">
        {title}
      </h2>

      <nav className="flex flex-col gap-4 text-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={
              item.path === "/executive" ||
              item.path === "/finance" ||
              item.path === "/ceo"
            }
            className={({ isActive }) =>
              isActive
                ? "text-blue-500"
                : "text-gray-400"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
