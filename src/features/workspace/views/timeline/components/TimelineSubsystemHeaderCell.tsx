import React from "react";
import { TimelineCollapseArrow } from "../TimelineCollapseArrow";
import { TimelineMergedCellColumn } from "./TimelineMergedCellColumn";
import { getTimelineMergedCellRotation, type TimelineSubsystemRow } from "../timelineViewModel";

interface TimelineSubsystemHeaderCellProps {
  accentColor: string;
  collapsed: boolean;
  canToggleSubsystem: boolean;
  isSubsystemHovered: boolean;
  isSubsystemSelected: boolean;
  onHover: () => void;
  onHoverLeave: () => void;
  onSelect: () => void;
  rowBackground: string;
  subsystem: TimelineSubsystemRow;
  subsystemColumnIndex: number;
  subsystemStickyLeft: number;
  taskCount: number;
  toggleSubsystem: (id: string) => void;
}

export const TimelineSubsystemHeaderCell: React.FC<TimelineSubsystemHeaderCellProps> = ({
  accentColor,
  collapsed,
  canToggleSubsystem,
  isSubsystemHovered,
  isSubsystemSelected,
  onHover,
  onHoverLeave,
  onSelect,
  rowBackground,
  subsystem,
  subsystemColumnIndex,
  subsystemStickyLeft,
  taskCount,
  toggleSubsystem,
}) => {
  const subsystemBandFill =
    isSubsystemHovered || isSubsystemSelected
      ? `color-mix(in srgb, ${rowBackground} 86%, ${accentColor} 14%)`
      : null;
  const subsystemSurfaceBackground = subsystemBandFill ?? rowBackground;
  const subsystemSurfaceBorderRight = subsystemBandFill ? "1px solid transparent" : "1px solid var(--border-base)";
  const shouldRotateSubsystemLabel = !collapsed && taskCount > 1;
  const subsystemLabelRotation = getTimelineMergedCellRotation(taskCount);

  return (
    <TimelineMergedCellColumn
      ariaPressed={isSubsystemSelected}
      background={subsystemSurfaceBackground}
      borderRight={subsystemSurfaceBorderRight}
      collapsed={collapsed}
      dataTimelineColumn="subsystem"
      flexDirection={collapsed ? "row" : "column"}
      gridColumn={`${subsystemColumnIndex}`}
      gridRow={collapsed ? "1" : `1 / span ${taskCount}`}
      justifyContent={collapsed ? "flex-start" : "center"}
      left={subsystemStickyLeft}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverLeave}
      onToggle={canToggleSubsystem ? () => toggleSubsystem(subsystem.id) : undefined}
      overflow={collapsed ? "hidden" : "visible"}
      padding={collapsed ? "0 12px" : "8px 6px"}
      role="button"
      shouldShowToggle={canToggleSubsystem}
      toggleIcon={<TimelineCollapseArrow isCollapsed={collapsed} />}
      toggleLabel={collapsed ? "Expand subsystem" : "Collapse subsystem"}
      toggleTitle={collapsed ? "Expand subsystem" : "Collapse subsystem"}
      tabIndex={0}
      zIndex={10021}
    >
      <div
        className={`timeline-merged-cell-text${shouldRotateSubsystemLabel ? " is-rotated" : ""}`}
        style={
          shouldRotateSubsystemLabel
            ? ({
                ["--timeline-merged-cell-rotation" as const]: subsystemLabelRotation,
              } as React.CSSProperties)
            : undefined
        }
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "0.55rem",
              height: "0.55rem",
              borderRadius: "999px",
              flexShrink: 0,
              background: accentColor,
              boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.08)",
            }}
          />
          <span className="timeline-merged-cell-title timeline-ellipsis-reveal" data-full-text={subsystem.name}>
            {subsystem.name}
          </span>
        </span>
      </div>
      {!collapsed ? (
        <span className="timeline-subsystem-counter-corner">
          {subsystem.completeCount}/{subsystem.taskCount}
        </span>
      ) : null}
    </TimelineMergedCellColumn>
  );
};
