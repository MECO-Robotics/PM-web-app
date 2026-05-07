import type { BootstrapPayload } from "@/types/bootstrap";
import type { FilterSelection } from "@/features/workspace/shared/filters/workspaceFilterUtils";
import {
  filterSelectionIncludes,
  filterSelectionMatchesTaskPeople,
} from "@/features/workspace/shared/filters/workspaceFilterUtils";
import { isTaskDueSoon } from "@/features/workspace/views/taskCalendar/taskCalendarEvents";

type AttentionItemKind = "risk" | "task" | "manufacturing" | "purchase" | "report";
type AttentionActionType = "open-risk" | "open-task" | null;

export interface AttentionSummaryCard {
  id: string;
  label: string;
  value: number;
}

export interface AttentionTriageItem {
  actionType: AttentionActionType;
  contextLabel: string;
  id: string;
  kind: AttentionItemKind;
  ownerLabel: string;
  recordId: string;
  severityLabel: string;
  statusLabel: string;
  subtitle: string;
  title: string;
}

export interface AttentionTriageGroup {
  emptyLabel: string;
  id: string;
  items: AttentionTriageItem[];
  title: string;
}

export interface AttentionViewModel {
  summaryCards: AttentionSummaryCard[];
  triageGroups: AttentionTriageGroup[];
}

interface BuildAttentionViewModelArgs {
  activePersonFilter: FilterSelection;
  bootstrap: BootstrapPayload;
}

const ATTENTION_DUE_SOON_DAYS = 7;
const RECENT_FAILURE_WINDOW_DAYS = 14;
const CALENDAR_MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatContextLabel({
  projectName,
  subsystemName,
  workstreamName,
}: {
  projectName?: string;
  subsystemName?: string;
  workstreamName?: string;
}) {
  return [projectName, workstreamName, subsystemName].filter(Boolean).join(" | ") || "Scope unknown";
}

function formatOwnerLabel(name: string | null | undefined) {
  return name && name.trim().length > 0 ? name : "Unassigned";
}

function normalizeDateOnly(value: string) {
  return value.includes("T") ? value.slice(0, 10) : value;
}

function isDateOverdue(value: string, today = new Date()) {
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dueDate = new Date(normalizeDateOnly(value)).getTime();
  return dueDate < todayDate;
}

function isWithinRecentWindow(value: string, today = new Date(), windowDays = RECENT_FAILURE_WINDOW_DAYS) {
  const target = new Date(value).getTime();
  if (!Number.isFinite(target)) {
    return false;
  }

  const now = today.getTime();
  const daysAgo = (now - target) / CALENDAR_MS_PER_DAY;
  return daysAgo >= 0 && daysAgo <= windowDays;
}

