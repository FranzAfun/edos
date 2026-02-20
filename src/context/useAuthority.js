import { useContext } from "react";
import AuthorityContext from "./authorityContextStore";

export function useAuthority() {
  return useContext(AuthorityContext);
}
