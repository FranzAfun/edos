import { NavLink } from "react-router-dom";
import useRole from "../hooks/useRole";
import useApprovalCount from "../hooks/useApprovalCount";
import Can from "./security/Can";
import { NAVIGATION } from "../config/navigation.js";
import { useFeature } from "../context/useFeature";
import * as userStore from "../shared/services/userStore";

const SIDEBAR_LOGO_SRC = "/era_full_logo.png";
const SIDEBAR_AVATAR_PLACEHOLDER_SRC = "/assets/avatar-placeholder.svg";

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

function SidebarNavIcon({ name }) {
  const sharedProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    className: "nav-icon shrink-0",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...sharedProps}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case "kpi":
      return (
        <svg {...sharedProps}>
          <path d="M4 19h16" />
          <path d="M6 16l4-5 3 3 5-7" />
          <circle cx="10" cy="11" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="13" cy="14" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="18" cy="7" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "approvals":
      return (
        <svg {...sharedProps}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "fund-request":
      return (
        <svg {...sharedProps}>
          <path d="M17 7a7 7 0 1 0 0 10" />
          <path d="M12 4v16" />
        </svg>
      );
    case "treasury":
      return (
        <svg {...sharedProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <circle cx="12" cy="14" r="2" />
        </svg>
      );
    case "revenue":
      return (
        <svg {...sharedProps}>
          <path d="M4 19h16" />
          <path d="M7 15l3-3 3 2 4-5" />
          <path d="M16 9h3v3" />
        </svg>
      );
    case "profit-loss":
      return (
        <svg {...sharedProps}>
          <path d="M3 3v18h18" />
          <path d="M7 9l3 3 4-4 3 3" />
          <path d="M17 14h4" />
        </svg>
      );
    case "budgets":
      return (
        <svg {...sharedProps}>
          <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );
    case "receipts":
      return (
        <svg {...sharedProps}>
          <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
        </svg>
      );
    case "reports":
      return (
        <svg {...sharedProps}>
          <path d="M4 20h16" />
          <rect x="6" y="10" width="3" height="6" rx="1" />
          <rect x="11" y="7" width="3" height="9" rx="1" />
          <rect x="16" y="4" width="3" height="12" rx="1" />
        </svg>
      );
    case "audit":
      return (
        <svg {...sharedProps}>
          <path d="M12 3l7 4v5c0 5-3.4 8.6-7 9-3.6-.4-7-4-7-9V7l7-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "attendance":
      return (
        <svg {...sharedProps}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M3 10h18" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      );
    case "communications":
      return (
        <svg {...sharedProps}>
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 8h8" />
          <path d="M8 12h6" />
        </svg>
      );
    case "assets":
      return (
        <svg {...sharedProps}>
          <path d="M3 8l9-5 9 5-9 5-9-5z" />
          <path d="M3 12l9 5 9-5" />
          <path d="M3 16l9 5 9-5" />
        </svg>
      );
    case "users":
      return (
        <svg {...sharedProps}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19c0-3.3 2.7-6 6-6" />
          <circle cx="17" cy="10" r="3" />
          <path d="M13 19c.3-2.8 2.7-5 5.5-5" />
        </svg>
      );
    case "programs":
      return (
        <svg {...sharedProps}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <circle cx="7" cy="6" r="1" fill="currentColor" />
          <circle cx="7" cy="12" r="1" fill="currentColor" />
          <circle cx="7" cy="18" r="1" fill="currentColor" />
        </svg>
      );
    case "strategy":
      return (
        <svg {...sharedProps}>
          <path d="M4 20l7-16 2 6 7 2-16 8z" />
          <circle cx="13" cy="11" r="1" fill="currentColor" />
        </svg>
      );
    case "oversight":
      return (
        <svg {...sharedProps}>
          <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "transparency":
      return (
        <svg {...sharedProps}>
          <path d="M12 3l8 4v5c0 5-3.8 8.7-8 9-4.2-.3-8-4-8-9V7l8-4z" />
          <path d="M12 10v5" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
      );
    case "intelligence":
      return (
        <svg {...sharedProps}>
          <path d="M12 3a7 7 0 0 0-4 12.8V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3.2A7 7 0 0 0 12 3z" />
          <path d="M9 21h6" />
        </svg>
      );
    case "compliance":
      return (
        <svg {...sharedProps}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );
    default:
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

function getSidebarIconName(item) {
  const label = String(item?.label || "").toLowerCase();
  const path = String(item?.path || "").toLowerCase();

  if (label.includes("dashboard")) return "dashboard";
  if (label.includes("kpi")) return "kpi";
  if (label.includes("approval")) return "approvals";
  if (label.includes("fund request")) return "fund-request";
  if (label.includes("treasury")) return "treasury";
  if (label.includes("revenue")) return "revenue";
  if (label.includes("profit")) return "profit-loss";
  if (label.includes("budget")) return "budgets";
  if (label.includes("receipt")) return "receipts";
  if (label.includes("report")) return "reports";
  if (label.includes("audit") || label.includes("log")) return "audit";
  if (label.includes("attendance") || label.includes("participation")) return "attendance";
  if (label.includes("communication")) return "communications";
  if (label.includes("asset")) return "assets";
  if (label.includes("user")) return "users";
  if (label.includes("program")) return "programs";
  if (label.includes("strategy")) return "strategy";
  if (label.includes("oversight")) return "oversight";
  if (label.includes("transparency")) return "transparency";
  if (label.includes("intelligence") || label.includes("insight")) return "intelligence";
  if (label.includes("compliance")) return "compliance";

  if (path.includes("/approvals")) return "approvals";
  if (path.includes("/reports")) return "reports";
  if (path.includes("/audit") || path.includes("/logs")) return "audit";

  return "dashboard";
}

export default function Sidebar({ title = "EDOS", mobileOpen = false, onCloseMobile, collapsed = false }) {
  const { role, user } = useRole() || {};
  const navItems = NAVIGATION[role] || [];
  const approvalCount = useApprovalCount(role);
  const systemTitle = role ? `EDOS - ${role.toUpperCase()}` : title;
  const roleUser = role ? userStore.getUsersByRole(role)[0] : null;
  const avatarSrc = user?.avatar || roleUser?.avatar || SIDEBAR_AVATAR_PLACEHOLDER_SRC;
  const displayName = user?.name || roleUser?.name || "User";

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
        className={`sidebar fixed inset-y-0 left-0 z-40 h-full md:static
          transition-all duration-300 ${collapsed ? "collapsed w-20 px-2 py-6" : "w-60 p-6"}
          border-r border-white/15
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:flex
        `}
      >
        <div className="mb-2 -ml-1 -mt-3 flex items-center justify-between border-b border-white/[0.12] px-1 pb-3 pt-0 md:hidden">
          <SidebarHeaderContent
            systemTitle={systemTitle}
            avatarSrc={avatarSrc}
            displayName={displayName}
            collapsed={collapsed}
          />
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="hidden -ml-1 -mt-3 border-b border-white/[0.12] px-1 pb-3 pt-0 md:block">
          <div className="mb-2">
            <SidebarHeaderContent
              systemTitle={systemTitle}
              avatarSrc={avatarSrc}
              displayName={displayName}
              collapsed={collapsed}
            />
          </div>
        </div>

        <nav className={`no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto pt-3 text-sm ${collapsed ? "px-0" : "-ml-1 px-1"}`}>
          {navItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              role={role}
              approvalCount={approvalCount}
              onCloseMobile={onCloseMobile}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarHeaderContent({ systemTitle, avatarSrc, displayName, collapsed }) {
  return (
    <div className={`flex flex-col ${collapsed ? "items-center" : "items-start"}`}>
      {!collapsed && (
        <img
          src={SIDEBAR_LOGO_SRC}
          alt="ERA logo"
          className="sidebar-logo -ml-1 mb-1 block self-start"
        />
      )}

      <div className={`sidebar-profile-row ${collapsed ? "w-full justify-center" : ""}`}>
        <button type="button" className="sidebar-avatar" aria-label="Open profile image settings">
          <img src={avatarSrc} alt="Profile" />
        </button>
        <span className={`${collapsed ? "hidden" : "inline"} sidebar-user-name`}>{displayName}</span>
      </div>

      <span className={`${collapsed ? "hidden" : "block"} sidebar-system-title`}>
        {systemTitle}
      </span>
    </div>
  );
}

function SidebarItem({ item, role, approvalCount, onCloseMobile, collapsed }) {
  if (item.roles && !item.roles.includes(role)) {
    return null;
  }

  if (item.feature) {
    return <FeatureItem item={item} role={role} approvalCount={approvalCount} onCloseMobile={onCloseMobile} collapsed={collapsed} />;
  }

  return <PermissionItem item={item} role={role} approvalCount={approvalCount} onCloseMobile={onCloseMobile} collapsed={collapsed} />;
}

function FeatureItem({ item, role, approvalCount, onCloseMobile, collapsed }) {
  const featureEnabled = useFeature(item.feature);

  if (!featureEnabled) {
    return null;
  }

  return <PermissionItem item={item} role={role} approvalCount={approvalCount} onCloseMobile={onCloseMobile} collapsed={collapsed} />;
}

function PermissionItem({ item, role, approvalCount, onCloseMobile, collapsed }) {
  if (!item.permission) {
    return <NavItem item={item} role={role} approvalCount={approvalCount} onCloseMobile={onCloseMobile} collapsed={collapsed} />;
  }

  return (
    <Can permission={item.permission}>
      <NavItem item={item} role={role} approvalCount={approvalCount} onCloseMobile={onCloseMobile} collapsed={collapsed} />
    </Can>
  );
}

const isApprovalLink = (path) => path.endsWith("/approvals");

function NavItem({ item, approvalCount, onCloseMobile, collapsed }) {
  const iconName = getSidebarIconName(item);

  return (
    <NavLink
      to={item.path}
      end={item.path === item.path.split("/").slice(0, 2).join("/")}
      onClick={onCloseMobile}
      className={({ isActive }) => {
        const base = "sidebar-item nav-item rounded-lg text-sm font-medium transition-all duration-150";
        const state = isActive ? "active shadow-sm" : "";
        const layout = collapsed ? "is-collapsed" : "";

        return `${base} ${state} ${layout}`;
      }}
    >
      <span className="nav-item-content text-white/90">
        <span className="nav-icon-wrapper">
          <SidebarNavIcon name={iconName} />
        </span>
        <span className="nav-label">{item.label}</span>
      </span>

      {!collapsed && isApprovalLink(item.path) && approvalCount > 0 && (
        <span className="nav-badge rounded-full bg-[var(--color-danger)] px-2 py-0.5 text-xs text-white">
          {approvalCount}
        </span>
      )}
    </NavLink>
  );
}
