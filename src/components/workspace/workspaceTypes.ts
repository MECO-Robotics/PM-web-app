import type { CSSProperties, ReactNode } from "react";

import type { BootstrapPayload } from "../../types";

export type ViewTab =
  | "timeline"
  | "queue"
  | "purchases"
  | "cnc"
  | "prints"
  | "materials"
  | "parts"
  | "roster";

export interface NavigationItem {
  value: ViewTab;
  label: string;
  icon: ReactNode;
  count: number;
}

export interface DropdownOption {
  id: string;
  name: string;
}

export type MembersById = Record<string, BootstrapPayload["members"][number]>;
export type SubsystemsById = Record<string, BootstrapPayload["subsystems"][number]>;

export const WORKSPACE_PANEL_STYLE: CSSProperties = {
  margin: 0,
  borderRadius: 0,
  border: "none",
  background: "var(--bg-panel)",
};
