import { createElement, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload } from "@/types";
import type { TaskBlockerDraft, TaskBlockerType } from "@/types";
import { getTaskOpenBlockersForTask } from "../../../../shared/task/taskTargeting";
import { TimelineTaskStatusLogo } from "../../../../views/timeline/TimelineTaskStatusLogo";
import { getTimelineTaskStatusSignal } from "../../../../views/timeline/timelineGridBodyUtils";
import { formatIterationVersion } from "@/lib/appUtils";
import { IconPerson } from "@/components/shared/Icons";

interface UseTaskDetailsBlockersSectionModelArgs {
  activeTaskId: string;
  bootstrap: BootstrapPayload;
  onResolveTaskBlocker: (blockerId: string) => Promise<void>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}

function getBlockerTypeDescription(blockerType: TaskBlockerType) {
  return blockerType === "task"
    ? "Waiting on task"
    : blockerType === "part_instance"
      ? "Waiting on part"
      : blockerType === "event"
        ? "Waiting on milestone"
        : "";
}

export function useTaskDetailsBlockersSectionModel({
  activeTaskId,
  bootstrap,
  onResolveTaskBlocker,
  setTaskDraft,
  taskDraft,
}: UseTaskDetailsBlockersSectionModelArgs) {
  const blockerDrafts = taskDraft?.taskBlockers ?? [];
  const openBlockers = getTaskOpenBlockersForTask(activeTaskId, bootstrap);
  const tasksById = Object.fromEntries(bootstrap.tasks.map((task) => [task.id, task] as const));
  const partDefinitionsById = Object.fromEntries(
    bootstrap.partDefinitions.map((partDefinition) => [partDefinition.id, partDefinition] as const),
  );
  const selectedSubsystemIds =
    (taskDraft?.subsystemIds?.length
      ? taskDraft.subsystemIds
      : taskDraft?.subsystemId
        ? [taskDraft.subsystemId]
        : []) ?? [];
  const blockerTaskOptions = bootstrap.tasks
    .filter((task) => {
      if (task.projectId !== taskDraft?.projectId || task.id === activeTaskId) {
        return false;
      }

      const taskSubsystemIds =
        task.subsystemIds.length > 0
          ? task.subsystemIds
          : task.subsystemId
            ? [task.subsystemId]
            : [];
      return taskSubsystemIds.some((subsystemId) => selectedSubsystemIds.includes(subsystemId));
    })
    .map((task) => ({
      id: task.id,
      name: task.title,
      icon: createElement(TimelineTaskStatusLogo, {
        compact: true,
        signal: getTimelineTaskStatusSignal(task, bootstrap),
        status: task.status,
      }),
    }));
  const blockerEventOptions = bootstrap.events.map((event) => ({
    id: event.id,
    name: event.title,
  }));
  const partOptions = bootstrap.partInstances.map((partInstance) => {
    const partDefinition = partDefinitionsById[partInstance.partDefinitionId];
    return {
      id: partInstance.id,
      name: partDefinition
        ? `${partInstance.name} (${partDefinition.name} (${formatIterationVersion(partDefinition.iteration)}))`
        : partInstance.name,
    };
  });
  const blockerTypeOptions: Array<{ id: TaskBlockerType; name: string; icon: ReactNode }> = [
    {
      id: "external",
      name: "Other",
      icon: createElement(IconPerson),
    },
  ];
  const openBlockerRows = openBlockers.map((blocker) => {
    const blockerTaskName =
      blocker.blockerType === "task" && blocker.blockerId
        ? tasksById[blocker.blockerId]?.title ?? "Unknown task"
        : null;

    return {
      ...blocker,
      blockerTaskName,
    };
  });
  const getBlockerDescription = (blocker: TaskBlockerDraft) => {
    switch (blocker.blockerType) {
      case "task":
        return blocker.blockerId
          ? `Waiting on task: ${
              blockerTaskOptions.find((option) => option.id === blocker.blockerId)?.name ??
              "Unknown task"
            }`
          : "Waiting on task";
      case "part_instance":
        return blocker.blockerId
          ? `Waiting on part: ${
              partOptions.find((option) => option.id === blocker.blockerId)?.name ?? "Unknown part"
            }`
          : "Waiting on part";
      case "event":
        return blocker.blockerId
          ? `Waiting on milestone: ${
              blockerEventOptions.find((option) => option.id === blocker.blockerId)?.name ??
              "Unknown milestone"
            }`
          : "Waiting on milestone";
      default:
        return blocker.description.trim();
    }
  };
  const addBlockerDraft = (blockerType: TaskBlockerType) => {
    setTaskDraft?.((current) => ({
      ...current,
      taskBlockers: [
        ...(current.taskBlockers ?? []),
        {
          blockerType,
          blockerId: null,
          description: getBlockerTypeDescription(blockerType),
          severity: "medium",
        },
      ],
    }));
  };
  const updateBlockerDraft = (index: number, updates: Partial<TaskBlockerDraft>) => {
    setTaskDraft?.((current) => {
      const nextBlockers = [...(current.taskBlockers ?? [])];
      const existingBlocker = nextBlockers[index];
      if (!existingBlocker) {
        return current;
      }

      nextBlockers[index] = {
        ...existingBlocker,
        ...updates,
      };

      return {
        ...current,
        taskBlockers: nextBlockers,
      };
    });
  };
  const updateBlockerType = (index: number, blockerType: TaskBlockerType) => {
    updateBlockerDraft(index, {
      blockerType,
      blockerId: null,
      description: getBlockerTypeDescription(blockerType),
    });
  };
  const updateBlockerTarget = (index: number, blockerId: string | null) => {
    const blocker = blockerDrafts[index];
    if (!blocker) {
      return;
    }

    updateBlockerDraft(index, {
      blockerId,
      description: getBlockerDescription({ ...blocker, blockerId }),
    });
  };
  const removeBlockerDraft = (index: number) => {
    setTaskDraft?.((current) => ({
      ...current,
      taskBlockers: (current.taskBlockers ?? []).filter(
        (_blocker, currentIndex) => currentIndex !== index,
      ),
    }));
  };

  return {
    addBlockerDraft,
    blockerDrafts,
    blockerEventOptions,
    blockerTaskOptions,
    blockerTypeOptions,
    openBlockerRows,
    onResolveTaskBlocker,
    partOptions,
    removeBlockerDraft,
    updateBlockerDraft,
    updateBlockerTarget,
    updateBlockerType,
  };
}
