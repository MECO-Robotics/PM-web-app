import type { CSSProperties } from "react";

import type { BootstrapPayload, EventRecord } from "@/types";
import { EditableHoverIndicator } from "@/features/workspace/shared";
import { getEventTypeStyle, EVENT_TYPE_STYLES, DEFAULT_EVENT_TYPE } from "@/features/workspace/shared/events";
import { formatMilestoneDateTime } from "./milestonesViewUtils";
import { KanbanColumns } from "@/features/workspace/views/kanban/KanbanColumns";

const MILESTONE_BOARD_TYPES = Object.keys(EVENT_TYPE_STYLES) as (keyof typeof EVENT_TYPE_STYLES)[];

function getMilestoneBoardType(event: EventRecord) {
  return event.type in EVENT_TYPE_STYLES ? event.type : DEFAULT_EVENT_TYPE;
}

interface MilestoneKanbanBoardProps {
  events: EventRecord[];
  onOpenEvent: (event: EventRecord) => void;
  projectLabelByEventId: Record<string, string>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

export function MilestoneKanbanBoard({
  events,
  onOpenEvent,
  projectLabelByEventId,
  subsystemsById,
}: MilestoneKanbanBoardProps) {
  const eventsByType = MILESTONE_BOARD_TYPES.reduce(
    (grouped, type) => {
      grouped[type] = [];
      return grouped;
    },
    {} as Record<(typeof MILESTONE_BOARD_TYPES)[number], EventRecord[]>,
  );

  events.forEach((event) => {
    const type = getMilestoneBoardType(event);
    eventsByType[type].push(event);
  });

  return (
    <KanbanColumns
      boardClassName="task-queue-board"
      columnBodyClassName="task-queue-board-column-body"
      columnClassName="task-queue-board-column"
      columnCountClassName="task-queue-board-column-count"
      columnEmptyClassName="task-queue-board-column-empty"
      columnHeaderClassName="task-queue-board-column-header"
      columns={MILESTONE_BOARD_TYPES.map((type) => {
        const eventStyle = getEventTypeStyle(type);

        return {
          state: type,
          count: eventsByType[type].length,
          header: (
            <span
              className="pill status-pill milestone-type-pill"
              style={
                {
                  "--milestone-type-chip-bg": eventStyle.chipBackground,
                  "--milestone-type-chip-border": eventStyle.columnBorder,
                  "--milestone-type-chip-text": eventStyle.chipText,
                  "--milestone-type-chip-bg-dark": eventStyle.darkChipBackground,
                  "--milestone-type-chip-border-dark": eventStyle.darkColumnBorder,
                  "--milestone-type-chip-text-dark": eventStyle.darkChipText,
                } as CSSProperties
              }
            >
              {eventStyle.label}
            </span>
          ),
        };
      })}
      emptyLabel="No milestones"
      itemsByState={eventsByType}
      renderItem={(event) => {
        const eventStyle = getEventTypeStyle(event.type);
        const relatedSubsystems = event.relatedSubsystemIds
          .map((subsystemId) => subsystemsById[subsystemId]?.name ?? "Unknown subsystem")
          .join(", ");

        return (
          <button
            className="task-queue-board-card editable-hover-target editable-hover-target-row"
            data-tutorial-target="edit-milestone-row"
            key={event.id}
            onClick={() => onOpenEvent(event)}
            type="button"
          >
            <div className="task-queue-board-card-header">
              <strong>{event.title}</strong>
              <span className="task-queue-board-card-due">
                Start {formatMilestoneDateTime(event.startDateTime)}
              </span>
            </div>
            <small className="task-queue-board-card-summary">
              {event.description.trim() || "No description"}
            </small>
            <div className="task-queue-board-card-meta">
              <span className="task-queue-board-card-context-chip" title={projectLabelByEventId[event.id] ?? "All projects"}>
                {projectLabelByEventId[event.id] ?? "All projects"}
              </span>
              <div className="task-queue-board-card-meta-person-group">
                <span
                  className="pill status-pill milestone-type-pill"
                  style={
                    {
                      "--milestone-type-chip-bg": eventStyle.chipBackground,
                      "--milestone-type-chip-border": eventStyle.columnBorder,
                      "--milestone-type-chip-text": eventStyle.chipText,
                      "--milestone-type-chip-bg-dark": eventStyle.darkChipBackground,
                      "--milestone-type-chip-border-dark": eventStyle.darkColumnBorder,
                      "--milestone-type-chip-text-dark": eventStyle.darkChipText,
                    } as CSSProperties
                  }
                >
                  {eventStyle.label}
                </span>
              </div>
            </div>
            <small className="task-queue-board-card-summary">
              End {event.endDateTime ? formatMilestoneDateTime(event.endDateTime) : "No end"}
              {relatedSubsystems.length > 0 ? ` · ${relatedSubsystems}` : ""}
            </small>
            <EditableHoverIndicator className="task-queue-board-card-hover" />
          </button>
        );
      }}
    />
  );
}

