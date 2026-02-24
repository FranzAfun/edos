import useModuleQuery from "../../../../shared/hooks/useModuleQuery";

/** Stable isEmpty – defined at module scope to avoid re-render identity changes. */
function isApprovalQueueEmpty(data) {
  return !data || data.length === 0;
}

/**
 * Generic hook for any approval queue service function.
 * Usage: useApprovalQueue(getFoQueue)
 */
export default function useApprovalQueue(serviceFn, options = {}) {
  return useModuleQuery(serviceFn, {
    ...options,
    isEmpty: isApprovalQueueEmpty,
  });
}
