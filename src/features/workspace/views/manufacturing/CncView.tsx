import type { BootstrapPayload, ManufacturingItemRecord } from "@/types";
import {
  type FilterSelection,
  type MembersById,
  type SubsystemsById,
} from "@/features/workspace/shared";
import { ManufacturingQueueView } from "./ManufacturingQueueView";

interface CncViewProps {
  activePersonFilter: FilterSelection;
  bootstrap: BootstrapPayload;
  items: ManufacturingItemRecord[];
  membersById: MembersById;
  onCreate: () => void;
  onEdit: (item: ManufacturingItemRecord) => void;
  onQuickStatusChange?: (
    item: ManufacturingItemRecord,
    status: ManufacturingItemRecord["status"],
  ) => Promise<void>;
  showMentorQuickActions?: boolean;
  subsystemsById: SubsystemsById;
}

export function CncView({
  activePersonFilter,
  bootstrap,
  items,
  membersById,
  onCreate,
  onEdit,
  onQuickStatusChange,
  showMentorQuickActions = false,
  subsystemsById,
}: CncViewProps) {
  return (
    <ManufacturingQueueView
      activePersonFilter={activePersonFilter}
      addButtonAriaLabel="Add CNC job"
      bootstrap={bootstrap}
      emptyStateMessage="No CNC jobs match the current filters."
      items={items}
      membersById={membersById}
      onCreate={onCreate}
      onEdit={onEdit}
      onQuickStatusChange={onQuickStatusChange}
      showMentorQuickActions={showMentorQuickActions}
      showInHouseColumn
      subsystemsById={subsystemsById}
      title="cnc"
      tutorialTargetPrefix="cnc"
    />
  );
}
