import useRole from "./useRole";
import { roles } from "../config/roles";

function usePermission() {
  const { role } = useRole();
  const roleMeta = roles[role];

  function can(permission) {
    return roleMeta?.permissions?.includes(permission);
  }

  return { can };
}

export { usePermission };
export default usePermission;
