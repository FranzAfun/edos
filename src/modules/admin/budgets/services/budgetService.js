/**
 * budgetService.js
 * Normalized service for department budget management.
 * Responses: { success, data, error }
 */

import createModuleService from "../../../../shared/services/createModuleService";
import * as budgetStore from "../../../../shared/services/budgetStore";

export const getAllBudgets = createModuleService(async () => {
  return budgetStore.listBudgets();
});

export const updateMonthlyLimit = createModuleService(
  async ({ departmentId, amount }) => {
    const result = budgetStore.setMonthlyLimit(departmentId, amount);
    if (!result) throw new Error("Department not found");
    return result;
  }
);

export const toggleFreeze = createModuleService(async ({ departmentId }) => {
  const current = budgetStore.getBudgetByDepartment(departmentId);
  if (!current) throw new Error("Department not found");

  if (current.frozen) {
    return budgetStore.unfreezeDepartment(departmentId);
  } else {
    return budgetStore.freezeDepartment(departmentId);
  }
});
