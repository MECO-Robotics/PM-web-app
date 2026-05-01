import type { CSSProperties } from "react";

import type { BootstrapPayload, TaskRecord } from "@/types";
import { formatDate } from "@/lib/appUtils";
import { EditableHoverIndicator, getStatusPillClassName } from "@/features/workspace/shared";
import {
  TASK_QUEUE_BOARD_COLUMNS,
  formatTaskQueueBoardState,
  getMemberInitial,
  getTaskCardPerson,
  getTaskQueueBoardState,
  getTaskQueueCardContextLabel,
  groupTasksByBoardState,
  TaskPriorityBadge,
  type TaskQueueBoardState,
} from "./taskQueueKanban";
import { getTimelineTaskDisciplineColor } from "@/features/workspace/views/timeline/timelineTaskColors";
import { TimelineTaskStatusLogo } from "@/features/workspace/views/timeline/TimelineTaskStatusLogo";
import type { TimelineTaskStatusSignal } from "@/features/workspace/views/timeline/timelineGridBodyUtils";
import { KanbanColumns } from "@/features/workspace/views/kanban/KanbanColumns";

const TASK_QUEUE_BOARD_STATE_LOGO_SPECS: Record<
  TaskQueueBoardState,
  { signal: TimelineTaskStatusSignal; status: TaskRecord["status"] }
> = {
  "not-started": {
    signal: "not-started",
    status: "not-started",
  },
  "in-progress": {
    signal: "in-progress",
    status: "in-progress",
  },
  blocked: {
    signal: "blocked",
    status: "not-started",
  },
  "waiting-for-qa": {
    signal: "waiting-for-qa",
    status: "waiting-for-qa",
  },
  complete: {
    signal: "complete",
    status: "complete",
  },
};

interface TaskQueueKanbanBoardProps {
  bootstrap: BootstrapPayload;
  disciplinesById: Record<string, BootstrapPayload["disciplines"][number]>;
  isNonRobotProject: boolean;
  membersById: Record<string, BootstrapPayload["members"][number]>;
  openEditTaskModal: (task: TaskRecord) => void;
  projectsById: Record<string, BootstrapPayload["projects"][number]>;
  showProjectContextOnCards: boolean;
  showProjectOnCards: boolean;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
  tasks: TaskRecord[];
  workstreamsById: Record<string, BootstrapPayload["workstreams"][number]>;
}

export function TaskQueueKanbanBoard({
  bootstrap,
  disciplinesById,
  isNonRobotProject,
  membersById,
  openEditTaskModal,
  projectsById,
  showProjectContextOnCards,
  showProjectOnCards,
  subsystemsById,
  tasks,
  workstreamsById,
}: TaskQueueKanbanBoardProps) {
  const tasksByState = groupTasksByBoardState(tasks, bootstrap);

  return (
    <KanbanColumns
      boardClassName="task-queue-board"
      columnBodyClassName="task-queue-board-column-body"
      columnClassName="task-queue-board-column"
      columnCountClassName="task-queue-board-column-count"
      columnEmptyClassName="task-queue-board-column-empty"
      columnHeaderClassName="task-queue-board-column-header"
      columns={TASK_QUEUE_BOARD_COLUMNS.map(({ state }) => ({
        state,
        count: tasksByState[state].length,
        header: (
          <span className={getStatusPillClassName(state)}>
            <span aria-hidden="true" className="task-queue-board-column-header-icon">
              <TimelineTaskStatusLogo
                compact
                signal={TASK_QUEUE_BOARD_STATE_LOGO_SPECS[state].signal}
                status={TASK_QUEUE_BOARD_STATE_LOGO_SPECS[state].status}
              />
            </span>
            <span className="task-queue-board-column-header-label">
              {formatTaskQueueBoardState(state)}
            </span>
          </span>
        ),
      }))}
      emptyLabel="No tasks"
      itemsByState={tasksByState}
      renderItem={(task) => {
        const boardState = getTaskQueueBoardState(task, bootstrap);
        const person = getTaskCardPerson(task, membersById);
        const disciplineAccentColor = task.disciplineId
          ? getTimelineTaskDisciplineColor(task.disciplineId, disciplinesById)
          : null;
        const cardStyle = disciplineAccentColor
          ? ({
              "--task-queue-board-card-discipline-accent": disciplineAccentColor,
            } as CSSProperties)
          : undefined;

        return (
          <button
            className={`task-queue-board-card editable-hover-target editable-hover-target-row${
              disciplineAccentColor ? " task-queue-board-card-discipline-accented" : ""
            }`}
            data-board-state={boardState}
            data-tutorial-target="edit-task-row"
            key={task.id}
            onClick={() => openEditTaskModal(task)}
            style={cardStyle}
            type="button"
          >
            <div className="task-queue-board-card-header">
              <strong>{task.title}</strong>
              <span className="task-queue-board-card-due">
                Due {formatDate(task.dueDate)}
              </span>
            </div>
            <small className="task-queue-board-card-summary">{task.summary}</small>
            <div
              className={`task-queue-board-card-meta${showProjectOnCards ? "" : " task-queue-board-card-meta-person-only"}`}
            >
              {showProjectOnCards ? (
                <span>{projectsById[task.projectId]?.name ?? "Unknown project"}</span>
              ) : showProjectContextOnCards ? (
                <span
                  className="task-queue-board-card-context-chip"
                  title={getTaskQueueCardContextLabel(
                    task,
                    isNonRobotProject ? "operations" : "robot",
                    subsystemsById,
                    workstreamsById,
                  )}
                >
                  {getTaskQueueCardContextLabel(
                    task,
                    isNonRobotProject ? "operations" : "robot",
                    subsystemsById,
                    workstreamsById,
                  )}
                </span>
              ) : null}
              <div className="task-queue-board-card-meta-person-group">
                <TaskPriorityBadge priority={task.priority} />
                {person ? (
                  <span className="task-queue-board-card-person" title={person.name}>
                    {person.photoUrl ? (
                      <img
                        alt={`${person.name} profile picture`}
                        className="profile-avatar"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        src={person.photoUrl}
                      />
                    ) : (
                      <span className="profile-avatar profile-avatar-fallback" aria-hidden="true">
                        {getMemberInitial(person)}
                      </span>
                    )}
                  </span>
                ) : null}
              </div>
            </div>
            <EditableHoverIndicator className="task-queue-board-card-hover" />
          </button>
        );
      }}
    />
  );
}
