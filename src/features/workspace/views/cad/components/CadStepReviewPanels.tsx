import { useMemo, useState } from "react";

import type { MechanismRecord, PartDefinitionRecord, SubsystemRecord } from "@/types/records";
import type {
  CadStepDiff,
  CadStepImportRunRecord,
  CadStepImportSummary,
  CadStepMappingRecord,
  CadStepSnapshotRecord,
  CadStepTreeNode,
  CadStepWarningRecord,
} from "../model/cadIntegrationTypes";
import {
  PLACEHOLDER_PARSER_WARNING_TEXT,
  stepUsesPlaceholderParser,
} from "../model/cadStepParserStatus";
import { CadStepImportSummaryCard } from "./CadStepImportSummaryCard";
import { CadStepTreePanel } from "./CadStepTreePanel";

type TargetKind = CadStepMappingRecord["targetKind"];

const targetKinds: Array<{ value: TargetKind; label: string }> = [
  { value: "SUBSYSTEM", label: "Existing subsystem" },
  { value: "MECHANISM", label: "Existing mechanism" },
  { value: "PART_DEFINITION", label: "Existing part definition" },
  { value: "IGNORE", label: "Ignore" },
  { value: "REFERENCE_GEOMETRY", label: "Reference geometry" },
  { value: "UNMAPPED", label: "Unmapped" },
];

function targetOptions(
  kind: TargetKind,
  targets: { subsystems: SubsystemRecord[]; mechanisms: MechanismRecord[]; partDefinitions: PartDefinitionRecord[] },
) {
  if (kind === "SUBSYSTEM") {
    return targets.subsystems.map((item) => ({ id: item.id, label: item.name }));
  }
  if (kind === "MECHANISM") {
    return targets.mechanisms.map((item) => ({ id: item.id, label: item.name }));
  }
  if (kind === "PART_DEFINITION") {
    return targets.partDefinitions.map((item) => ({ id: item.id, label: `${item.partNumber} - ${item.name}` }));
  }
  return [];
}

function ruleOrigin(mapping: CadStepMappingRecord) {
  if (mapping.rule) {
    return "existing rule";
  }
  if (mapping.confidence === "MANUAL") {
    return "manual override";
  }
  return mapping.status === "CONFIRMED" ? "this snapshot only" : "new suggestion";
}

