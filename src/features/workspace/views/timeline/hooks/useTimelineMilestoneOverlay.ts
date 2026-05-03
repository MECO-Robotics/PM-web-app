import { useCallback, useRef } from "react";
import type React from "react";
import type { BootstrapPayload, EventRecord } from "@/types";
import { datePortion } from "@/features/workspace/shared/timeline";
import { getEventTypeStyle } from "@/features/workspace/shared/events";
import {
  isSameHoveredMilestonePopup,
  type HoveredMilestonePopup,
} from "@/features/workspace/shared/timeline";
import {
  getTimelineMilestonePopupItems,
} from "../model/timelineMilestoneData";
import { useTimelineMilestoneOverlayLayout } from "./useTimelineMilestoneOverlayLayout";
import { useTimelineMilestoneOverlaySync } from "./useTimelineMilestoneOverlaySync";

interface UseTimelineMilestoneOverlayArgs {
  days: string[];
  dayEventsByDate: Record<string, EventRecord[]>;
  events: BootstrapPayload["events"];
}

export function useTimelineMilestoneOverlay({
  days,
  dayEventsByDate,
  events,
}: UseTimelineMilestoneOverlayArgs) {
  const sync = useTimelineMilestoneOverlaySync({ days });
  const layout = useTimelineMilestoneOverlayLayout({
    days,
    events,
    timelineDayCellLayouts: sync.timelineDayCellLayouts,
    timelineDayCellRefs: sync.timelineDayCellRefs,
    timelineGridHeight: sync.timelineGridHeight,
    timelineGridRef: sync.timelineGridRef,
    timelineHeaderHeight: sync.timelineHeaderHeight,
    timelineShellRef: sync.timelineShellRef,
  });
  const hoveredMilestonePopupRef = useRef<HoveredMilestonePopup | null>(null);
  const setHoveredMilestonePopupLayerRef = useRef<
    (popup: HoveredMilestonePopup | null) => void
  >(() => undefined);
  const resolveMilestonePopupGeometry = layout.resolveMilestonePopupGeometry;
  const timelineDayMilestoneUnderlays = layout.timelineDayMilestoneUnderlays;
  const timelineDayCellRefs = sync.timelineDayCellRefs;
  const timelineGridRef = sync.timelineGridRef;
  const timelineShellRef = sync.timelineShellRef;
  const timelineTodayMarkerLabelTop = sync.timelineTodayMarkerLabelTop;
  const timelineTodayMarkerLineLeft = sync.timelineTodayMarkerLineLeft;
  const timelineTodayMarkerLeft = sync.timelineTodayMarkerLeft;
  const isTimelineShellScrolling = sync.isTimelineShellScrolling;
  const tooltipPortalTarget = sync.tooltipPortalTarget;
  const queueTimelineLayerUpdate = sync.queueTimelineLayerUpdate;

  const updateHoveredMilestonePopup = useCallback(
    (
      target: HTMLElement,
      lines: string[],
      lineOffsets: number[],
      background: string,
      color: string,
    ) => {
      if (typeof document === "undefined") {
        return;
      }

      const popupStartDay = target.dataset.popupStartDay;
      const popupEndDay = target.dataset.popupEndDay;
      const isMultiDayEvent =
        Boolean(popupStartDay) && Boolean(popupEndDay) && popupStartDay !== popupEndDay;
      const normalizedPopupStartDay = popupStartDay ?? null;
      const normalizedPopupEndDay = popupEndDay ?? null;

      if (!normalizedPopupStartDay) {
        return;
      }

      const nextPopup: HoveredMilestonePopup = {
        anchorStartDay: normalizedPopupStartDay,
        anchorEndDay: normalizedPopupEndDay,
        rotationDeg: isMultiDayEvent ? 45 : 90,
        lines,
        lineOffsets,
        background,
        color,
      };
      if (isSameHoveredMilestonePopup(hoveredMilestonePopupRef.current, nextPopup)) {
        return;
      }

      hoveredMilestonePopupRef.current = nextPopup;
      setHoveredMilestonePopupLayerRef.current(nextPopup);
    },
    [],
  );

  const showDateCellMilestonePopup = useCallback(
    (anchor: HTMLElement, day: string) => {
      const eventsOnDay = dayEventsByDate[day] ?? [];
      if (!eventsOnDay.length) {
        return;
      }

      const primaryEvent = eventsOnDay[0];
      if (!primaryEvent) {
        return;
      }

      const timelineStart = days[0] ?? null;
      const timelineEnd = days[days.length - 1] ?? null;
      const eventStartDay = datePortion(primaryEvent.startDateTime);
      const eventEndDay = primaryEvent.endDateTime
        ? datePortion(primaryEvent.endDateTime)
        : eventStartDay;
      const popupItems = getTimelineMilestonePopupItems(eventsOnDay, timelineDayMilestoneUnderlays);
      const anchorStartDay =
        timelineStart && eventStartDay < timelineStart ? timelineStart : eventStartDay;
      const anchorEndDay = timelineEnd && eventEndDay > timelineEnd ? timelineEnd : eventEndDay;

      anchor.dataset.popupStartDay = anchorStartDay;
      anchor.dataset.popupEndDay = anchorEndDay;

      const dayStyle = getEventTypeStyle(primaryEvent.type);
      updateHoveredMilestonePopup(
        anchor,
        popupItems.map((item) => item.text),
        popupItems.map((item) => item.horizontalOffset),
        dayStyle.columnBackground,
        dayStyle.chipText,
      );
    },
    [dayEventsByDate, days, timelineDayMilestoneUnderlays, updateHoveredMilestonePopup],
  );

  const clearHoveredMilestonePopup = useCallback(() => {
    if (!hoveredMilestonePopupRef.current) {
      return;
    }
    hoveredMilestonePopupRef.current = null;
    setHoveredMilestonePopupLayerRef.current(null);
  }, []);

  const handleTimelineDayMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const day = event.currentTarget.dataset.timelineDay;
      if (!day) {
        return;
      }
      showDateCellMilestonePopup(event.currentTarget, day);
    },
    [showDateCellMilestonePopup],
  );

  return {
    clearHoveredMilestonePopup,
    handleTimelineDayMouseEnter,
    queueTimelineLayerUpdate,
    resolveMilestonePopupGeometry,
    setHoveredMilestonePopupLayerRef,
    timelineDayCellRefs,
    timelineDayMilestoneUnderlays,
    timelineGridRef,
    timelineShellRef,
    timelineTodayMarkerLabelTop,
    timelineTodayMarkerLineLeft,
    timelineTodayMarkerLeft,
    tooltipPortalTarget,
    isTimelineShellScrolling,
  };
}

