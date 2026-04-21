export type RoleFilter = "all" | "students" | "mentors" | "admins";

export interface PortalCard {
  title: string;
  topline: string;
  metric: string;
  description: string;
  roles: Exclude<RoleFilter, "all">[];
  items: string[];
}

export interface WorkflowLane {
  title: string;
  metric: string;
  summary: string;
  tags: string[];
}

export interface SubsystemCard {
  name: string;
  lead: string;
  mentor: string;
  progress: number;
}
