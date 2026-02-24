import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getAllKpis } from "../services/kpiAdminService";

export default function useAllKpis() {
  return useModuleQuery(getAllKpis);
}
