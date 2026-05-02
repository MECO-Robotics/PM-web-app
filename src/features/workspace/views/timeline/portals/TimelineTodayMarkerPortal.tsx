import { createPortal } from "react-dom";

interface TimelineTodayMarkerPortalProps {
  portalTarget: HTMLElement | null;
  todayMarkerLeft: number | null;
}

export const TimelineTodayMarkerPortal: React.FC<TimelineTodayMarkerPortalProps> = ({
  portalTarget,
  todayMarkerLeft,
}) => {
  if (!portalTarget || todayMarkerLeft === null) {
    return null;
  }

  return createPortal(
    <div
      aria-hidden="true"
      className="timeline-today-marker-column"
      style={{
        left: `${todayMarkerLeft}px`,
      }}
    >
      <div aria-hidden="true" className="timeline-today-marker-line" />
      <div aria-hidden="true" className="timeline-today-marker-label">
        Today
      </div>
    </div>,
    portalTarget,
  );
};
