const SESSION_STORAGE_KEY = "meco.session.token";

export function loadStoredSessionToken() {
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function storeSessionToken(token: string) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, token);
}

export function clearStoredSessionToken() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
