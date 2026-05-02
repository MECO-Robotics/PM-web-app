import type { BootstrapPayload, EventPayload } from "@/types";
import type { FilterSelection } from "@/features/workspace/shared";
import { WORKSPACE_PANEL_CLASS } from "@/features/workspace/shared";

import { MilestonesToolbar } from "./MilestonesToolbar";
import { MilestonesEventModal } from "./MilestonesEventModal";
import { MilestonesBoardSection } from "./sections/MilestonesBoardSection";
import { useMilestonesViewState } from "./sections/milestonesViewState";

interface MilestonesViewProps {
  activePersonFilter: FilterSelection;
  bootstrap: BootstrapPayload;
  isAllProjectsView: boolean;
  onDeleteTimelineEvent: (eventId: string) => Promise<void>;
  onSaveTimelineEvent: (
    mode: "create" | "edit",
    eventId: string | null,
    payload: EventPayload,
  ) => Promise<void>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

export function MilestonesView({
  activePersonFilter,
  bootstrap,
  isAllProjectsView,
  onDeleteTimelineEvent,
  onSaveTimelineEvent,
  subsystemsById,
}: MilestonesViewProps) {
  const milestones = useMilestonesViewState({
    activePersonFilter,
    bootstrap,
    isAllProjectsView,
    onDeleteTimelineEvent,
    onSaveTimelineEvent,
    subsystemsById,
  });

  return (
    <section className={`panel dense-panel milestone-view ${WORKSPACE_PANEL_CLASS}`}>
      <div className="panel-header compact-header">
        <div className="queue-section-header">
          <h2>Milestones</h2>
          <p className="section-copy filter-copy">
            {milestones.processedEvents.length === 1
              ? "1 milestone matches the current filters."
              : `${milestones.processedEvents.length} milestones match the current filters.`}
            {activePersonFilter.length > 0
              ? ` Only milestones linked to tasks assigned to or mentored by ${milestones.activePersonFilterLabel}.`
              : ""}
          </p>
        </div>
        <MilestonesToolbar
          isAllProjectsView={isAllProjectsView}
          onAddMilestone={milestones.openCreateEventModal}
          projectFilter={milestones.projectFilter}
          projects={bootstrap.projects}
          searchFilter={milestones.searchFilter}
          setProjectFilter={milestones.setProjectFilter}
          setSearchFilter={milestones.setSearchFilter}
          setSortField={milestones.setSortField}
          setSortOrder={milestones.setSortOrder}
          setTypeFilter={milestones.setTypeFilter}
          sortField={milestones.sortField}
          sortOrder={milestones.sortOrder}
          typeFilter={milestones.typeFilter}
        />
      </div>

      <MilestonesBoardSection
        events={milestones.processedEvents}
        motionClassName={milestones.milestoneFilterMotionClass}
        onOpenEvent={milestones.openEditEventModal}
        projectLabelByEventId={milestones.projectLabelByEventId}
        subsystemsById={subsystemsById}
      />

      <MilestonesEventModal
        activeEvent={milestones.activeEvent}
        activeEventCompleteTasks={milestones.activeEventCompleteTasks}
        activeEventTasks={milestones.activeEventTasks}
        bootstrap={bootstrap}
        eventError={milestones.eventError}
        eventModalMode={milestones.eventModalMode}
        eventStartDate={milestones.eventStartDate}
        eventStartTime={milestones.eventStartTime}
        eventEndDate={milestones.eventEndDate}
        eventEndTime={milestones.eventEndTime}
        eventTaskGroups={milestones.eventTaskGroups}
        eventTaskOrder={milestones.eventTaskOrder}
        isDeletingEvent={milestones.isDeletingEvent}
        isSavingEvent={milestones.isSavingEvent}
        milestoneDraft={milestones.milestoneDraft}
        modalPortalTarget={milestones.modalPortalTarget}
        onClose={milestones.closeEventModal}
        onDelete={milestones.handleEventDelete}
        onSubmit={milestones.handleEventSubmit}
        projectsById={milestones.projectsById}
        selectableSubsystems={milestones.selectableSubsystems}
        setEventEndDate={milestones.setEventEndDate}
        setEventEndTime={milestones.setEventEndTime}
        setEventStartDate={milestones.setEventStartDate}
        setEventStartTime={milestones.setEventStartTime}
        setMilestoneDraft={milestones.setMilestoneDraft}
        subsystemsById={subsystemsById}
      />
    </section>
  );
}
