import type { EventPayload, EventRecord } from "@/types";
import { requestItem } from "./common";

export function createEventRecord(payload: EventPayload, onUnauthorized?: () => void) {
  return requestItem<EventRecord, EventPayload>("/events", "POST", payload, onUnauthorized);
}

export function updateEventRecord(
  eventId: string,
  payload: Partial<EventPayload>,
  onUnauthorized?: () => void,
) {
  return requestItem<EventRecord, Partial<EventPayload>>(
    `/events/${eventId}`,
    "PATCH",
    payload,
    onUnauthorized,
  );
}

export function deleteEventRecord(eventId: string, onUnauthorized?: () => void) {
  return requestItem<EventRecord, never>(`/events/${eventId}`, "DELETE", undefined, onUnauthorized);
}
