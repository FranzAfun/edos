import { createContext, useContext, useMemo } from "react";
import useRole from "../hooks/useRole";
import { AUTHORITIES } from "../config/authorities";

const AuthorityContext = createContext(null);

export function AuthorityProvider({ children }) {
  const { role } = useRole();

  const value = useMemo(() => {
    return AUTHORITIES[role] || null;
  }, [role]);

  return (
    <AuthorityContext.Provider value={value}>
      {children}
    </AuthorityContext.Provider>
  );
}

export function useAuthority() {
  return useContext(AuthorityContext);
}
