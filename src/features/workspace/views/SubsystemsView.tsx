import { useMemo, useState } from "react";

import { IconEdit, IconPlus } from "@/components/shared";
import type { BootstrapPayload, MechanismRecord, SubsystemRecord } from "@/types";
import {
  SearchToolbarInput,
  TableCell,
  useFilterChangeMotionClass,
} from "@/features/workspace/shared";
import { formatIterationVersion, getDefaultSubsystemId } from "@/lib/appUtils";
import type { MembersById } from "@/features/workspace/shared";
import { WORKSPACE_PANEL_CLASS } from "@/features/workspace/shared";

interface SubsystemsViewProps {
  bootstrap: BootstrapPayload;
  membersById: MembersById;
  openCreateMechanismModal: (subsystemId?: string) => void;
  openCreatePartInstanceModal: (mechanism: BootstrapPayload["mechanisms"][number]) => void;
  openCreateSubsystemModal: () => void;
  openEditMechanismModal: (mechanism: MechanismRecord) => void;
  openEditPartInstanceModal: (partInstance: BootstrapPayload["partInstances"][number]) => void;
  openEditSubsystemModal: (subsystem: SubsystemRecord) => void;
}

function formatMemberName(membersById: MembersById, memberId: string | null) {
  if (!memberId) {
    return "Unassigned";
  }

  return membersById[memberId]?.name ?? "Unknown";
}

