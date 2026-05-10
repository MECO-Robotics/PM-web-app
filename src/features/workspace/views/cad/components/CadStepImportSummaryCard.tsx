import type {
  CadStepImportSummary,
  CadStepSnapshotRecord,
  CadStepWarningRecord,
} from "../model/cadIntegrationTypes";

const PLACEHOLDER_PARSER_WARNING_CODE = "step_parser_placeholder_used";
const PLACEHOLDER_PARSER_WARNING_TEXT = "Placeholder parser was used. This is not a real parse of the uploaded STEP file.";
const SUMMARY_WARNING_CODES = new Set([
  "step_hierarchy_missing",
  "step_flattened_file",
  "step_parser_partial",
]);

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "not yet";
}

export function CadStepImportSummaryCard({
  snapshot,
  summary,
  warnings,
}: {
  snapshot: CadStepSnapshotRecord | null;
  summary: CadStepImportSummary | null;
  warnings: CadStepWarningRecord[];
}) {
  const usesPlaceholderParser = warnings.some((warning) => warning.code === PLACEHOLDER_PARSER_WARNING_CODE);
  const summaryWarnings = warnings.filter((warning) => SUMMARY_WARNING_CODES.has(warning.code));

  return (
    <article className="cad-card cad-status-card">
      <span className="cad-eyebrow">Import summary</span>
      <h3>{snapshot?.label ?? "No STEP snapshot selected"}</h3>
      <dl className="cad-key-values">
        <div><dt>Status</dt><dd>{snapshot?.status ?? "none"}</dd></div>
        <div><dt>Parser</dt><dd>{summary?.parserVersion ?? "not run"}</dd></div>
        <div><dt>Assemblies</dt><dd>{summary?.assemblyCount ?? 0}</dd></div>
        <div><dt>Part defs</dt><dd>{summary?.partDefinitionCount ?? 0}</dd></div>
        <div><dt>Instances</dt><dd>{summary?.partInstanceCount ?? 0}</dd></div>
        <div><dt>Max depth</dt><dd>{summary?.maxDepth ?? 0}</dd></div>
        <div><dt>Warnings</dt><dd>{warnings.length}</dd></div>
        <div><dt>Created</dt><dd>{formatDate(snapshot?.createdAt)}</dd></div>
      </dl>
      {usesPlaceholderParser ? (
        <p className="cad-parser-alert">{PLACEHOLDER_PARSER_WARNING_TEXT}</p>
      ) : null}
      {summaryWarnings.length ? (
        <div className="cad-summary-warning-list" aria-label="Critical import warnings">
          {summaryWarnings.map((warning) => (
            <article className="cad-summary-warning-item" data-severity={warning.severity.toLowerCase()} key={warning.id}>
              <strong>{warning.title}</strong>
              <span>{warning.message}</span>
              <code>{warning.code}</code>
            </article>
          ))}
        </div>
      ) : null}
    </article>
  );
}
