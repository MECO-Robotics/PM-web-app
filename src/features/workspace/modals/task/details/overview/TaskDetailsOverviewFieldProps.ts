import type { Dispatch, SetStateAction } from "react";
import type { TaskDetailsEditableField } from "../../taskModalTypes";
import type { TaskDetailsOverviewModel } from "./useTaskDetailsOverviewModel";

export interface TaskDetailsOverviewFieldProps {
  canInlineEdit: boolean;
  editingField: TaskDetailsEditableField | null;
  model: TaskDetailsOverviewModel;
  openTaskEditModal: () => void;
  setEditingField: Dispatch<SetStateAction<TaskDetailsEditableField | null>>;
}
