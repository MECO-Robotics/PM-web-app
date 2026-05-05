import { TaskDetailReveal } from "../TaskDetailReveal";

interface TaskDetailsAssignedListProps {
  assigneeNames: string[];
}

export function TaskDetailsAssignedList({ assigneeNames }: TaskDetailsAssignedListProps) {
  if (assigneeNames.length === 0) {
    return <div className="task-details-assigned-empty">Unassigned</div>;
  }

  return (
    <>
      {assigneeNames.map((assigneeName, index) => (
        <div className="task-details-assigned-item" key={`${assigneeName}-${index}`}>
          <TaskDetailReveal className="task-detail-ellipsis-reveal" text={assigneeName} />
        </div>
      ))}
    </>
  );
}
