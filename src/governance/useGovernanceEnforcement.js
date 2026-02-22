import { useAuthority } from "../context/AuthorityContext";
import { PIPELINE_REGISTRY } from "./pipelineRegistry";

/**
 * useGovernanceEnforcement
 *
 * Determines whether the current authority
 * satisfies the pipeline requirements of a module.
 *
 * Returns:
 * {
 *   allowed: boolean,
 *   authorityLevel: number,
 *   requiredLevel: number,
 *   enforcementGap: number
 * }
 */
export default function useGovernanceEnforcement(moduleKey) {
  const authority = useAuthority();

  const authorityLevel = authority?.level ?? 0;

  const pipeline = PIPELINE_REGISTRY[moduleKey];

  if (!pipeline) {
    return {
      allowed: true,
      authorityLevel,
      requiredLevel: 0,
      enforcementGap: 0,
    };
  }

  const requiredLevel = pipeline.requiredAuthorityLevel ?? 1;

  const enforcementGap = requiredLevel - authorityLevel;

  const allowed = authorityLevel >= requiredLevel;

  return {
    allowed,
    authorityLevel,
    requiredLevel,
    enforcementGap,
  };
}
