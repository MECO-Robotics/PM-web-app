import type { MediaUploadResponse, SessionUser } from "../types";
import { clearStoredSessionToken, loadStoredSessionToken } from "./sessionStorage";

const DEFAULT_API_BASE_URL = "/api";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

async function readJson<T>(response: Response): Promise<T> {
  const rawBody = await response.text().catch(() => "");
  let payload: { message?: string } | null = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as { message?: string };
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const statusText = response.statusText ? `: ${response.statusText}` : "";
    const textMessage = rawBody.trim();
    const fallbackMessage =
      payload?.message ??
      (textMessage.length > 0 ? textMessage : null) ??
      `Server Error (${response.status})${statusText}`;
    throw new ApiError(fallbackMessage, response.status);
  }

  if (payload === null) {
    throw new ApiError(
      "The server returned an empty or invalid response.",
      502,
    );
  }

  return payload as T;
}

export function isApiErrorLike(
  error: unknown,
): error is { statusCode: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
  );
}

export function requestApi<T>(
  path: string,
  options: RequestInit = {},
  onUnauthorized?: () => void,
) {
  const token = loadStoredSessionToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(buildApiUrl(path), {
    ...options,
    headers,
  })
    .then((response) => readJson<T>(response))
    .catch((error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        clearStoredSessionToken();
        onUnauthorized?.();
      }
      throw error;
    });
}

export function postJson<T>(path: string, body: unknown) {
  return fetch(buildApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((response) => readJson<T>(response));
}

export async function requestUpload(
  endpoint: string,
  failureMessage: string,
  projectId: string,
  file: File,
  onUnauthorized?: () => void,
) {
  const presignedUpload = await requestApi<MediaUploadResponse>(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      }),
    },
    onUnauthorized,
  );

  const uploadResponse = await fetch(presignedUpload.uploadUrl, {
    method: presignedUpload.method,
    headers: presignedUpload.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new ApiError(failureMessage, uploadResponse.status);
  }

  return presignedUpload.publicUrl;
}

export async function fetchCurrentUser(token: string) {
  const response = await fetch(buildApiUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await readJson<{
    enabled: boolean;
    user: SessionUser | null;
  }>(response);

  if (!payload.user) {
    throw new ApiError("No signed-in session is available.", 401);
  }

  return payload.user;
}
