import createModuleService from "../../../../shared/services/createModuleService";
import * as kpiStore from "../../../../shared/services/kpiStore";
import * as notificationStore from "../../../../shared/services/notificationStore";
import * as userStore from "../../../../shared/services/userStore";

/**
 * Admin KPI service
 * Normalized responses: { success, data, error }
 */

export const getAllKpis = createModuleService(async () => {
  return kpiStore.listTasks();
});

export const createKpiTask = createModuleService(async (payload) => {
  const task = kpiStore.createTask(payload);

  // Notify assigned executive
  notificationStore.createNotification({
    toUserId: task.assignedToUserId,
    type: "KPI_ASSIGNED",
    message: `New KPI assigned: "${task.title}"`,
    relatedId: task.id,
  });

  return task;
});

export const getAllEvidence = createModuleService(async () => {
  return kpiStore.listAllEvidence();
});

export const gradeEvidence = createModuleService(async ({ evidenceId, gradeStatus }) => {
  const result = kpiStore.gradeEvidence(evidenceId, gradeStatus);
  if (!result) throw new Error("Evidence or task not found");

  // Notify executive who submitted
  notificationStore.createNotification({
    toUserId: result.userId,
    type: "KPI_GRADED",
    message: `Your KPI evidence was graded: ${gradeStatus} (Score: ${result.computedScore})`,
    relatedId: result.taskId,
  });

  return result;
});
