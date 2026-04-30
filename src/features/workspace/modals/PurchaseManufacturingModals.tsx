import type { Dispatch, FormEvent, SetStateAction } from "react";
import type {
  BootstrapPayload,
  ManufacturingItemPayload,
  PurchaseItemPayload,
} from "@/types";
import {
  getManufacturingPartInstanceOptions,
  inferManufacturingDraftFromPartSelection,
  toggleManufacturingDraftPartInstanceSelection,
} from "@/lib/appUtils";

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
  const selectedPartDefinition = bootstrap.partDefinitions.find(
    (partDefinition) => partDefinition.id === purchaseDraft.partDefinitionId,
  );

  return (
    <div className="modal-scrim" role="presentation" style={{ zIndex: 2000 }}>
      <section aria-modal="true" className="modal-card" role="dialog" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}>
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--meco-blue)" }}>Purchase editor</p>
            <h2 style={{ color: "var(--text-title)" }}>
              {purchaseModalMode === "create"
                ? "Add purchase"
                : "Edit purchase"}
            </h2>
          </div>
          <button className="icon-button" onClick={closePurchaseModal} type="button" style={{ color: "var(--text-copy)", background: "transparent" }}>
            Close
          </button>
        </div>
        <form className="modal-form" onSubmit={handlePurchaseSubmit} style={{ color: "var(--text-copy)" }}>
          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Part</span>
            <select
              onChange={(event) => {
                const partDefinitionId = event.target.value;
                const partDefinition = bootstrap.partDefinitions.find(
                  (candidate) => candidate.id === partDefinitionId,
                );

                setPurchaseDraft((current) => ({
                  ...current,
                  partDefinitionId,
                  title: partDefinition?.name ?? current.title,
                }));
              }}
              required
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              value={purchaseDraft.partDefinitionId ?? ""}
            >
              <option value="">Select a real part from the Parts tab...</option>
              {bootstrap.partDefinitions.map((partDefinition) => (
                <option key={partDefinition.id} value={partDefinition.id}>
                  {partDefinition.partNumber} - {partDefinition.name} (Rev {partDefinition.revision})
                </option>
              ))}
            </select>
            <small style={{ color: "var(--text-copy)" }}>
              {selectedPartDefinition
                ? `Stored as ${selectedPartDefinition.name}.`
                : "Purchases can only be logged against a real part from the catalog."}
            </small>
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Subsystem</span>
            <select
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  subsystemId: event.target.value,
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
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
            <span style={{ color: "var(--text-title)" }}>Requester</span>
            <select
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  requestedById: event.target.value || null,
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
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
            <span style={{ color: "var(--text-title)" }}>Vendor</span>
            <input
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  vendor: event.target.value,
                }))
              }
              required
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              value={purchaseDraft.vendor}
            />
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Link label</span>
            <input
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  linkLabel: event.target.value,
                }))
              }
              required
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              value={purchaseDraft.linkLabel}
            />
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Quantity</span>
            <input
              min="1"
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  quantity: Number(event.target.value),
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              type="number"
              value={purchaseDraft.quantity}
            />
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Status</span>
            <select
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  status: event.target.value as PurchaseItemPayload["status"],
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
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
            <span style={{ color: "var(--text-title)" }}>Estimated cost</span>
            <input
              min="0"
              onChange={(event) =>
                setPurchaseDraft((current) => ({
                  ...current,
                  estimatedCost: Number(event.target.value),
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              type="number"
              value={purchaseDraft.estimatedCost}
            />
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Final cost</span>
            <input
              min="0"
              onChange={(event) => setPurchaseFinalCost(event.target.value)}
              placeholder="Optional"
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
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
              <span style={{ color: "var(--text-title)" }}>Mentor approved</span>
            </label>
          </div>
          <div className="modal-actions modal-wide">
            <button className="secondary-action" onClick={closePurchaseModal} style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }} type="button">
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
  const COMMON_MATERIALS = [
    "Aluminum 6061", "Steel 4130", "Polycarbonate",
    "PLA - Black", "PLA - Blue", "PETG", "TPU",
    "Delrin", "Wood"
  ];
  const materialOptions = bootstrap.materials.length > 0
    ? bootstrap.materials
    : COMMON_MATERIALS.map((name) => ({ id: name, name }));
  const filteredPartInstances = getManufacturingPartInstanceOptions(bootstrap, manufacturingDraft);
  const selectedPartDefinition = manufacturingDraft.partDefinitionId
    ? bootstrap.partDefinitions.find(
        (partDefinition) => partDefinition.id === manufacturingDraft.partDefinitionId,
      )
    : null;
  const selectedPartInstanceIds = manufacturingDraft.partInstanceIds.length
    ? manufacturingDraft.partInstanceIds
    : manufacturingDraft.partInstanceId
      ? [manufacturingDraft.partInstanceId]
      : [];
  const subsystemsById = Object.fromEntries(
    bootstrap.subsystems.map((subsystem) => [subsystem.id, subsystem]),
  ) as Record<string, BootstrapPayload["subsystems"][number]>;
  const mechanismsById = Object.fromEntries(
    bootstrap.mechanisms.map((mechanism) => [mechanism.id, mechanism]),
  ) as Record<string, BootstrapPayload["mechanisms"][number]>;
  const getPartInstanceSubtitle = (partInstance: BootstrapPayload["partInstances"][number]) =>
    [
      subsystemsById[partInstance.subsystemId]?.name ?? "Unknown subsystem",
      partInstance.mechanismId ? mechanismsById[partInstance.mechanismId]?.name ?? "Unknown mechanism" : null,
    ].filter(Boolean).join(" / ");
  const togglePartInstance = (partInstanceId: string) => {
    setManufacturingDraft((current) =>
      toggleManufacturingDraftPartInstanceSelection(bootstrap, current, partInstanceId),
    );
  };

  return (
    <div className="modal-scrim" role="presentation" style={{ zIndex: 2000 }}>
      <section aria-modal="true" className="modal-card" role="dialog" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}>
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--meco-blue)" }}>Manufacturing editor</p>
            <h2 style={{ color: "var(--text-title)" }}>
              {manufacturingModalMode === "create"
                ? manufacturingDraft.process === "cnc"
                  ? "Add CNC job"
                  : manufacturingDraft.process === "3d-print"
                    ? "Add 3D print job"
                    : "Add fabrication job"
                : "Edit manufacturing job"}
            </h2>
          </div>
          <button className="icon-button" onClick={closeManufacturingModal} type="button" style={{ color: "var(--text-copy)", background: "transparent" }}>
            Close
          </button>
        </div>
        <form className="modal-form" onSubmit={handleManufacturingSubmit} style={{ color: "var(--text-copy)" }}>
          <label className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Part definition</span>
            <select
              onChange={(event) => {
                const partDefinitionId = event.target.value;

                setManufacturingDraft((current) =>
                  inferManufacturingDraftFromPartSelection(
                    bootstrap,
                    current,
                    partDefinitionId,
                  ),
                );
              }}
              required
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              value={manufacturingDraft.partDefinitionId ?? ""}
            >
              <option value="">Select a real part from the Parts tab...</option>
              {bootstrap.partDefinitions.map((partDefinition) => (
                <option key={partDefinition.id} value={partDefinition.id}>
                  {partDefinition.partNumber} - {partDefinition.name} (Rev {partDefinition.revision})
                </option>
              ))}
            </select>
            <small style={{ color: "var(--text-copy)" }}>
              {selectedPartDefinition
                ? `${selectedPartDefinition.name} will be used as the job title.`
                : "Choose the catalog part before selecting the instances being made."}
            </small>
          </label>
          <div className="field modal-wide task-target-picker">
            <span style={{ color: "var(--text-title)" }}>Part instances</span>
            <div className="task-target-group">
              <span className="task-target-group-title">Instances being made</span>
              {filteredPartInstances.length > 0 ? (
                filteredPartInstances.map((partInstance) => {
                  const isSelected = selectedPartInstanceIds.includes(partInstance.id);

                  return (
                    <label
                      className={`task-target-option${isSelected ? " is-selected" : ""}`}
                      key={partInstance.id}
                    >
                      <input
                        checked={isSelected}
                        onChange={() => togglePartInstance(partInstance.id)}
                        type="checkbox"
                      />
                      <span className="task-target-option-copy">
                        <span>{partInstance.name}</span>
                        <small>{getPartInstanceSubtitle(partInstance)}</small>
                      </span>
                    </label>
                  );
                })
              ) : (
                <span className="task-target-empty">
                  {selectedPartDefinition
                    ? "No part instances exist for this part definition yet."
                    : "Choose a part definition first."}
                </span>
              )}
            </div>
          </div>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Requester</span>
            <select
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  requestedById: event.target.value || null,
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
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
            <span style={{ color: "var(--text-title)" }}>Due date</span>
            <input
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              type="date"
              value={manufacturingDraft.dueDate}
            />
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Material</span>
            <select
              onChange={(event) => {
                const selectedId = event.target.value;
                const material = bootstrap.materials.find((item) => item.id === selectedId);
                setManufacturingDraft((current) => ({
                  ...current,
                  materialId: material?.id ?? null,
                  material: material?.name ?? selectedId,
                }));
              }}
              required
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              value={manufacturingDraft.materialId ?? manufacturingDraft.material}
            >
              <option value="">Select material...</option>
              {materialOptions.map((material) => (
                <option key={material.id} value={material.id}>{material.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Quantity</span>
            <input
              min="1"
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  quantity: Number(event.target.value),
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              type="number"
              value={manufacturingDraft.quantity}
            />
          </label>
          <label className="field">
            <span style={{ color: "var(--text-title)" }}>Status</span>
            <select
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  status: event.target.value as ManufacturingItemPayload["status"],
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
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
            <span style={{ color: "var(--text-title)" }}>Batch label</span>
            <input
              onChange={(event) =>
                setManufacturingDraft((current) => ({
                  ...current,
                  batchLabel: event.target.value,
                }))
              }
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
              placeholder="Optional"
              value={manufacturingDraft.batchLabel ?? ""}
            />
          </label>
          {manufacturingDraft.process === "cnc" ? (
            <div className="checkbox-row modal-wide">
              <label className="checkbox-field">
                <input
                  checked={manufacturingDraft.inHouse}
                  onChange={(event) =>
                    setManufacturingDraft((current) => ({
                      ...current,
                      inHouse: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span style={{ color: "var(--text-title)" }}>In-house</span>
              </label>
            </div>
          ) : null}
          {manufacturingModalMode === "edit" ? (
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
                <span style={{ color: "var(--text-title)" }}>Mentor reviewed</span>
              </label>
            </div>
          ) : null}
          <div className="modal-actions modal-wide">
            <button
              className="secondary-action"
              onClick={closeManufacturingModal}
              style={{ background: "var(--bg-row-alt)", color: "var(--text-title)", border: "1px solid var(--border-base)" }}
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
