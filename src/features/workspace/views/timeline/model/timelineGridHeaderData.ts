import type { TimelineMonthGroup } from "../timelineViewModel";

export interface TimelineMonthHeaderCell extends TimelineMonthGroup {
  startColumn: number;
}

export function buildTimelineMonthHeaderCells(
  monthGroups: TimelineMonthGroup[],
  firstDayGridColumn: number,
): TimelineMonthHeaderCell[] {
  return monthGroups.reduce<TimelineMonthHeaderCell[]>((cells, group) => {
    const previous = cells[cells.length - 1];
    const startColumn = previous ? previous.startColumn + previous.span : firstDayGridColumn;
    return [...cells, { ...group, startColumn }];
  }, []);
}

export function buildTimelineHiddenColumnToggles(params: {
  hasProjectColumn: boolean;
  showProjectCol: boolean;
  showSubsystemCol: boolean;
  toggleProjectColumn: () => void;
  toggleSubsystemColumn: () => void;
}) {
  const { hasProjectColumn, showProjectCol, showSubsystemCol, toggleProjectColumn, toggleSubsystemColumn } =
    params;

  return [
    hasProjectColumn && !showProjectCol
      ? {
          id: "project",
          label: "Show project column",
          onClick: toggleProjectColumn,
        }
      : null,
    !showSubsystemCol
      ? {
          id: "subsystem",
          label: "Show subsystem column",
          onClick: toggleSubsystemColumn,
        }
      : null,
  ].filter((toggle): toggle is { id: string; label: string; onClick: () => void } => Boolean(toggle));
}

export function getTimelineHiddenToggleLeft(
  projectColumnWidth: number,
  subsystemColumnWidth: number,
  hiddenToggleCount: number,
) {
  const visibleLabelWidth = projectColumnWidth + subsystemColumnWidth;
  const hiddenToggleWidth = hiddenToggleCount * 28 + Math.max(0, hiddenToggleCount - 1) * 6;
  return Math.max(6, visibleLabelWidth - hiddenToggleWidth - 6);
}
