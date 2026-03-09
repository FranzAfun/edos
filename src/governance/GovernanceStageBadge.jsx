import { semanticStatus } from "@/theme/semanticColors";
import { GOVERNANCE_STAGES } from "./governanceStages";

const STAGE_STYLES = {
  WORK: semanticStatus.info,
  EVIDENCE: semanticStatus.info,
  SCORING: semanticStatus.info,
  AUTHORITY_REVIEW: semanticStatus.warning,
  APPROVAL: semanticStatus.success,
  SPENDING: semanticStatus.warning,
  VERIFICATION: semanticStatus.info,
  INSIGHT: semanticStatus.info,
};

export default function GovernanceStageBadge({ stage }) {
  if (!GOVERNANCE_STAGES.includes(stage)) {
    return (
      <span
        className="px-2 py-1 text-xs rounded"
        style={{
          backgroundColor: semanticStatus.error.bg,
          color: semanticStatus.error.text,
        }}
      >
        INVALID STAGE
      </span>
    );
  }

  const style = STAGE_STYLES[stage] || STAGE_STYLES.WORK;

  return (
    <span
      className="px-2 py-1 text-xs font-medium rounded"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {formatStage(stage)}
    </span>
  );
}

function formatStage(stage) {
  return stage
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
