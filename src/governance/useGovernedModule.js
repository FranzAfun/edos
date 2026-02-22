import createGovernedEntity from "./createGovernedEntity";
import useGovernanceEnforcement from "./useGovernanceEnforcement";
import { PIPELINE_REGISTRY } from "./pipelineRegistry";
import { useAuthority } from "../context/AuthorityContext";

/**
 * useGovernedModule
 *
 * Standardizes governance integration for any module.
 *
 * Params:
 *  moduleKey: string (must match PIPELINE_REGISTRY key)
 *  data: raw module data (optional)
 *
 * Returns:
 * {
 *   governedEntity,
 *   enforcement,
 *   pipeline,
 *   authority
 * }
 */
export default function useGovernedModule(moduleKey, data = {}) {
  const authority = useAuthority();

  const pipeline = PIPELINE_REGISTRY[moduleKey] || null;

  const enforcement = useGovernanceEnforcement(moduleKey);

  const governedEntity = createGovernedEntity({
    ...data,
    authorityLevelRequired:
      pipeline?.requiredAuthorityLevel ?? 1,
  });

  return {
    governedEntity,
    enforcement,
    pipeline,
    authority,
  };
}
