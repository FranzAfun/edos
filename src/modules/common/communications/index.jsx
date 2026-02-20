import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Communications Module (F24)
 * Internal messaging, announcements, and bulk email simulation.
 */
import { useState, useMemo, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import DataTable from "../../../shared/ui/DataTable";
import FormField from "../../../shared/ui/FormField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as messageStore from "../../../shared/services/messageStore";
import * as userStore from "../../../shared/services/userStore";
import useRole from "../../../hooks/useRole";

function resolveUser(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

export default function CommunicationsPage() {
  useDocumentTitle("Communications");
  const { role } = useRole();
  const currentUser = resolveUser(role);
  const [activeTab, setActiveTab] = useState("inbox");

  const [inbox, setInbox] = useState(() => currentUser ? messageStore.getMessagesForUser(currentUser.id) : []);
  const [sent, setSent] = useState(() => currentUser ? messageStore.getSentMessages(currentUser.id) : []);
  const [announcements, setAnnouncements] = useState(() => messageStore.getAnnouncements());

  const reload = useCallback(() => {
    setInbox(currentUser ? messageStore.getMessagesForUser(currentUser.id) : []);
    setSent(currentUser ? messageStore.getSentMessages(currentUser.id) : []);
    setAnnouncements(messageStore.getAnnouncements());
  }, [currentUser]);

  const unreadCount = inbox.filter((m) => !m.read).length;

  const handleMarkRead = useCallback(
    (id) => {
      messageStore.markMessageRead(id);
      reload();
    },
    [reload]
  );

  const tabs = [
    { key: "inbox", label: `Inbox (${unreadCount})` },
    { key: "sent", label: "Sent" },
    { key: "announcements", label: "Announcements" },
    { key: "compose", label: "Compose" },
  ];

  return (
    <div>
      <PageSection title="Communications" subtitle="Internal messaging and announcements">
        <Grid cols={4}>
          <MetricCard label="Inbox" value={inbox.length} />
          <MetricCard label="Unread" value={unreadCount} />
          <MetricCard label="Sent" value={sent.length} />
          <MetricCard label="Announcements" value={announcements.length} />
        </Grid>
      </PageSection>

      <div className="mb-4 overflow-x-auto border-b">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "inbox" && (
        <PageSection title="Inbox">
          <Grid cols={1}>
            {inbox.length === 0 ? (
              <Card><p className="text-sm text-gray-500">No messages.</p></Card>
            ) : (
              inbox.map((msg) => {
                const sender = userStore.getUserById(msg.fromUserId);
                return (
                  <Card key={msg.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm ${msg.read ? "text-gray-600" : "font-semibold"}`}>
                            {msg.subject}
                          </h3>
                          {!msg.read && <StatusBadge variant="info">New</StatusBadge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{msg.body}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          From: {sender?.name || msg.fromUserId} &middot;{" "}
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!msg.read && (
                        <button
                          onClick={() => handleMarkRead(msg.id)}
                          className="rounded border px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </Grid>
        </PageSection>
      )}

      {activeTab === "sent" && (
        <PageSection title="Sent Messages">
          <DataTable
            columns={[
              { key: "subject", label: "Subject" },
              {
                key: "toUserId",
                label: "To",
                render: (v) => {
                  const u = userStore.getUserById(v);
                  return u?.name || v || "—";
                },
              },
              { key: "type", label: "Type" },
              {
                key: "createdAt",
                label: "Date",
                render: (v) => new Date(v).toLocaleString(),
              },
            ]}
            data={sent}
            pageSize={10}
            emptyText="No sent messages."
          />
        </PageSection>
      )}

      {activeTab === "announcements" && (
        <PageSection title="Announcements">
          <Grid cols={1}>
            {announcements.length === 0 ? (
              <Card><p className="text-sm text-gray-500">No announcements.</p></Card>
            ) : (
              announcements.map((ann) => {
                const sender = userStore.getUserById(ann.fromUserId);
                return (
                  <Card key={ann.id}>
                    <h3 className="text-sm font-semibold">{ann.subject}</h3>
                    <p className="text-xs text-gray-500 mt-1">{ann.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      By: {sender?.name || "System"} &middot;{" "}
                      {new Date(ann.createdAt).toLocaleString()}
                    </p>
                  </Card>
                );
              })
            )}
          </Grid>
        </PageSection>
      )}

      {activeTab === "compose" && (
        <PageSection title="Compose Message">
          <ComposeForm currentUser={currentUser} onSent={() => { setActiveTab("sent"); reload(); }} />
        </PageSection>
      )}
    </div>
  );
}

function ComposeForm({ currentUser, onSent }) {
  const users = useMemo(() => userStore.listUsers().filter((u) => u.id !== currentUser?.id), [currentUser]);
  const [messageType, setMessageType] = useState("message");

  const rules = {
    subject: (v) => (!v ? "Subject is required" : null),
    body: (v) => (!v ? "Message body is required" : null),
    toUserId: (v) => (messageType === "message" && !v ? "Recipient is required" : null),
  };

  const { values, errors, touched, handleChange, validate, reset } =
    useFormValidation({ toUserId: "", subject: "", body: "" }, rules);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      messageStore.createMessage({
        fromUserId: currentUser?.id,
        toUserId: messageType === "message" ? values.toUserId : null,
        subject: values.subject,
        body: values.body,
        type: messageType,
        recipients: messageType === "announcement" ? users.map((u) => u.id) : [],
      });
      reset();
      onSent();
    },
    [validate, values, currentUser, messageType, users, reset, onSent]
  );

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 mb-2">
          {["message", "announcement"].map((t) => (
            <label key={t} className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="messageType"
                value={t}
                checked={messageType === t}
                onChange={(e) => setMessageType(e.target.value)}
                className="accent-[var(--color-accent)]"
              />
              {t === "message" ? "Direct Message" : "Announcement"}
            </label>
          ))}
        </div>
        {messageType === "message" && (
          <FormField
            label="To"
            name="toUserId"
            type="select"
            required
            value={values.toUserId}
            onChange={handleChange}
            error={touched.toUserId ? errors.toUserId : null}
            options={users.map((u) => ({ value: u.id, label: u.name }))}
          />
        )}
        <FormField
          label="Subject"
          name="subject"
          required
          value={values.subject}
          onChange={handleChange}
          error={touched.subject ? errors.subject : null}
        />
        <FormField
          label="Message"
          name="body"
          type="textarea"
          required
          value={values.body}
          onChange={handleChange}
          error={touched.body ? errors.body : null}
        />
        <button
          type="submit"
          className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          {messageType === "announcement" ? "Post Announcement" : "Send Message"}
        </button>
      </form>
    </Card>
  );
}


