import type React from "react";

import type { BootstrapPayload, EventRecord } from "@/types";
import type { TimelineEventDraft } from "@/features/workspace/shared/timeline";

export interface TimelineMilestoneModalProps {
  activeDayEvents: EventRecord[];
  activeEventDay: string | null;
  bootstrap: BootstrapPayload;
  eventDraft: TimelineEventDraft;
  eventEndDate: string;
  eventEndTime: string;
  eventError: string | null;
  eventStartDate: string;
  eventStartTime: string;
  isDeletingEvent: boolean;
  isSavingEvent: boolean;
  mode: "create" | "edit" | null;
  onClose: () => void;
  onDelete: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSwitchToTask: () => void;
  portalTarget: HTMLElement | null;
  projectsById: Record<string, BootstrapPayload["projects"][number]>;
  selectableSubsystems: BootstrapPayload["subsystems"];
  setEventDraft: React.Dispatch<React.SetStateAction<TimelineEventDraft>>;
  setEventEndDate: React.Dispatch<React.SetStateAction<string>>;
  setEventEndTime: React.Dispatch<React.SetStateAction<string>>;
  setEventStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEventStartTime: React.Dispatch<React.SetStateAction<string>>;
  subsystemsById: Record<string, BootstrapPayload["subsystems"][number]>;
}
