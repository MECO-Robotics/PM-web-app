import React from "react";
import type { TimelineDayHeaderCell } from "./timelineViewModel";

interface TimelineGridDaySlotsProps {
  clearHoveredMilestonePopup: () => void;
  firstDayGridColumn: number;
  gridRow: string | number;
  handleTimelineDayMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
  includeTopBorder?: boolean;
  onRowClick?: () => void;
  onRowMouseEnter?: () => void;
  onRowMouseLeave?: () => void;
  rowKey: string;
  timelineDayHeaderCells: TimelineDayHeaderCell[];
}

export const TimelineGridDaySlots: React.FC<TimelineGridDaySlotsProps> = ({
  clearHoveredMilestonePopup,
  firstDayGridColumn,
  gridRow,
  handleTimelineDayMouseEnter,
  includeTopBorder = false,
  onRowClick,
  onRowMouseEnter,
  onRowMouseLeave,
  rowKey,
  timelineDayHeaderCells,
}) =>
  timelineDayHeaderCells.map((cell, dayIndex) => (
    <div
      aria-hidden="true"
      className="timeline-day-slot"
      data-popup-end-day={cell.primaryEventEndDay}
      data-popup-start-day={cell.primaryEventStartDay}
      data-timeline-day={cell.day}
      data-timeline-grid-cell="true"
      key={`${rowKey}-${cell.day}`}
      onClick={onRowClick}
      onMouseEnter={(event) => {
        handleTimelineDayMouseEnter(event);
        onRowMouseEnter?.();
      }}
      onMouseLeave={() => {
        clearHoveredMilestonePopup();
        onRowMouseLeave?.();
      }}
      style={{
        gridRow,
        gridColumn: dayIndex + firstDayGridColumn,
        borderRight: `1px solid ${cell.dayStyle?.columnBorder ?? "var(--border-base)"}`,
        borderTop: includeTopBorder ? "1px solid var(--border-base)" : "none",
        background: cell.dayStyle?.columnBackground,
        minHeight: "38px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 0,
        cursor: onRowClick ? "pointer" : undefined,
      }}
    />
  ));
