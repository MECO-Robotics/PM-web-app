import type {
  MechanismPayload,
  MechanismRecord,
  SubsystemPayload,
  SubsystemRecord,
} from "@/types";
import { requestItem } from "./common";

export function createSubsystemRecord(
  payload: SubsystemPayload,
  onUnauthorized?: () => void,
) {
  return requestItem<SubsystemRecord, SubsystemPayload>(
    "/subsystems",
    "POST",
    payload,
    onUnauthorized,
  );
}

export function updateSubsystemRecord(
  subsystemId: string,
  payload: Partial<SubsystemPayload>,
  onUnauthorized?: () => void,
) {
  return requestItem<SubsystemRecord, Partial<SubsystemPayload>>(
    `/subsystems/${subsystemId}`,
    "PATCH",
    payload,
    onUnauthorized,
  );
}

export function createMechanismRecord(
  payload: MechanismPayload,
  onUnauthorized?: () => void,
) {
  return requestItem<MechanismRecord, MechanismPayload>(
    "/mechanisms",
    "POST",
    payload,
    onUnauthorized,
  );
}

export function updateMechanismRecord(
  mechanismId: string,
  payload: Partial<MechanismPayload>,
  onUnauthorized?: () => void,
) {
  return requestItem<MechanismRecord, Partial<MechanismPayload>>(
    `/mechanisms/${mechanismId}`,
    "PATCH",
    payload,
    onUnauthorized,
  );
}

export function deleteMechanismRecord(
  mechanismId: string,
  onUnauthorized?: () => void,
) {
  return requestItem<MechanismRecord, never>(
    `/mechanisms/${mechanismId}`,
    "DELETE",
    undefined,
    onUnauthorized,
  );
}
