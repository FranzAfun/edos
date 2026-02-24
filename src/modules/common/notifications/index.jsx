import { useState, useMemo, useCallback } from "react";
import BackButton from "../../../components/ui/BackButton";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useModuleQuery from "../../../shared/hooks/useModuleQuery";
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../shared/services/notificationService";
import * as userStore from "../../../shared/services/userStore";
import useRole from "../../../hooks/useRole";

function resolveUserId(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0].id : null;
}

export default function NotificationsPage() {
  const { role } = useRole();
  const userId = resolveUserId(role);

  const params = useMemo(() => ({ userId }), [userId]);
  const query = useModuleQuery(getNotificationsForUser, {
    params,
    enabled: !!userId,
  });

  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return;
    setMarkingAll(true);
    await markAllNotificationsAsRead({ userId });
    setMarkingAll(false);
    query.reload();
  }, [userId, query]);

  const unreadCount = (query.data || []).filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>

      {!userId && (
        <div className="text-sm text-gray-500">
          No user configured for this role.
        </div>
      )}

      {userId && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "All read"}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="rounded border px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                {markingAll ? "Marking…" : "Mark all as read"}
              </button>
            )}
          </div>

          <ModuleBoundary
            query={query}
            title="Notifications"
            emptyText="No notifications yet."
          >
            <Grid cols={1}>
              {(query.data || []).map((notif) => (
                <NotificationRow
                  key={notif.id}
                  notification={notif}
                  onRead={() => query.reload()}
                />
              ))}
            </Grid>
          </ModuleBoundary>
        </>
      )}
    </div>
  );
}

function NotificationRow({ notification, onRead }) {
  const [marking, setMarking] = useState(false);

  async function handleMarkRead() {
    setMarking(true);
    await markNotificationAsRead({ id: notification.id });
    setMarking(false);
    onRead();
  }

  return (
    <Card className={notification.read ? "opacity-60" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            )}
            <span className="text-xs font-semibold uppercase text-gray-400">
              {notification.type}
            </span>
          </div>
          <p className="text-sm mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        {!notification.read && (
          <button
            onClick={handleMarkRead}
            disabled={marking}
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 shrink-0"
          >
            {marking ? "…" : "Mark read"}
          </button>
        )}
      </div>
    </Card>
  );
}
