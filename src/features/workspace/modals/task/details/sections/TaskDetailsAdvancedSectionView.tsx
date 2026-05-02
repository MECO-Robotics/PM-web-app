import type { Dispatch, SetStateAction } from "react";
import type { BootstrapPayload, TaskPayload, TaskRecord } from "@/types";
import { EditableHoverIndicator, FilterDropdown } from "../../../../shared/WorkspaceViewShared";
import { IconManufacturing, IconParts } from "@/components/shared/Icons";
import type { TaskDetailsEditableField } from "../../taskModalTypes";
import { useTaskDetailsAdvancedSectionModel } from "./useTaskDetailsAdvancedSectionModel";

interface TaskDetailsAdvancedSectionViewProps {
  activeTask: TaskRecord;
  bootstrap: BootstrapPayload;
  canInlineEdit: boolean;
  editingField: TaskDetailsEditableField | null;
  openTaskEditModal: () => void;
  setEditingField: Dispatch<SetStateAction<TaskDetailsEditableField | null>>;
  setTaskDraft?: Dispatch<SetStateAction<TaskPayload>>;
  taskDraft?: TaskPayload;
}

export function TaskDetailsAdvancedSectionView(props: TaskDetailsAdvancedSectionViewProps) {
  const {
    activeTask,
    bootstrap,
    canInlineEdit,
    editingField,
    openTaskEditModal,
    setEditingField,
    setTaskDraft,
    taskDraft,
  } = props;
  const model = useTaskDetailsAdvancedSectionModel({
    activeTask,
    bootstrap,
    setEditingField,
    setTaskDraft,
    taskDraft,
  });
  const editableTask = model.editableTask;

  return (
    <details className="task-details-section-collapse modal-wide">
      <summary className="task-details-section-title task-details-section-summary">
        <span>Advanced</span>
      </summary>
      <div className="task-details-section-grid">
        <label className="field task-detail-row">
          <span style={{ color: "var(--text-title)" }}>Discipline</span>
          {canInlineEdit ? (
            editingField === "discipline" ? (
              <FilterDropdown
                allLabel="Not set"
                ariaLabel="Set task discipline"
                buttonInlineEditField="discipline"
                className="task-queue-filter-menu-submenu"
                icon={<IconManufacturing />}
                getOptionToneClassName={model.getDisciplineOptionToneClassName}
                getSelectedToneClassName={(selection) =>
                  selection[0]
                    ? model.getDisciplineOptionToneClassName({ id: selection[0] })
                    : undefined
                }
                singleSelect
                onChange={model.handleDisciplineChange}
                options={model.availableDisciplines}
                value={editableTask.disciplineId ? [editableTask.disciplineId] : []}
              />
            ) : (
              <span className="task-detail-inline-edit-shell task-detail-inline-edit-shell-inline task-detail-inline-edit-shell-inline-left">
                <button
                  className="task-detail-inline-edit-trigger task-detail-inline-edit-trigger-inline"
                  data-inline-edit-field="discipline"
                  onClick={() => setEditingField("discipline")}
                  type="button"
                >
                  <span className={model.disciplinePillClassName}>{model.disciplineText}</span>
                </button>
                <EditableHoverIndicator className="editable-hover-indicator-inline task-detail-inline-edit-indicator" />
              </span>
            )
          ) : (
            <p className="task-detail-copy" onDoubleClick={openTaskEditModal}>
              <span className={model.disciplinePillClassName}>{model.disciplineText}</span>
            </p>
          )}
        </label>
        <label className="field task-detail-row">
          <span style={{ color: "var(--text-title)" }}>{model.subsystemFieldLabel}</span>
          {canInlineEdit ? (
            editingField === "subsystem" ? (
              <FilterDropdown
                allLabel={`No ${model.subsystemFieldLabel.toLowerCase()} linked`}
                ariaLabel={`Set ${model.subsystemFieldLabel.toLowerCase()}`}
                buttonInlineEditField="subsystem"
                className="task-queue-filter-menu-submenu"
                icon={<IconManufacturing />}
                getOptionToneClassName={model.getSubsystemOptionToneClassName}
                getSelectedToneClassName={(selection) =>
                  selection[0]
                    ? model.getSubsystemOptionToneClassName({ id: selection[0] })
                    : undefined
                }
                singleSelect
                onChange={model.handleSubsystemChange}
                options={model.primaryTargetNameOptions.map((name) => ({ id: name, name }))}
                value={model.selectedPrimaryTargetId ? [model.selectedPrimaryTargetId] : []}
              />
            ) : (
              <span className="task-detail-inline-edit-shell task-detail-inline-edit-shell-inline task-detail-inline-edit-shell-inline-left">
                <button
                  className="task-detail-inline-edit-trigger task-detail-inline-edit-trigger-inline"
                  data-inline-edit-field="subsystem"
                  onClick={() => setEditingField("subsystem")}
                  type="button"
                >
                  <span className={model.subsystemPillClassName}>
                    {model.subsystemNames.length > 0
                      ? model.subsystemNames.join(", ")
                      : "No subsystem linked"}
                  </span>
                </button>
                <EditableHoverIndicator className="editable-hover-indicator-inline task-detail-inline-edit-indicator" />
              </span>
            )
          ) : (
            <p className="task-detail-copy" onDoubleClick={openTaskEditModal}>
              <span className={model.subsystemPillClassName}>
                {model.subsystemNames.length > 0 ? model.subsystemNames.join(", ") : "No subsystem linked"}
              </span>
            </p>
          )}
        </label>
        <label className="field task-detail-row">
          <span style={{ color: "var(--text-title)" }}>Start date</span>
          {canInlineEdit ? (
            editingField === "startDate" ? (
              <input
                aria-label="Start date"
                autoFocus
                className="task-detail-inline-edit-input task-detail-inline-edit-input-date"
                data-inline-edit-field="startDate"
                onBlur={() => setEditingField(null)}
                onChange={model.handleStartDateChange}
                type="date"
                value={editableTask.startDate}
              />
            ) : (
              <span className="task-detail-inline-edit-shell task-detail-inline-edit-shell-inline task-detail-inline-edit-shell-inline-left">
                <button
                  className="task-detail-inline-edit-trigger task-detail-inline-edit-trigger-inline"
                  data-inline-edit-field="startDate"
                  onClick={() => setEditingField("startDate")}
                  type="button"
                >
                  <span className="pill status-pill status-pill-neutral">
                    {new Date(`${editableTask.startDate}T00:00:00`).toLocaleDateString()}
                  </span>
                </button>
                <EditableHoverIndicator className="editable-hover-indicator-inline task-detail-inline-edit-indicator" />
              </span>
            )
          ) : (
            <p className="task-detail-copy" onDoubleClick={openTaskEditModal}>
              <span className="pill status-pill status-pill-neutral">
                {new Date(`${editableTask.startDate}T00:00:00`).toLocaleDateString()}
              </span>
            </p>
          )}
        </label>
        <label className="field modal-wide task-detail-row task-detail-collapsible-field">
          <details className="task-detail-collapsible" onDoubleClick={canInlineEdit ? undefined : openTaskEditModal}>
            <summary className="task-detail-collapsible-summary">
              <span className="task-detail-collapsible-icon" aria-hidden="true"></span>
              <span className="task-detail-copy">{canInlineEdit ? "Mechanism" : "Mechanisms"}</span>
            </summary>
            <div className="task-detail-collapsible-body">
              {canInlineEdit ? (
                editingField === "mechanism" ? (
                  model.projectMechanisms.length > 0 ? (
                    <FilterDropdown
                      allLabel="No mechanism linked"
                      ariaLabel="Set task mechanisms"
                      buttonInlineEditField="mechanism"
                      className="task-queue-filter-menu-submenu"
                      menuClassName="task-details-blocker-menu-popup"
                      icon={<IconManufacturing />}
                      onChange={model.handleMechanismChange}
                      options={model.projectMechanisms.map((mechanism) => ({
                        id: mechanism.id,
                        name: `${mechanism.name} (${mechanism.iteration})`,
                      }))}
                      portalMenu
                      value={model.selectedMechanismIds}
                    />
                  ) : (
                    <p className="task-detail-copy task-detail-empty" style={{ margin: "0.25rem 0 0" }}>
                      No mechanism linked
                    </p>
                  )
                ) : (
                  <span className="task-detail-inline-edit-shell task-detail-inline-edit-shell-inline">
                    <button
                      className="task-detail-inline-edit-trigger task-detail-inline-edit-trigger-inline"
                      data-inline-edit-field="mechanism"
                      onClick={() => setEditingField("mechanism")}
                      type="button"
                    >
                      <span className="task-detail-copy">
                        {model.mechanismNames.length > 0 ? model.mechanismNames.join(", ") : "No mechanism linked"}
                      </span>
                    </button>
                    <EditableHoverIndicator className="editable-hover-indicator-inline task-detail-inline-edit-indicator" />
                  </span>
                )
              ) : model.mechanismNames.length > 0 ? (
                <div className="task-details-mechanism-list">
                  {model.mechanismNames.map((mechanismName, index) => (
                    <div className="task-details-mechanism-item" key={`${mechanismName}-${index}`}>
                      <span className="task-detail-ellipsis-reveal" data-full-text={mechanismName}>
                        {mechanismName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="task-detail-copy task-detail-empty" style={{ margin: "0.25rem 0 0" }}>
                  No mechanism linked
                </p>
              )}
            </div>
          </details>
        </label>
        <label className="field modal-wide task-detail-row task-detail-collapsible-field">
          <details className="task-detail-collapsible" onDoubleClick={canInlineEdit ? undefined : openTaskEditModal}>
            <summary className="task-detail-collapsible-summary">
              <span className="task-detail-collapsible-icon" aria-hidden="true"></span>
              <span className="task-detail-copy">Parts</span>
            </summary>
            <div className="task-detail-collapsible-body">
              {canInlineEdit ? (
                editingField === "parts" ? (
                  model.projectPartInstances.length > 0 ? (
                    <FilterDropdown
                      allLabel="No part linked"
                      ariaLabel="Set task parts"
                      buttonInlineEditField="parts"
                      className="task-queue-filter-menu-submenu"
                      menuClassName="task-details-blocker-menu-popup"
                      icon={<IconParts />}
                      onChange={model.handlePartsChange}
                      options={model.projectPartInstances.map((partInstance) => ({
                        id: partInstance.id,
                        name: `${partInstance.name}`,
                      }))}
                      portalMenu
                      value={model.selectedPartInstanceIds}
                    />
                  ) : (
                    <p className="task-detail-copy task-detail-empty" style={{ margin: "0.25rem 0 0" }}>
                      No part linked
                    </p>
                  )
                ) : (
                  <span className="task-detail-inline-edit-shell task-detail-inline-edit-shell-inline">
                    <button
                      className="task-detail-inline-edit-trigger task-detail-inline-edit-trigger-inline"
                      data-inline-edit-field="parts"
                      onClick={() => setEditingField("parts")}
                      type="button"
                    >
                      <span className="task-detail-copy">{model.partsText}</span>
                    </button>
                    <EditableHoverIndicator className="editable-hover-indicator-inline task-detail-inline-edit-indicator" />
                  </span>
                )
              ) : (
                <p className="task-detail-copy">
                  <span className="task-detail-ellipsis-reveal" data-full-text={model.partsText}>
                    {model.partsText}
                  </span>
                </p>
              )}
            </div>
          </details>
        </label>
      </div>
    </details>
  );
}
