import { Navigate } from "react-router-dom";
import usePermission from "../hooks/usePermission";

function RequirePermission({ permission, children }) {
  const { can } = usePermission();

  if (!can(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequirePermission;
