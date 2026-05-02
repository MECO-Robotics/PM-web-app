import { useCallback } from "react";
import type { RefObject } from "react";

export interface TimelineRowHighlightGeometry {
  height: number;
  left: number;
  top: number;
  width: number;
}

export function useTimelineRowHighlightGeometry(
  timelineShellRef: RefObject<HTMLElement | null>,
) {
  return useCallback(
    (anchorKey: string): TimelineRowHighlightGeometry | null => {
      const shell = timelineShellRef.current;
      if (!shell) {
        return null;
      }

      const anchor = shell.querySelector<HTMLElement>(
        `[data-timeline-row-anchor="${anchorKey}"]`,
      );
      if (!anchor) {
        return null;
      }

      const shellRect = shell.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();

      return {
        height: anchorRect.height,
        left: anchorRect.left - shellRect.left + shell.scrollLeft,
        top: anchorRect.top - shellRect.top + shell.scrollTop,
        width: anchorRect.width,
      };
    },
    [timelineShellRef],
  );
}
