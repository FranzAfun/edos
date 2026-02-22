import useModuleQuery from "../../../../shared/hooks/useModuleQuery";
import { getIntelligenceOverview } from "../services/intelligenceService";

export default function useIntelligenceOverview() {
  return useModuleQuery(getIntelligenceOverview);
}
