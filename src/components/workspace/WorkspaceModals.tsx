import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  BootstrapPayload,
  ManufacturingItemPayload,
  PurchaseItemPayload,
  TaskPayload,
  TaskRecord,
} from "../../types";

interface TaskEditorModalProps {
  activeTask: TaskRecord | null;
  bootstrap: BootstrapPayload;
  closeTaskModal: () => void;
  handleTaskSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavingTask: boolean;
  mentors: BootstrapPayload["members"];
  students: BootstrapPayload["members"];
  taskDraft: TaskPayload;
  taskDraftBlockers: string;
  taskModalMode: "create" | "edit";
  setTaskDraft: Dispatch<SetStateAction<TaskPayload>>;
  setTaskDraftBlockers: (value: string) => void;
}

export function TaskEditorModal({
  activeTask,
  bootstrap,
  closeTaskModal,
  handleTaskSubmit,
  isSavingTask,
  mentors,
  students,
  taskDraft,
  taskDraftBlockers,
  taskModalMode,
  setTaskDraft,
  setTaskDraftBlockers,
}: TaskEditorModalProps) {
  return (
    <div className="modal-scrim" role="presentation">
      <section aria-modal="true" className="modal-card" role="dialog">
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow">Task editor</p>
            <h2>{taskModalMode === "create" ? "Create task" : activeTask?.title ?? "Edit task"}</h2>
          </div>
          <button className="icon-button" onClick={closeTaskModal} type="button">
            Close
          </button>
        </div>
        <form className="modal-form" onSubmit={handleTaskSubmit}>
          <label className="field modal-wide">
            <span>Title</span>
            <input
              onChange={(event) =>
                setTaskDraft((current) => ({ ...current, title: event.target.value }))
              }
              required
              value={taskDraft.title}
            />
          </label>
          <label className="field modal-wide">
            <span>Summary</span>
            <textarea
              onChange={(event) =>
                setTaskDraft((current) => ({ ...current, summary: event.target.value }))
              }
              required
              rows={3}
              value={taskDraft.summary}
            />
          </label>
          <label className="field">
            <span>Subsystem</span>
            <select
              onChange={(event) =>
                setTaskDraft((current) => ({ ...current, subsystemId: event.target.value }))
              }
              value={taskDraft.subsystemId}
            >
              {bootstrap.subsystems.map((subsystem) => (
                <option key={subsystem.id} value={subsystem.id}>
                  {subsystem.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Owner</span>
            <select
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  ownerId: event.target.value || null,
                }))
              }
              value={taskDraft.ownerId ?? ""}
            >
              <option value="">Unassigned</option>
              {students.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Mentor</span>
            <select
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  mentorId: event.target.value || null,
                }))
              }
              value={taskDraft.mentorId ?? ""}
            >
              <option value="">Unassigned</option>
              {mentors.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  status: event.target.value as TaskPayload["status"],
                }))
              }
              value={taskDraft.status}
            >
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="waiting-for-qa">Waiting for QA</option>
              <option value="complete">Complete</option>
            </select>
          </label>
          <label className="field">
            <span>Priority</span>
            <select
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  priority: event.target.value as TaskPayload["priority"],
                }))
              }
              value={taskDraft.priority}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="field">
            <span>Start date</span>
            <input
              onChange={(event) =>
                setTaskDraft((current) => ({ ...current, startDate: event.target.value }))
              }
              type="date"
              value={taskDraft.startDate}
            />
          </label>
          <label className="field">
            <span>Due date</span>
            <input
              onChange={(event) =>
                setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))
              }
              type="date"
              value={taskDraft.dueDate}
            />
          </label>
          <label className="field">
            <span>Estimated hours</span>
            <input
              min="0"
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  estimatedHours: Number(event.target.value),
                }))
              }
              type="number"
              value={taskDraft.estimatedHours}
            />
          </label>
          <label className="field">
            <span>Actual hours</span>
            <input
              min="0"
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  actualHours: Number(event.target.value),
                }))
              }
              step="0.5"
              type="number"
              value={taskDraft.actualHours}
            />
          </label>
          <label className="field modal-wide">
            <span>Blockers</span>
            <input
              onChange={(event) => setTaskDraftBlockers(event.target.value)}
              placeholder="Comma-separated blockers"
              value={taskDraftBlockers}
            />
          </label>
          <div className="checkbox-row modal-wide">
            <label className="checkbox-field">
              <input
                checked={taskDraft.requiresDocumentation}
                onChange={(event) =>
                  setTaskDraft((current) => ({
                    ...current,
                    requiresDocumentation: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>Requires documentation</span>
            </label>
            <label className="checkbox-field">
              <input
                checked={taskDraft.documentationLinked}
                onChange={(event) =>
                  setTaskDraft((current) => ({
                    ...current,
                    documentationLinked: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>Documentation linked</span>
            </label>
          </div>
          <div className="modal-actions modal-wide">
            <button className="secondary-action" onClick={closeTaskModal} type="button">
              Cancel
            </button>
            <button className="primary-action" disabled={isSavingTask} type="submit">
              {isSavingTask
                ? "Saving..."
                : taskModalMode === "create"
                  ? "Create task"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface PurchaseEditorModalProps {
  bootstrap: BootstrapPayload;
  closePurchaseModal: () => void;
  handlePurchaseSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavingPurchase: boolean;
  purchaseDraft: PurchaseItemPayload;
  purchaseFinalCost: string;
  purchaseModalMode: "create" | "edit";
  setPurchaseDraft: Dispatch<SetStateAction<PurchaseItemPayload>>;
  setPurchaseFinalCost: (value: string) => void;
}

export function PurchaseEditorModal({
  bootstrap,
  closePurchaseModal,
  handlePurchaseSubmit,
  isSavingPurchase,
  purchaseDraft,
  purchaseFinalCost,
  purchaseModalMode,
  setPurchaseDraft,
  setPurchaseFinalCost,
}: PurchaseEditorModalProps) {
  return (
    <div className="modal-scrim" role="presentation">
      <section aria-modal="true" className="modal-card" role="dialog">
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow">Purchase editor</p>
            <h2>
              {purchaseModalMode === "create"
                ? "Add purchase"
                : "Edit purchase"}
            </h2>
          </div>
          <button className="icon-button" onClick={closePurchaseModal} type="button">
            Close
          </button>
        </div>
        <form className="modal-form" onSubmit={handlePurchaseSubmit}>
          <label className="field modal-wide">
            <span>Title</span>
            <input
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              value={purchaseDraft.title}
            />
          </label>
          <label className="field">
            <span>Subsystem</span>
            <select
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  subsystemId: event.target.value,
                }))
              }
              value={purchaseDraft.subsystemId}
            >
              {bootstrap.subsystems.map((subsystem) => (
                <option key={subsystem.id} value={subsystem.id}>
                  {subsystem.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Requester</span>
            <select
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  requestedById: event.target.value || null,
                }))
              }
              value={purchaseDraft.requestedById ?? ""}
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
            <span>Vendor</span>
            <input
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  vendor: event.target.value,
                }))
              }
              required
              value={purchaseDraft.vendor}
            />
          </label>
          <label className="field">
            <span>Link label</span>
            <input
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  linkLabel: event.target.value,
                }))
              }
              required
              value={purchaseDraft.linkLabel}
            />
          </label>
          <label className="field">
            <span>Quantity</span>
            <input
              min="1"
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  quantity: Number(event.target.value),
                }))
              }
              type="number"
              value={purchaseDraft.quantity}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  status: event.target.value as PurchaseItemPayload["status"],
                }))
              }
              value={purchaseDraft.status}
            >
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="purchased">Purchased</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>
          <label className="field">
            <span>Estimated cost</span>
            <input
              min="0"
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  estimatedCost: Number(event.target.value),
                }))
              }
              type="number"
              value={purchaseDraft.estimatedCost}
            />
          </label>
          <label className="field">
            <span>Final cost</span>
            <input
              min="0"
              onChange={(event) => setPurchaseFinalCost(event.target.value)}
              placeholder="Optional"
              type="number"
              value={purchaseFinalCost}
            />
          </label>
          <div className="checkbox-row modal-wide">
            <label className="checkbox-field">
              <input
                checked={purchaseDraft.approvedByMentor}
                onChange={(event) =>
                  setPurchaseDraft((current) => ({
                    ...current,
                    approvedByMentor: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>Mentor approved</span>
            </label>
          </div>
          <div className="modal-actions modal-wide">
            <button className="secondary-action" onClick={closePurchaseModal} type="button">
              Cancel
            </button>
            <button className="primary-action" disabled={isSavingPurchase} type="submit">
              {isSavingPurchase
                ? "Saving..."
                : purchaseModalMode === "create"
                  ? "Add purchase"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface ManufacturingEditorModalProps {
  bootstrap: BootstrapPayload;
  closeManufacturingModal: () => void;
  handleManufacturingSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSavingManufacturing: boolean;
  manufacturingDraft: ManufacturingItemPayload;
  manufacturingModalMode: "create" | "edit";
  setManufacturingDraft: Dispatch<SetStateAction<ManufacturingItemPayload>>;
}

export function ManufacturingEditorModal({
  bootstrap,
  closeManufacturingModal,
  handleManufacturingSubmit,
  isSavingManufacturing,
  manufacturingDraft,
  manufacturingModalMode,
  setManufacturingDraft,
}: ManufacturingEditorModalProps) {
  return (
    <div className="modal-scrim" role="presentation">
      <section aria-modal="true" className="modal-card" role="dialog">
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow">Manufacturing editor</p>
            <h2>
              {manufacturingModalMode === "create"
                ? manufacturingDraft.process === "cnc"
                  ? "Add CNC job"
                  : "Add 3D print job"
                : "Edit manufacturing job"}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={closeManufacturingModal}
            type="button"
          >
            Close
          </button>
        </div>
        <form className="modal-form" onSubmit={handleManufacturingSubmit}>
          <label className="field modal-wide">
            <span>Title</span>
            <input
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              value={manufacturingDraft.title}
            />
          </label>
          <label className="field">
            <span>Subsystem</span>
            <select
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  subsystemId: event.target.value,
                }))
              }
              value={manufacturingDraft.subsystemId}
            >
              {bootstrap.subsystems.map((subsystem) => (
                <option key={subsystem.id} value={subsystem.id}>
                  {subsystem.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Requester</span>
            <select
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  requestedById: event.target.value || null,
                }))
              }
              value={manufacturingDraft.requestedById ?? ""}
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
            <span>Process</span>
            <select
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  process: event.target.value as ManufacturingItemPayload["process"],
                }))
              }
              value={manufacturingDraft.process}
            >
              <option value="cnc">CNC</option>
              <option value="3d-print">3D print</option>
              <option value="fabrication">Fabrication</option>
            </select>
          </label>
          <label className="field">
            <span>Due date</span>
            <input
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
              type="date"
              value={manufacturingDraft.dueDate}
            />
          </label>
          <label className="field">
            <span>Material</span>
            <input
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  material: event.target.value,
                }))
              }
              required
              value={manufacturingDraft.material}
            />
          </label>
          <label className="field">
            <span>Quantity</span>
            <input
              min="1"
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  quantity: Number(event.target.value),
                }))
              }
              type="number"
              value={manufacturingDraft.quantity}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  status: event.target.value as ManufacturingItemPayload["status"],
                }))
              }
              value={manufacturingDraft.status}
            >
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In progress</option>
              <option value="qa">QA</option>
              <option value="complete">Complete</option>
            </select>
          </label>
          <label className="field">
            <span>Batch label</span>
            <input
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  batchLabel: event.target.value,
                }))
              }
              placeholder="Optional"
              value={manufacturingDraft.batchLabel ?? ""}
            />
          </label>
          <div className="checkbox-row modal-wide">
            <label className="checkbox-field">
              <input
                checked={manufacturingDraft.mentorReviewed}
                onChange={(event) =>
                  setManufacturingDraft((current) => ({
                    ...current,
                    mentorReviewed: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>Mentor reviewed</span>
            </label>
          </div>
          <div className="modal-actions modal-wide">
            <button
              className="secondary-action"
              onClick={closeManufacturingModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className="primary-action"
              disabled={isSavingManufacturing}
              type="submit"
            >
              {isSavingManufacturing
                ? "Saving..."
                : manufacturingModalMode === "create"
                  ? "Add job"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
