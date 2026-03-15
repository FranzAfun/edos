import { Navigate } from "react-router-dom";
import usePermission from "../hooks/usePermission";
import useRole from "../hooks/useRole";

function RequirePermission({ permission, children, allowedRoles }) {
  const { can } = usePermission();
  const { role } = useRole();

  if (!can(permission)) {
    return <Navigate to="/" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequirePermission;
