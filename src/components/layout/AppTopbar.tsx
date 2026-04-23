import { IconRefresh } from "../shared/Icons";
import type { SessionUser } from "../../lib/auth";

interface AppTopbarProps {
  handleSignOut: () => void;
  isLoadingData: boolean;
  loadWorkspace: () => Promise<void>;
  sessionUser: SessionUser | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function AppTopbar({
  handleSignOut,
  isLoadingData,
  loadWorkspace,
  sessionUser,
  isDarkMode,
  toggleDarkMode,
  toggleSidebar,
  isSidebarCollapsed,
}: AppTopbarProps) {
  return (
    <header
      className="topbar app-topbar"
      style={{
        width: "100%",
        height: "64px",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 0,
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border-base)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          width: isSidebarCollapsed ? "64px" : "240px",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRight: "1px solid var(--border-base)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-copy)",
            cursor: "pointer",
            fontSize: "1.2rem",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: isSidebarCollapsed ? "100%" : "64px",
            height: "100%",
          }}
          title="Toggle Sidebar"
        >
          ☰
        </button>
        {!isSidebarCollapsed && (
          <div className="app-topbar-logo">
            <div className="app-topbar-logo-badge">
              <img
                src="/meco-favicon.svg"
                alt="3D printing icon"
                style={{ height: "38px", width: "auto", maxWidth: "160px", objectFit: "contain" }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="topbar-right app-topbar-right" style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
        {sessionUser ? (
          <div className="profile-menu">
            <button
              aria-haspopup="menu"
              className="user-chip profile-trigger"
              type="button"
              style={{ padding: 0, height: "34px" }}
              title={sessionUser.name}
            >
              {sessionUser.picture ? (
                <img
                  alt={`${sessionUser.name} profile`}
                  className="profile-avatar"
                  referrerPolicy="no-referrer"
                  src={sessionUser.picture}
                />
              ) : (
                <span className="profile-avatar profile-avatar-fallback" aria-hidden="true">
                  {sessionUser.name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </button>
            <div
              aria-label="Profile menu"
              className="profile-menu-popover"
              role="menu"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-base)",
                boxShadow: isDarkMode ? "0 10px 15px -3px rgba(0, 0, 0, 0.5)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "4px",
              }}
            >
              <button
                className="profile-menu-item"
                onClick={handleSignOut}
                role="menuitem"
                style={{ color: "var(--text-title)", background: "transparent" }}
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="user-chip" style={{ padding: "4px 12px", height: "34px" }}>
            <strong style={{ fontSize: "0.85rem", color: "var(--text-title)" }}>Local access</strong>
          </div>
        )}
        <button
          onClick={toggleDarkMode}
          title="Toggle dark mode"
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-panel)",
            border: "1px solid var(--border-base)",
            borderRadius: "8px",
            width: "34px",
            height: "34px",
            color: isDarkMode ? "#fbbf24" : "#64748b",
            cursor: "pointer",
            padding: 0,
            marginLeft: "8px",
          }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <button
          aria-label="Refresh workspace"
          className={isLoadingData ? "icon-button refresh-button is-loading" : "icon-button refresh-button"}
          onClick={() => void loadWorkspace()}
          title="Refresh workspace"
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--meco-soft-blue)",
            border: "1px solid var(--meco-blue)",
            borderRadius: "8px",
            width: "34px",
            height: "34px",
            color: "var(--meco-blue)",
            cursor: "pointer",
            padding: 0,
            marginLeft: "8px",
          }}
        >
          <IconRefresh />
        </button>
      </div>
    </header>
  );
}
