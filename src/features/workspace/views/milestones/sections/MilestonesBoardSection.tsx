import { KanbanScrollFrame } from "@/features/workspace/views/kanban/KanbanScrollFrame";
import type { BootstrapPayload, MilestoneRecord } from "@/types";

import { MilestoneKanbanBoard } from "../MilestoneKanbanBoard";

interface MilestonesBoardSectionProps {
  bootstrap: BootstrapPayload;
  milestones: MilestoneRecord[];
  motionClassName: string;
  onOpenMilestone: (milestone: MilestoneRecord) => void;
  projectLabelByMilestoneId: Record<string, string>;
}

export function MilestonesBoardSection({
  bootstrap,
  milestones,
  motionClassName,
  onOpenMilestone,
  projectLabelByMilestoneId,
}: MilestonesBoardSectionProps) {
  return milestones.length > 0 ? (
    <KanbanScrollFrame motionClassName={motionClassName}>
      <MilestoneKanbanBoard
        bootstrap={bootstrap}
        milestones={milestones}
        onOpenMilestone={onOpenMilestone}
        projectLabelByMilestoneId={projectLabelByMilestoneId}
      />
    </KanbanScrollFrame>
  ) : (
    <p className="empty-state">No milestones match the current filters.</p>
  );
}
