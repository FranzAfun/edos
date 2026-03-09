/**
 * Pipeline registry
 * Maps modules to governance enforcement behavior.
 *
 * Later:
 * - scoring engine plugs in here
 * - approval chains defined here
 */
export const PIPELINE_REGISTRY = {
  intelligence: {
    requiredAuthorityLevel: 5,
    requiresEvidence: true,
    requiresScoring: true,
  },

  budget: {
    requiredAuthorityLevel: 3,
    requiresEvidence: true,
    requiresScoring: true,
  },

  oversight: {
    requiredAuthorityLevel: 5,
    requiresEvidence: false,
    requiresScoring: false,
  },

  kpi: {
    requiredAuthorityLevel: 1,
    requiresEvidence: true,
    requiresScoring: true,
  },

  approval: {
    requiredAuthorityLevel: 3,
    requiresEvidence: false,
    requiresScoring: false,
    thresholds: {
      foFinalApprovalMax: 1000,
      ceoJustificationAbove: 3000,
    },
    approvalChain: ["tech", "fo", "ceo"],
    conditionalChains: {
      fo_final: ["tech", "fo", "approved"],
      ceo_review: ["tech", "fo", "ceo", "approved"],
    },
    reviewerRoles: {
      tech: ["cto", "coo"],
      fo: ["finance"],
      ceo: ["ceo"],
    },
  },
};