export function SubsystemsView({
  bootstrap,
  membersById,
  openCreateMechanismModal,
  openCreatePartInstanceModal,
  openCreateSubsystemModal,
  openEditMechanismModal,
  openEditSubsystemModal,
}: SubsystemsViewProps) {
  const [search, setSearch] = useState("");
  const [showArchivedSubsystems, setShowArchivedSubsystems] = useState(false);
  const [showArchivedMechanisms, setShowArchivedMechanisms] = useState(false);
  const [selectedSubsystemId, setSelectedSubsystemId] = useState(
    getDefaultSubsystemId(bootstrap),
  );

  const handleSubsystemSelection = (subsystemId: string) => {
    setSelectedSubsystemId((currentSubsystemId) =>
      currentSubsystemId === subsystemId ? "" : subsystemId,
    );
  };

  const countsBySubsystemId = useMemo(() => {
    const initialCounts = Object.fromEntries(
      bootstrap.subsystems.map((subsystem) => [
        subsystem.id,
        {
          mechanisms: 0,
          parts: 0,
          tasks: 0,
          openTasks: 0,
        },
      ]),
    ) as Record<
      string,
      {
        mechanisms: number;
        parts: number;
        tasks: number;
        openTasks: number;
      }
    >;

    for (const mechanism of bootstrap.mechanisms) {
      if (!showArchivedMechanisms && mechanism.isArchived) {
        continue;
      }
      initialCounts[mechanism.subsystemId] = initialCounts[mechanism.subsystemId] ?? {
        mechanisms: 0,
        parts: 0,
        tasks: 0,
        openTasks: 0,
      };
      initialCounts[mechanism.subsystemId].mechanisms += 1;
    }

    for (const partInstance of bootstrap.partInstances) {
      initialCounts[partInstance.subsystemId] = initialCounts[partInstance.subsystemId] ?? {
        mechanisms: 0,
        parts: 0,
        tasks: 0,
        openTasks: 0,
      };
      initialCounts[partInstance.subsystemId].parts += 1;
    }

    for (const task of bootstrap.tasks) {
      for (const subsystemId of task.subsystemIds) {
        initialCounts[subsystemId] = initialCounts[subsystemId] ?? {
          mechanisms: 0,
          parts: 0,
          tasks: 0,
          openTasks: 0,
        };
        initialCounts[subsystemId].tasks += 1;
        if (task.status !== "complete") {
          initialCounts[subsystemId].openTasks += 1;
        }
      }
    }

    return initialCounts;
  }, [
    bootstrap.mechanisms,
    bootstrap.partInstances,
    bootstrap.subsystems,
    bootstrap.tasks,
    showArchivedMechanisms,
  ]);

  const partDefinitionsById = useMemo(
    () =>
      Object.fromEntries(
        bootstrap.partDefinitions.map((partDefinition) => [partDefinition.id, partDefinition]),
      ) as Record<string, BootstrapPayload["partDefinitions"][number]>,
    [bootstrap.partDefinitions],
  );

  const filteredSubsystems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...bootstrap.subsystems].filter((subsystem) => {
      if (!showArchivedSubsystems && subsystem.isArchived) {
        return false;
      }

      const parentSubsystem = subsystem.parentSubsystemId
        ? bootstrap.subsystems.find((candidate) => candidate.id === subsystem.parentSubsystemId)
        : null;
      const relatedMechanisms = bootstrap.mechanisms
        .filter((mechanism) => (showArchivedMechanisms ? true : !mechanism.isArchived))
        .filter((mechanism) => mechanism.subsystemId === subsystem.id)
        .map((mechanism) => mechanism.name)
        .join(" ");
      const relatedTasks = bootstrap.tasks
        .filter((task) => task.subsystemId === subsystem.id || task.subsystemIds.includes(subsystem.id))
        .map((task) => `${task.title} ${task.summary}`)
        .join(" ");
      const relatedPartInstances = bootstrap.partInstances
        .filter((partInstance) => partInstance.subsystemId === subsystem.id)
        .map((partInstance) => {
          const partDefinition = partDefinitionsById[partInstance.partDefinitionId];
          return `${partInstance.name} ${partDefinition?.name ?? ""}`;
        })
        .join(" ");
      const relatedRisks = subsystem.risks.join(" ");
      const responsibleEngineer = formatMemberName(
        membersById,
        subsystem.responsibleEngineerId,
      );
      const mentorNames = subsystem.mentorIds
        .map((mentorId) => membersById[mentorId]?.name ?? "")
        .join(" ");
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          subsystem.name,
          subsystem.description,
          `iteration ${subsystem.iteration}`,
          formatIterationVersion(subsystem.iteration),
          parentSubsystem?.name ?? "",
          responsibleEngineer,
          mentorNames,
          relatedMechanisms,
          relatedTasks,
          relatedPartInstances,
          relatedRisks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesSearch;
    });
  }, [
    bootstrap.mechanisms,
    bootstrap.partInstances,
    bootstrap.subsystems,
    bootstrap.tasks,
    membersById,
    partDefinitionsById,
    search,
    showArchivedMechanisms,
    showArchivedSubsystems,
  ]);

  const selectedSubsystem =
    filteredSubsystems.find((subsystem) => subsystem.id === selectedSubsystemId) ?? null;
  const subsystemFilterMotionClass = useFilterChangeMotionClass([
    search,
    showArchivedSubsystems,
    showArchivedMechanisms,
  ]);

  return (
    <section className={`panel dense-panel subsystem-manager-shell ${WORKSPACE_PANEL_CLASS}`}>
      <div className="panel-header compact-header">
        <div className="queue-section-header">
          <h2 style={{ color: "var(--text-title)" }}>Subsystem manager</h2>
          <p className="section-copy filter-copy" style={{ color: "var(--text-copy)" }}>
            Review subsystem ownership, risk, and mechanism coverage in one place.
          </p>
        </div>
        <div className="panel-actions filter-toolbar subsystem-manager-toolbar">
          <div data-tutorial-target="subsystem-search-input">
            <SearchToolbarInput
              ariaLabel="Search subsystems and mechanisms"
              onChange={setSearch}
              placeholder="Search subsystems or mechanisms..."
              value={search}
            />
          </div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "var(--text-copy)",
              fontSize: "0.85rem",
            }}
          >
            <input
              checked={showArchivedSubsystems}
              onChange={(event) => setShowArchivedSubsystems(event.target.checked)}
              type="checkbox"
            />
            Show archived subsystems
          </label>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "var(--text-copy)",
              fontSize: "0.85rem",
            }}
          >
            <input
              checked={showArchivedMechanisms}
              onChange={(event) => setShowArchivedMechanisms(event.target.checked)}
              type="checkbox"
            />
            Show archived mechanisms
          </label>

          <button
            aria-label="Add subsystem"
            className="primary-action queue-toolbar-action subsystem-manager-toolbar-action"
            data-tutorial-target="create-subsystem-button"
            onClick={openCreateSubsystemModal}
            type="button"
          >
            Add subsystem
          </button>
        </div>
      </div>

      <div className="panel-subsection subsystem-manager-list" style={{ flex: "1 1 620px" }}>
        <div className="roster-section-header">
          <div className="roster-section-title">
            <h3 style={{ color: "var(--text-title)" }}>Subsystems</h3>
          </div>
        </div>

        <div className={`table-shell subsystem-manager-list-shell ${subsystemFilterMotionClass}`}>
          <div
            className="ops-table ops-table-header subsystem-manager-table-header"
            style={{
              gridTemplateColumns: "minmax(220px, 2.2fr) 1fr 1.1fr 0.8fr 0.8fr 0.8fr",
              borderBottom: "1px solid var(--border-base)",
              color: "var(--text-copy)",
            }}
          >
            <span style={{ textAlign: "left" }}>Subsystem</span>
            <span>Lead</span>
            <span>Mentors</span>
            <span>Mechanisms</span>
            <span>Tasks</span>
            <span>Risks</span>
          </div>

          {filteredSubsystems.map((subsystem) => {
            const counts = countsBySubsystemId[subsystem.id] ?? {
              mechanisms: 0,
              parts: 0,
              tasks: 0,
              openTasks: 0,
            };
            const isSelected = subsystem.id === selectedSubsystem?.id;
            const mentorNames = subsystem.mentorIds
              .map((mentorId) => membersById[mentorId]?.name ?? "Unknown")
              .join(", ");
            const parentSubsystem = subsystem.parentSubsystemId
              ? bootstrap.subsystems.find(
                  (candidate) => candidate.id === subsystem.parentSubsystemId,
                )
              : null;
            const subsystemDescription = subsystem.description.trim();
            const subsystemMechanisms = [...bootstrap.mechanisms]
              .filter((mechanism) => mechanism.subsystemId === subsystem.id)
              .filter((mechanism) => (showArchivedMechanisms ? true : !mechanism.isArchived))
              .sort((left, right) => left.name.localeCompare(right.name));
            const accentColor = subsystem.color ?? "var(--meco-blue)";

            return (
              <div
                key={subsystem.id}
                className={`subsystem-manager-item${isSelected ? " is-active" : ""}`}
                data-workspace-color={subsystem.color}
              >
                <div
                  className="ops-table ops-row subsystem-manager-row editable-row-clickable editable-action-host editable-hover-target-row"
                  onClick={() => handleSubsystemSelection(subsystem.id)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) {
                      return;
                    }

                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSubsystemSelection(subsystem.id);
                    }
                  }}
                  role="button"
                  aria-expanded={isSelected}
                  aria-controls={`subsystem-${subsystem.id}-details`}
                  style={{
                    gridTemplateColumns: "minmax(220px, 2.2fr) 1fr 1.1fr 0.8fr 0.8fr 0.8fr",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-base)",
                    color: "var(--text-copy)",
                    background: isSelected ? "rgba(22, 71, 142, 0.08)" : "var(--row-bg, var(--bg-row-alt))",
                    textAlign: "left",
                    boxShadow: isSelected
                      ? `inset 4px 0 0 ${accentColor}, inset 0 0 0 1px rgba(22, 71, 142, 0.16)`
                      : `inset 4px 0 0 ${accentColor}`,
                  }}
                  tabIndex={0}
                  title={`Inspect ${subsystem.name}`}
                >
                  <TableCell label="Subsystem">
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "flex-start",
                        gap: "0.65rem",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: "0.75rem",
                          height: "0.75rem",
                          borderRadius: "999px",
                          marginTop: "0.2rem",
                          flexShrink: 0,
                          background: accentColor,
                          boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.08)",
                        }}
                      />
                      <span className="subsystem-cell-meta">
                        <strong className="subsystem-cell-title">{subsystem.name}</strong>
                        {subsystem.isArchived ? (
                          <span className="subsystem-cell-description">Archived</span>
                        ) : null}
                        {subsystemDescription ? (
                          <span className="subsystem-cell-description">{subsystemDescription}</span>
                        ) : null}
                        <span className="subsystem-cell-details" aria-label="Subsystem metadata">
                          <small>{formatIterationVersion(subsystem.iteration)}</small>
                          <small>
                            {subsystem.parentSubsystemId
                              ? `Parent: ${parentSubsystem?.name ?? "Unknown"}`
                              : "Root subsystem"}
                          </small>
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell label="Lead">
                    {formatMemberName(membersById, subsystem.responsibleEngineerId)}
                  </TableCell>
                  <TableCell label="Mentors">{mentorNames || "Unassigned"}</TableCell>
                  <TableCell label="Mechanisms">{counts.mechanisms}</TableCell>
                  <TableCell label="Tasks">
                    <strong style={{ color: "var(--text-title)" }}>{counts.openTasks}</strong>
                    <small>{counts.tasks} total</small>
                  </TableCell>
                  <TableCell label="Risks">{subsystem.risks.length}</TableCell>
                  <div className="subsystem-manager-row-actions">
                    <button
                      className="subsystem-manager-action-button subsystem-manager-action-button-primary"
                      data-tutorial-target="create-mechanism-button"
                      disabled={subsystem.isArchived}
                      onClick={(event) => {
                        event.stopPropagation();
                        openCreateMechanismModal(subsystem.id);
                      }}
                      type="button"
                      aria-label={`Add mechanism to ${subsystem.name}`}
                      title="Add mechanism"
                    >
                      <IconPlus />
                    </button>
                    <button
                      className="subsystem-manager-action-button"
                      data-tutorial-target="edit-subsystem-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditSubsystemModal(subsystem);
                      }}
                      type="button"
                      aria-label={`Edit ${subsystem.name}`}
                      title="Edit subsystem"
                    >
                      <IconEdit />
                    </button>
                  </div>
                </div>

                {isSelected ? (
                  <div className="subsystem-manager-expansion" id={`subsystem-${subsystem.id}-details`}>
                    {subsystemMechanisms.length > 0 ? (
                      <div style={{ display: "grid", gap: "0.45rem" }}>
                        {subsystemMechanisms.map((mechanism) => (
                          <div
                            key={mechanism.id}
                            className="summary-chip"
                            style={{ display: "grid", gap: "0.3rem" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "0.75rem",
                                alignItems: "flex-start",
                              }}
                            >
                              <div style={{ display: "grid", gap: "0.2rem" }}>
                                <strong style={{ color: "var(--text-title)" }}>{mechanism.name}</strong>
                                {mechanism.isArchived ? (
                                  <small style={{ color: "var(--text-copy)" }}>Archived</small>
                                ) : null}
                                <small style={{ color: "var(--text-copy)" }}>
                                  {formatIterationVersion(mechanism.iteration)} / {mechanism.description}
                                </small>
                              </div>
                              <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                                <button
                                  className="subsystem-manager-action-button subsystem-manager-action-button-primary"
                                  data-tutorial-target="add-part-to-mechanism-button"
                                  onClick={() => openCreatePartInstanceModal(mechanism)}
                                  type="button"
                                  aria-label={`Add part to ${mechanism.name}`}
                                  title="Add part to mechanism"
                                >
                                  <IconPlus />
                                </button>
                                <button
                                  className="subsystem-manager-action-button"
                                  data-tutorial-target="edit-mechanism-button"
                                  onClick={() => openEditMechanismModal(mechanism)}
                                  type="button"
                                  aria-label={`Edit ${mechanism.name}`}
                                  title="Edit mechanism"
                                >
                                  <IconEdit />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <small style={{ color: "var(--text-copy)" }}>No mechanisms yet.</small>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}

          {filteredSubsystems.length === 0 ? (
            <p className="empty-state">
              No subsystems match the current search or filters.
            </p>
          ) : null}
        </div>
      </div>

    </section>
  );
}
