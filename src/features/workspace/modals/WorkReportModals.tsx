import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  BootstrapPayload,
  QaReportPayload,
  TestResultPayload,
  WorkLogPayload,
} from "@/types";
import { PhotoUploadField } from "@/features/workspace/shared/PhotoUploadField";

interface WorkLogEditorModalProps {
  bootstrap: BootstrapPayload;
  closeWorkLogModal: () => void;
  handleWorkLogSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavingWorkLog: boolean;
  requestPhotoUpload: (projectId: string, file: File) => Promise<string>;
  setWorkLogDraft: Dispatch<SetStateAction<WorkLogPayload>>;
  workLogDraft: WorkLogPayload;
}

export function WorkLogEditorModal({
  bootstrap,
  closeWorkLogModal,
  handleWorkLogSubmit,
  isSavingWorkLog,
  requestPhotoUpload,
  setWorkLogDraft,
  workLogDraft,
}: WorkLogEditorModalProps) {
  const selectedTask = bootstrap.tasks.find(
    (task) => task.id === workLogDraft.taskId,
  );
  const workLogPhotoProjectId = selectedTask?.projectId ?? bootstrap.projects[0]?.id ?? null;
  const selectedSubsystem = selectedTask
    ? bootstrap.subsystems.find(
        (subsystem) => subsystem.id === selectedTask.subsystemId,
      )
    : null;

  return (
    <div className="modal-scrim" role="presentation" style={{ zIndex: 2000 }}>
      <section
        aria-modal="true"
        className="modal-card"
        role="dialog"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}
      >
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--meco-blue)" }}>
              Work log editor
            </p>
            <h2 style={{ color: "var(--text-title)" }}>Add work log</h2>
          </div>
          <button
            className="icon-button"
            onClick={closeWorkLogModal}
            type="button"
            style={{ color: "var(--text-copy)", background: "transparent" }}
          >
            Close
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleWorkLogSubmit}
          style={{ color: "var(--text-copy)" }}
        >
          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Task</span>
            <select
              onChange={(event) =>
                setWorkLogDraft((current) => ({
                  ...current,
                  taskId: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={workLogDraft.taskId}
            >
              <option value="" disabled>
                Choose a task
              </option>
              {bootstrap.tasks.map((task) => {
                const subsystemName =
                  task.subsystemIds
                    .map(
                      (subsystemId) =>
                        bootstrap.subsystems.find((subsystem) => subsystem.id === subsystemId)
                          ?.name,
                    )
                    .filter(Boolean)
                    .join(", ") || "Unknown subsystem";

                return (
                  <option key={task.id} value={task.id}>
                    {task.title} - {subsystemName}
                  </option>
                );
              })}
            </select>
            {bootstrap.tasks.length === 0 ? (
              <small style={{ color: "var(--text-copy)" }}>
                No tasks are available in this filtered workspace.
              </small>
            ) : null}
            {selectedTask ? (
              <small style={{ color: "var(--text-copy)" }}>
                {selectedSubsystem?.name ?? "Unknown subsystem"} - {selectedTask.summary}
              </small>
            ) : null}
          </label>

          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Date</span>
            <input
              onChange={(event) =>
                setWorkLogDraft((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              type="date"
              value={workLogDraft.date}
            />
          </label>

          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Hours</span>
            <input
              min="0.5"
              onChange={(event) =>
                setWorkLogDraft((current) => ({
                  ...current,
                  hours: Number(event.target.value),
                }))
              }
              required
              step="0.5"
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              type="number"
              value={workLogDraft.hours}
            />
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Participants</span>
            <select
              multiple
              onChange={(event) =>
                setWorkLogDraft((current) => ({
                  ...current,
                  participantIds: Array.from(
                    event.currentTarget.selectedOptions,
                    (option) => option.value,
                  ),
                }))
              }
              size={Math.min(bootstrap.members.length || 1, 5)}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={workLogDraft.participantIds}
            >
              {bootstrap.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <small style={{ color: "var(--text-copy)" }}>
              Hold Ctrl or Cmd to select multiple people.
            </small>
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Notes</span>
            <textarea
              onChange={(event) =>
                setWorkLogDraft((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="What got done?"
              rows={3}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={workLogDraft.notes}
            />
          </label>
          <PhotoUploadField
            currentUrl={workLogDraft.photoUrl}
            label="Work log photo"
            onChange={(value) => setWorkLogDraft((current) => ({ ...current, photoUrl: value }))}
            onUpload={async (file) => {
              if (!workLogPhotoProjectId) {
                throw new Error("No project is available for photo upload.");
              }

              return requestPhotoUpload(workLogPhotoProjectId, file);
            }}
          />

          <div className="modal-actions modal-wide">
            <button
              className="secondary-action"
              onClick={closeWorkLogModal}
              type="button"
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
            >
              Cancel
            </button>
            <button
              className="primary-action"
              disabled={isSavingWorkLog || bootstrap.tasks.length === 0 || bootstrap.members.length === 0}
              type="submit"
            >
              {isSavingWorkLog ? "Saving..." : "Add work log"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface QaReportEditorModalProps {
  bootstrap: BootstrapPayload;
  closeQaReportModal: () => void;
  handleQaReportSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavingQaReport: boolean;
  requestPhotoUpload: (projectId: string, file: File) => Promise<string>;
  qaReportDraft: QaReportPayload;
  setQaReportDraft: Dispatch<SetStateAction<QaReportPayload>>;
}

export function QaReportEditorModal({
  bootstrap,
  closeQaReportModal,
  handleQaReportSubmit,
  isSavingQaReport,
  requestPhotoUpload,
  qaReportDraft,
  setQaReportDraft,
}: QaReportEditorModalProps) {
  const selectedTask = bootstrap.tasks.find((task) => task.id === qaReportDraft.taskId);
  const qaReportPhotoProjectId = selectedTask?.projectId ?? bootstrap.projects[0]?.id ?? null;

  return (
    <div className="modal-scrim" role="presentation" style={{ zIndex: 2000 }}>
      <section
        aria-modal="true"
        className="modal-card"
        role="dialog"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}
      >
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--meco-blue)" }}>
              QA report
            </p>
            <h2 style={{ color: "var(--text-title)" }}>Add QA report</h2>
          </div>
          <button
            className="icon-button"
            onClick={closeQaReportModal}
            style={{ color: "var(--text-copy)", background: "transparent" }}
            type="button"
          >
            Close
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleQaReportSubmit}
          style={{ color: "var(--text-copy)" }}
        >
          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Task</span>
            <select
              onChange={(event) =>
                setQaReportDraft((current) => ({
                  ...current,
                  taskId: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={qaReportDraft.taskId ?? ""}
            >
              <option disabled value="">
                Choose a task
              </option>
              {bootstrap.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            {selectedTask ? (
              <small style={{ color: "var(--text-copy)" }}>{selectedTask.summary}</small>
            ) : null}
          </label>

          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Result</span>
            <select
              onChange={(event) =>
                setQaReportDraft((current) => ({
                  ...current,
                  result: event.target.value as QaReportPayload["result"],
                }))
              }
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={qaReportDraft.result}
            >
              <option value="pass">Pass</option>
              <option value="minor-fix">Minor fix</option>
              <option value="iteration-worthy">Iteration worthy</option>
            </select>
          </label>

          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Reviewed date</span>
            <input
              onChange={(event) =>
                setQaReportDraft((current) => ({
                  ...current,
                  reviewedAt: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              type="date"
              value={qaReportDraft.reviewedAt}
            />
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Participants</span>
            <select
              multiple
              onChange={(event) =>
                setQaReportDraft((current) => ({
                  ...current,
                  participantIds: Array.from(
                    event.currentTarget.selectedOptions,
                    (option) => option.value,
                  ),
                }))
              }
              size={Math.min(bootstrap.members.length || 1, 5)}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={qaReportDraft.participantIds}
            >
              {bootstrap.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <small style={{ color: "var(--text-copy)" }}>
              Hold Ctrl or Cmd to select multiple people.
            </small>
          </label>

          <label className="checkbox-field modal-wide">
            <input
              checked={qaReportDraft.mentorApproved}
              onChange={(event) =>
                setQaReportDraft((current) => ({
                  ...current,
                  mentorApproved: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span style={{ color: "var(--text-title)" }}>Mentor approved</span>
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Notes</span>
            <textarea
              onChange={(event) =>
                setQaReportDraft((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="QA observations and follow-up."
              rows={3}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={qaReportDraft.notes}
            />
          </label>
          <PhotoUploadField
            accept="image/*,video/*"
            currentUrl={qaReportDraft.photoUrl}
            label="QA report media"
            onChange={(value) => setQaReportDraft((current) => ({ ...current, photoUrl: value }))}
            onUpload={async (file) => {
              if (!qaReportPhotoProjectId) {
                throw new Error("No project is available for photo upload.");
              }

              return requestPhotoUpload(qaReportPhotoProjectId, file);
            }}
          />

          <div className="modal-actions modal-wide">
            <button
              className="secondary-action"
              onClick={closeQaReportModal}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              type="button"
            >
              Cancel
            </button>
            <button
              className="primary-action"
              disabled={
                isSavingQaReport ||
                bootstrap.tasks.length === 0 ||
                bootstrap.members.length === 0
              }
              type="submit"
            >
              {isSavingQaReport ? "Saving..." : "Add QA report"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface EventReportEditorModalProps {
  bootstrap: BootstrapPayload;
  closeEventReportModal: () => void;
  eventReportDraft: TestResultPayload;
  eventReportFindings: string;
  handleEventReportSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavingEventReport: boolean;
  requestPhotoUpload: (projectId: string, file: File) => Promise<string>;
  setEventReportDraft: Dispatch<SetStateAction<TestResultPayload>>;
  setEventReportFindings: (value: string) => void;
}

export function EventReportEditorModal({
  bootstrap,
  closeEventReportModal,
  eventReportDraft,
  eventReportFindings,
  handleEventReportSubmit,
  isSavingEventReport,
  requestPhotoUpload,
  setEventReportDraft,
  setEventReportFindings,
}: EventReportEditorModalProps) {
  const selectedEvent = bootstrap.events.find((item) => item.id === eventReportDraft.eventId);
  const eventReportPhotoProjectId =
    selectedEvent?.projectIds[0] ?? bootstrap.projects[0]?.id ?? null;

  return (
    <div className="modal-scrim" role="presentation" style={{ zIndex: 2000 }}>
      <section
        aria-modal="true"
        className="modal-card"
        role="dialog"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}
      >
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--meco-blue)" }}>
              Event report
            </p>
            <h2 style={{ color: "var(--text-title)" }}>Add event report</h2>
          </div>
          <button
            className="icon-button"
            onClick={closeEventReportModal}
            style={{ color: "var(--text-copy)", background: "transparent" }}
            type="button"
          >
            Close
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleEventReportSubmit}
          style={{ color: "var(--text-copy)" }}
        >
          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Event</span>
            <select
              onChange={(event) =>
                setEventReportDraft((current) => ({
                  ...current,
                  eventId: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={eventReportDraft.eventId ?? ""}
            >
              <option disabled value="">
                Choose an event
              </option>
              {bootstrap.events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            {selectedEvent ? (
              <small style={{ color: "var(--text-copy)" }}>{selectedEvent.description}</small>
            ) : null}
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Title</span>
            <input
              onChange={(event) =>
                setEventReportDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={eventReportDraft.title ?? ""}
            />
          </label>

          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Status</span>
            <select
              onChange={(event) =>
                setEventReportDraft((current) => ({
                  ...current,
                  status: event.target.value as TestResultPayload["status"],
                }))
              }
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={eventReportDraft.status}
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Findings (one per line)</span>
            <textarea
              onChange={(event) => setEventReportFindings(event.target.value)}
              placeholder="Add findings from this event."
              rows={4}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={eventReportFindings}
            />
          </label>
          <PhotoUploadField
            accept="image/*,video/*"
            currentUrl={eventReportDraft.photoUrl}
            label="Event report media"
            onChange={(value) =>
              setEventReportDraft((current) => ({ ...current, photoUrl: value }))
            }
            onUpload={async (file) => {
              if (!eventReportPhotoProjectId) {
                throw new Error("No project is available for photo upload.");
              }

              return requestPhotoUpload(eventReportPhotoProjectId, file);
            }}
          />

          <div className="modal-actions modal-wide">
            <button
              className="secondary-action"
              onClick={closeEventReportModal}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              type="button"
            >
              Cancel
            </button>
            <button
              className="primary-action"
              disabled={isSavingEventReport || bootstrap.events.length === 0}
              type="submit"
            >
              {isSavingEventReport ? "Saving..." : "Add event report"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
