import { useCallback, useMemo } from "react";
import type { BootstrapPayload, EventPayload } from "@/types";
import {
  type FilterSelection,
  filterSelectionMatchesTaskPeople,
  formatFilterSelectionLabel,
  useFilterChangeMotionClass,
} from "@/features/workspace/shared";
import { getMilestoneSubsystemOptions } from "@/features/workspace/shared/events";
import { formatTimelinePeriodLabel, type TimelineViewInterval } from "@/features/workspace/shared/timeline";
import {
  buildTimelineData,
  buildTimelineDayHeaderCells,
  buildTimelineMonthGroups,
  buildTimelineProjectRows,
  filterTimelineEventsByPersonSelection,
} from "../model/timelineViewData";
import { useTimelineEventModal } from "../useTimelineEventModal";
import { useTimelineMilestoneOverlay } from "./useTimelineMilestoneOverlay";
import { useTimelineRowHighlightGeometry } from "./useTimelineRowHighlightGeometry";
import { resolveTimelineRowHighlightStyle } from "../timelineTaskColors";

interface UseTimelineViewDataArgs {
  activePersonFilter: FilterSelection;
  bootstrap: BootstrapPayload;
  openCreateTaskModal: () => void;
  onDeleteTimelineEvent: (eventId: string) => Promise<void>;
  onSaveTimelineEvent: (
    mode: "create" | "edit",
    eventId: string | null,
    payload: EventPayload,
  ) => Promise<void>;
  triggerCreateMilestoneToken: number;
  viewAnchorDate: string;
  viewInterval: TimelineViewInterval;
}

