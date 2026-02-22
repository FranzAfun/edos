import { GOVERNANCE_STAGES } from "./governanceStages";

/**
 * createGovernedEntity
 *
 * Creates a standardized governance object.
 * All governed records must follow this shape.
 */
export default function createGovernedEntity(data = {}) {
  return {
    id: data.id ?? null,
    title: data.title ?? "",
    stage: data.stage ?? "WORK",
    score: data.score ?? 0,
    authorityLevelRequired: data.authorityLevelRequired ?? 1,
    approvedBy: data.approvedBy ?? null,
    verified: data.verified ?? false,
    evidenceCount: data.evidenceCount ?? 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Validate stage
 */
export function isValidStage(stage) {
  return GOVERNANCE_STAGES.includes(stage);
}
