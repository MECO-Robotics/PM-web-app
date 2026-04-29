import type { BootstrapPayload, TaskStatus } from "@/types";

export type TimelineTaskDependencyRecord = NonNullable<BootstrapPayload["taskDependencies"]>[number];
export type TimelineTaskBlockerRecord = NonNullable<BootstrapPayload["taskBlockers"]>[number];
export type TimelineTaskStatusSignal = TaskStatus | "blocked" | "waiting-on-dependency";

export interface TimelineTaskDependencyCounts {
  incoming: number;
  outgoing: number;
}

const BLOCKING_DEPENDENCY_TYPES = new Set<TimelineTaskDependencyRecord["dependencyType"]>([
  "blocks",
  "finish_to_start",
]);

const EMPTY_DEPENDENCY_COUNTS: TimelineTaskDependencyCounts = {
  incoming: 0,
  outgoing: 0,
};

export function getTaskDependencyCounts(
  taskId: string,
  dependencies: TimelineTaskDependencyRecord[] = [],
): TimelineTaskDependencyCounts {
  let incoming = 0;
  let outgoing = 0;

  dependencies.forEach((dependency) => {
    if (dependency.downstreamTaskId === taskId) {
      incoming += 1;
    }
    if (dependency.upstreamTaskId === taskId) {
      outgoing += 1;
    }
  });

  return { incoming, outgoing };
}

function getOrCreateDependencyCounts(
  dependencyCountsByTaskId: Record<string, TimelineTaskDependencyCounts>,
  taskId: string,
) {
  dependencyCountsByTaskId[taskId] ??= { incoming: 0, outgoing: 0 };
  return dependencyCountsByTaskId[taskId];
}

export function buildTaskDependencyCountsByTaskId(
  dependencies: TimelineTaskDependencyRecord[] = [],
): Record<string, TimelineTaskDependencyCounts> {
  const dependencyCountsByTaskId: Record<string, TimelineTaskDependencyCounts> = {};

  dependencies.forEach((dependency) => {
    getOrCreateDependencyCounts(dependencyCountsByTaskId, dependency.downstreamTaskId).incoming += 1;
    getOrCreateDependencyCounts(dependencyCountsByTaskId, dependency.upstreamTaskId).outgoing += 1;
  });

  return dependencyCountsByTaskId;
}

export function getTaskDependencyCountsFromLookup(
  dependencyCountsByTaskId: Record<string, TimelineTaskDependencyCounts>,
  taskId: string,
) {
  return dependencyCountsByTaskId[taskId] ?? EMPTY_DEPENDENCY_COUNTS;
}

function hasActiveTaskBlocker(
  task: BootstrapPayload["tasks"][number],
  blockers: TimelineTaskBlockerRecord[] = [],
) {
  return (
    task.blockers.length > 0 ||
    blockers.some((blocker) => blocker.blockedTaskId === task.id && blocker.status === "open")
  );
}

function waitsOnIncompleteDependency(
  task: BootstrapPayload["tasks"][number],
  tasksById: Record<string, BootstrapPayload["tasks"][number]>,
  dependencies: TimelineTaskDependencyRecord[] = [],
) {
  if (task.status === "complete") {
    return false;
  }

  const waitsOnDependencyRecord = dependencies.some((dependency) => {
    if (
      dependency.downstreamTaskId !== task.id ||
      !BLOCKING_DEPENDENCY_TYPES.has(dependency.dependencyType)
    ) {
      return false;
    }

    return tasksById[dependency.upstreamTaskId]?.status !== "complete";
  });

  return (
    waitsOnDependencyRecord ||
    task.dependencyIds.some((dependencyId) => tasksById[dependencyId]?.status !== "complete")
  );
}

export function getTimelineTaskStatusSignal(
  task: BootstrapPayload["tasks"][number],
  bootstrap: BootstrapPayload,
): TimelineTaskStatusSignal {
  if (hasActiveTaskBlocker(task, bootstrap.taskBlockers)) {
    return "blocked";
  }

  const tasksById = Object.fromEntries(bootstrap.tasks.map((candidate) => [candidate.id, candidate]));
  if (waitsOnIncompleteDependency(task, tasksById, bootstrap.taskDependencies)) {
    return "waiting-on-dependency";
  }

  return task.status;
}

export function buildTimelineTaskStatusSignalByTaskId(
  bootstrap: BootstrapPayload,
): Record<string, TimelineTaskStatusSignal> {
  const tasksById = Object.fromEntries(bootstrap.tasks.map((task) => [task.id, task]));

  return Object.fromEntries(
    bootstrap.tasks.map((task) => {
      const signal = hasActiveTaskBlocker(task, bootstrap.taskBlockers)
        ? "blocked"
        : waitsOnIncompleteDependency(task, tasksById, bootstrap.taskDependencies)
          ? "waiting-on-dependency"
          : task.status;

      return [task.id, signal];
    }),
  );
}
