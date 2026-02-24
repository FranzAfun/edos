import createModuleService from "./createModuleService";
import * as notificationStore from "./notificationStore";

/**
 * Notification service
 * Normalized responses: { success, data, error }
 */

export const createNotification = createModuleService(async (payload) => {
  return notificationStore.createNotification(payload);
});

export const getNotificationsForUser = createModuleService(async ({ userId }) => {
  return notificationStore.listNotificationsForUser(userId);
});

export const markNotificationAsRead = createModuleService(async ({ id }) => {
  const result = notificationStore.markAsRead(id);
  if (!result) throw new Error("Notification not found");
  return result;
});

export const markAllNotificationsAsRead = createModuleService(async ({ userId }) => {
  const count = notificationStore.markAllAsRead(userId);
  return { markedCount: count };
});
