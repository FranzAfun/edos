import { AUTHORITIES } from "../config/authorities";

export function getAuthorityByRole(role) {
  return AUTHORITIES[role] || null;
}
