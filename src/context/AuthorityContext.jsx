import { useMemo } from "react";
import useRole from "../hooks/useRole";
import { getAuthorityByRole } from "./authorityConfig";
import AuthorityContext from "./authorityContextStore";

export function AuthorityProvider({ children }) {
  const { role } = useRole();

  const value = useMemo(() => {
    return getAuthorityByRole(role);
  }, [role]);

  return (
    <AuthorityContext.Provider value={value}>
      {children}
    </AuthorityContext.Provider>
  );
}
