import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { BootstrapPayload, MechanismPayload, SubsystemPayload } from "@/types";
import { buildIterationOptions, formatIterationVersion } from "@/lib/appUtils";
import { PhotoUploadField } from "@/features/workspace/shared/media";
import { WorkspaceColorField } from "./WorkspaceColorField";

interface SubsystemEditorModalProps {
  activeSubsystemId: string | null;
  bootstrap: BootstrapPayload;
  closeSubsystemModal: () => void;
  handleToggleSubsystemArchived: (subsystemId: string) => void;
  handleSubsystemSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavingSubsystem: boolean;
  requestPhotoUpload: (projectId: string, file: File) => Promise<string>;
  subsystemDraft: SubsystemPayload;
  subsystemDraftRisks: string;
  subsystemModalMode: "create" | "edit";
  setSubsystemDraft: Dispatch<SetStateAction<SubsystemPayload>>;
  setSubsystemDraftRisks: (value: string) => void;
}

interface MechanismEditorModalProps {
  activeMechanismId: string | null;
  bootstrap: BootstrapPayload;
  closeMechanismModal: () => void;
  handleDeleteMechanism: (mechanismId: string) => void;
  handleToggleMechanismArchived: (mechanismId: string) => void;
  handleMechanismSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isDeletingMechanism: boolean;
  isSavingMechanism: boolean;
  requestPhotoUpload: (projectId: string, file: File) => Promise<string>;
  mechanismDraft: MechanismPayload;
  mechanismModalMode: "create" | "edit";
  setMechanismDraft: Dispatch<SetStateAction<MechanismPayload>>;
}
export function SubsystemEditorModal({
  activeSubsystemId,
  bootstrap,
  closeSubsystemModal,
  handleToggleSubsystemArchived,
  handleSubsystemSubmit,
  isSavingSubsystem,
  requestPhotoUpload,
  subsystemDraft,
  subsystemDraftRisks,
  subsystemModalMode,
  setSubsystemDraft,
  setSubsystemDraftRisks,
}: SubsystemEditorModalProps) {
  const mentorOptions = bootstrap.members.filter(
    (member) => member.role === "mentor" || member.role === "admin",
  );
  const currentSubsystem = activeSubsystemId
    ? bootstrap.subsystems.find((subsystem) => subsystem.id === activeSubsystemId) ?? null
    : null;
  const parentSubsystemOptions = bootstrap.subsystems.filter(
    (subsystem) => subsystem.id !== activeSubsystemId,
  );
  const parentSubsystemName = subsystemDraft.parentSubsystemId
    ? bootstrap.subsystems.find(
        (subsystem) => subsystem.id === subsystemDraft.parentSubsystemId,
      )?.name ?? "Unknown"
    : null;
  const subsystemIterationOptions = buildIterationOptions(
    bootstrap.subsystems
      .filter((subsystem) => subsystem.projectId === subsystemDraft.projectId)
      .map((subsystem) => subsystem.iteration),
    subsystemDraft.iteration,
  );
  const subsystemPhotoProjectId = subsystemDraft.projectId || bootstrap.projects[0]?.id || null;

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
              Subsystem editor
            </p>
            <h2 style={{ color: "var(--text-title)" }}>
              {subsystemModalMode === "create"
                ? "Add subsystem"
                : bootstrap.subsystems.find((subsystem) => subsystem.id === activeSubsystemId)?.name ??
                  "Edit subsystem"}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={closeSubsystemModal}
            type="button"
            style={{ color: "var(--text-copy)", background: "transparent" }}
          >
            Close
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleSubsystemSubmit}
          style={{ color: "var(--text-copy)" }}
        >
          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Name</span>
            <input
              onChange={(event) =>
                setSubsystemDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={subsystemDraft.name}
            />
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Description</span>
            <textarea
              onChange={(event) =>
                setSubsystemDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              rows={3}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={subsystemDraft.description}
            />
          </label>

          <WorkspaceColorField
            label="Subsystem color"
            onChange={(color) =>
              setSubsystemDraft((current) => ({
                ...current,
                color,
              }))
            }
            seed={`${subsystemDraft.projectId}:${subsystemDraft.name}:subsystem`}
            value={subsystemDraft.color}
          />

          {subsystemModalMode === "edit" ? (
            <label className="field">
              <span style={{ color: "var(--text-title)" }}>Iteration</span>
              <select
                onChange={(event) =>
                  setSubsystemDraft((current) => ({
                    ...current,
                    iteration: Number(event.target.value),
                  }))
                }
                style={{
                  background: "var(--bg-row-alt)",
                  color: "var(--text-title)",
                  border: "1px solid var(--border-base)",
                }}
                value={subsystemDraft.iteration ?? 1}
              >
                {subsystemIterationOptions.map((iteration) => (
                  <option key={iteration} value={iteration}>
                    {formatIterationVersion(iteration)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {subsystemModalMode === "create" ? (
            <label className="field">
              <span style={{ color: "var(--text-title)" }}>Parent subsystem</span>
              <select
                onChange={(event) =>
                  setSubsystemDraft((current) => ({
                    ...current,
                    parentSubsystemId: event.target.value || null,
                  }))
                }
                style={{
                  background: "var(--bg-row-alt)",
                  color: "var(--text-title)",
                  border: "1px solid var(--border-base)",
                }}
                value={subsystemDraft.parentSubsystemId ?? ""}
              >
                <option value="">No parent (root subsystem)</option>
                {parentSubsystemOptions.map((subsystem) => (
                  <option key={subsystem.id} value={subsystem.id}>
                    {subsystem.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="field modal-wide">
              <span style={{ color: "var(--text-title)" }}>Parent subsystem</span>
              <p style={{ margin: 0, color: "var(--text-copy)" }}>
                {currentSubsystem?.isCore
                  ? "Drivetrain is the root subsystem and has no parent."
                  : parentSubsystemName ?? "Unassigned"}
              </p>
            </div>
          )}

          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Responsible engineer</span>
            <select
              onChange={(event) =>
                setSubsystemDraft((current) => ({
                  ...current,
                  responsibleEngineerId: event.target.value || null,
                }))
              }
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={subsystemDraft.responsibleEngineerId ?? ""}
            >
              <option value="">Unassigned</option>
              {bootstrap.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Mentors</span>
            <select
              multiple
              onChange={(event) =>
                setSubsystemDraft((current) => ({
                  ...current,
                  mentorIds: Array.from(event.currentTarget.selectedOptions, (option) => option.value),
                }))
              }
              size={Math.min(mentorOptions.length || 1, 5)}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={subsystemDraft.mentorIds}
            >
              {mentorOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Risks</span>
            <textarea
              onChange={(event) => setSubsystemDraftRisks(event.target.value)}
              placeholder="Comma-separated risks"
              rows={3}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={subsystemDraftRisks}
            />
          </label>
          <PhotoUploadField
            currentUrl={subsystemDraft.photoUrl}
            label="Subsystem photo"
            onChange={(value) => setSubsystemDraft((current) => ({ ...current, photoUrl: value }))}
            onUpload={async (file) => {
              if (!subsystemPhotoProjectId) {
                throw new Error("No project is available for photo upload.");
              }

              return requestPhotoUpload(subsystemPhotoProjectId, file);
            }}
          />

          <div className="modal-actions modal-wide">
            {subsystemModalMode === "edit" && activeSubsystemId ? (
              <button
                className={subsystemDraft.isArchived ? "secondary-action" : "danger-action"}
                disabled={isSavingSubsystem}
                onClick={() => handleToggleSubsystemArchived(activeSubsystemId)}
                type="button"
              >
                {subsystemDraft.isArchived ? "Restore subsystem" : "Archive subsystem"}
              </button>
            ) : null}
            <button
              className="secondary-action"
              onClick={closeSubsystemModal}
              type="button"
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
            >
              Cancel
            </button>
            <button className="primary-action" disabled={isSavingSubsystem} type="submit">
              {isSavingSubsystem
                ? "Saving..."
                : subsystemModalMode === "create"
                  ? "Add subsystem"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function MechanismEditorModal({
  activeMechanismId,
  bootstrap,
  closeMechanismModal,
  handleDeleteMechanism,
  handleToggleMechanismArchived,
  handleMechanismSubmit,
  isDeletingMechanism,
  isSavingMechanism,
  requestPhotoUpload,
  mechanismDraft,
  mechanismModalMode,
  setMechanismDraft,
}: MechanismEditorModalProps) {
  const mechanismIterationOptions = buildIterationOptions(
    bootstrap.mechanisms
      .filter((mechanism) => mechanism.subsystemId === mechanismDraft.subsystemId)
      .map((mechanism) => mechanism.iteration),
    mechanismDraft.iteration,
  );
  const mechanismPhotoProjectId =
    bootstrap.subsystems.find((subsystem) => subsystem.id === mechanismDraft.subsystemId)
      ?.projectId ?? bootstrap.projects[0]?.id ?? null;

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
              Mechanism editor
            </p>
            <h2 style={{ color: "var(--text-title)" }}>
              {mechanismModalMode === "create" ? "Add mechanism" : "Edit mechanism"}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={closeMechanismModal}
            type="button"
            style={{ color: "var(--text-copy)", background: "transparent" }}
          >
            Close
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleMechanismSubmit}
          style={{ color: "var(--text-copy)" }}
        >
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Subsystem</span>
            <select
              onChange={(event) =>
                setMechanismDraft((current) => ({
                  ...current,
                  subsystemId: event.target.value,
                }))
              }
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={mechanismDraft.subsystemId}
            >
              {bootstrap.subsystems.map((subsystem) => (
                <option key={subsystem.id} value={subsystem.id}>
                  {subsystem.name}
                </option>
              ))}
            </select>
          </label>

          {mechanismModalMode === "edit" ? (
            <label className="field">
              <span style={{ color: "var(--text-title)" }}>Iteration</span>
              <select
                onChange={(event) =>
                  setMechanismDraft((current) => ({
                    ...current,
                    iteration: Number(event.target.value),
                  }))
                }
                style={{
                  background: "var(--bg-row-alt)",
                  color: "var(--text-title)",
                  border: "1px solid var(--border-base)",
                }}
                value={mechanismDraft.iteration ?? 1}
              >
                {mechanismIterationOptions.map((iteration) => (
                  <option key={iteration} value={iteration}>
                    {formatIterationVersion(iteration)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Name</span>
            <input
              onChange={(event) =>
                setMechanismDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={mechanismDraft.name}
            />
          </label>

          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Description</span>
            <textarea
              onChange={(event) =>
                setMechanismDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              rows={3}
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
              value={mechanismDraft.description}
            />
          </label>
          <PhotoUploadField
            currentUrl={mechanismDraft.photoUrl}
            label="Mechanism photo"
            onChange={(value) =>
              setMechanismDraft((current) => ({ ...current, photoUrl: value }))
            }
            onUpload={async (file) => {
              if (!mechanismPhotoProjectId) {
                throw new Error("No project is available for photo upload.");
              }

              return requestPhotoUpload(mechanismPhotoProjectId, file);
            }}
          />

          <div className="modal-actions modal-wide">
            {mechanismModalMode === "edit" && activeMechanismId ? (
              <button
                className={mechanismDraft.isArchived ? "secondary-action" : "danger-action"}
                disabled={isDeletingMechanism || isSavingMechanism}
                onClick={() => handleToggleMechanismArchived(activeMechanismId)}
                type="button"
              >
                {mechanismDraft.isArchived ? "Restore mechanism" : "Archive mechanism"}
              </button>
            ) : null}
            {mechanismModalMode === "edit" && activeMechanismId ? (
              <button
                className="danger-action"
                disabled={isDeletingMechanism || isSavingMechanism}
                onClick={() => handleDeleteMechanism(activeMechanismId)}
                type="button"
              >
                {isDeletingMechanism ? "Deleting..." : "Delete mechanism"}
              </button>
            ) : null}
            <button
              className="secondary-action"
              onClick={closeMechanismModal}
              type="button"
              style={{
                background: "var(--bg-row-alt)",
                color: "var(--text-title)",
                border: "1px solid var(--border-base)",
              }}
            >
              Cancel
            </button>
            <button className="primary-action" disabled={isSavingMechanism} type="submit">
              {isSavingMechanism
                ? "Saving..."
                : mechanismModalMode === "create"
                  ? "Add mechanism"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

