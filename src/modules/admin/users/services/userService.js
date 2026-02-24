import createModuleService from "../../../../shared/services/createModuleService";
import * as userStore from "../../../../shared/services/userStore";

/**
 * Admin User service
 * Normalized responses: { success, data, error }
 */

export const getAllUsers = createModuleService(async () => {
  return userStore.listUsers();
});

export const createUser = createModuleService(async (payload) => {
  return userStore.createUser(payload);
});

export const updateUser = createModuleService(async ({ id, ...patch }) => {
  const result = userStore.updateUser(id, patch);
  if (!result) throw new Error("User not found");
  return result;
});

export const deleteUser = createModuleService(async ({ id }) => {
  userStore.deleteUser(id);
  return { deleted: true };
});

export const getExecutives = createModuleService(async () => {
  return userStore.getUsersByAuthorityLevel(1);
});
