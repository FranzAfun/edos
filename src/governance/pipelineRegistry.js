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
    requiredAuthorityLevel: 3,
    requiresEvidence: true,
    requiresScoring: true,
  },

  budget: {
    requiredAuthorityLevel: 4,
    requiresEvidence: true,
    requiresScoring: true,
  },

  oversight: {
    requiredAuthorityLevel: 5,
    requiresEvidence: false,
    requiresScoring: false,
  },
};
