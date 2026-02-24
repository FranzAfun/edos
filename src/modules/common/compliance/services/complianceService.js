/**
 * complianceService.js
 * Normalized service for user funding compliance.
 * Responses: { success, data, error }
 */

import createModuleService from "../../../../shared/services/createModuleService";
import * as complianceStore from "../../../../shared/services/complianceStore";

export const getUserCompliance = createModuleService(async ({ userId }) => {
  return complianceStore.getCompliance(userId);
});

export const blockUser = createModuleService(async ({ userId, reason }) => {
  return complianceStore.setBlocked(userId, reason);
});

export const unblockUser = createModuleService(async ({ userId }) => {
  return complianceStore.unblockUser(userId);
});

export const markOutstanding = createModuleService(async ({ userId }) => {
  return complianceStore.incrementOutstanding(userId);
});

export const clearOutstanding = createModuleService(async ({ userId }) => {
  return complianceStore.clearOutstanding(userId);
});
