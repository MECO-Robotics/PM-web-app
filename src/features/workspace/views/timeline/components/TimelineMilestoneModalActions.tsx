interface TimelineMilestoneModalActionsProps {
  isDeletingEvent: boolean;
  isSavingEvent: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onDelete: () => void;
}

export function TimelineMilestoneModalActions({
  isDeletingEvent,
  isSavingEvent,
  mode,
  onClose,
  onDelete,
}: TimelineMilestoneModalActionsProps) {
  return (
    <div className="modal-actions modal-wide">
      {mode === "edit" ? (
        <button
          className="danger-action"
          disabled={isDeletingEvent || isSavingEvent}
          onClick={onDelete}
          type="button"
        >
          {isDeletingEvent ? "Deleting..." : "Delete milestone"}
        </button>
      ) : null}
      <button
        className="secondary-action"
        disabled={isDeletingEvent || isSavingEvent}
        onClick={onClose}
        style={{
          background: "var(--bg-row-alt)",
          color: "var(--text-title)",
          border: "1px solid var(--border-base)",
        }}
        type="button"
      >
        Cancel
      </button>
      <button className="primary-action" disabled={isDeletingEvent || isSavingEvent} type="submit">
        {isSavingEvent ? "Saving..." : mode === "create" ? "Add milestone" : "Save changes"}
      </button>
    </div>
  );
}
