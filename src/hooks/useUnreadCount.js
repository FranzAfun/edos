import { useCallback, useEffect, useState } from "react";
import * as notificationStore from "../shared/services/notificationStore";
import * as userStore from "../shared/services/userStore";

/**
 * useUnreadCount
 * Returns live unread notification count for the current role's user.
 * Subscribes to the notificationStore event emitter so badge updates
 * automatically on create / markRead / markAllRead — no polling.
 */
export default function useUnreadCount(roleKey) {
  const resolveCount = useCallback(() => {
    if (!roleKey) return 0;
    const users = userStore.getUsersByRole(roleKey);
    if (users.length === 0) return 0;
    return notificationStore.getUnreadCount(users[0].id);
  }, [roleKey]);

  const [count, setCount] = useState(resolveCount);

  useEffect(() => {
    // Sync on mount / role change
    setCount(resolveCount());

    // Subscribe to store mutations
    const unsubscribe = notificationStore.subscribe(() => {
      setCount(resolveCount());
    });

    return unsubscribe;
  }, [resolveCount]);

  return count;
}
