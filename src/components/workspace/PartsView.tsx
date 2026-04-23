import { useMemo, useState, type ReactNode } from "react";
import { IconManufacturing, IconTasks } from "../shared/Icons";
import type { BootstrapPayload, PartDefinitionRecord } from "../../types";

function TableCell({
  label,
  valueClassName,
  children,
}: {
  label: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <span className="table-cell" data-label={label}>
      <span className={`table-cell-value${valueClassName ? ` ${valueClassName}` : ""}`}>{children}</span>
    </span>
  );
}

function FilterDropdown({
  icon,
  value,
  onChange,
  options,
  allLabel,
}: {
  icon: ReactNode;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; name: string }[];
  allLabel: string;
}) {
  const isActive = value !== "all";
  return (
    <label className={`toolbar-filter toolbar-filter-compact${isActive ? " is-active" : ""}`}>
      <span className="toolbar-filter-icon">{icon}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="all">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </label>
  );
}

interface PartsViewProps {
  bootstrap: BootstrapPayload;
  handleDeletePartDefinition: (id: string) => void;
  isDeletingPartDefinition: boolean;
  openCreatePartDefinitionModal: () => void;
  openEditPartDefinitionModal: (item: PartDefinitionRecord) => void;
  partDefinitionsById: Record<string, BootstrapPayload["partDefinitions"][number]>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}

