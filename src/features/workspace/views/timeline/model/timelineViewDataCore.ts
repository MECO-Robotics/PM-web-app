import type { BootstrapPayload, EventRecord, TaskRecord } from "@/types";
import { dateDiffInDays } from "@/lib/appUtils";
import {
  datePortion,
  monthEndFromDay,
  monthStartFromDay,
  type TimelineViewInterval,
} from "@/features/workspace/shared/timeline";
import type {
  TimelineSubsystemRow,
} from "../timelineViewModel";
import { buildTimelineSubsystemRows } from "./timelineViewDataRows";

const ALL_INTERVAL_PAST_MONTHS = 9;
const ALL_INTERVAL_FUTURE_MONTHS = 3;

function compareTimelineEventsByStart(left: EventRecord, right: EventRecord) {
  const startComparison = left.startDateTime.localeCompare(right.startDateTime);
  if (startComparison !== 0) {
    return startComparison;
  }

  const leftEnd = left.endDateTime ?? left.startDateTime;
  const rightEnd = right.endDateTime ?? right.startDateTime;
  const endComparison = leftEnd.localeCompare(rightEnd);
  if (endComparison !== 0) {
    return endComparison;
  }

  return left.id.localeCompare(right.id);
}

function buildTimelineDateRange({
  events,
  tasks,
  viewAnchorDate,
  viewInterval,
}: {
  events: BootstrapPayload["events"];
  tasks: TaskRecord[];
  viewAnchorDate: string;
  viewInterval: TimelineViewInterval;
}) {
  let startDate: string;
  let endDate: string;

  if (viewInterval === "all") {
    let earliestDate: string | null = null;
    let latestDate: string | null = null;

    const includeCandidate = (candidate: string) => {
      if (!earliestDate || candidate < earliestDate) {
        earliestDate = candidate;
      }
      if (!latestDate || candidate > latestDate) {
        latestDate = candidate;
      }
    };

    tasks.forEach((task) => {
      includeCandidate(task.startDate);
      includeCandidate(task.dueDate);
    });

    events.forEach((event) => {
      includeCandidate(datePortion(event.startDateTime));
      includeCandidate(datePortion(event.endDateTime ?? event.startDateTime));
    });

    if (!earliestDate || !latestDate) {
      return null;
    }

    const startObj = new Date(`${monthStartFromDay(earliestDate)}T12:00:00`);
    const endObj = new Date(`${monthEndFromDay(latestDate)}T12:00:00`);
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    const boundedStart = new Date(now.getFullYear(), now.getMonth() - ALL_INTERVAL_PAST_MONTHS, 1, 12);
    const boundedEnd = new Date(now.getFullYear(), now.getMonth() + ALL_INTERVAL_FUTURE_MONTHS + 1, 0, 12);

    if (startObj < boundedStart) {
      startObj.setTime(boundedStart.getTime());
    }
    if (endObj > boundedEnd) {
      endObj.setTime(boundedEnd.getTime());
    }
    if (startObj > endObj) {
      startObj.setTime(boundedStart.getTime());
      endObj.setTime(boundedEnd.getTime());
    }

    startDate = startObj.toISOString().slice(0, 10);
    endDate = endObj.toISOString().slice(0, 10);
  } else {
    const now = new Date(`${viewAnchorDate}T12:00:00`);
    let start: Date;
    let end: Date;

    if (viewInterval === "week") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 12);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 12);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12);
    }

    startDate = start.toISOString().slice(0, 10);
    endDate = end.toISOString().slice(0, 10);
  }

  return { startDate, endDate };
}

function buildTimelineDays(startDate: string, endDate: string) {
  const totalDays = dateDiffInDays(startDate, endDate) + 1;
  const days: string[] = [];
  const dayCursor = new Date(`${startDate}T12:00:00`);

  for (let index = 0; index < totalDays; index += 1) {
    days.push(dayCursor.toISOString().slice(0, 10));
    dayCursor.setDate(dayCursor.getDate() + 1);
  }

  return days;
}

function buildTimelineDayEvents(
  startDate: string,
  endDate: string,
  events: BootstrapPayload["events"],
) {
  const dayEvents: Record<string, EventRecord[]> = {};
  const eventsSortedByStart = [...events].sort(compareTimelineEventsByStart);

  eventsSortedByStart.forEach((event) => {
    const eventStart = datePortion(event.startDateTime);
    const eventEnd = datePortion(event.endDateTime ?? event.startDateTime);

    if (eventStart > endDate || eventEnd < startDate) {
      return;
    }

    const rangeStart = eventStart < startDate ? startDate : eventStart;
    const rangeEnd = eventEnd > endDate ? endDate : eventEnd;
    const cursor = new Date(`${rangeStart}T12:00:00`);
    const finalDay = new Date(`${rangeEnd}T12:00:00`);

    while (cursor <= finalDay) {
      const dayKey = cursor.toISOString().slice(0, 10);
      const existing = dayEvents[dayKey];
      if (existing) {
        existing.push(event);
      } else {
        dayEvents[dayKey] = [event];
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return dayEvents;
}

export function buildTimelineData({
  events,
  projectsById,
  scopedSubsystems,
  scopedTasks,
  viewAnchorDate,
  viewInterval,
}: {
  events: BootstrapPayload["events"];
  projectsById: Record<string, BootstrapPayload["projects"][number]>;
  scopedSubsystems: BootstrapPayload["subsystems"];
  scopedTasks: TaskRecord[];
  viewAnchorDate: string;
  viewInterval: TimelineViewInterval;
}) {
  const range = buildTimelineDateRange({
    events,
    tasks: scopedTasks,
    viewAnchorDate,
    viewInterval,
  });

  if (!range) {
    return {
      days: [] as string[],
      dayEvents: {} as Record<string, EventRecord[]>,
      subsystemRows: [] as TimelineSubsystemRow[],
    };
  }

  const days = buildTimelineDays(range.startDate, range.endDate);
  const dayEvents = buildTimelineDayEvents(range.startDate, range.endDate, events);
  const subsystemRows = buildTimelineSubsystemRows({
    projectsById,
    scopedSubsystems,
    scopedTasks,
    startDate: range.startDate,
    endDate: range.endDate,
  });

  return { days, dayEvents, subsystemRows };
}

