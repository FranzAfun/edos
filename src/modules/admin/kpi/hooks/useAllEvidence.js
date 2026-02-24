import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getAllEvidence } from "../services/kpiAdminService";

export default function useAllEvidence() {
  return useModuleQuery(getAllEvidence);
}
