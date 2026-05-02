import type { Dispatch, SetStateAction } from "react";

import type { BootstrapPayload, EventType } from "@/types";
import { EVENT_TYPE_STYLES } from "@/features/workspace/shared/events";
import { reconcileMilestoneSubsystemIds } from "@/features/workspace/shared/events";
import type { TimelineEventDraft } from "@/features/workspace/shared/timeline";

const EVENT_TYPE_OPTIONS: { id: EventType; name: string }[] = (
  Object.entries(EVENT_TYPE_STYLES) as [EventType, (typeof EVENT_TYPE_STYLES)[EventType]][]
).map(([id, style]) => ({
  id,
  name: style.label,
}));

interface MilestonesEventModalFieldsProps {
  bootstrap: BootstrapPayload;
  eventEndDate: string;
  eventEndTime: string;
  eventError: string | null;
  eventStartDate: string;
  eventStartTime: string;
  milestoneDraft: TimelineEventDraft;
  projectsById: Record<string, BootstrapPayload["projects"][number]>;
  selectableSubsystems: BootstrapPayload["subsystems"];
  setEventEndDate: Dispatch<SetStateAction<string>>;
  setEventEndTime: Dispatch<SetStateAction<string>>;
  setEventStartDate: Dispatch<SetStateAction<string>>;
  setEventStartTime: Dispatch<SetStateAction<string>>;
  setMilestoneDraft: Dispatch<SetStateAction<TimelineEventDraft>>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

const FIELD_STYLE = {
  background: "var(--bg-row-alt)",
  border: "1px solid var(--border-base)",
  color: "var(--text-title)",
} as const;

const LABEL_STYLE = {
  color: "var(--text-title)",
} as const;

export function MilestonesEventModalFields({
  bootstrap,
  eventEndDate,
  eventEndTime,
  eventError,
  eventStartDate,
  eventStartTime,
  milestoneDraft,
  projectsById,
  selectableSubsystems,
  setEventEndDate,
  setEventEndTime,
  setEventStartDate,
  setEventStartTime,
  setMilestoneDraft,
  subsystemsById,
}: MilestonesEventModalFieldsProps) {
  return (
    <>
      <label className="field modal-wide">
        <span style={LABEL_STYLE}>Title</span>
        <input
          onChange={(event) =>
            setMilestoneDraft((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          required
          style={FIELD_STYLE}
          value={milestoneDraft.title}
        />
      </label>

      <label className="field">
        <span style={LABEL_STYLE}>Type</span>
        <select
          onChange={(event) =>
            setMilestoneDraft((current) => ({
              ...current,
              type: event.target.value as EventType,
            }))
          }
          style={FIELD_STYLE}
          value={milestoneDraft.type}
        >
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span style={LABEL_STYLE}>Start date</span>
        <input
          onChange={(event) => setEventStartDate(event.target.value)}
          required
          style={FIELD_STYLE}
          type="date"
          value={eventStartDate}
        />
      </label>

      <label className="field">
        <span style={LABEL_STYLE}>Start time</span>
        <input
          onChange={(event) => setEventStartTime(event.target.value)}
          required
          style={FIELD_STYLE}
          type="time"
          value={eventStartTime}
        />
      </label>

      <label className="field">
        <span style={LABEL_STYLE}>End date (optional)</span>
        <input
          onChange={(event) => setEventEndDate(event.target.value)}
          style={FIELD_STYLE}
          type="date"
          value={eventEndDate}
        />
      </label>

      <label className="field">
        <span style={LABEL_STYLE}>End time (optional)</span>
        <input
          onChange={(event) => setEventEndTime(event.target.value)}
          style={FIELD_STYLE}
          type="time"
          value={eventEndTime}
        />
      </label>

      <label className="field modal-wide">
        <span style={LABEL_STYLE}>Description</span>
        <textarea
          onChange={(event) =>
            setMilestoneDraft((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={3}
          style={FIELD_STYLE}
          value={milestoneDraft.description}
        />
      </label>

      <label className="field modal-wide">
        <span style={LABEL_STYLE}>Related projects</span>
        <select
          multiple
          onChange={(event) =>
            setMilestoneDraft((current) => {
              const projectIds = Array.from(event.currentTarget.selectedOptions, (option) => option.value);
              return {
                ...current,
                projectIds,
                relatedSubsystemIds: reconcileMilestoneSubsystemIds(
                  current.relatedSubsystemIds,
                  projectIds,
                  subsystemsById,
                ),
              };
            })
          }
          size={Math.min(bootstrap.projects.length || 1, 6)}
          style={{
            ...FIELD_STYLE,
            minHeight: "5rem",
          }}
          value={milestoneDraft.projectIds}
        >
          {bootstrap.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field modal-wide">
        <span style={LABEL_STYLE}>Related subsystems</span>
        <select
          multiple
          onChange={(event) =>
            setMilestoneDraft((current) => ({
              ...current,
              relatedSubsystemIds: Array.from(event.currentTarget.selectedOptions, (option) => option.value),
            }))
          }
          style={{
            ...FIELD_STYLE,
            minHeight: "7rem",
          }}
          value={milestoneDraft.relatedSubsystemIds}
        >
          {selectableSubsystems.map((subsystem) => (
            <option key={subsystem.id} value={subsystem.id}>
              {projectsById[subsystem.projectId]?.name
                ? `${projectsById[subsystem.projectId].name} - ${subsystem.name}`
                : subsystem.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field modal-wide" style={{ display: "flex", alignItems: "center" }}>
        <input
          checked={milestoneDraft.isExternal}
          onChange={(event) =>
            setMilestoneDraft((current) => ({
              ...current,
              isExternal: event.target.checked,
            }))
          }
          style={{ width: "auto" }}
          type="checkbox"
        />
        <span style={LABEL_STYLE}>External milestone/event</span>
      </label>

      {eventError ? (
        <p className="section-copy" style={{ color: "var(--official-red)" }}>
          {eventError}
        </p>
      ) : null}
    </>
  );
}
