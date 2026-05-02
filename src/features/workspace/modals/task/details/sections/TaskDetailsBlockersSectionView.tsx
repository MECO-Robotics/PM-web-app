import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload } from "@/types";
import { FilterDropdown } from "../../../../shared/WorkspaceViewShared";
import { IconParts, IconTasks } from "@/components/shared/Icons";
import { useTaskDetailsBlockersSectionModel } from "./useTaskDetailsBlockersSectionModel";

interface TaskDetailsBlockersSectionViewProps {
  activeTaskId: string;
  bootstrap: BootstrapPayload;
  canInlineEdit: boolean;
  onResolveTaskBlocker: (blockerId: string) => Promise<void>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}

export function TaskDetailsBlockersSectionView(props: TaskDetailsBlockersSectionViewProps) {
  const { activeTaskId, bootstrap, canInlineEdit, onResolveTaskBlocker, setTaskDraft, taskDraft } =
    props;
  const model = useTaskDetailsBlockersSectionModel({
    activeTaskId,
    bootstrap,
    onResolveTaskBlocker,
    setTaskDraft,
    taskDraft,
  });

  return (
    <div className="task-detail-blocker-split-column">
      <span style={{ color: "var(--text-title)" }}>Blockers</span>
      {canInlineEdit ? (
        <div className="task-details-blocker-editor">
          {model.blockerDrafts.length > 0 ? (
            model.blockerDrafts.map((blocker, index) => (
              <div className="task-details-blocker-editor-row" key={blocker.id ?? `blocker-${index}`}>
                <FilterDropdown
                  allLabel="Type"
                  ariaLabel="Set blocker type"
                  buttonInlineEditField={`blocker-type-${index}`}
                  className="task-queue-filter-menu-submenu task-details-blocker-type-menu"
                  menuClassName="task-details-blocker-menu-popup"
                  icon={<IconTasks />}
                  portalMenu
                  onChange={(selection) => {
                    const nextType = selection[0] as Parameters<
                      typeof model.updateBlockerType
                    >[1] | undefined;
                    if (!nextType) {
                      return;
                    }
                    model.updateBlockerType(index, nextType);
                  }}
                  options={model.blockerTypeOptions}
                  showAllOption={false}
                  singleSelect
                  value={[blocker.blockerType]}
                />
                {blocker.blockerType === "task" ? (
                  <FilterDropdown
                    allLabel="Select task"
                    ariaLabel="Set blocker task"
                    buttonInlineEditField={`blocker-target-${index}`}
                    className="task-queue-filter-menu-submenu task-details-blocker-target-menu"
                    menuClassName="task-details-blocker-menu-popup"
                    icon={<IconTasks />}
                    portalMenu
                    onChange={(selection) => model.updateBlockerTarget(index, selection[0] ?? null)}
                    options={model.blockerTaskOptions}
                    singleSelect
                    value={blocker.blockerId ? [blocker.blockerId] : []}
                  />
                ) : blocker.blockerType === "part_instance" ? (
                  <FilterDropdown
                    allLabel="Select part"
                    ariaLabel="Set blocker part"
                    buttonInlineEditField={`blocker-target-${index}`}
                    className="task-queue-filter-menu-submenu task-details-blocker-target-menu"
                    menuClassName="task-details-blocker-menu-popup"
                    icon={<IconParts />}
                    portalMenu
                    onChange={(selection) => model.updateBlockerTarget(index, selection[0] ?? null)}
                    options={model.partOptions}
                    singleSelect
                    value={blocker.blockerId ? [blocker.blockerId] : []}
                  />
                ) : blocker.blockerType === "event" ? (
                  <FilterDropdown
                    allLabel="Select milestone"
                    ariaLabel="Set blocker milestone"
                    buttonInlineEditField={`blocker-target-${index}`}
                    className="task-queue-filter-menu-submenu task-details-blocker-target-menu"
                    menuClassName="task-details-blocker-menu-popup"
                    icon={<IconTasks />}
                    portalMenu
                    onChange={(selection) => model.updateBlockerTarget(index, selection[0] ?? null)}
                    options={model.blockerEventOptions}
                    singleSelect
                    value={blocker.blockerId ? [blocker.blockerId] : []}
                  />
                ) : (
                  <input
                    aria-label={`Blocker note ${index + 1}`}
                    className="task-detail-inline-edit-input task-details-blocker-input"
                    onChange={(event) =>
                      model.updateBlockerDraft(index, { description: event.target.value })
                    }
                    placeholder="Describe blocker"
                    value={blocker.description}
                  />
                )}
                <button
                  aria-label={`Remove blocker ${index + 1}`}
                  className="icon-button task-details-blocker-remove-button"
                  onClick={() => model.removeBlockerDraft(index)}
                  type="button"
                >
                  {"\u00D7"}
                </button>
              </div>
            ))
          ) : (
            <p className="task-detail-copy task-detail-empty" style={{ margin: "0.25rem 0 0" }}>
              No blockers yet
            </p>
          )}
          <div className="task-details-blocker-editor-actions">
            <FilterDropdown
              allLabel="Add blocker"
              ariaLabel="Add blocker"
              buttonInlineEditField="add-blocker"
              className="task-queue-filter-menu-submenu task-details-blocker-add-menu"
              menuClassName="task-details-blocker-menu-popup task-details-blocker-add-menu-popup"
              icon={<IconTasks />}
              portalMenu
              portalMenuPlacement="below"
              onChange={(selection) => {
                const nextType = (selection[0] as Parameters<
                  typeof model.addBlockerDraft
                >[0] | undefined) ?? null;
                if (!nextType) {
                  return;
                }
                model.addBlockerDraft(nextType);
              }}
              options={model.blockerTypeOptions}
              showAllOption={false}
              singleSelect
              value={[]}
            />
          </div>
        </div>
      ) : model.openBlockerRows.length > 0 ? (
        <div className="workspace-detail-list task-detail-list" style={{ marginTop: "0.5rem" }}>
          {model.openBlockerRows.map((blocker) => (
            <div className="workspace-detail-list-item task-detail-list-item" key={blocker.id}>
              <div style={{ minWidth: 0, flex: "1 1 auto", display: "grid", gap: "0.1rem" }}>
                <strong
                  className="task-detail-ellipsis-reveal"
                  data-full-text={blocker.description}
                  style={{ color: "var(--text-title)" }}
                >
                  {blocker.description}
                </strong>
                <div
                  className="task-detail-ellipsis-reveal"
                  data-full-text={`${blocker.blockerType.replace("_", " ")}${
                    blocker.blockerType === "task" && blocker.blockerTaskName
                      ? ` ? ${blocker.blockerTaskName}`
                      : ""
                  }${blocker.severity ? ` ? ${blocker.severity}` : ""}`}
                  style={{ color: "var(--text-copy)", fontSize: "0.8rem" }}
                >
                  {blocker.blockerType.replace("_", " ")}
                  {blocker.blockerType === "task" && blocker.blockerTaskName
                    ? ` ? ${blocker.blockerTaskName}`
                    : ""}
                  {blocker.severity ? ` ? ${blocker.severity}` : ""}
                </div>
              </div>
              <button
                className="secondary-action"
                onClick={() => void model.onResolveTaskBlocker(blocker.id)}
                type="button"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="task-detail-copy task-detail-empty" style={{ margin: "0.25rem 0 0" }}>
          None
        </p>
      )}
    </div>
  );
}
