import type { RiskRecord } from "@/types";

import { ATTACHMENT_TYPE_LABELS, formatRiskSeverity, getRiskSeverityPillClassName } from "./riskViewModel";

interface RiskDetailsModalProps {
  activeRisk: RiskRecord;
  getAttachmentLabel: (risk: RiskRecord) => string;
  getMitigationLabel: (risk: RiskRecord) => string;
  getSourceLabel: (risk: RiskRecord) => string;
  onClose: () => void;
  onEditRisk: () => void;
}

export function RiskDetailsModal({
  activeRisk,
  getAttachmentLabel,
  getMitigationLabel,
  getSourceLabel,
  onClose,
  onEditRisk,
}: RiskDetailsModalProps) {
  return (
    <div className="modal-scrim" role="presentation" style={{ zIndex: 2000 }}>
      <section
        aria-modal="true"
        className="modal-card task-details-modal"
        role="dialog"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-base)" }}
      >
        <div className="panel-header compact-header task-details-header">
          <div>
            <p className="eyebrow" style={{ color: "var(--official-red)" }}>
              Risk management
            </p>
            <h2>{activeRisk.title}</h2>
          </div>
          <div className="panel-actions">
            <button className="icon-button task-details-close-button" onClick={onClose} type="button">
              {"\u00D7"}
            </button>
          </div>
        </div>

        <div className="modal-form task-details-grid" style={{ color: "var(--text-copy)" }}>
          <div className="field">
            <span style={{ color: "var(--text-title)" }}>Severity</span>
            <span className={getRiskSeverityPillClassName(activeRisk.severity)}>
              {formatRiskSeverity(activeRisk.severity)}
            </span>
          </div>
          <div className="field">
            <span style={{ color: "var(--text-title)" }}>Source</span>
            <span className="task-detail-copy">
              {activeRisk.sourceType === "qa-report" ? "QA report" : "Test result"}
            </span>
          </div>
          <div className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Source value</span>
            <p className="task-detail-copy">{getSourceLabel(activeRisk)}</p>
          </div>
          <div className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Mitigation task</span>
            <p className="task-detail-copy">{getMitigationLabel(activeRisk)}</p>
          </div>
          <div className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Attachment</span>
            <p className="task-detail-copy">
              {ATTACHMENT_TYPE_LABELS[activeRisk.attachmentType]}: {getAttachmentLabel(activeRisk)}
            </p>
          </div>
          <div className="field modal-wide">
            <span style={{ color: "var(--text-title)" }}>Detail</span>
            <p className="task-detail-copy">{activeRisk.detail || "No risk detail provided."}</p>
          </div>

          <div className="modal-actions modal-wide">
            <button className="primary-action" onClick={onEditRisk} type="button">
              Edit risk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
