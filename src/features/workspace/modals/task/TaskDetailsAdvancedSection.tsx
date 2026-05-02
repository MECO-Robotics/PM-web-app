import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload, TaskRecord } from "@/types";
import type { TaskDetailsEditableField } from "./taskModalTypes";
import { TaskDetailsAdvancedSectionContent } from "./details/TaskDetailsAdvancedSectionContent";

interface TaskDetailsAdvancedSectionProps {
  activeTask: TaskRecord;
  bootstrap: BootstrapPayload;
  canInlineEdit: boolean;
  editingField: TaskDetailsEditableField | null;
  openTaskEditModal: () => void;
  setEditingField: Dispatch<SetStateAction<TaskDetailsEditableField | null>>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}

export function TaskDetailsAdvancedSection({
  activeTask,
  bootstrap,
  canInlineEdit,
  editingField,
  openTaskEditModal,
  setEditingField,
  setTaskDraft,
  taskDraft,
}: TaskDetailsAdvancedSectionProps) {
  return (
    <TaskDetailsAdvancedSectionContent
      activeTask={activeTask}
      bootstrap={bootstrap}
      canInlineEdit={canInlineEdit}
      editingField={editingField}
      openTaskEditModal={openTaskEditModal}
      setEditingField={setEditingField}
      setTaskDraft={setTaskDraft}
      taskDraft={taskDraft}
    />
  );
}