export function PartsView({
  bootstrap,
  handleDeletePartDefinition,
  isDeletingPartDefinition,
  openCreatePartDefinitionModal,
  openEditPartDefinitionModal,
  partDefinitionsById,
  subsystemsById,
}: PartsViewProps) {
  const [partSearch, setPartSearch] = useState("");
  const [partSubsystem, setPartSubsystem] = useState("all");
  const [partStatus, setPartStatus] = useState("all");

  const getPillStyle = (value: string) => {
    const success: string[] = ["available", "installed"];
    const info: string[] = [];
    const warning: string[] = ["needed"];
    const danger: string[] = ["retired"];

    let prefix = "--status-neutral";
    if (success.includes(value)) prefix = "--status-success";
    else if (info.includes(value)) prefix = "--status-info";
    else if (warning.includes(value)) prefix = "--status-warning";
    else if (danger.includes(value)) prefix = "--status-danger";

    return {
      background: `var(${prefix}-bg)`,
      color: `var(${prefix}-text)`,
      border: "none",
      fontWeight: "600",
      fontSize: "0.7rem",
      padding: "2px 8px",
      borderRadius: "4px",
      textTransform: "capitalize" as const,
      width: "fit-content",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    };
  };

  const filteredPartDefinitions = useMemo(() => {
    const search = partSearch.toLowerCase();
    return bootstrap.partDefinitions.filter((partDefinition) => {
      const materialName = partDefinition.materialId
        ? bootstrap.materials.find((material) => material.id === partDefinition.materialId)?.name ?? ""
        : "";
      return !search ||
        partDefinition.name.toLowerCase().includes(search) ||
        partDefinition.partNumber.toLowerCase().includes(search) ||
        partDefinition.type.toLowerCase().includes(search) ||
        partDefinition.source.toLowerCase().includes(search) ||
        materialName.toLowerCase().includes(search);
    });
  }, [bootstrap.materials, bootstrap.partDefinitions, partSearch]);

  const filteredPartInstances = useMemo(() => {
    const search = partSearch.toLowerCase();
    return bootstrap.partInstances.filter((partInstance) => {
      const definition = partDefinitionsById[partInstance.partDefinitionId];
      const matchesSearch = !search ||
        partInstance.name.toLowerCase().includes(search) ||
        definition?.name.toLowerCase().includes(search) ||
        definition?.partNumber.toLowerCase().includes(search);
      const matchesSubsystem = partSubsystem === "all" || partInstance.subsystemId === partSubsystem;
      const matchesStatus = partStatus === "all" || partInstance.status === partStatus;
      return matchesSearch && matchesSubsystem && matchesStatus;
    });
  }, [bootstrap.partInstances, partDefinitionsById, partSearch, partStatus, partSubsystem]);

  return (
    <section className="panel dense-panel part-manager-shell" style={{ margin: 0, borderRadius: 0, border: "none", background: "var(--bg-panel)" }}>
      <div className="panel-header compact-header">
        <div className="queue-section-header">
          <h2 style={{ color: "var(--text-title)" }}>Part manager</h2>
          <p className="section-copy" style={{ color: "var(--text-copy)" }}>Reusable part definitions and subsystem-specific part instances for traceability.</p>
        </div>
        <div className="panel-actions filter-toolbar queue-toolbar part-manager-toolbar" style={{ justifyContent: "flex-start" }}>
          <label className={`toolbar-filter toolbar-filter-compact toolbar-search${partSearch.trim() !== "" ? " is-active" : ""}`}>
            <span className="toolbar-filter-icon"><IconTasks /></span>
            <input
              className="toolbar-search-input"
              onChange={(event) => setPartSearch(event.target.value)}
              placeholder="Search parts..."
              type="text"
              value={partSearch}
            />
          </label>

          <FilterDropdown
            allLabel="All subsystems"
            icon={<IconManufacturing />}
            onChange={setPartSubsystem}
            options={bootstrap.subsystems}
            value={partSubsystem}
          />

          <FilterDropdown
            allLabel="All statuses"
            icon={<IconTasks />}
            onChange={setPartStatus}
            options={[
              { id: "planned", name: "Planned" },
              { id: "needed", name: "Needed" },
              { id: "available", name: "Available" },
              { id: "installed", name: "Installed" },
              { id: "retired", name: "Retired" },
            ]}
            value={partStatus}
          />

          <button aria-label="Add part definition" className="primary-action queue-toolbar-action part-manager-toolbar-action" onClick={openCreatePartDefinitionModal} title="Add part definition" type="button">
            Add part
          </button>
        </div>
      </div>

      <div className="panel-subsection">
        <div className="table-shell">
          <div className="ops-table ops-table-header" style={{ gridTemplateColumns: "minmax(180px, 2fr) 1fr 0.6fr 0.8fr 1fr 0.8fr", borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)" }}>
            <span style={{ textAlign: "left" }}>Part</span>
            <span>Number</span>
            <span>Rev</span>
            <span>Type</span>
            <span>Material</span>
            <span>Actions</span>
          </div>
          {filteredPartDefinitions.map((partDefinition) => (
            <div
              className="ops-table ops-row"
              key={partDefinition.id}
              style={{ gridTemplateColumns: "minmax(180px, 2fr) 1fr 0.6fr 0.8fr 1fr 0.8fr", padding: "12px 16px", borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)", background: "var(--bg-row-alt)" }}
            >
              <TableCell label="Part">
                <strong style={{ color: "var(--text-title)" }}>{partDefinition.name}</strong>
                {partDefinition.description ? <small>{partDefinition.description}</small> : null}
              </TableCell>
              <TableCell label="Number">{partDefinition.partNumber}</TableCell>
              <TableCell label="Rev">{partDefinition.revision}</TableCell>
              <TableCell label="Type">{partDefinition.type}</TableCell>
              <TableCell label="Material">
                {(partDefinition.materialId ? bootstrap.materials.find((material) => material.id === partDefinition.materialId)?.name : null) ?? "Unassigned"}
              </TableCell>
              <TableCell label="Actions">
                <span className="part-manager-row-actions" style={{ display: "inline-flex", gap: "0.35rem" }}>
                  <button className="secondary-action part-manager-action" onClick={() => openEditPartDefinitionModal(partDefinition)} style={{ padding: "0.35rem 0.6rem" }} type="button">
                    Edit
                  </button>
                  <button className="danger-action part-manager-danger-action" disabled={isDeletingPartDefinition} onClick={() => handleDeletePartDefinition(partDefinition.id)} style={{ padding: "0.35rem 0.6rem" }} type="button">
                    Delete
                  </button>
                </span>
              </TableCell>
            </div>
          ))}
          {filteredPartDefinitions.length === 0 ? (
            <p className="empty-state">No part definitions match the current search.</p>
          ) : null}
        </div>
      </div>

      <div className="panel-subsection">
        <div className="roster-section-header">
          <h3 style={{ color: "var(--text-title)" }}>Part instances</h3>
        </div>
        <div className="table-shell">
          <div className="ops-table ops-table-header" style={{ gridTemplateColumns: "minmax(180px, 2fr) 1fr 1fr 0.5fr 0.8fr", borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)" }}>
            <span style={{ textAlign: "left" }}>Instance</span>
            <span>Definition</span>
            <span>Subsystem</span>
            <span>Qty</span>
            <span>Status</span>
          </div>
          {filteredPartInstances.map((partInstance) => (
            <div
              className="ops-table ops-row"
              key={partInstance.id}
              style={{ gridTemplateColumns: "minmax(180px, 2fr) 1fr 1fr 0.5fr 0.8fr", padding: "12px 16px", borderBottom: "1px solid var(--border-base)", color: "var(--text-copy)", background: "var(--bg-row-alt)" }}
            >
              <TableCell label="Instance">
                <strong style={{ color: "var(--text-title)" }}>{partInstance.name}</strong>
                <small>{partInstance.trackIndividually ? "Individual tracking" : "Bulk quantity"}</small>
              </TableCell>
              <TableCell label="Definition">
                {partDefinitionsById[partInstance.partDefinitionId]?.name ?? "Unknown part"}
              </TableCell>
              <TableCell label="Subsystem">
                {(partInstance.subsystemId ? subsystemsById[partInstance.subsystemId]?.name : null) ?? "Unknown"}
              </TableCell>
              <TableCell label="Qty">{partInstance.quantity}</TableCell>
              <TableCell label="Status" valueClassName="table-cell-pill">
                <span style={getPillStyle(partInstance.status)}>{partInstance.status}</span>
              </TableCell>
            </div>
          ))}
          {filteredPartInstances.length === 0 ? (
            <p className="empty-state">No part instances match the current filters.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
