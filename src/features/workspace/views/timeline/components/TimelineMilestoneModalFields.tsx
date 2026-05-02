import { reconcileMilestoneSubsystemIds, EVENT_TYPE_OPTIONS } from "@/features/workspace/shared/events";
import type { BootstrapPayload, EventRecord, EventType } from "@/types";
import type React from "react";

import type { TimelineEventDraft } from "@/features/workspace/shared/timeline";

interface TimelineMilestoneModalFieldsProps {
  activeDayEvents: EventRecord[];
  bootstrap: BootstrapPayload;
  eventDraft: TimelineEventDraft;
  eventError: string | null;
  mode: "create" | "edit";
  projectsById: Record<string, BootstrapPayload["projects"][number]>;
  selectableSubsystems: BootstrapPayload["subsystems"];
  setEventDraft: React.Dispatch<React.SetStateAction<TimelineEventDraft>>;
  setEventEndDate: React.Dispatch<React.SetStateAction<string>>;
  setEventEndTime: React.Dispatch<React.SetStateAction<string>>;
  setEventStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEventStartTime: React.Dispatch<React.SetStateAction<string>>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
  eventEndDate: string;
  eventEndTime: string;
  eventStartDate: string;
  eventStartTime: string;
}

const FIELD_INPUT_STYLE = {
  background: "var(--bg-row-alt)",
  color: "var(--text-title)",
  border: "1px solid var(--border-base)",
} as const;

export function TimelineMilestoneModalFields({
  activeDayEvents,
  bootstrap,
  eventDraft,
  eventError,
  mode,
  projectsById,
  selectableSubsystems,
  setEventDraft,
  setEventEndDate,
  setEventEndTime,
  setEventStartDate,
  setEventStartTime,
  subsystemsById,
  eventEndDate,
  eventEndTime,
  eventStartDate,
  eventStartTime,
}: TimelineMilestoneModalFieldsProps) {
  return (
    <>
      <label className="field modal-wide">
        <span style={{ color: "var(--text-title)" }}>Title</span>
        <input
          onChange={(event) =>
            setEventDraft((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          required
          style={FIELD_INPUT_STYLE}
          value={eventDraft.title}
        />
      </label>

      <label className="field">
        <span style={{ color: "var(--text-title)" }}>Type</span>
        <select
          onChange={(event) =>
            setEventDraft((current) => ({
              ...current,
              type: event.target.value as EventType,
            }))
          }
          style={FIELD_INPUT_STYLE}
          value={eventDraft.type}
        >
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span style={{ color: "var(--text-title)" }}>Start date</span>
        <input
          onChange={(event) => setEventStartDate(event.target.value)}
          required
          style={FIELD_INPUT_STYLE}
          type="date"
          value={eventStartDate}
        />
      </label>

      <label className="field">
        <span style={{ color: "var(--text-title)" }}>Start time</span>
        <input
          onChange={(event) => setEventStartTime(event.target.value)}
          required
          style={FIELD_INPUT_STYLE}
          type="time"
          value={eventStartTime}
        />
      </label>

      <label className="field">
        <span style={{ color: "var(--text-title)" }}>End date (optional)</span>
        <input
          onChange={(event) => setEventEndDate(event.target.value)}
          style={FIELD_INPUT_STYLE}
          type="date"
          value={eventEndDate}
        />
      </label>

      <label className="field">
        <span style={{ color: "var(--text-title)" }}>End time (optional)</span>
        <input
          onChange={(event) => setEventEndTime(event.target.value)}
          style={FIELD_INPUT_STYLE}
          type="time"
          value={eventEndTime}
        />
      </label>

      <label className="field modal-wide">
        <span style={{ color: "var(--text-title)" }}>Description</span>
        <textarea
          onChange={(event) =>
            setEventDraft((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={3}
          style={FIELD_INPUT_STYLE}
          value={eventDraft.description}
        />
      </label>

      <label className="field modal-wide">
        <span style={{ color: "var(--text-title)" }}>Related projects</span>
        <select
          multiple
          onChange={(event) =>
            setEventDraft((current) => {
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
          style={FIELD_INPUT_STYLE}
          value={eventDraft.projectIds}
        >
          {bootstrap.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field modal-wide">
        <span style={{ color: "var(--text-title)" }}>Related subsystems</span>
        <select
          multiple
          onChange={(event) =>
            setEventDraft((current) => ({
              ...current,
              relatedSubsystemIds: Array.from(event.currentTarget.selectedOptions, (option) => option.value),
            }))
          }
          size={Math.min(bootstrap.subsystems.length || 1, 6)}
          style={FIELD_INPUT_STYLE}
          value={eventDraft.relatedSubsystemIds}
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

      <div className="checkbox-row modal-wide">
        <label className="checkbox-field">
          <input
            checked={eventDraft.isExternal}
            onChange={(event) =>
              setEventDraft((current) => ({
                ...current,
                isExternal: event.target.checked,
              }))
            }
            type="checkbox"
          />
          <span style={{ color: "var(--text-title)" }}>External milestone/event</span>
        </label>
      </div>

      {eventError ? (
        <p className="section-copy modal-wide" style={{ color: "var(--official-red)" }}>
          {eventError}
        </p>
      ) : null}

      {mode === "edit" && activeDayEvents.length > 1 ? (
        <p className="section-copy modal-wide">
          {activeDayEvents.length} milestones are scheduled on this day. This editor opened the
          earliest one.
        </p>
      ) : null}
    </>
  );
}
