import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload } from "@/types";
import { TaskDetailsBlockersSectionView } from "./sections/TaskDetailsBlockersSectionView";

interface TaskDetailsBlockersSectionProps {
  activeTaskId: string;
  bootstrap: BootstrapPayload;
  canInlineEdit: boolean;
  collapsibleOpen?: boolean;
  onCollapsibleToggle?: (open: boolean) => void;
  onResolveTaskBlocker: (blockerId: string) => Promise<void>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}

export function TaskDetailsBlockersSectionContent(props: TaskDetailsBlockersSectionProps) {
  return <TaskDetailsBlockersSectionView {...props} />;
}
