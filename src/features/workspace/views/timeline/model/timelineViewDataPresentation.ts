import type { BootstrapPayload, EventRecord } from "@/types";
import {
  filterSelectionMatchesTaskPeople,
  type FilterSelection,
} from "@/features/workspace/shared";
import { getEventTypeStyle } from "@/features/workspace/shared/events";
import { datePortion, monthLabelFromDay } from "@/features/workspace/shared/timeline";
import type {
  TimelineMonthGroup,
  TimelineProjectRow,
  TimelineSubsystemRow,
  TimelineTaskSpan,
} from "../timelineViewModel";

const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const DAY_NUMBER_FORMATTER = new Intl.DateTimeFormat(undefined, { day: "numeric" });

export function buildTimelineMonthGroups(days: string[]) {
  const groups: TimelineMonthGroup[] = [];
  let lastMonthKey = "";
  let lastMonthLabel = "";
  let currentSpan = 0;

  days.forEach((day) => {
    const monthKey = day.slice(0, 7);
    if (monthKey !== lastMonthKey) {
      if (lastMonthLabel !== "") {
        groups.push({ month: lastMonthLabel, span: currentSpan });
      }
      lastMonthKey = monthKey;
      lastMonthLabel = monthLabelFromDay(day);
      currentSpan = 1;
    } else {
      currentSpan += 1;
    }
  });

  if (lastMonthLabel) {
    groups.push({ month: lastMonthLabel, span: currentSpan });
  }

  return groups;
}

export function buildTimelineDayHeaderCells(
  days: string[],
  dayEventsByDate: Record<string, EventRecord[]>,
) {
  return days.map((day) => {
    const eventsOnDay = dayEventsByDate[day] ?? [];
    const primaryEvent = eventsOnDay[0];
    const dayStyle = primaryEvent ? getEventTypeStyle(primaryEvent.type) : null;
    const primaryEventStartDay = primaryEvent ? datePortion(primaryEvent.startDateTime) : day;
    const primaryEventEndDay = primaryEvent?.endDateTime
      ? datePortion(primaryEvent.endDateTime)
      : primaryEventStartDay;
    const dayDate = new Date(`${day}T00:00:00`);

    return {
      day,
      weekdayLabel: WEEKDAY_SHORT_FORMATTER.format(dayDate),
      dayNumberLabel: DAY_NUMBER_FORMATTER.format(dayDate),
      eventsOnDay,
      dayStyle,
      primaryEventStartDay,
      primaryEventEndDay,
    };
  });
}

export function buildTimelineProjectRows(subsystemRows: TimelineSubsystemRow[]) {
  const grouped = new Map<string, TimelineProjectRow>();

  subsystemRows.forEach((subsystem) => {
    const existing = grouped.get(subsystem.projectId);
    if (existing) {
      existing.subsystems.push(subsystem);
      existing.tasks.push(...subsystem.tasks);
      return;
    }

    grouped.set(subsystem.projectId, {
      id: subsystem.projectId,
      name: subsystem.projectName,
      subsystems: [subsystem],
      taskCount: subsystem.taskCount,
      completeCount: subsystem.completeCount,
      tasks: [...subsystem.tasks],
    });
  });

  return Array.from(grouped.values()).map((project) => {
    const tasksById = new Map<string, TimelineTaskSpan>();
    project.tasks.forEach((task) => {
      if (!tasksById.has(task.id)) {
        tasksById.set(task.id, task);
      }
    });
    const tasks = Array.from(tasksById.values());

    return {
      ...project,
      taskCount: tasks.length,
      completeCount: tasks.filter((task) => task.status === "complete").length,
      tasks,
    };
  });
}

export function filterTimelineEventsByPersonSelection({
  activePersonFilter,
  events,
  tasks,
}: {
  activePersonFilter: FilterSelection;
  events: BootstrapPayload["events"];
  tasks: BootstrapPayload["tasks"];
}) {
  if (activePersonFilter.length === 0) {
    return events;
  }

  const matchingEventIds = new Set(
    tasks.flatMap((task) =>
      task.targetEventId && filterSelectionMatchesTaskPeople(activePersonFilter, task)
        ? [task.targetEventId]
        : [],
    ),
  );

  return events.filter((event) => matchingEventIds.has(event.id));
}

