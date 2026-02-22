import { useLocation } from "react-router-dom";
import useRole from "../../hooks/useRole";
import { roles } from "../../config/roles";

function formatTitle(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  
  // If only authority segment exists (e.g., /executive)
  if (segments.length === 1) return "Dashboard";

  const last = segments[segments.length - 1];

  return last.charAt(0).toUpperCase() + last.slice(1);
}

export default function AuthorityHeader() {
  const location = useLocation();
  const { role } = useRole();
  const roleMeta = roles[role];

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

      <div>
        {/* future action controls */}
      </div>
    </div>
  );
}
