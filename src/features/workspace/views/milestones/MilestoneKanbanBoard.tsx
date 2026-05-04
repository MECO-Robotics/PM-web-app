import type { CSSProperties } from "react";

import type { BootstrapPayload, MilestoneRecord } from "@/types";
import { getStatusPillClassName } from "@/features/workspace/shared";
import {
  MilestoneTaskStateIcon,
  getMilestoneTaskBoardStateForMilestone,
  getMilestoneTaskBoardStateLabel,
} from "@/features/workspace/shared/milestones";
import { EditableHoverIndicator } from "@/features/workspace/shared/WorkspaceViewShared";
import {
  DEFAULT_EVENT_TYPE as DEFAULT_MILESTONE_TYPE,
  EVENT_TYPE_STYLES as MILESTONE_TYPE_STYLES,
  getMilestoneTypeStyle,
} from "@/features/workspace/shared/events/eventStyles";
import { KanbanColumns } from "@/features/workspace/views/kanban/KanbanColumns";
import { formatMilestoneDateTime } from "./milestonesViewUtils";

const MILESTONE_BOARD_TYPES = Object.keys(MILESTONE_TYPE_STYLES) as (keyof typeof MILESTONE_TYPE_STYLES)[];

function getMilestoneBoardType(milestone: MilestoneRecord) {
  return milestone.type in MILESTONE_TYPE_STYLES ? milestone.type : DEFAULT_MILESTONE_TYPE;
}

interface MilestoneKanbanBoardProps {
  bootstrap: BootstrapPayload;
  milestones: MilestoneRecord[];
  onOpenMilestone: (milestone: MilestoneRecord) => void;
  projectLabelByMilestoneId: Record<string, string>;
}

export function MilestoneKanbanBoard({
  bootstrap,
  milestones,
  onOpenMilestone,
  projectLabelByMilestoneId,
}: MilestoneKanbanBoardProps) {
  const milestonesByType = MILESTONE_BOARD_TYPES.reduce(
    (grouped, type) => {
      grouped[type] = [];
      return grouped;
    },
    {} as Record<(typeof MILESTONE_BOARD_TYPES)[number], MilestoneRecord[]>,
  );

  milestones.forEach((milestone) => {
    const type = getMilestoneBoardType(milestone);
    milestonesByType[type].push(milestone);
  });

  return (
    <KanbanColumns
      boardClassName="task-queue-board milestone-board"
      columnBodyClassName="task-queue-board-column-body"
      columnClassName="task-queue-board-column"
      columnCountClassName="task-queue-board-column-count"
      columnEmptyClassName="task-queue-board-column-empty"
      columnHeaderClassName="task-queue-board-column-header"
      columns={MILESTONE_BOARD_TYPES.map((type) => {
        const milestoneStyle = getMilestoneTypeStyle(type);

        return {
          state: type,
          count: milestonesByType[type].length,
          header: (
            <span
              className="pill status-pill milestone-type-pill"
              style={
                {
                  "--milestone-type-chip-bg": milestoneStyle.chipBackground,
                  "--milestone-type-chip-border": milestoneStyle.columnBorder,
                  "--milestone-type-chip-text": milestoneStyle.chipText,
                  "--milestone-type-chip-bg-dark": milestoneStyle.darkChipBackground,
                  "--milestone-type-chip-border-dark": milestoneStyle.darkColumnBorder,
                  "--milestone-type-chip-text-dark": milestoneStyle.darkChipText,
                } as CSSProperties
              }
            >
              {milestoneStyle.label}
            </span>
          ),
        };
      })}
      emptyLabel="No milestones"
      itemsByState={milestonesByType}
      renderItem={(milestone) => {
        const milestoneStatus = getMilestoneTaskBoardStateForMilestone(milestone, bootstrap);
        const milestoneStatusLabel = getMilestoneTaskBoardStateLabel(milestoneStatus);

        return (
          <button
            className="task-queue-board-card editable-hover-target editable-hover-target-row"
            data-tutorial-target="edit-milestone-row"
            key={milestone.id}
            onClick={() => onOpenMilestone(milestone)}
            type="button"
          >
            <div className="task-queue-board-card-header">
              <strong>{milestone.title}</strong>
              <span
                style={{
                  alignItems: "flex-end",
                  display: "inline-flex",
                  flexDirection: "column",
                  gap: "0.15rem",
                  whiteSpace: "normal",
                }}
              >
                <span className="task-queue-board-card-due">
                  {formatMilestoneDateTime(milestone.startDateTime)}
                </span>
                <span className="task-queue-board-card-due">
                  {`to ${milestone.endDateTime ? formatMilestoneDateTime(milestone.endDateTime) : "No end date"}`}
                </span>
              </span>
            </div>
            <small className="task-queue-board-card-summary">
              {milestone.description.trim() || "No description"}
            </small>
            <div className="task-queue-board-card-meta">
              <span
                className="task-queue-board-card-context-chip"
                title={projectLabelByMilestoneId[milestone.id] ?? "All projects"}
              >
                {projectLabelByMilestoneId[milestone.id] ?? "All projects"}
              </span>
              <div className="task-queue-board-card-meta-person-group">
                <span
                  aria-label={`Milestone status: ${milestoneStatusLabel}`}
                  className={getStatusPillClassName(milestoneStatus)}
                  title={`Milestone status: ${milestoneStatusLabel}`}
                  style={{ display: "inline-flex", gap: "0.24rem", padding: "0.14rem 0.34rem" }}
                >
                  <span aria-hidden="true" className="task-queue-board-card-status-icon">
                    <MilestoneTaskStateIcon compact state={milestoneStatus} />
                  </span>
                  <span className="task-queue-board-card-status-label">{milestoneStatusLabel}</span>
                </span>
              </div>
            </div>
            <EditableHoverIndicator className="task-queue-board-card-hover" />
          </button>
        );
      }}
    />
  );
}
