import usePermission from "../../hooks/usePermission";

export default function Can({ permission, children }) {
  const { can } = usePermission();

  if (!can(permission)) return null;

  return children;
}
