import type { BootstrapPayload, EventRecord, TaskRecord } from "@/types";

export interface TimelineEventDraft {
  title: string;
  type: EventRecord["type"];
  isExternal: boolean;
  description: string;
  projectIds: string[];
  relatedSubsystemIds: string[];
}

export interface HoveredMilestonePopup {
  anchorStartDay: string | null;
  anchorEndDay: string | null;
  rotationDeg: 45 | 90;
  lines: string[];
  background: string;
  color: string;
}

export function formatTaskAssignees(
  task: TaskRecord,
  membersById: Record<string, BootstrapPayload["members"][number]>,
) {
  const taskAssigneeIds = Array.isArray(task.assigneeIds) ? task.assigneeIds : [];
  const assigneeIds =
    taskAssigneeIds.length > 0
      ? taskAssigneeIds
      : task.ownerId
        ? [task.ownerId]
        : [];

  if (assigneeIds.length === 0) {
    return "Unassigned";
  }

  return assigneeIds.map((assigneeId) => membersById[assigneeId]?.name ?? "Unknown").join(", ");
}

export function emptyTimelineEventDraft(defaultEventType: EventRecord["type"]): TimelineEventDraft {
  return {
    title: "",
    type: defaultEventType,
    isExternal: false,
    description: "",
    projectIds: [],
    relatedSubsystemIds: [],
  };
}

export function timelineEventDraftFromRecord(record: EventRecord): TimelineEventDraft {
  return {
    title: record.title,
    type: record.type,
    isExternal: record.isExternal,
    description: record.description,
    projectIds: record.projectIds,
    relatedSubsystemIds: record.relatedSubsystemIds,
  };
}

function areSameLines(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

export function isSameHoveredMilestonePopup(
  left: HoveredMilestonePopup | null,
  right: HoveredMilestonePopup | null,
) {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.anchorStartDay === right.anchorStartDay &&
    left.anchorEndDay === right.anchorEndDay &&
    left.rotationDeg === right.rotationDeg &&
    left.background === right.background &&
    left.color === right.color &&
    areSameLines(left.lines, right.lines)
  );
}
