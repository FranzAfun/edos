import { AUTHORITY_LEVEL, ROLES } from "./roles";

export const AUTHORITIES = {
  [ROLES.ADMIN]: {
    level: AUTHORITY_LEVEL.ADMIN,
    label: "System Administration",
    enforcementWeight: AUTHORITY_LEVEL.ADMIN,
  },
  [ROLES.CEO]: {
    level: AUTHORITY_LEVEL.CEO,
    label: "Chief Executive Authority",
    enforcementWeight: AUTHORITY_LEVEL.CEO,
  },
  [ROLES.CTO]: {
    level: AUTHORITY_LEVEL.CTO,
    label: "Chief Technology Officer Authority",
    enforcementWeight: AUTHORITY_LEVEL.CTO,
  },
  [ROLES.COO]: {
    level: AUTHORITY_LEVEL.COO,
    label: "Chief Operations Officer Authority",
    enforcementWeight: AUTHORITY_LEVEL.COO,
  },
  [ROLES.FINANCE]: {
    level: AUTHORITY_LEVEL.FINANCE,
    label: "Financial Officer Authority",
    enforcementWeight: AUTHORITY_LEVEL.FINANCE,
  },
  [ROLES.EXECUTIVE]: {
    level: AUTHORITY_LEVEL.EXECUTIVE,
    label: "Executive Authority",
    enforcementWeight: AUTHORITY_LEVEL.EXECUTIVE,
  },
};
