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
}

export function AppSidebar({ activeTab, items, onSelectTab }: AppSidebarProps) {
  return (
    <nav
      aria-label="Workspace views"
      className="sidebar"
      style={{
        padding: 0,
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border-base)",
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
            }}
            type="button"
          >
            <span className="sidebar-tab-main">
              <span aria-hidden="true" className="sidebar-tab-icon" style={{ color: isActive ? "var(--meco-blue)" : "inherit" }}>{icon}</span>
              <span style={{ fontWeight: isActive ? "600" : "400" }}>{label}</span>
            </span>
            <span
              aria-label={`${count} items`}
              className="sidebar-tab-count"
              style={{
                background: isActive ? "var(--meco-blue)" : "var(--border-base)",
                color: isActive ? "#ffffff" : "var(--text-copy)",
              }}
            >{count}</span>
          </button>
        );
      })}
    </nav>
  );
}
