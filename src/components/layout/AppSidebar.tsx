import type { ReactNode } from "react";

interface NavigationItem {
  value: string;
  label: string;
  icon: ReactNode;
  count: number;
}

interface AppSidebarProps {
  activeTab: string;
  items: NavigationItem[];
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
}

export function AppSidebar({ activeTab, items, onSelectTab, isCollapsed }: AppSidebarProps) {
  return (
    <nav
      aria-label="Workspace views"
      className="sidebar"
      style={{
        position: "fixed",
        left: 0,
        top: "64px",
        bottom: 0,
        width: isCollapsed ? "64px" : "240px",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        padding: 0,
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border-base)",
        overflowX: "hidden",
        zIndex: 900,
      }}
    >
      {items.map(({ value, label, icon, count }) => {
        const isActive = activeTab === value;
        return (
          <button
            className={isActive ? "tab active" : "tab"}
            key={value}
            onClick={() => onSelectTab(value)}
            style={{
              color: isActive ? "var(--meco-blue)" : "var(--text-copy)",
              background: isActive ? "var(--meco-soft-blue)" : "transparent",
              border: "none",
              borderRight: isActive ? "3px solid var(--meco-blue)" : "none",
              width: "100%",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              padding: isCollapsed ? "0" : "0 20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            type="button"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isCollapsed ? "0" : "12px",
              }}
            >
              <span aria-hidden="true" className="sidebar-tab-icon" style={{ color: isActive ? "var(--meco-blue)" : "inherit", display: "flex", alignItems: "center", fontSize: "1.2rem" }}>{icon}</span>
              {!isCollapsed && <span style={{ fontWeight: isActive ? "600" : "400", whiteSpace: "nowrap", fontSize: "0.9rem" }}>{label}</span>}
            </div>
            {!isCollapsed && <span
              aria-label={`${count} items`}
              className="sidebar-tab-count"
              style={{
                background: isActive ? "var(--meco-blue)" : "var(--border-base)",
                color: isActive ? "#ffffff" : "var(--text-copy)",
              }}
            >{count}</span>}
          </button>
        );
      })}
    </nav>
  );
}
