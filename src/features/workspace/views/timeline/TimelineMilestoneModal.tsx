import React from "react";
import { createPortal } from "react-dom";
import type { TimelineMilestoneModalProps } from "./timelineMilestoneModalTypes";
import { TimelineMilestoneModalActions } from "./components/TimelineMilestoneModalActions";
import { TimelineMilestoneModalFields } from "./components/TimelineMilestoneModalFields";
import { TimelineMilestoneModalHeader } from "./components/TimelineMilestoneModalHeader";

export const TimelineMilestoneModal: React.FC<TimelineMilestoneModalProps> = ({
  activeDayEvents,
  activeEventDay,
  bootstrap,
  eventDraft,
  eventEndDate,
  eventEndTime,
  eventError,
  eventStartDate,
  eventStartTime,
  isDeletingEvent,
  isSavingEvent,
  mode,
  onClose,
  onDelete,
  onSubmit,
  onSwitchToTask,
  portalTarget,
  projectsById,
  selectableSubsystems,
  setEventDraft,
  setEventEndDate,
  setEventEndTime,
  setEventStartDate,
  setEventStartTime,
  subsystemsById,
}) => {
  if (!mode || !portalTarget) {
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
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-base)",
          ...(mode === "create" ? { paddingTop: "0.65rem" } : null),
        }}
        >
        <TimelineMilestoneModalHeader
          activeEventDay={activeEventDay}
          mode={mode}
          onClose={onClose}
          onSwitchToTask={onSwitchToTask}
        />
        <form className="modal-form" onSubmit={onSubmit}>
          <TimelineMilestoneModalFields
            activeDayEvents={activeDayEvents}
            bootstrap={bootstrap}
            eventDraft={eventDraft}
            eventEndDate={eventEndDate}
            eventEndTime={eventEndTime}
            eventError={eventError}
            eventStartDate={eventStartDate}
            eventStartTime={eventStartTime}
            mode={mode}
            projectsById={projectsById}
            selectableSubsystems={selectableSubsystems}
            setEventDraft={setEventDraft}
            setEventEndDate={setEventEndDate}
            setEventEndTime={setEventEndTime}
            setEventStartDate={setEventStartDate}
            setEventStartTime={setEventStartTime}
            subsystemsById={subsystemsById}
          />
          <TimelineMilestoneModalActions
            isDeletingEvent={isDeletingEvent}
            isSavingEvent={isSavingEvent}
            mode={mode}
            onClose={onClose}
            onDelete={onDelete}
          />
        </form>
      </section>
    </div>,
    portalTarget,
  );
};

