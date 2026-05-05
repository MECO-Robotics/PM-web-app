import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload, TaskRecord } from "@/types";
import type { TaskDetailsEditableField } from "../../taskModalTypes";

export interface TaskDetailsOverviewSectionProps {
  activeTask: TaskRecord;
  bootstrap: BootstrapPayload;
  canInlineEdit: boolean;
  editingField: TaskDetailsEditableField | null;
  openTaskEditModal: () => void;
  setEditingField: Dispatch<SetStateAction<TaskDetailsEditableField | null>>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}
