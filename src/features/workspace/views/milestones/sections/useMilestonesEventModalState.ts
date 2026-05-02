import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";

import type { BootstrapPayload, EventPayload, EventRecord } from "@/types";
import type { FilterSelection } from "@/features/workspace/shared";
import { DEFAULT_EVENT_TYPE, getEventProjectIds } from "@/features/workspace/shared/events";
import {
  buildDateTime,
  compareDateTimes,
  datePortion,
  localTodayDate,
  timePortion,
} from "@/features/workspace/shared/timeline";
import {
  emptyTimelineEventDraft,
  timelineEventDraftFromRecord,
  type TimelineEventDraft,
} from "@/features/workspace/shared/timeline";
import { groupTasksByPlanningState } from "@/features/workspace/shared/task/taskPlanning";

export const EVENT_TASK_ORDER = [
  "blocked",
  "at-risk",
  "waiting-on-dependency",
  "ready",
  "overdue",
] as const;

type TaskPlanningState = (typeof EVENT_TASK_ORDER)[number];

type UseMilestonesEventModalStateArgs = {
  bootstrap: BootstrapPayload;
  isAllProjectsView: boolean;
  onDeleteTimelineEvent: (eventId: string) => Promise<void>;
  onSaveTimelineEvent: (
    mode: "create" | "edit",
    eventId: string | null,
    payload: EventPayload,
  ) => Promise<void>;
  projectFilter: FilterSelection;
  scopedProjectIds: string[];
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
};

export type MilestonesEventModalState = {
  activeEvent: EventRecord | null;
  activeEventCompleteTasks: BootstrapPayload["tasks"];
  activeEventTasks: BootstrapPayload["tasks"];
  closeEventModal: () => void;
  eventEndDate: string;
  eventEndTime: string;
  eventError: string | null;
  eventModalMode: "create" | "edit" | null;
  eventStartDate: string;
  eventStartTime: string;
  eventTaskGroups: Record<TaskPlanningState, BootstrapPayload["tasks"]>;
  eventTaskOrder: readonly TaskPlanningState[];
  handleEventDelete: () => Promise<void>;
  handleEventSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isDeletingEvent: boolean;
  isSavingEvent: boolean;
  milestoneDraft: TimelineEventDraft;
  modalPortalTarget: HTMLElement | null;
  openCreateEventModal: () => void;
  openEditEventModal: (event: EventRecord) => void;
  setEventEndDate: Dispatch<SetStateAction<string>>;
  setEventEndTime: Dispatch<SetStateAction<string>>;
  setEventModalMode: Dispatch<SetStateAction<"create" | "edit" | null>>;
  setEventStartDate: Dispatch<SetStateAction<string>>;
  setEventStartTime: Dispatch<SetStateAction<string>>;
  setMilestoneDraft: Dispatch<SetStateAction<TimelineEventDraft>>;
};

