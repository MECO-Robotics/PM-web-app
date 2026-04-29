import React from "react";
import { EditableHoverIndicator } from "@/features/workspace/shared";
import type { TaskRecord } from "@/types";
import { TimelineTaskStatusLogo } from "./TimelineTaskStatusLogo";
import type {
  TimelineTaskDependencyCounts,
  TimelineTaskStatusSignal,
} from "./timelineGridBodyUtils";

type TimelineTaskDependencyPresentation = "none" | "outline" | "text";
const TIMELINE_TASK_BAR_EDGE_GAP = "24px";

interface TimelineTaskBarProps {
  compact?: boolean;
  dependencyCounts: TimelineTaskDependencyCounts;
  dependencyPresentation?: TimelineTaskDependencyPresentation;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onOpenTask: (task: TaskRecord) => void;
  style: React.CSSProperties;
  statusSignal: TimelineTaskStatusSignal;
  task: TaskRecord;
  title: string;
  spillsLeft?: boolean;
  spillsRight?: boolean;
}

function hasTaskDependencies(counts: TimelineTaskDependencyCounts) {
  return counts.incoming > 0 || counts.outgoing > 0;
}

function renderDependencyIndicator(
  counts: TimelineTaskDependencyCounts,
  presentation: TimelineTaskDependencyPresentation,
) {
  if (!hasTaskDependencies(counts) || presentation === "none") {
    return null;
  }

  if (presentation === "outline") {
    return (
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "inherit",
          pointerEvents: "none",
          opacity: 0.75,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        marginLeft: "8px",
        fontSize: "0.65rem",
        opacity: 0.8,
        whiteSpace: "nowrap",
      }}
    >
      {counts.incoming > 0 ? `\u2199 ${counts.incoming}` : ""}
      {counts.incoming > 0 && counts.outgoing > 0 ? " " : ""}
      {counts.outgoing > 0 ? `\u2197 ${counts.outgoing}` : ""}
    </span>
  );
}

export const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({
  compact = false,
  dependencyCounts,
  dependencyPresentation = "none",
  onMouseEnter,
  onMouseLeave,
  onOpenTask,
  style,
  statusSignal,
  task,
  title,
  spillsLeft = false,
  spillsRight = false,
}) => {
  const { borderRadius, ...baseStyle } = style;
  const spillAwareStyle: React.CSSProperties = {
    ...baseStyle,
    ...(borderRadius
      ? ({
          "--timeline-task-bar-radius": borderRadius,
        } as React.CSSProperties)
      : null),
    ...(!spillsLeft
      ? {
          marginLeft: TIMELINE_TASK_BAR_EDGE_GAP,
        }
      : null),
    ...(!spillsRight
      ? {
          marginRight: TIMELINE_TASK_BAR_EDGE_GAP,
        }
      : null),
    ...(spillsLeft
      ? {
          marginLeft: 0,
        }
      : null),
    ...(spillsRight
      ? {
          marginRight: 0,
        }
      : null),
  };

  return (
    <button
      className={`timeline-bar timeline-${task.status} editable-hover-target timeline-row-motion-item`}
      data-spill-left={spillsLeft ? "true" : undefined}
      data-spill-right={spillsRight ? "true" : undefined}
      data-tutorial-target="timeline-task-bar"
      onClick={() => onOpenTask(task)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={spillAwareStyle}
      title={title}
      type="button"
    >
      <span className="timeline-bar-content">
        <TimelineTaskStatusLogo compact={compact} signal={statusSignal} status={task.status} />
        {compact ? null : <span className="timeline-bar-title">{task.title}</span>}
        {renderDependencyIndicator(dependencyCounts, dependencyPresentation)}
        <EditableHoverIndicator className="editable-hover-indicator-compact" />
      </span>
    </button>
  );
};
