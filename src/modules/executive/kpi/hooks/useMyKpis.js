import { useMemo } from "react";
import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getMyKpis } from "../services/kpiService";

export default function useMyKpis(userId) {
  const params = useMemo(() => ({ userId }), [userId]);
  return useModuleQuery(getMyKpis, { params });
}
