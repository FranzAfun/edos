import { useMemo } from "react";
import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getMyKpiScores } from "../services/kpiService";

export default function useMyScores(userId) {
  const params = useMemo(() => ({ userId }), [userId]);
  return useModuleQuery(getMyKpiScores, { params });
}