export function useTimelineViewData({
  activePersonFilter,
  bootstrap,
  openCreateTaskModal,
  onDeleteTimelineEvent,
  onSaveTimelineEvent,
  triggerCreateMilestoneToken,
  viewAnchorDate,
  viewInterval,
}: UseTimelineViewDataArgs) {
  const projectsById = useMemo(
    () =>
      Object.fromEntries(
        bootstrap.projects.map((project) => [project.id, project]),
      ) as Record<string, BootstrapPayload["projects"][number]>,
    [bootstrap.projects],
  );
  const scopedProjectIds = useMemo(
    () => bootstrap.projects.map((project) => project.id),
    [bootstrap.projects],
  );
  const subsystemsById = useMemo(
    () =>
      Object.fromEntries(
        bootstrap.subsystems.map((subsystem) => [subsystem.id, subsystem]),
      ) as Record<string, BootstrapPayload["subsystems"][number]>,
    [bootstrap.subsystems],
  );
  const disciplinesById = useMemo(
    () =>
      Object.fromEntries(
        bootstrap.disciplines.map((discipline) => [discipline.id, discipline]),
      ) as Record<string, BootstrapPayload["disciplines"][number]>,
    [bootstrap.disciplines],
  );

  const scopedTasks = useMemo(
    () =>
      activePersonFilter.length > 0
        ? bootstrap.tasks.filter((task) => filterSelectionMatchesTaskPeople(activePersonFilter, task))
        : bootstrap.tasks,
    [activePersonFilter, bootstrap.tasks],
  );
  const scopedEvents = useMemo(
    () =>
      filterTimelineEventsByPersonSelection({
        activePersonFilter,
        events: bootstrap.events,
        tasks: bootstrap.tasks,
      }),
    [activePersonFilter, bootstrap.events, bootstrap.tasks],
  );
  const tasksById = useMemo(
    () =>
      Object.fromEntries(
        bootstrap.tasks.map((task) => [task.id, task]),
      ) as Record<string, BootstrapPayload["tasks"][number]>,
    [bootstrap.tasks],
  );
  const timelineFilterMotionClass = useFilterChangeMotionClass([activePersonFilter]);
  const activePersonFilterLabel = formatFilterSelectionLabel("All roster", bootstrap.members, activePersonFilter);
  const timeline = useMemo(
    () =>
      buildTimelineData({
        events: scopedEvents,
        projectsById,
        scopedSubsystems: bootstrap.subsystems,
        scopedTasks,
        viewAnchorDate,
        viewInterval,
      }),
    [bootstrap.subsystems, projectsById, scopedEvents, scopedTasks, viewAnchorDate, viewInterval],
  );
  const timelinePeriodLabel = useMemo(
    () => formatTimelinePeriodLabel(viewInterval, timeline.days),
    [timeline.days, viewInterval],
  );
  const monthGroups = useMemo(() => buildTimelineMonthGroups(timeline.days), [timeline.days]);
  const dayEventsByDate = timeline.dayEvents;
  const eventModal = useTimelineEventModal({
    dayEventsByDate,
    openCreateTaskModal,
    onDeleteTimelineEvent,
    onSaveTimelineEvent,
    scopedProjectIds,
    subsystemsById,
    triggerCreateMilestoneToken,
  });
  const selectableSubsystems = useMemo(
    () => getMilestoneSubsystemOptions(bootstrap.subsystems, eventModal.eventDraft.projectIds),
    [bootstrap.subsystems, eventModal.eventDraft.projectIds],
  );
  const timelineDayHeaderCells = useMemo(
    () => buildTimelineDayHeaderCells(timeline.days, dayEventsByDate),
    [dayEventsByDate, timeline.days],
  );
  const projectRows = useMemo(
    () => buildTimelineProjectRows(timeline.subsystemRows),
    [timeline.subsystemRows],
  );

  const {
    clearHoveredMilestonePopup,
    handleTimelineDayMouseEnter,
    queueTimelineLayerUpdate,
    resolveMilestonePopupGeometry,
    setHoveredMilestonePopupLayerRef,
    timelineDayCellRefs,
    timelineDayMilestoneUnderlays,
    timelineGridRef,
    timelineShellRef,
    timelineTodayMarkerLabelTop,
    timelineTodayMarkerLineLeft,
    timelineTodayMarkerLeft,
    isTimelineShellScrolling,
    tooltipPortalTarget,
  } = useTimelineMilestoneOverlay({
    days: timeline.days,
    dayEventsByDate,
    events: scopedEvents,
  });

  const resolveRowHighlightGeometry = useTimelineRowHighlightGeometry(timelineShellRef);

  const resolveTaskRowHighlightStyle = useCallback(
    (anchorKey: string) =>
      resolveTimelineRowHighlightStyle(anchorKey, tasksById, subsystemsById, disciplinesById),
    [disciplinesById, subsystemsById, tasksById],
  );
  const modalPortalTarget =
    typeof document !== "undefined"
      ? ((document.querySelector(".page-shell") as HTMLElement | null) ?? document.body)
      : null;

  return {
    clearHoveredMilestonePopup,
    activePersonFilterLabel,
    disciplinesById,
    dayEventsByDate,
    eventModal,
    handleTimelineDayMouseEnter,
    isTimelineShellScrolling,
    monthGroups,
    projectRows,
    projectsById,
    queueTimelineLayerUpdate,
    resolveMilestonePopupGeometry,
    resolveRowHighlightGeometry,
    resolveTaskRowHighlightStyle,
    scopedEvents,
    scopedProjectIds,
    scopedTasks,
    selectableSubsystems,
    setHoveredMilestonePopupLayerRef,
    subsystemsById,
    tasksById,
    timeline,
    timelineDayCellRefs,
    timelineDayHeaderCells,
    timelineDayMilestoneUnderlays,
    timelineFilterMotionClass,
    timelineGridRef,
    timelinePeriodLabel,
    timelineShellRef,
    timelineTodayMarkerLabelTop,
    timelineTodayMarkerLineLeft,
    timelineTodayMarkerLeft,
    modalPortalTarget,
    tooltipPortalTarget,
  };
}

