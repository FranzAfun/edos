import { useContext } from "react";
import RoleContext from "../context/roleContextStore";

export default function useRole() {
  return useContext(RoleContext);
}

export function useSetRole() {
  const { setRole } = useRole();
  return setRole;
}
