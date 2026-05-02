import type { Dispatch, FormEvent, SetStateAction } from "react";
import { createPortal } from "react-dom";

import type { BootstrapPayload, EventRecord } from "@/types";
import type { TimelineEventDraft } from "@/features/workspace/shared/timeline";

import { MilestonesEventModalActions } from "./sections/MilestonesEventModalActions";
import { MilestonesEventModalFields } from "./sections/MilestonesEventModalFields";
import { MilestonesEventModalReadinessSection } from "./sections/MilestonesEventModalReadinessSection";

type TaskPlanningState = "blocked" | "at-risk" | "waiting-on-dependency" | "ready" | "overdue";

interface MilestonesEventModalProps {
  activeEvent: EventRecord | null;
  activeEventCompleteTasks: BootstrapPayload["tasks"];
  activeEventTasks: BootstrapPayload["tasks"];
  bootstrap: BootstrapPayload;
  eventError: string | null;
  eventModalMode: "create" | "edit" | null;
  eventStartDate: string;
  eventStartTime: string;
  eventEndDate: string;
  eventEndTime: string;
  eventTaskGroups: Record<TaskPlanningState, BootstrapPayload["tasks"]>;
  eventTaskOrder: readonly TaskPlanningState[];
  isDeletingEvent: boolean;
  isSavingEvent: boolean;
  milestoneDraft: TimelineEventDraft;
  modalPortalTarget: HTMLElement | null;
  onClose: () => void;
  onDelete: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  projectsById: Record<string, BootstrapPayload["projects"][number]>;
  selectableSubsystems: BootstrapPayload["subsystems"];
  setEventEndDate: Dispatch<SetStateAction<string>>;
  setEventEndTime: Dispatch<SetStateAction<string>>;
  setEventStartDate: Dispatch<SetStateAction<string>>;
  setEventStartTime: Dispatch<SetStateAction<string>>;
  setMilestoneDraft: Dispatch<SetStateAction<TimelineEventDraft>>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

export function MilestonesEventModal({
  activeEvent,
  activeEventCompleteTasks,
  activeEventTasks,
  bootstrap,
  eventError,
  eventModalMode,
  eventStartDate,
  eventStartTime,
  eventEndDate,
  eventEndTime,
  eventTaskGroups,
  eventTaskOrder,
  isDeletingEvent,
  isSavingEvent,
  milestoneDraft,
  modalPortalTarget,
  onClose,
  onDelete,
  onSubmit,
  projectsById,
  selectableSubsystems,
  setEventEndDate,
  setEventEndTime,
  setEventStartDate,
  setEventStartTime,
  setMilestoneDraft,
  subsystemsById,
}: MilestonesEventModalProps) {
  if (!eventModalMode || !modalPortalTarget) {
    return null;
  }

  return createPortal(
    <div
      className="modal-scrim"
      onClick={onClose}
      role="presentation"
      style={{ zIndex: 2050 }}
    >
      <section
        aria-modal="true"
        className="modal-card"
        data-tutorial-target={
          eventModalMode === "create" ? "milestone-create-modal" : "milestone-edit-modal"
        }
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}
      >
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--meco-blue)" }}>
              Timeline milestone
            </p>
            <h2 style={{ color: "var(--text-title)" }}>
              {eventModalMode === "create" ? "Add milestone" : "Edit milestone"}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            style={{ color: "var(--text-copy)", background: "transparent" }}
            type="button"
          >
            Close
          </button>
        </div>

        <form className="modal-form" onSubmit={onSubmit}>
          <MilestonesEventModalFields
            bootstrap={bootstrap}
            eventEndDate={eventEndDate}
            eventEndTime={eventEndTime}
            eventError={eventError}
            eventStartDate={eventStartDate}
            eventStartTime={eventStartTime}
            milestoneDraft={milestoneDraft}
            projectsById={projectsById}
            selectableSubsystems={selectableSubsystems}
            setEventEndDate={setEventEndDate}
            setEventEndTime={setEventEndTime}
            setEventStartDate={setEventStartDate}
            setEventStartTime={setEventStartTime}
            setMilestoneDraft={setMilestoneDraft}
            subsystemsById={subsystemsById}
          />

          <MilestonesEventModalReadinessSection
            activeEvent={activeEvent}
            activeEventCompleteTasks={activeEventCompleteTasks}
            activeEventTasks={activeEventTasks}
            bootstrap={bootstrap}
            eventModalMode={eventModalMode}
            eventTaskGroups={eventTaskGroups}
            eventTaskOrder={eventTaskOrder}
          />

          <MilestonesEventModalActions
            eventModalMode={eventModalMode}
            isDeletingEvent={isDeletingEvent}
            isSavingEvent={isSavingEvent}
            onClose={onClose}
            onDelete={onDelete}
          />
        </form>
      </section>
    </div>,
    modalPortalTarget,
  );
}
