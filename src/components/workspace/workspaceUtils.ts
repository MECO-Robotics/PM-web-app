import type { CSSProperties } from "react";

export function getStatusPillStyle(value: string): CSSProperties {
    const success = new Set(["complete", "delivered", "approved", "low", "available", "installed"]);
    const info = new Set(["in-progress", "shipped", "purchased", "medium"]);
    const warning = new Set(["waiting-for-qa", "qa", "requested", "high", "waiting", "needed"]);
    const danger = new Set(["not-started", "critical", "retired"]);

    let prefix = "--status-neutral";
    if (success.has(value)) {
        prefix = "--status-success";
    } else if (info.has(value)) {
        prefix = "--status-info";
    } else if (warning.has(value)) {
        prefix = "--status-warning";
    } else if (danger.has(value)) {
        prefix = "--status-danger";
    }

    return {
        background: `var(${prefix}-bg)`,
        color: `var(${prefix}-text)`,
        border: "none",
        fontWeight: "600",
        fontSize: "0.7rem",
        padding: "2px 8px",
        borderRadius: "4px",
        textTransform: "capitalize",
        width: "fit-content",
    };
}