export function useMilestonesEventModalState({
  bootstrap,
  isAllProjectsView,
  onDeleteTimelineEvent,
  onSaveTimelineEvent,
  projectFilter,
  scopedProjectIds,
  subsystemsById,
}: UseMilestonesEventModalStateArgs): MilestonesEventModalState {
  const [eventModalMode, setEventModalMode] = useState<"create" | "edit" | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [milestoneDraft, setMilestoneDraft] = useState<TimelineEventDraft>(
    emptyTimelineEventDraft(DEFAULT_EVENT_TYPE),
  );
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("18:00");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventError, setEventError] = useState<string | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const activeEvent =
    eventModalMode && activeEventId
      ? bootstrap.events.find((event) => event.id === activeEventId) ?? null
      : null;
  const activeEventTasks = useMemo(
    () =>
      activeEvent
        ? bootstrap.tasks.filter((task) => task.targetEventId === activeEvent.id)
        : [],
    [activeEvent, bootstrap.tasks],
  );
  const activeEventCompleteTasks = useMemo(
    () => activeEventTasks.filter((task) => task.status === "complete"),
    [activeEventTasks],
  );
  const eventTaskGroups = useMemo(
    () =>
      groupTasksByPlanningState(
        activeEventTasks.filter((task) => task.status !== "complete"),
        bootstrap,
      ),
    [activeEventTasks, bootstrap],
  );

  const closeEventModal = () => {
    setEventModalMode(null);
    setActiveEventId(null);
    setEventError(null);
    setIsSavingEvent(false);
    setIsDeletingEvent(false);
  };

  const getDefaultEventProjectIds = () =>
    isAllProjectsView && projectFilter.length > 0 ? projectFilter : scopedProjectIds;

  const openCreateEventModal = () => {
    setEventModalMode("create");
    setActiveEventId(null);
    setMilestoneDraft({
      ...emptyTimelineEventDraft(DEFAULT_EVENT_TYPE),
      projectIds: getDefaultEventProjectIds(),
    });
    setEventStartDate(localTodayDate());
    setEventStartTime("18:00");
    setEventEndDate("");
    setEventEndTime("");
    setEventError(null);
  };

  const openEditEventModal = (event: EventRecord) => {
    const eventProjectIds = getEventProjectIds(event, subsystemsById);
    setEventModalMode("edit");
    setActiveEventId(event.id);
    setMilestoneDraft({
      ...timelineEventDraftFromRecord(event),
      projectIds: eventProjectIds.length > 0 ? eventProjectIds : scopedProjectIds,
    });
    setEventStartDate(datePortion(event.startDateTime));
    setEventStartTime(timePortion(event.startDateTime));
    setEventEndDate(event.endDateTime ? datePortion(event.endDateTime) : "");
    setEventEndTime(event.endDateTime ? timePortion(event.endDateTime) : "");
    setEventError(null);
  };

  const handleEventSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!eventModalMode) {
      return;
    }

    if (!eventStartDate) {
      setEventError("Start date is required.");
      return;
    }

    const normalizedTitle = milestoneDraft.title.trim();
    if (!normalizedTitle) {
      setEventError("Title is required.");
      return;
    }

    const startDateTime = buildDateTime(eventStartDate, eventStartTime || "12:00");
    const includeEndDate = eventEndDate.trim().length > 0 || eventEndTime.trim().length > 0;
    const endDateTime = includeEndDate
      ? buildDateTime(
          eventEndDate.trim().length > 0 ? eventEndDate : eventStartDate,
          eventEndTime.trim().length > 0 ? eventEndTime : eventStartTime,
        )
      : null;

    if (endDateTime && compareDateTimes(endDateTime, startDateTime) < 0) {
      setEventError("End date/time must be after the start date/time.");
      return;
    }

    setIsSavingEvent(true);
    setEventError(null);

    try {
      const payload: EventPayload = {
        title: normalizedTitle,
        type: milestoneDraft.type,
        startDateTime,
        endDateTime,
        isExternal: milestoneDraft.isExternal,
        description: milestoneDraft.description.trim(),
        projectIds: Array.from(new Set(milestoneDraft.projectIds)),
        relatedSubsystemIds: Array.from(new Set(milestoneDraft.relatedSubsystemIds)),
      };

      await onSaveTimelineEvent(eventModalMode, activeEventId, payload);
      closeEventModal();
    } catch (error) {
      setEventError(
        error instanceof Error ? error.message : "Could not save the milestone. Please try again.",
      );
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleEventDelete = async () => {
    if (eventModalMode !== "edit" || !activeEventId) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete this milestone event? Any tasks targeting this event will be unlinked.",
    );
    if (!shouldDelete) {
      return;
    }

    setIsDeletingEvent(true);
    setEventError(null);

    try {
      await onDeleteTimelineEvent(activeEventId);
      closeEventModal();
    } catch (error) {
      setEventError(
        error instanceof Error ? error.message : "Could not delete the milestone. Please try again.",
      );
      setIsDeletingEvent(false);
    }
  };

  const modalPortalTarget =
    typeof document !== "undefined"
      ? ((document.querySelector(".page-shell") as HTMLElement | null) ?? document.body)
      : null;

  return {
    activeEvent,
    activeEventCompleteTasks,
    activeEventTasks,
    closeEventModal,
    eventEndDate,
    eventEndTime,
    eventError,
    eventModalMode,
    eventStartDate,
    eventStartTime,
    eventTaskGroups,
    eventTaskOrder: EVENT_TASK_ORDER,
    handleEventDelete,
    handleEventSubmit,
    isDeletingEvent,
    isSavingEvent,
    milestoneDraft,
    modalPortalTarget,
    openCreateEventModal,
    openEditEventModal,
    setEventEndDate,
    setEventEndTime,
    setEventModalMode,
    setEventStartDate,
    setEventStartTime,
    setMilestoneDraft,
  };
}
