import type { InventoryViewTab } from "@/lib/workspaceNavigation";
import type { WorkspaceContentPanelsProps } from "../WorkspaceContentPanelsCoreImpl";

export type SwipeDirection = "left" | "right" | null;

export type WorkspaceContentPanelsViewProps = WorkspaceContentPanelsProps & {
  effectiveInventoryView: InventoryViewTab;
  taskSwipeDirection: SwipeDirection;
  reportsSwipeDirection: SwipeDirection;
  manufacturingSwipeDirection: SwipeDirection;
  inventorySwipeDirection: SwipeDirection;
};
