import { createElement, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { createPausableTimeout, type PausableTimeoutController } from "./taskEditNoticeTimer";

const TASK_EDIT_NOTICE_TIMEOUT_MS = 4500;

export function WorkspaceInfoToast({
  message,
  title = "Changes Canceled",
  onDismiss,
}: {
  message: string;
  title?: string;
  onDismiss: () => void;
}) {
  const dismissTimerRef = useRef<PausableTimeoutController | null>(null);

  useEffect(() => {
    const timer = createPausableTimeout(onDismiss, TASK_EDIT_NOTICE_TIMEOUT_MS);
    dismissTimerRef.current = timer;

    return () => {
      timer.cancel();
      if (dismissTimerRef.current === timer) {
        dismissTimerRef.current = null;
      }
    };
  }, [message, onDismiss]);

  const pauseDismissTimer = () => {
    dismissTimerRef.current?.pause();
  };

  const resumeDismissTimer = () => {
    dismissTimerRef.current?.resume();
  };

  const toast = createElement(
    "aside",
    { className: "workspace-info-toast", role: "status", "aria-live": "polite" },
    createElement(
      "section",
      {
        className: "workspace-info-toast-card",
        onMouseEnter: pauseDismissTimer,
        onMouseLeave: resumeDismissTimer,
      },
      createElement(
        "div",
        { className: "workspace-info-toast-header" },
        createElement(
          "div",
          null,
          createElement("p", { className: "eyebrow", style: { color: "var(--official-blue)" } }, "Info"),
          createElement("h2", null, title),
        ),
        createElement("button", { className: "icon-button", onClick: onDismiss, type: "button" }, "Dismiss"),
      ),
      createElement("p", { className: "workspace-info-toast-message" }, message),
      createElement(
        "div",
        { className: "workspace-info-toast-timer", "aria-hidden": "true" },
        createElement("span"),
      ),
    ),
  );

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return portalTarget ? createPortal(toast, portalTarget) : toast;
}

export function WorkspaceErrorPopup({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return createElement(WorkspaceInfoToast, { message, onDismiss, title: "Something went wrong" });
}
