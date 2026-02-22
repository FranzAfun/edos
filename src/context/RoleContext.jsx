import { useCallback, useMemo, useState } from "react";
import { roles } from "../config/roles";
import RoleContext from "./roleContextStore";

const ROLE_STORAGE_KEY = "edos_role";
const DEFAULT_ROLE = "executive";

function resolveRole(value) {
  return Object.prototype.hasOwnProperty.call(roles, value) ? value : DEFAULT_ROLE;
}

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_ROLE;
    }

    const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return resolveRole(storedRole);
  });

  const setRole = useCallback((nextRole) => {
    const resolvedRole = resolveRole(nextRole);
    setRoleState(resolvedRole);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_STORAGE_KEY, resolvedRole);
    }
  }, []);

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}
