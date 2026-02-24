/**
 * kpiStore.js
 * localStorage-backed KPI data layer.
 * Keys: edos_kpi_tasks, edos_kpi_evidence, edos_kpi_scores
 *
 * No React. Pure JS. Returns raw objects.
 */

const KEYS = {
  TASKS: "edos_kpi_tasks",
  EVIDENCE: "edos_kpi_evidence",
  SCORES: "edos_kpi_scores",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Impact multiplier + scoring helpers
// ---------------------------------------------------------------------------

const IMPACT_MULTIPLIER = {
  Operational: 1,
  Important: 2,
  Strategic: 4,
};

const GRADE_RAW_SCORE = {
  COMPLETED: 100,
  PARTIAL: 60,
  REJECTED: 0,
  LATE: 40,
};

function computeScore(rawScore, weight, impactCategory) {
  const multiplier = IMPACT_MULTIPLIER[impactCategory] ?? 1;
  return rawScore * weight * multiplier;
}

// ---------------------------------------------------------------------------
// Seed data (only on first run)
// ---------------------------------------------------------------------------

function seedIfEmpty() {
  const existing = read(KEYS.TASKS);
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const sampleTasks = [
    {
      id: generateId(),
      title: "Submit Q1 Revenue Report",
      description: "Compile and submit the Q1 revenue report with all supporting data.",
      deadline: "2026-03-15",
      evidenceType: "Report",
      weight: 3,
      impactCategory: "Strategic",
      assignedToUserId: "user-exec-1",
      status: "ASSIGNED",
      createdAt: now,
    },
    {
      id: generateId(),
      title: "Complete Compliance Training",
      description: "Finish annual compliance training module and submit certificate.",
      deadline: "2026-03-01",
      evidenceType: "File",
      weight: 1,
      impactCategory: "Operational",
      assignedToUserId: "user-exec-1",
      status: "ASSIGNED",
      createdAt: now,
    },
    {
      id: generateId(),
      title: "Team Performance Review",
      description: "Conduct performance reviews for all direct reports and submit summary.",
      deadline: "2026-03-30",
      evidenceType: "Text",
      weight: 2,
      impactCategory: "Important",
      assignedToUserId: "user-exec-1",
      status: "ASSIGNED",
      createdAt: now,
    },
  ];

  write(KEYS.TASKS, sampleTasks);
}

// Auto-seed on import
seedIfEmpty();

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export function listTasks() {
  return read(KEYS.TASKS);
}

export function createTask(task) {
  const tasks = read(KEYS.TASKS);
  const newTask = {
    ...task,
    id: generateId(),
    status: "ASSIGNED",
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  write(KEYS.TASKS, tasks);
  return newTask;
}

export function updateTask(id, patch) {
  const tasks = read(KEYS.TASKS);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...patch };
  write(KEYS.TASKS, tasks);
  return tasks[idx];
}

export function deleteTask(id) {
  const tasks = read(KEYS.TASKS).filter((t) => t.id !== id);
  write(KEYS.TASKS, tasks);
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export function listEvidenceByUser(userId) {
  return read(KEYS.EVIDENCE).filter((e) => e.userId === userId);
}

export function listAllEvidence() {
  return read(KEYS.EVIDENCE);
}

export function submitEvidence(evidence) {
  const all = read(KEYS.EVIDENCE);
  const entry = {
    ...evidence,
    id: generateId(),
    submittedAt: new Date().toISOString(),
  };
  all.push(entry);
  write(KEYS.EVIDENCE, all);

  // Mark task as SUBMITTED
  updateTask(evidence.taskId, { status: "SUBMITTED" });

  return entry;
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

export function listScoresByUser(userId) {
  return read(KEYS.SCORES).filter((s) => s.userId === userId);
}

export function gradeEvidence(evidenceId, gradeStatus) {
  const allEvidence = read(KEYS.EVIDENCE);
  const evidence = allEvidence.find((e) => e.id === evidenceId);
  if (!evidence) return null;

  // Look up the task for weight + impactCategory
  const tasks = read(KEYS.TASKS);
  const task = tasks.find((t) => t.id === evidence.taskId);
  if (!task) return null;

  const rawScore = GRADE_RAW_SCORE[gradeStatus] ?? 0;
  const computed = computeScore(rawScore, task.weight ?? 1, task.impactCategory ?? "Operational");

  // Create or update score
  const scores = read(KEYS.SCORES);
  const existingIdx = scores.findIndex(
    (s) => s.taskId === evidence.taskId && s.userId === evidence.userId
  );

  const scoreEntry = {
    id: existingIdx >= 0 ? scores[existingIdx].id : generateId(),
    taskId: evidence.taskId,
    userId: evidence.userId,
    gradeStatus,
    rawScore,
    computedScore: computed,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    scores[existingIdx] = scoreEntry;
  } else {
    scores.push(scoreEntry);
  }
  write(KEYS.SCORES, scores);

  // Mark task as GRADED
  updateTask(evidence.taskId, { status: "GRADED" });

  return scoreEntry;
}
