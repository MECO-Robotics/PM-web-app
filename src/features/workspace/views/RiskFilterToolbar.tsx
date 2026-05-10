import { CompactFilterMenu } from "@/features/workspace/shared/filters/workspaceCompactFilterMenu";
import { TopbarResponsiveSearch } from "@/features/workspace/shared/filters/TopbarResponsiveSearch";

import type { RiskSeverityFilter, RiskSourceFilter } from "./riskViewModel";

interface RiskFilterToolbarProps {
  onSearchChange: (value: string) => void;
  onSeverityFilterChange: (value: RiskSeverityFilter) => void;
  onSourceFilterChange: (value: RiskSourceFilter) => void;
  search: string;
  severityFilter: RiskSeverityFilter;
  sourceFilter: RiskSourceFilter;
}

export function RiskFilterToolbar({
  onSearchChange,
  onSeverityFilterChange,
  onSourceFilterChange,
  search,
  severityFilter,
  sourceFilter,
}: RiskFilterToolbarProps) {
  const activeFilterCount = Number(severityFilter !== "all") + Number(sourceFilter !== "all");

  return (
    <div className="panel-actions filter-toolbar subsystem-manager-toolbar">
      <TopbarResponsiveSearch
        actions={
          <CompactFilterMenu
            activeCount={activeFilterCount}
            ariaLabel="Risk filters"
            buttonLabel="Filters"
            className="materials-filter-menu"
            items={[
              {
                label: "Severity",
                content: (
                  <select
                    aria-label="Filter risks by severity"
                    className="task-queue-sort-menu-select"
                    onChange={(milestone) => onSeverityFilterChange(milestone.target.value as RiskSeverityFilter)}
                    value={severityFilter}
                  >
                    <option value="all">All severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                ),
              },
              {
                label: "Source",
                content: (
                  <select
                    aria-label="Filter risks by source"
                    className="task-queue-sort-menu-select"
                    onChange={(milestone) => onSourceFilterChange(milestone.target.value as RiskSourceFilter)}
                    value={sourceFilter}
                  >
                    <option value="all">All sources</option>
                    <option value="qa-report">QA report</option>
                    <option value="test-result">Test result</option>
                  </select>
                ),
              },
            ]}
          />
        }
        ariaLabel="Search risks"
        compactPlaceholder="Search"
        onChange={onSearchChange}
        placeholder="Search risks..."
        value={search}
      />

    </div>
  );
}
