import { useCallback, useSyncExternalStore } from "react";
import * as notificationStore from "../shared/services/notificationStore";
import * as userStore from "../shared/services/userStore";

/**
 * useUnreadCount
 * Returns live unread notification count for the current role's user.
 * Subscribes to the notificationStore event emitter so badge updates
 * automatically on create / markRead / markAllRead — no polling.
 */
export default function useUnreadCount(role) {
  const resolveCount = useCallback(() => {
    if (!role) return 0;
    const users = userStore.getUsersByRole(role);
    if (users.length === 0) return 0;
    return notificationStore.getUnreadCount(users[0].id);
  }, [role]);

  const subscribe = useCallback((onStoreChange) => {
    return notificationStore.subscribe(onStoreChange);
  }, []);

  return useSyncExternalStore(subscribe, resolveCount, resolveCount);
}
