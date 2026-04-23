import { useEffect, useMemo, useState, type CSSProperties } from "react";

export function useAppShell() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isViewportNarrow, setIsViewportNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 960px)").matches
      : false,
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("meco-theme") === "dark";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 960px)");

    const updateViewportState = () => {
      setIsViewportNarrow(mediaQuery.matches);
    };

    updateViewportState();
    mediaQuery.addEventListener("change", updateViewportState);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportState);
    };
  }, []);

  const isShellCompact = isSidebarCollapsed || isViewportNarrow;

  const toggleSidebar = () => {
    setIsSidebarCollapsed((current) => !current);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((current) => {
      const next = !current;
      localStorage.setItem("meco-theme", next ? "dark" : "light");
      return next;
    });
  };

  const pageShellStyle = useMemo(
    () =>
      ({
        background: isDarkMode ? "#0f172a" : "#ffffff",
        "--bg-panel": isDarkMode ? "#1e293b" : "#ffffff",
        "--border-base": isDarkMode ? "#334155" : "#e5e7eb",
        "--text-title": isDarkMode ? "#f8fafc" : "#000000",
        "--text-copy": isDarkMode ? "#e2e8f0" : "#64748b",
        "--meco-blue": isDarkMode ? "#3b82f6" : "#16478e",
        "--meco-soft-blue": isDarkMode ? "#1e3a8a" : "#eff6ff",
        "--bg-row-alt": isDarkMode ? "#0f172a" : "#f8fafc",
        "--official-black": isDarkMode ? "#f8fafc" : "#000000",
        "--status-success-bg": isDarkMode ? "#064e3b" : "#dcfce7",
        "--status-success-text": isDarkMode ? "#34d399" : "#166534",
        "--status-info-bg": isDarkMode ? "#082f49" : "#e0f2fe",
        "--status-info-text": isDarkMode ? "#38bdf8" : "#075985",
        "--status-warning-bg": isDarkMode ? "#451a03" : "#fef3c7",
        "--status-warning-text": isDarkMode ? "#fbbf24" : "#92400e",
        "--status-danger-bg": isDarkMode ? "#450a0a" : "#fee2e2",
        "--status-danger-text": isDarkMode ? "#f87171" : "#991b1b",
        "--status-neutral-bg": isDarkMode ? "#1e293b" : "#f1f5f9",
        "--status-neutral-text": isDarkMode ? "#94a3b8" : "#475569",
        colorScheme: isDarkMode ? "dark" : "light",
      }) as CSSProperties,
    [isDarkMode],
  );

  return {
    isDarkMode,
    isShellCompact,
    pageShellStyle,
    toggleDarkMode,
    toggleSidebar,
  };
}
