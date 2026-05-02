import { KanbanScrollFrame } from "@/features/workspace/views/kanban/KanbanScrollFrame";
import type { BootstrapPayload, EventRecord } from "@/types";

import { MilestoneKanbanBoard } from "../MilestoneKanbanBoard";

interface MilestonesBoardSectionProps {
  events: EventRecord[];
  motionClassName: string;
  onOpenEvent: (event: EventRecord) => void;
  projectLabelByEventId: Record<string, string>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

export function MilestonesBoardSection({
  events,
  motionClassName,
  onOpenEvent,
  projectLabelByEventId,
  subsystemsById,
}: MilestonesBoardSectionProps) {
  return events.length > 0 ? (
    <KanbanScrollFrame motionClassName={motionClassName}>
      <MilestoneKanbanBoard
        events={events}
        onOpenEvent={onOpenEvent}
        projectLabelByEventId={projectLabelByEventId}
        subsystemsById={subsystemsById}
      />
    </KanbanScrollFrame>
  ) : (
    <p className="empty-state">No milestones match the current filters.</p>
  );
}
