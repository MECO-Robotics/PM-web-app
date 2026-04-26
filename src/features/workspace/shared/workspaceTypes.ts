import type { BootstrapPayload } from "@/types";

export interface DropdownOption {
  id: string;
  name: string;
}

export type MembersById = Record<string, BootstrapPayload["members"][number]>;
export type SubsystemsById = Record<string, BootstrapPayload["subsystems"][number]>;

export const WORKSPACE_PANEL_CLASS = "workspace-panel";

