import createModuleService from "../../../../shared/services/createModuleService";
import * as financialTransactionStore from "../../../../shared/services/financialTransactionStore";
import * as treasuryStore from "../../../../shared/services/treasuryStore";
import * as auditStore from "../../../../shared/services/auditStore";
import * as notificationStore from "../../../../shared/services/notificationStore";
import * as userStore from "../../../../shared/services/userStore";

export const getCeoExpenses = createModuleService(async () => {
  return financialTransactionStore.listTransactionsByType("CEO_EXPENSE");
});

export const logCeoExpense = createModuleService(async (payload) => {
  const amount = Number(payload.amount || 0);
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const transaction = financialTransactionStore.createTransaction({
    type: "CEO_EXPENSE",
    purpose: payload.purpose,
    program: payload.program,
    vendor: payload.vendor,
    amount,
    receipt: payload.receipt || "",
    notes: payload.notes || "",
    status: "RECORDED",
    createdBy: "ceo",
    createdByUserId: payload.createdByUserId,
    sourceId: payload.sourceId || null,
  });

  treasuryStore.recordExpense(amount);

  auditStore.createAuditEntry({
    userId: payload.createdByUserId,
    action: "CEO_EXPENSE_RECORDED",
    entityType: "financial_transaction",
    entityId: transaction.id,
    details: {
      type: transaction.type,
      purpose: transaction.purpose,
      program: transaction.program,
      vendor: transaction.vendor,
      amount: transaction.amount,
      status: transaction.status,
    },
  });

  const financeUser = userStore.getUsersByRole("finance")[0];
  if (financeUser) {
    notificationStore.createNotification({
      toUserId: financeUser.id,
      type: "CEO_EXPENSE",
      message: `CEO recorded a direct expense of GHS ${amount.toLocaleString()} for ${transaction.purpose}.`,
    });
  }

  return transaction;
});