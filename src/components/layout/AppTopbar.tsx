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
      data-collapsed={isSidebarCollapsed ? "true" : "false"}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border-base)",
      }}
    >
      <div className="app-topbar-left">
        <button
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="app-topbar-toggle"
          onClick={toggleSidebar}
          title="Toggle sidebar"
          type="button"
        >
          <span aria-hidden="true">{"\u2630"}</span>
        </button>
        {!isSidebarCollapsed ? (
          <div className="app-topbar-brand">
            <div className="app-topbar-logo-badge">
              <img
                alt="3D printing icon"
                className="app-topbar-brand-icon"
                src="/meco-favicon.svg"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="topbar-right app-topbar-right">
        {sessionUser ? (
          <div className="profile-menu">
            <button
              aria-haspopup="menu"
              className="user-chip profile-trigger"
              title={sessionUser.name}
              type="button"
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
            <div aria-label="Profile menu" className="profile-menu-popover" role="menu">
              <button
                className="profile-menu-item"
                onClick={handleSignOut}
                role="menuitem"
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="user-chip app-topbar-user-chip">
            <strong>Local access</strong>
          </div>
        )}

        <button
          aria-label="Toggle dark mode"
          className="app-topbar-icon-button"
          onClick={toggleDarkMode}
          title="Toggle dark mode"
          type="button"
        >
          <span aria-hidden="true">{isDarkMode ? "\u2600" : "\u263E"}</span>
        </button>

        <button
          aria-label="Refresh workspace"
          className={
            isLoadingData
              ? "icon-button refresh-button app-topbar-icon-button is-loading"
              : "icon-button refresh-button app-topbar-icon-button"
          }
          onClick={() => void loadWorkspace()}
          title="Refresh workspace"
          type="button"
        >
          <IconRefresh />
        </button>
      </div>
    </header>
  );
}
