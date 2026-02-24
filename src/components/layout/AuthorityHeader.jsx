import { useLocation, useNavigate } from "react-router-dom";
import useRole from "../../hooks/useRole";
import useUnreadCount from "../../hooks/useUnreadCount";
import { roles } from "../../config/roles";

function formatTitle(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  
  // If only authority segment exists (e.g., /executive)
  if (segments.length === 1) return "Dashboard";

  const last = segments[segments.length - 1];

  return last.charAt(0).toUpperCase() + last.slice(1);
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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
    <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
      <div>
        <div className="text-sm text-gray-500 uppercase tracking-wide">
          {roleMeta?.label}
        </div>
        <div className="text-2xl font-semibold">
          {title}
        </div>
      </div>

      <div
        className="relative cursor-pointer text-gray-500 hover:text-gray-800"
        onClick={() => navigate("/notifications")}
        role="button"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
