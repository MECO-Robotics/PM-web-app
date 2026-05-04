import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload } from "@/types";
import { TaskDetailsBlockersSectionContent } from "./details/TaskDetailsBlockersSectionContent";

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

export function TaskDetailsBlockersSection({
  activeTaskId,
  bootstrap,
  canInlineEdit,
  collapsibleOpen,
  onCollapsibleToggle,
  onResolveTaskBlocker,
  setTaskDraft,
  taskDraft,
}: TaskDetailsBlockersSectionProps) {
  return (
    <TaskDetailsBlockersSectionContent
      activeTaskId={activeTaskId}
      bootstrap={bootstrap}
      canInlineEdit={canInlineEdit}
      collapsibleOpen={collapsibleOpen}
      onCollapsibleToggle={onCollapsibleToggle}
      onResolveTaskBlocker={onResolveTaskBlocker}
      setTaskDraft={setTaskDraft}
      taskDraft={taskDraft}
    />
  );
}
