import type { ReactNode } from "react";

type SwipeDirection = "left" | "right" | null;
type TabSwitchDirection = "up" | "down";

export function WorkspaceSectionPanel({
  children,
  disableAnimations = false,
  isActive,
  tabSwitchDirection,
}: {
  children: ReactNode;
  disableAnimations?: boolean;
  isActive: boolean;
  tabSwitchDirection: TabSwitchDirection;
}) {
  if (!isActive) {
    return null;
  }

  const animationClass = !disableAnimations
    ? ` workspace-tab-panel-enter workspace-tab-panel-enter-${tabSwitchDirection}`
    : "";

  return <div className={`workspace-tab-panel${animationClass}`}>{children}</div>;
}

export function WorkspaceSubPanel({
  children,
  disableAnimations = false,
  isActive,
  swipeDirection = null,
}: {
  children: ReactNode;
  disableAnimations?: boolean;
  isActive: boolean;
  swipeDirection?: SwipeDirection;
}) {
  if (!isActive) {
    return null;
  }

  const panelAnimation = !disableAnimations ? swipeDirection ?? "neutral" : undefined;

  return (
    <div
      className="workspace-tab-panel workspace-subtab-panel"
      data-swipe-direction={panelAnimation}
    >
      {children}
    </div>
  );
}