export function buildAttentionViewModel({
  activePersonFilter,
  bootstrap,
}: BuildAttentionViewModelArgs): AttentionViewModel {
  const membersById = Object.fromEntries(
    bootstrap.members.map((member) => [member.id, member] as const),
  );
  const projectsById = Object.fromEntries(
    bootstrap.projects.map((project) => [project.id, project] as const),
  );
  const subsystemsById = Object.fromEntries(
    bootstrap.subsystems.map((subsystem) => [subsystem.id, subsystem] as const),
  );
  const workstreamsById = Object.fromEntries(
    bootstrap.workstreams.map((workstream) => [workstream.id, workstream] as const),
  );
  const tasksById = Object.fromEntries(bootstrap.tasks.map((task) => [task.id, task] as const));

  const filteredTasks = bootstrap.tasks.filter(
    (task) =>
      filterSelectionMatchesTaskPeople(activePersonFilter, task) && task.status !== "complete",
  );

  const taskByReportId = new Map<string, BootstrapPayload["tasks"][number]>();
  for (const report of bootstrap.reports) {
    if (!report.taskId) {
      continue;
    }

    const task = tasksById[report.taskId];
    if (task) {
      taskByReportId.set(report.id, task);
    }
  }

  const criticalRisks = bootstrap.risks
    .filter((risk) => risk.severity === "high" && !risk.mitigationTaskId)
    .filter((risk) => {
      if (activePersonFilter.length === 0) {
        return true;
      }

      const mitigationTask = risk.mitigationTaskId ? tasksById[risk.mitigationTaskId] : null;
      const sourceTask = taskByReportId.get(risk.sourceId);
      return [mitigationTask, sourceTask]
        .filter((task): task is BootstrapPayload["tasks"][number] => Boolean(task))
        .some((task) => filterSelectionMatchesTaskPeople(activePersonFilter, task));
    });

  const highRisks = bootstrap.risks
    .filter((risk) => risk.severity === "high" && Boolean(risk.mitigationTaskId))
    .filter((risk) => {
      if (activePersonFilter.length === 0) {
        return true;
      }

      const mitigationTask = risk.mitigationTaskId ? tasksById[risk.mitigationTaskId] : null;
      const sourceTask = taskByReportId.get(risk.sourceId);
      return [mitigationTask, sourceTask]
        .filter((task): task is BootstrapPayload["tasks"][number] => Boolean(task))
        .some((task) => filterSelectionMatchesTaskPeople(activePersonFilter, task));
    });

  const blockedTasks = filteredTasks.filter(
    (task) =>
      task.isBlocked ||
      task.blockers.length > 0 ||
      task.planningState === "blocked" ||
      task.planningState === "waiting-on-dependency",
  );
  const waitingQaTasks = filteredTasks.filter((task) => task.status === "waiting-for-qa");
  const overdueTasks = filteredTasks.filter((task) => task.dueDate && isDateOverdue(task.dueDate));
  const dueSoonTasks = filteredTasks.filter(
    (task) =>
      task.dueDate &&
      !isDateOverdue(task.dueDate) &&
      isTaskDueSoon(task.dueDate, new Date()) &&
      task.status !== "waiting-for-qa",
  );

  const manufacturingBlockers = bootstrap.manufacturingItems
    .filter(
      (item) =>
        item.status !== "complete" &&
        filterSelectionIncludes(activePersonFilter, item.requestedById) &&
        (!item.mentorReviewed ||
          item.status === "requested" ||
          item.status === "approved" ||
          isDateOverdue(item.dueDate)),
    )
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

  const purchaseDelays = bootstrap.purchaseItems
    .filter(
      (item) =>
        item.status !== "delivered" && filterSelectionIncludes(activePersonFilter, item.requestedById),
    )
    .sort((left, right) => left.status.localeCompare(right.status));

  const failedReports = bootstrap.reports
    .filter((report) => report.status === "fail" || report.status === "blocked")
    .filter((report) => {
      if (activePersonFilter.length > 0) {
        const sourceTask = report.taskId ? tasksById[report.taskId] : null;
        if (
          !filterSelectionIncludes(activePersonFilter, report.createdByMemberId) &&
          !(sourceTask && filterSelectionMatchesTaskPeople(activePersonFilter, sourceTask))
        ) {
          return false;
        }
      }

      return report.createdAt ? isWithinRecentWindow(report.createdAt) : true;
    });

  const failedQaReviews = (bootstrap.qaReviews ?? []).filter((review) => {
    if (review.result === "pass") {
      return false;
    }

    if (activePersonFilter.length > 0) {
      const participantMatches = review.participantIds.some((memberId) =>
        activePersonFilter.includes(memberId),
      );
      if (!participantMatches) {
        return false;
      }
    }

    return isWithinRecentWindow(review.reviewedAt);
  });

  const riskItems = (rows: BootstrapPayload["risks"]) =>
    rows.map<AttentionTriageItem>((risk) => {
      const mitigationTask = risk.mitigationTaskId ? tasksById[risk.mitigationTaskId] : null;
      const sourceTask = taskByReportId.get(risk.sourceId);
      const taskContext = mitigationTask ?? sourceTask;
      const projectName = taskContext ? projectsById[taskContext.projectId]?.name : undefined;
      const workstreamId = taskContext?.workstreamId ?? taskContext?.workstreamIds[0] ?? null;
      const workstreamName = workstreamId ? workstreamsById[workstreamId]?.name : undefined;
      const subsystemName = taskContext ? subsystemsById[taskContext.subsystemId]?.name : undefined;

      return {
        actionType: "open-risk",
        contextLabel: formatContextLabel({ projectName, subsystemName, workstreamName }),
        id: `risk-${risk.id}`,
        kind: "risk",
        ownerLabel: formatOwnerLabel(mitigationTask?.ownerId ? membersById[mitigationTask.ownerId]?.name : null),
        recordId: risk.id,
        severityLabel: risk.severity === "high" ? "High" : "Medium",
        statusLabel: mitigationTask ? "Mitigation linked" : "Needs mitigation",
        subtitle: risk.detail,
        title: risk.title,
      };
    });

  const taskItems = (rows: BootstrapPayload["tasks"], statusLabel: string) =>
    rows.map<AttentionTriageItem>((task) => {
      const workstreamId = task.workstreamId ?? task.workstreamIds[0] ?? null;

      return {
        actionType: "open-task",
        contextLabel: formatContextLabel({
          projectName: projectsById[task.projectId]?.name,
          subsystemName: subsystemsById[task.subsystemId]?.name,
          workstreamName: workstreamId ? workstreamsById[workstreamId]?.name : undefined,
        }),
        id: `task-${task.id}`,
        kind: "task",
        ownerLabel: formatOwnerLabel(task.ownerId ? membersById[task.ownerId]?.name : null),
        recordId: task.id,
        severityLabel: task.priority,
        statusLabel,
        subtitle: task.summary,
        title: task.title,
      };
    });

  const manufacturingItems = manufacturingBlockers.map<AttentionTriageItem>((item) => ({
    actionType: null,
    contextLabel: formatContextLabel({
      projectName: projectsById[subsystemsById[item.subsystemId]?.projectId]?.name,
      subsystemName: subsystemsById[item.subsystemId]?.name,
    }),
    id: `manufacturing-${item.id}`,
    kind: "manufacturing",
    ownerLabel: formatOwnerLabel(
      item.requestedById ? membersById[item.requestedById]?.name : null,
    ),
    recordId: item.id,
    severityLabel: item.mentorReviewed ? "Watch" : "Needs review",
    statusLabel: item.status,
    subtitle: `Due ${normalizeDateOnly(item.dueDate)} | Qty ${item.quantity}`,
    title: item.title,
  }));

  const purchaseItems = purchaseDelays.map<AttentionTriageItem>((item) => ({
    actionType: null,
    contextLabel: formatContextLabel({
      projectName: projectsById[subsystemsById[item.subsystemId]?.projectId]?.name,
      subsystemName: subsystemsById[item.subsystemId]?.name,
    }),
    id: `purchase-${item.id}`,
    kind: "purchase",
    ownerLabel: formatOwnerLabel(
      item.requestedById ? membersById[item.requestedById]?.name : null,
    ),
    recordId: item.id,
    severityLabel: "Supply",
    statusLabel: item.status,
    subtitle: `${item.vendor || "Vendor unknown"} | Qty ${item.quantity}`,
    title: item.title,
  }));

  const reportItems = [
    ...failedReports.map<AttentionTriageItem>((report) => {
      const task = report.taskId ? tasksById[report.taskId] : null;
      const projectName = report.projectId ? projectsById[report.projectId]?.name : undefined;
      const subsystemName = task ? subsystemsById[task.subsystemId]?.name : undefined;

      return {
        actionType: task ? "open-task" : null,
        contextLabel: formatContextLabel({ projectName, subsystemName }),
        id: `report-${report.id}`,
        kind: "report",
        ownerLabel: formatOwnerLabel(
          report.createdByMemberId ? membersById[report.createdByMemberId]?.name : null,
        ),
        recordId: task?.id ?? report.id,
        severityLabel: report.reportType,
        statusLabel: report.status ?? "flagged",
        subtitle: report.summary || report.notes || "Failed report result",
        title: report.title || "Failed report",
      };
    }),
    ...failedQaReviews.map<AttentionTriageItem>((review) => {
      const sourceTask = review.subjectType === "task" ? tasksById[review.subjectId] : null;
      const sourceManufacturing =
        review.subjectType === "manufacturing"
          ? bootstrap.manufacturingItems.find((item) => item.id === review.subjectId)
          : null;
      const projectName = sourceTask
        ? projectsById[sourceTask.projectId]?.name
        : sourceManufacturing
          ? projectsById[subsystemsById[sourceManufacturing.subsystemId]?.projectId]?.name
          : undefined;
      const subsystemName = sourceTask
        ? subsystemsById[sourceTask.subsystemId]?.name
        : sourceManufacturing
          ? subsystemsById[sourceManufacturing.subsystemId]?.name
          : undefined;

      return {
        actionType: sourceTask ? "open-task" : null,
        contextLabel: formatContextLabel({ projectName, subsystemName }),
        id: `qa-review-${review.id}`,
        kind: "report",
        ownerLabel:
          review.participantIds.length > 0
            ? formatOwnerLabel(membersById[review.participantIds[0]]?.name)
            : "Unassigned",
        recordId: sourceTask?.id ?? review.id,
        severityLabel: "QA",
        statusLabel: review.result,
        subtitle: review.notes,
        title: review.subjectTitle,
      };
    }),
  ];

  const summaryCards: AttentionSummaryCard[] = [
    { id: "critical-risks", label: "Critical risks", value: criticalRisks.length },
    { id: "high-risks", label: "High risks", value: highRisks.length },
    { id: "blocked-tasks", label: "Blocked tasks", value: blockedTasks.length },
    { id: "waiting-qa", label: "Waiting QA", value: waitingQaTasks.length },
    { id: "due-soon", label: "Due soon", value: dueSoonTasks.length },
    { id: "overdue", label: "Overdue", value: overdueTasks.length },
    { id: "manufacturing-blockers", label: "MFG blockers", value: manufacturingItems.length },
    { id: "purchase-delays", label: "Purchase delays", value: purchaseItems.length },
    { id: "failed-reports", label: "Failed QA/reports", value: reportItems.length },
  ];

  const triageGroups: AttentionTriageGroup[] = [
    {
      emptyLabel: "No critical risks in scope.",
      id: "critical-risks",
      items: riskItems(criticalRisks),
      title: "Critical risks",
    },
    {
      emptyLabel: "No high risks in scope.",
      id: "high-risks",
      items: riskItems(highRisks),
      title: "High risks",
    },
    {
      emptyLabel: "No blocked tasks in scope.",
      id: "blocked-tasks",
      items: taskItems(blockedTasks, "Blocked"),
      title: "Blocked tasks",
    },
    {
      emptyLabel: "No tasks waiting QA in scope.",
      id: "waiting-qa",
      items: taskItems(waitingQaTasks, "Waiting QA"),
      title: "Waiting for QA",
    },
    {
      emptyLabel: "No tasks due soon in scope.",
      id: "due-soon",
      items: taskItems(dueSoonTasks, `Due <= ${ATTENTION_DUE_SOON_DAYS} days`),
      title: "Tasks due soon",
    },
    {
      emptyLabel: "No overdue tasks in scope.",
      id: "overdue",
      items: taskItems(overdueTasks, "Overdue"),
      title: "Overdue tasks",
    },
    {
      emptyLabel: "No manufacturing blockers in scope.",
      id: "manufacturing-blockers",
      items: manufacturingItems,
      title: "Manufacturing blockers",
    },
    {
      emptyLabel: "No purchase delays in scope.",
      id: "purchase-delays",
      items: purchaseItems,
      title: "Purchase delays",
    },
    {
      emptyLabel: "No recent failed QA/report signals.",
      id: "failed-reports",
      items: reportItems,
      title: "Recently failed QA / reports",
    },
  ];

  return {
    summaryCards,
    triageGroups,
  };
}
