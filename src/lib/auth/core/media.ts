import { requestUpload } from "./request";

export function requestImageUpload(
  projectId: string,
  file: File,
  onUnauthorized?: () => void,
) {
  return requestUpload(
    "/media/presign-upload",
    "Photo upload failed unexpectedly.",
    projectId,
    file,
    onUnauthorized,
  );
}

export function requestVideoUpload(
  projectId: string,
  file: File,
  onUnauthorized?: () => void,
) {
  return requestUpload(
    "/media/presign-video-upload",
    "Video upload failed unexpectedly.",
    projectId,
    file,
    onUnauthorized,
  );
}
