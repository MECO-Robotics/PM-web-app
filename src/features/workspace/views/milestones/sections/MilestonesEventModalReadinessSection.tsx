import type { BootstrapPayload, EventRecord } from "@/types";
import { formatTaskPlanningState } from "@/features/workspace/shared/task/taskPlanning";

import { MilestoneTaskCard } from "./MilestoneTaskCard";

type TaskPlanningState = "blocked" | "at-risk" | "waiting-on-dependency" | "ready" | "overdue";

interface MilestonesEventModalReadinessSectionProps {
  activeEvent: EventRecord | null;
  activeEventCompleteTasks: BootstrapPayload["tasks"];
  activeEventTasks: BootstrapPayload["tasks"];
  bootstrap: BootstrapPayload;
  eventModalMode: "create" | "edit" | null;
  eventTaskGroups: Record<TaskPlanningState, BootstrapPayload["tasks"]>;
  eventTaskOrder: readonly TaskPlanningState[];
}

export function MilestonesEventModalReadinessSection({
  activeEvent,
  activeEventCompleteTasks,
  activeEventTasks,
  bootstrap,
  eventModalMode,
  eventTaskGroups,
  eventTaskOrder,
}: MilestonesEventModalReadinessSectionProps) {
  return eventModalMode === "edit" && activeEvent ? (
    <div className="field modal-wide">
      <span style={{ color: "var(--text-title)" }}>Readiness</span>
      {activeEventTasks.length > 0 ? (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.5rem" }}>
          {eventTaskOrder.map((state) => {
            const tasks = eventTaskGroups[state];
            if (tasks.length === 0) {
              return null;
            }

            return (
              <section key={state} style={{ display: "grid", gap: "0.5rem" }}>
                <h3
                  style={{
                    margin: 0,
                    color: "var(--text-title)",
                    fontSize: "0.9rem",
                    textTransform: "capitalize",
                  }}
                >
                  {formatTaskPlanningState(state)} ({tasks.length})
                </h3>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {tasks.map((task) => (
                    <MilestoneTaskCard key={task.id} bootstrap={bootstrap} task={task} />
                  ))}
                </div>
              </section>
            );
          })}
          {activeEventCompleteTasks.length > 0 ? (
            <section style={{ display: "grid", gap: "0.5rem" }}>
              <h3
                style={{
                  margin: 0,
                  color: "var(--text-title)",
                  fontSize: "0.9rem",
                  textTransform: "capitalize",
                }}
              >
                Complete ({activeEventCompleteTasks.length})
              </h3>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {activeEventCompleteTasks.map((task) => (
                  <MilestoneTaskCard key={task.id} bootstrap={bootstrap} task={task} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <p style={{ margin: "0.25rem 0 0", color: "var(--text-copy)" }}>
          No tasks currently target this milestone.
        </p>
      )}
    </div>
  ) : null;
}
