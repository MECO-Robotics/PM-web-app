import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload } from "@/types";
import { TaskDetailsBlockersSectionContent } from "./details/TaskDetailsBlockersSectionContent";

interface TaskDetailsBlockersSectionProps {
  activeTaskId: string;
  bootstrap: BootstrapPayload;
  canInlineEdit: boolean;
  onResolveTaskBlocker: (blockerId: string) => Promise<void>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}

export function TaskDetailsBlockersSection({
  activeTaskId,
  bootstrap,
  canInlineEdit,
  onResolveTaskBlocker,
  setTaskDraft,
  taskDraft,
}: TaskDetailsBlockersSectionProps) {
  return (
    <TaskDetailsBlockersSectionContent
      activeTaskId={activeTaskId}
      bootstrap={bootstrap}
      canInlineEdit={canInlineEdit}
      onResolveTaskBlocker={onResolveTaskBlocker}
      setTaskDraft={setTaskDraft}
      taskDraft={taskDraft}
    />
  );
}
