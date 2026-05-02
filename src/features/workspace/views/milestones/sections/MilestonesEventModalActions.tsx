interface MilestonesEventModalActionsProps {
  eventModalMode: "create" | "edit" | null;
  isDeletingEvent: boolean;
  isSavingEvent: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function MilestonesEventModalActions({
  eventModalMode,
  isDeletingEvent,
  isSavingEvent,
  onClose,
  onDelete,
}: MilestonesEventModalActionsProps) {
  return (
    <div className="modal-actions modal-wide">
      {eventModalMode === "edit" ? (
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
        {isSavingEvent ? "Saving..." : eventModalMode === "create" ? "Add milestone" : "Save milestone"}
      </button>
    </div>
  );
}
