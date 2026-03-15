import createModuleService from "../../../../shared/services/createModuleService";
import * as kpiStore from "../../../../shared/services/kpiStore";
import * as notificationStore from "../../../../shared/services/notificationStore";
import * as userStore from "../../../../shared/services/userStore";

/**
 * Executive KPI service
 * Normalized responses: { success, data, error }
 */

export const getMyKpis = createModuleService(async ({ userId }) => {
  const tasks = kpiStore.listTasks().filter((t) => t.assignedToUserId === userId);
  return tasks;
});

export const getMyKpiEvidence = createModuleService(async ({ userId }) => {
  return kpiStore.listEvidenceByUser(userId);
});

export const submitKpiEvidence = createModuleService(
  async ({
    taskId,
    userId,
    type,
    linkOrText,
    evidenceLink,
    fileName,
    fileSize,
    fileType,
    comments,
  }) => {
    const entry = kpiStore.submitEvidence({
      taskId,
      userId,
      type,
      linkOrText,
      evidenceLink,
      fileName,
      fileSize,
      fileType,
      comments,
      reviewerStatus: "Pending",
    });

    // Notify admin users
    const admins = userStore.getUsersByRole("admin");
    const task = kpiStore.listTasks().find((t) => t.id === taskId);
    for (const admin of admins) {
      notificationStore.createNotification({
        toUserId: admin.id,
        type: "KPI_SUBMITTED",
        message: `Evidence submitted for KPI: "${task?.title || taskId}"`,
        relatedId: taskId,
      });
    }

    return entry;
  }
);

export const getMyKpiScores = createModuleService(async ({ userId }) => {
  const scores = kpiStore.listScoresByUser(userId);
  return scores;
});
