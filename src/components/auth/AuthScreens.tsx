import type { RefObject } from "react";
import type { AuthConfig } from "../../lib/auth";

interface AuthStatusScreenProps {
  body: string;
  eyebrow?: string;
  message?: string | null;
  title: string;
}

export function AuthStatusScreen({
  body,
  eyebrow = "Google SSO",
  message,
  title,
}: AuthStatusScreenProps) {
  return (
    <main className="page-shell auth-shell">
      <section className="auth-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-body">{body}</p>
        {message ? <p className="auth-error">{message}</p> : null}
      </section>
    </main>
  );
}

interface GoogleSignInScreenProps {
  authMessage: string | null;
  googleButtonRef: RefObject<HTMLDivElement | null>;
  isLocalGoogleDevHost: boolean;
  isLocalGoogleOverrideActive: boolean;
  isSigningIn: boolean;
  signInConfig: AuthConfig;
}

export function GoogleSignInScreen({
  authMessage,
  googleButtonRef,
  isLocalGoogleDevHost,
  isLocalGoogleOverrideActive,
  isSigningIn,
  signInConfig,
}: GoogleSignInScreenProps) {
  return (
    <main className="page-shell auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Google SSO</p>
        <h1>Sign in with your {signInConfig.hostedDomain} Google account.</h1>
        <p className="auth-body">
          Google verifies the account, and the API then issues a short-lived app
          session for the project-management workspace.
        </p>
        <div className="auth-chip-row">
          <span className="auth-chip">
            Hosted domain: {signInConfig.hostedDomain}
          </span>
          <span className="auth-chip">Google ID token + app session</span>
        </div>
        <div className="google-button-slot" ref={googleButtonRef} />
        <p className="auth-note">
          {isSigningIn
            ? "Verifying your Google identity..."
            : `Choose a Google Workspace account from ${signInConfig.hostedDomain}.`}
        </p>
        {isLocalGoogleDevHost && !isLocalGoogleOverrideActive ? (
          <p className="auth-note">
            Localhost sign-in may fail with a 403 if the server&apos;s Google client is not
            authorized for {window.location.origin}. Add that origin in Google Cloud Console
            or set `VITE_LOCAL_GOOGLE_CLIENT_ID` in your local env to use a localhost-safe web
            client.
          </p>
        ) : null}
        {authMessage ? <p className="auth-error">{authMessage}</p> : null}
      </section>
    </main>
  );
}
