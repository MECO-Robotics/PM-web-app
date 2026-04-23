import type { NavigationItem, ViewTab } from "../workspace/workspaceTypes";

interface AppSidebarProps {
  activeTab: ViewTab;
  items: NavigationItem[];
  onSelectTab: (tab: ViewTab) => void;
  isCollapsed: boolean;
}

export function AppSidebar({ activeTab, items, onSelectTab, isCollapsed }: AppSidebarProps) {
  return (
    <nav
      aria-label="Workspace views"
      className="sidebar"
      data-collapsed={isCollapsed ? "true" : "false"}
      style={{
        position: "fixed",
        left: 0,
        top: "var(--shell-topbar-height)",
        bottom: 0,
        zIndex: 900,
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border-base)",
      }}
    >
      {items.map(({ value, label, icon, count }) => {
        const isActive = activeTab === value;

        return (
          <button
            key={value}
            className={isActive ? "tab active" : "tab"}
            onClick={() => onSelectTab(value)}
            style={{
              color: isActive ? "var(--meco-blue)" : "var(--text-copy)",
              background: isActive ? "var(--meco-soft-blue)" : "transparent",
              border: "none",
              borderRight: isActive ? "3px solid var(--meco-blue)" : "none",
              cursor: "pointer",
            }}
            type="button"
          >
            <span className="sidebar-tab-main">
              <span
                aria-hidden="true"
                className="sidebar-tab-icon"
                style={{ color: isActive ? "var(--meco-blue)" : "inherit" }}
              >
                {icon}
              </span>
              {!isCollapsed ? (
                <span className="sidebar-tab-label">{label}</span>
              ) : null}
            </span>

            {!isCollapsed ? (
              <span
                aria-label={`${count} items`}
                className="sidebar-tab-count"
                style={{
                  background: isActive ? "var(--meco-blue)" : "var(--border-base)",
                  color: isActive ? "#ffffff" : "var(--text-copy)",
                }}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
