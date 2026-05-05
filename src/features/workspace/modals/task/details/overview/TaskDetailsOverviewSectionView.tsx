import type { TaskDetailsOverviewSectionProps } from "./TaskDetailsOverviewTypes";
import { TaskDetailsOverviewAssignedField } from "./TaskDetailsOverviewAssignedField";
import { TaskDetailsOverviewMentorField } from "./TaskDetailsOverviewMentorField";
import { TaskDetailsOverviewOwnerField } from "./TaskDetailsOverviewOwnerField";
import { TaskDetailsOverviewPriorityField } from "./TaskDetailsOverviewPriorityField";
import { TaskDetailsOverviewSubsystemField } from "./TaskDetailsOverviewSubsystemField";
import { TaskDetailsOverviewSummaryField } from "./TaskDetailsOverviewSummaryField";
import { useTaskDetailsOverviewModel } from "./useTaskDetailsOverviewModel";

export function TaskDetailsOverviewSectionView(props: TaskDetailsOverviewSectionProps) {
  const {
    activeTask,
    canInlineEdit,
    editingField,
    openTaskEditModal,
    setEditingField,
  } = props;
  const model = useTaskDetailsOverviewModel(props);
  const fieldProps = {
    canInlineEdit,
    editingField,
    model,
    openTaskEditModal,
    setEditingField,
  };

  return (
    <>
      <TaskDetailsOverviewSummaryField activeSummary={activeTask.summary} {...fieldProps} />
      <div className="task-details-section-grid task-details-overview-grid modal-wide">
        <TaskDetailsOverviewPriorityField {...fieldProps} />
        <TaskDetailsOverviewSubsystemField {...fieldProps} />
        <TaskDetailsOverviewOwnerField {...fieldProps} />
        <TaskDetailsOverviewAssignedField {...fieldProps} />
        <TaskDetailsOverviewMentorField {...fieldProps} />
      </div>
    </>
  );
}
