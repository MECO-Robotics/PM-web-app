import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload, TaskRecord } from "@/types";
import type { TaskDetailsEditableField } from "../taskModalTypes";
import { TaskDetailsAdvancedSectionView } from "./sections/TaskDetailsAdvancedSectionView";

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

export function TaskDetailsAdvancedSectionContent(props: TaskDetailsAdvancedSectionProps) {
  return <TaskDetailsAdvancedSectionView {...props} />;
}
