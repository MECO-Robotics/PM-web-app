import React from "react";
import type { TimelineProjectRow } from "../timelineViewModel";

interface TimelineProjectSummaryCellProps {
  collapsedSummarySpan: number;
  collapsedSummaryStart: number;
  collapsedSummaryStickyLeft: number;
  project: TimelineProjectRow;
  projectBackground: string;
}

export const TimelineProjectSummaryCell: React.FC<TimelineProjectSummaryCellProps> = ({
  collapsedSummarySpan,
  collapsedSummaryStart,
  collapsedSummaryStickyLeft,
  project,
  projectBackground,
}) =>
  collapsedSummarySpan > 0 ? (
    <div
      className="timeline-merged-cell-column timeline-column-motion"
      style={{
        gridRow: "1",
        gridColumn: `${collapsedSummaryStart} / span ${collapsedSummarySpan}`,
        position: "sticky",
        left: `${collapsedSummaryStickyLeft}px`,
        zIndex: 10021,
        background: projectBackground,
        borderRight: "1px solid var(--border-base)",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0 12px",
        paddingRight: "52px",
        minHeight: "38px",
        color: "var(--text-copy)",
        fontSize: "0.75rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {project.subsystems.length} subsystems / {project.taskCount} tasks
    </div>
  ) : null;
