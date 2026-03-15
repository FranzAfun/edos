import { useCallback, useSyncExternalStore } from "react";
import { APPROVAL_STAGES } from "../governance/approvalStages";
import * as approvalStore from "../shared/services/approvalStore";
import { normalizeSupervisor } from "../utils/supervisor";

/**
 * useApprovalCount
 * Returns live pending approval queue count for the active role.
 */
export default function useApprovalCount(role) {
  const resolveCount = useCallback(() => {
    if (!role) return 0;

    if (role === "finance") {
      return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_FO).length;
    }

    if (role === "ceo") {
      return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_CEO).length;
    }

    if (role === "operations") {
      return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_TECH_REVIEW).length;
    }

    const reviewerRole = normalizeSupervisor(role);
    if (reviewerRole) {
      return approvalStore.getTechReviewApprovalsForSupervisor(reviewerRole).length;
    }

    return 0;
  }, [role]);

  const subscribe = useCallback((onStoreChange) => {
    return approvalStore.subscribe(onStoreChange);
  }, []);

  return useSyncExternalStore(subscribe, resolveCount, resolveCount);
}
