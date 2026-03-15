import { useMemo } from "react";
import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getMyKpiEvidence } from "../services/kpiService";

export default function useMyEvidence(userId) {
  const params = useMemo(() => ({ userId }), [userId]);
  return useModuleQuery(getMyKpiEvidence, { params });
}
