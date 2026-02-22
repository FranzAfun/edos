import createModuleService from "../../../../shared/services/createModuleService";
import { fetchIntelligenceOverview } from "../../../../pages/executive/modules/intelligence/services/intelligenceService";

export const getIntelligenceOverview =
  createModuleService(fetchIntelligenceOverview);
