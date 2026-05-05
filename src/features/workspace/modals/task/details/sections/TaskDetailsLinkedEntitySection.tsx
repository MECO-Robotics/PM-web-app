// Shared collapsible section renderer for linked mechanism/part lists.
import type { ReactNode } from "react";
import { IconTrash } from "@/components/shared/Icons";
import { TaskDetailReveal } from "../TaskDetailReveal";

interface TaskDetailsLinkedEntityRow {
  id: string;
  label: string;
}

interface TaskDetailsLinkedEntitySectionProps {
  title: string;
  canInlineEdit: boolean;
  open: boolean;
  onToggle: (open: boolean) => void;
  onDoubleClick?: () => void;
  addControl?: ReactNode;
  rows: TaskDetailsLinkedEntityRow[];
  removeEntityLabel: string;
  onRemove: (id: string) => void;
  rowButtonClassName: string;
  emptyText: string;
  readOnlyContent?: ReactNode;
}

export function TaskDetailsLinkedEntitySection(props: TaskDetailsLinkedEntitySectionProps) {
  const {
    title,
    canInlineEdit,
    open,
    onToggle,
    onDoubleClick,
    addControl,
    rows,
    removeEntityLabel,
    onRemove,
    rowButtonClassName,
    emptyText,
    readOnlyContent,
  } = props;

  return (
    <label className="field task-detail-row task-detail-collapsible-field">
      <details
        className="task-detail-collapsible"
        open={open}
        onDoubleClick={canInlineEdit ? undefined : onDoubleClick}
        onToggle={(event) => onToggle(event.currentTarget.open)}
      >
        <summary className="task-detail-collapsible-summary">
          <span className="task-detail-collapsible-summary-main">
            <span className="task-detail-collapsible-icon" aria-hidden="true"></span>
            <span className="task-detail-copy">{title}</span>
          </span>
          {canInlineEdit ? addControl : null}
        </summary>
        <div className="task-detail-collapsible-body">
          {rows.length > 0 ? (
            <div className="task-details-dependency-editor">
              {rows.map((row, index) => (
                <div
                  className="workspace-detail-list-item task-detail-list-item task-details-dependency-row task-details-dependency-row-with-delete"
                  key={row.id}
                >
                  <button
                    aria-label={`Remove ${removeEntityLabel} ${index + 1}`}
                    className="icon-button task-details-dependency-row-remove-button"
                    onClick={() => onRemove(row.id)}
                    type="button"
                  >
                    <IconTrash />
                  </button>
                  <div className={`task-details-dependency-row-button ${rowButtonClassName}`}>
                    <TaskDetailReveal
                      className="task-detail-ellipsis-reveal"
                      style={{ color: "var(--text-title)", fontWeight: 800 }}
                      text={row.label}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : !canInlineEdit ? (
            readOnlyContent
          ) : (
            <p className="task-detail-copy task-detail-empty" style={{ margin: "0.25rem 0 0" }}>
              {emptyText}
            </p>
          )}
        </div>
      </details>
    </label>
  );
}
