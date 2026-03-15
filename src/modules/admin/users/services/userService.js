import createModuleService from "../../../../shared/services/createModuleService";
import * as userStore from "../../../../shared/services/userStore";
import * as auditStore from "../../../../shared/services/auditStore";

/**
 * Admin User service
 * Normalized responses: { success, data, error }
 */

export const getAllUsers = createModuleService(async () => {
  return userStore.listUsers();
});

export const createUser = createModuleService(async (payload) => {
  const created = userStore.createUser(payload);

  auditStore.createAuditEntry({
    userId: "user-admin-1",
    category: auditStore.AUDIT_CATEGORIES.SYSTEM_LOG,
    action: auditStore.SYSTEM_LOG_ACTIONS.USER_CREATED,
    entityType: "user",
    entityId: created.id,
    details: {
      roleKey: created.roleKey,
      authorityLevel: created.authorityLevel,
      featureFlags: created.featureFlags || [],
    },
  });

  return created;
});

export const updateUser = createModuleService(async ({ id, ...patch }) => {
  const before = userStore.getUserById(id);
  const result = userStore.updateUser(id, patch);
  if (!result) throw new Error("User not found");

  auditStore.createAuditEntry({
    userId: "user-admin-1",
    category: auditStore.AUDIT_CATEGORIES.SYSTEM_LOG,
    action: auditStore.SYSTEM_LOG_ACTIONS.USER_UPDATED,
    entityType: "user",
    entityId: result.id,
    details: {
      patch,
    },
  });

  if (before?.roleKey && before.roleKey !== result.roleKey) {
    auditStore.createAuditEntry({
      userId: "user-admin-1",
      category: auditStore.AUDIT_CATEGORIES.SYSTEM_LOG,
      action: auditStore.SYSTEM_LOG_ACTIONS.ROLE_CHANGED,
      entityType: "user",
      entityId: result.id,
      details: {
        previousRole: before.roleKey,
        nextRole: result.roleKey,
      },
    });
  }

  const beforeFlags = JSON.stringify(before?.featureFlags || []);
  const afterFlags = JSON.stringify(result.featureFlags || []);
  if (before && beforeFlags !== afterFlags) {
    auditStore.createAuditEntry({
      userId: "user-admin-1",
      category: auditStore.AUDIT_CATEGORIES.SYSTEM_LOG,
      action: auditStore.SYSTEM_LOG_ACTIONS.FEATURE_FLAG_CHANGED,
      entityType: "user",
      entityId: result.id,
      details: {
        previousFlags: before.featureFlags || [],
        nextFlags: result.featureFlags || [],
      },
    });
  }

  return result;
});

export const deleteUser = createModuleService(async ({ id }) => {
  userStore.deleteUser(id);
  return { deleted: true };
});

export const getExecutives = createModuleService(async () => {
  return userStore.getUsersByAuthorityLevel(1);
});
