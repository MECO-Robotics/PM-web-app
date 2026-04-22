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
    <nav aria-label="Workspace views" className="sidebar" style={{ padding: 0 }}>
      {items.map(({ value, label, icon, count }) => (
        <button
          className={activeTab === value ? "tab active" : "tab"}
          key={value}
          onClick={() => onSelectTab(value)}
          type="button"
        >
          <span className="sidebar-tab-main">
            <span aria-hidden="true" className="sidebar-tab-icon">{icon}</span>
            <span>{label}</span>
          </span>
          <span aria-label={`${count} items`} className="sidebar-tab-count">{count}</span>
        </button>
      ))}
    </nav>
  );
}