export function CadStepReviewPanels({
  diff,
  importRun,
  isFinalizing,
  isSavingMapping,
  latestImportRunId,
  mappings,
  onConfirmMapping,
  onFinalize,
  snapshot,
  summary,
  targets,
  tree,
  warnings,
}: {
  diff: CadStepDiff | null;
  importRun: CadStepImportRunRecord | null;
  isFinalizing: boolean;
  isSavingMapping: boolean;
  latestImportRunId: string | null;
  mappings: CadStepMappingRecord[];
  onConfirmMapping: (input: {
    mappingId: string;
    targetKind: TargetKind;
    targetId: string | null;
    applyToFuture: boolean;
  }) => void;
  onFinalize: (allowUnresolved: boolean) => void;
  snapshot: CadStepSnapshotRecord | null;
  summary: CadStepImportSummary | null;
  targets: { subsystems: SubsystemRecord[]; mechanisms: MechanismRecord[]; partDefinitions: PartDefinitionRecord[] };
  tree: CadStepTreeNode[];
  warnings: CadStepWarningRecord[];
}) {
  const [drafts, setDrafts] = useState<Record<string, { targetKind: TargetKind; targetId: string; scope: string }>>({});
  const [allowUnresolved, setAllowUnresolved] = useState(false);
  const unresolvedCount = useMemo(
    () => mappings.filter((mapping) => mapping.status === "NEEDS_REVIEW" || mapping.targetKind === "UNMAPPED").length,
    [mappings],
  );
  const usesPlaceholderParser = stepUsesPlaceholderParser({ importRun, summary, warnings });
  const isViewingOlderSnapshot = Boolean(snapshot && latestImportRunId && snapshot.importRunId !== latestImportRunId);

  const readDraft = (mapping: CadStepMappingRecord) => drafts[mapping.id] ?? {
    targetKind: mapping.targetKind === "UNMAPPED" ? "SUBSYSTEM" : mapping.targetKind,
    targetId: mapping.targetId ?? "",
    scope: "snapshot",
  };

  return (
    <div className="cad-step-review-stack">
      {usesPlaceholderParser ? (
        <section className="cad-parser-alert cad-parser-alert-large" role="alert">
          {PLACEHOLDER_PARSER_WARNING_TEXT}
        </section>
      ) : null}

      <div className="cad-grid cad-grid-three">
        <CadStepImportSummaryCard importRun={importRun} snapshot={snapshot} summary={summary} warnings={warnings} />

        <article className="cad-card cad-status-card">
          <span className="cad-eyebrow">Carry-forward</span>
          <h3>Mapping rules</h3>
          <p>
            {usesPlaceholderParser
              ? "Placeholder output cannot be saved as future mapping rules."
              : "Existing rules propose mappings. Student edits can stay snapshot-only or create a new future rule."}
          </p>
          <dl className="cad-key-values">
            <div><dt>Existing rules</dt><dd>{mappings.filter((mapping) => mapping.rule).length}</dd></div>
            <div><dt>Needs review</dt><dd>{unresolvedCount}</dd></div>
            <div><dt>Previous snapshot</dt><dd>{snapshot?.previousSnapshotId ?? "none"}</dd></div>
          </dl>
        </article>

        <article className="cad-card cad-status-card">
          <span className="cad-eyebrow">Finalize</span>
          <h3>Review gate</h3>
          <p>
            {usesPlaceholderParser
              ? "Finalize is blocked for placeholder STEP output."
              : "Finalize is blocked while required mappings are unresolved unless you explicitly allow unresolved warnings."}
          </p>
          <label className="cad-inline-check">
            <input
              checked={allowUnresolved}
              disabled={usesPlaceholderParser}
              onChange={(event) => setAllowUnresolved(event.target.checked)}
              type="checkbox"
            />
            <span>Finalize with unresolved warnings</span>
          </label>
          <button
            className="secondary-button"
            disabled={!snapshot || isFinalizing || usesPlaceholderParser || (unresolvedCount > 0 && !allowUnresolved)}
            onClick={() => onFinalize(allowUnresolved)}
            type="button"
          >
            {isFinalizing ? "Finalizing..." : "Finalize snapshot"}
          </button>
        </article>
      </div>

      <CadStepTreePanel
        importRun={importRun}
        isViewingOlderSnapshot={isViewingOlderSnapshot}
        tree={tree}
      />

      <section className="cad-card">
        <div className="cad-section-heading">
          <span className="cad-eyebrow">Mapping review</span>
          <h3>Detected items</h3>
        </div>
        <div className="cad-table-wrap">
          <table className="cad-table cad-mapping-table">
            <thead>
              <tr><th>Detected item</th><th>Type</th><th>Suggested target</th><th>Confidence</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {mappings.length ? mappings.map((mapping) => {
                const draft = readDraft(mapping);
                const options = targetOptions(draft.targetKind, targets);
                return (
                  <tr data-status={mapping.status} key={mapping.id}>
                    <td><strong>{mapping.sourceName}</strong><small>{ruleOrigin(mapping)}</small></td>
                    <td>{mapping.sourceKind.replace(/_/g, " ").toLowerCase()}</td>
                    <td>
                      <select
                        value={draft.targetKind}
                        onChange={(event) => setDrafts({
                          ...drafts,
                          [mapping.id]: { ...draft, targetKind: event.target.value as TargetKind, targetId: "" },
                        })}
                      >
                        {targetKinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                      </select>
                      {options.length ? (
                        <select
                          value={draft.targetId}
                          onChange={(event) => setDrafts({
                            ...drafts,
                            [mapping.id]: { ...draft, targetId: event.target.value },
                          })}
                        >
                          <option value="">Select target</option>
                          {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                        </select>
                      ) : null}
                    </td>
                    <td>{mapping.confidence.toLowerCase()}</td>
                    <td>{mapping.status.replace(/_/g, " ").toLowerCase()}</td>
                    <td>
                      <select
                        value={draft.scope}
                        onChange={(event) => setDrafts({
                          ...drafts,
                          [mapping.id]: { ...draft, scope: event.target.value },
                        })}
                      >
                        <option value="snapshot">This snapshot only</option>
                        {usesPlaceholderParser ? null : <option value="future">This snapshot and future imports</option>}
                      </select>
                      <div className="cad-row-actions">
                        <button
                          className="secondary-button compact-action"
                          disabled={isSavingMapping}
                          onClick={() => onConfirmMapping({
                            mappingId: mapping.id,
                            targetKind: draft.targetKind,
                            targetId: draft.targetId || null,
                            applyToFuture: !usesPlaceholderParser && draft.scope === "future",
                          })}
                          type="button"
                        >
                          Confirm
                        </button>
                        <button
                          className="ghost-button compact-action"
                          disabled={isSavingMapping}
                          onClick={() => onConfirmMapping({
                            mappingId: mapping.id,
                            targetKind: "IGNORE",
                            targetId: null,
                            applyToFuture: !usesPlaceholderParser && draft.scope === "future",
                          })}
                          type="button"
                        >
                          Ignore
                        </button>
                        <button
                          className="ghost-button compact-action"
                          disabled={isSavingMapping}
                          onClick={() => onConfirmMapping({
                            mappingId: mapping.id,
                            targetKind: "REFERENCE_GEOMETRY",
                            targetId: null,
                            applyToFuture: !usesPlaceholderParser && draft.scope === "future",
                          })}
                          type="button"
                        >
                          Reference
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={6}>No mappings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="cad-grid cad-grid-two">
        <section className="cad-card">
          <div className="cad-section-heading">
            <span className="cad-eyebrow">Diff</span>
            <h3>Previous snapshot comparison</h3>
          </div>
          {diff?.previousSnapshotId ? (
            <div className="cad-diff-grid">
              <span>Added assemblies: {diff.addedAssemblies.length}</span>
              <span>Removed assemblies: {diff.removedAssemblies.length}</span>
              <span>Moved assemblies: {diff.movedAssemblies.length}</span>
              <span>Added parts: {diff.addedParts.length}</span>
              <span>Removed parts: {diff.removedParts.length}</span>
              <span>Moved part instances: {diff.movedPartInstances.length}</span>
              <span>Mapping changes: {diff.mappingChanges.length}</span>
            </div>
          ) : <p className="cad-empty-copy">Upload another STEP iteration to compare snapshots.</p>}
        </section>

        <section className="cad-card">
          <div className="cad-section-heading">
            <span className="cad-eyebrow">Warnings</span>
            <h3>Import and mapping warnings</h3>
          </div>
          <div className="cad-warning-list">
            {warnings.length ? warnings.map((warning) => (
              <article className="cad-warning-item" data-severity={warning.severity.toLowerCase()} key={warning.id}>
                <strong>{warning.title}</strong>
                <span>{warning.message}</span>
                <code>{warning.code}</code>
              </article>
            )) : <p className="cad-empty-copy">No warnings for this snapshot.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
