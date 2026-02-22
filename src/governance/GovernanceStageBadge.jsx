import { GOVERNANCE_STAGES } from "./governanceStages";

const STAGE_STYLES = {
  WORK: "bg-gray-200 text-gray-800",
  EVIDENCE: "bg-blue-100 text-blue-800",
  SCORING: "bg-purple-100 text-purple-800",
  AUTHORITY_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVAL: "bg-green-100 text-green-800",
  SPENDING: "bg-orange-100 text-orange-800",
  VERIFICATION: "bg-indigo-100 text-indigo-800",
  INSIGHT: "bg-teal-100 text-teal-800",
};

export default function GovernanceStageBadge({ stage }) {
  if (!GOVERNANCE_STAGES.includes(stage)) {
    return (
      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
        INVALID STAGE
      </span>
    );
  }

  const style = STAGE_STYLES[stage] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${style}`}
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
