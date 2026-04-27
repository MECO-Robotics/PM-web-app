import { type CSSProperties, type FormEvent, type RefObject, useRef, useState } from "react";

import {
  MECO_LOGIN_BACKDROP_SRC,
  MECO_MAIN_LOGO_LIGHT_SRC,
  MECO_MAIN_LOGO_WHITE_SRC,
  MECO_MAIN_LOGO_HEIGHT,
  MECO_MAIN_LOGO_WIDTH,
} from "@/lib/branding";
import type { AuthConfig, EmailCodeDeliveryResponse } from "@/lib/auth";

const MOBILE_RELEASES_URL =
  "https://github.com/MECO-Robotics/PM-mobile-app/releases";
const MOBILE_USER_AGENT_PATTERN =
  /android|iphone|ipod|mobile|windows phone|blackberry|opera mini/i;

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
  };
};

function detectMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const nav = navigator as NavigatorWithUserAgentData;
  const userAgent = nav.userAgent?.toLowerCase() ?? "";

  if (nav.userAgentData?.mobile) {
    return true;
  }

  if (MOBILE_USER_AGENT_PATTERN.test(userAgent)) {
    return true;
  }

  return /ipad/i.test(userAgent) || (userAgent.includes("macintosh") && nav.maxTouchPoints > 1);
}

interface AuthStatusScreenProps {
  body: string;
  eyebrow?: string;
  isDarkMode?: boolean;
  message?: string | null;
  shellStyle?: CSSProperties;
  title: string;
}

export function AuthStatusScreen({
  body,
  eyebrow = "MECO workspace",
  isDarkMode = false,
  message,
  shellStyle,
  title,
}: AuthStatusScreenProps) {
  return (
    <main
      className={`page-shell auth-shell ${isDarkMode ? "dark-mode" : ""}`}
      style={shellStyle}
    >
      <section className="auth-card auth-card-status">
        <img
          alt="MECO main logo"
          className="auth-status-mark"
          height={MECO_MAIN_LOGO_HEIGHT}
          loading="eager"
          width={MECO_MAIN_LOGO_WIDTH}
          src={isDarkMode ? MECO_MAIN_LOGO_WHITE_SRC : MECO_MAIN_LOGO_LIGHT_SRC}
        />
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-body">{body}</p>
        {message ? <p className="auth-error">{message}</p> : null}
      </section>
    </main>
  );
}

interface SignInScreenProps {
  authMessage: string | null;
  clearAuthMessage: () => void;
  googleButtonRef: RefObject<HTMLDivElement | null>;
  hasEmailSignIn: boolean;
  hasGoogleSignIn: boolean;
  isDarkMode?: boolean;
  isSigningIn: boolean;
  onDevBypassSignIn: () => Promise<void>;
  onRequestEmailCode: (email: string) => Promise<EmailCodeDeliveryResponse>;
  onVerifyEmailCode: (email: string, code: string) => Promise<void>;
  shellStyle?: CSSProperties;
  signInConfig: AuthConfig;
}

function AuthIntroPanel() {
  return (
    <aside className="auth-intro" aria-label="MECO sign-in overview">
      <div className="auth-intro-mark-wrap">
        <img
          alt="MECO main logo"
          className="auth-intro-mark"
          height={MECO_MAIN_LOGO_HEIGHT}
          loading="eager"
          width={MECO_MAIN_LOGO_WIDTH}
          src={MECO_MAIN_LOGO_WHITE_SRC}
        />
      </div>

      <div className="auth-intro-copy">
        <p className="eyebrow">MECO Robotics</p>
        <h1>Sign in to the project workspace.</h1>
        <p className="auth-body auth-intro-description">
          <span>Plan. Build. Verify.</span>
          <span>One system for tasks, parts, and QA.</span>
        </p>
      </div>
    </aside>
  );
}

export function SignInScreen({
  authMessage,
  clearAuthMessage,
  googleButtonRef,
  hasEmailSignIn,
  hasGoogleSignIn,
  isDarkMode = false,
  isSigningIn,
  onDevBypassSignIn,
  onRequestEmailCode,
  onVerifyEmailCode,
  shellStyle,
  signInConfig,
}: SignInScreenProps) {
  const isMobileDevice = detectMobileDevice();

  const authCardTitle = isMobileDevice
    ? "Use the PM mobile app."
    :
    hasEmailSignIn && hasGoogleSignIn
      ? "Sign in with Google or email."
      : hasGoogleSignIn
        ? "Sign in with Google."
        : hasEmailSignIn
          ? "Sign in with email."
          : "Sign-in is currently unavailable.";

  const authCardBody = isMobileDevice
    ? "Login is hidden on detected mobile devices. Install the latest iOS or Android build from PM mobile app releases."
    :
    hasEmailSignIn && hasGoogleSignIn
      ? "Use Google SSO or request a verified email code."
      : hasGoogleSignIn
        ? "Google SSO is available below. Email code sign-in is not configured on this server."
        : hasEmailSignIn
          ? "Email code sign-in is available below. Google SSO is not configured on this server."
          : "No sign-in methods are currently configured on this server.";

  return (
    <main
      className={`page-shell auth-shell ${isDarkMode ? "dark-mode" : ""}`}
      style={shellStyle}
    >
      <div className="auth-layout">
        <img
          alt=""
          aria-hidden="true"
          className="auth-layout-backdrop"
          loading="eager"
          src={MECO_LOGIN_BACKDROP_SRC}
        />

        <AuthIntroPanel />

        <section className="auth-card auth-card-wide">
          <div className="auth-card-header">
            <p className="eyebrow">Secure access</p>
            <h1>{authCardTitle}</h1>
            <p className="auth-body">{authCardBody}</p>
          </div>

          {authMessage ? (
            <p className="auth-error" role="alert">
              {authMessage}
            </p>
          ) : null}

          <div className="auth-signin-simple">
            {isMobileDevice ? (
              <MobileReleasePanel />
            ) : (
              <>
                {hasEmailSignIn ? (
                  <EmailAuthPanel
                    clearAuthMessage={clearAuthMessage}
                    hostedDomain={signInConfig.hostedDomain}
                    isSigningIn={isSigningIn}
                    onRequestEmailCode={onRequestEmailCode}
                    onVerifyEmailCode={onVerifyEmailCode}
                  />
                ) : null}

                {hasEmailSignIn && hasGoogleSignIn ? (
                  <p className="auth-method-divider" aria-hidden="true">
                    <span>OR</span>
                  </p>
                ) : null}

                {hasGoogleSignIn ? (
                  <GoogleAuthChip googleButtonRef={googleButtonRef} />
                ) : null}

                {signInConfig.devBypassAvailable ? (
                  <DevBypassButton
                    isSigningIn={isSigningIn}
                    onDevBypassSignIn={onDevBypassSignIn}
                  />
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MobileReleasePanel() {
  return (
    <section className="auth-panel" aria-label="Mobile app releases">
      <div className="auth-panel-copy">
        <p className="auth-panel-eyebrow">Mobile app</p>
        <h2>Install from PM mobile app releases.</h2>
        <p className="auth-body">
          Open the GitHub releases page to get the latest mobile build for your
          device.
        </p>
      </div>

      <div className="auth-mobile-platforms" aria-label="Supported mobile platforms">
        <span className="auth-mobile-platform">
          <IosPlatformIcon />
          <span>iOS</span>
        </span>
        <span className="auth-mobile-platform">
          <AndroidPlatformIcon />
          <span>Android</span>
        </span>
      </div>

      <div className="auth-form-actions">
        <a
          className="secondary-action auth-release-link"
          href={MOBILE_RELEASES_URL}
          rel="noreferrer"
          target="_blank"
        >
          Open mobile releases
        </a>
      </div>
    </section>
  );
}

function IosPlatformIcon() {
  return (
    <svg
      aria-hidden="true"
      className="auth-mobile-platform-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect height="19" rx="2.35" stroke="currentColor" strokeWidth="1.7" width="10.5" x="6.75" y="2.5" />
      <path d="M10 5.4h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <circle cx="12" cy="18.2" fill="currentColor" r="0.95" />
    </svg>
  );
}

function AndroidPlatformIcon() {
  return (
    <svg
      aria-hidden="true"
      className="auth-mobile-platform-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M8.2 7 7 5.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <path d="M15.8 7 17 5.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <rect height="9.8" rx="2.8" stroke="currentColor" strokeWidth="1.7" width="12" x="6" y="7.2" />
      <circle cx="9.8" cy="11.5" fill="currentColor" r="0.92" />
      <circle cx="14.2" cy="11.5" fill="currentColor" r="0.92" />
    </svg>
  );
}

interface GoogleAuthChipProps {
  googleButtonRef: RefObject<HTMLDivElement | null>;
}

function GoogleAuthChip({
  googleButtonRef,
}: GoogleAuthChipProps) {
  return (
    <div className="auth-google-chip" aria-label="Google SSO">
      <div className="auth-chip-row">
        <div className="google-button-slot" ref={googleButtonRef} />
      </div>
    </div>
  );
}

interface DevBypassButtonProps {
  isSigningIn: boolean;
  onDevBypassSignIn: () => Promise<void>;
}

function DevBypassButton({
  isSigningIn,
  onDevBypassSignIn,
}: DevBypassButtonProps) {
  return (
    <div className="auth-dev-bypass" aria-label="Development sign-in bypass">
      <button
        className="secondary-action"
        disabled={isSigningIn}
        onClick={() => {
          void onDevBypassSignIn();
        }}
        type="button"
      >
        {isSigningIn ? "Opening..." : "Continue as local dev"}
      </button>
    </div>
  );
}

interface EmailAuthPanelProps {
  clearAuthMessage: () => void;
  hostedDomain: string;
  isSigningIn: boolean;
  onRequestEmailCode: (email: string) => Promise<EmailCodeDeliveryResponse>;
  onVerifyEmailCode: (email: string, code: string) => Promise<void>;
}

function EmailAuthPanel({
  clearAuthMessage,
  hostedDomain,
  isSigningIn,
  onRequestEmailCode,
  onVerifyEmailCode,
}: EmailAuthPanelProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [delivery, setDelivery] = useState<EmailCodeDeliveryResponse | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRequestingCode(true);

    try {
      const response = await onRequestEmailCode(email);
      setDelivery(response);
      setCode("");
      window.setTimeout(() => {
        codeInputRef.current?.focus();
      }, 0);
    } catch {
      // The hook already surfaced the error message.
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await onVerifyEmailCode(email, code);
    } catch {
      // The hook already surfaced the error message.
    }
  };

  return (
    <section className="auth-email-method" aria-label="Email code">
      <form className="auth-form auth-email-inline" onSubmit={handleRequestCode}>
        <label className="field auth-email-send-field">
          <input
            autoComplete="email"
            className="auth-email-input"
            inputMode="email"
            onChange={(event) => {
              clearAuthMessage();
              setEmail(event.target.value);
              setCode("");
              setDelivery(null);
            }}
            placeholder={`you@${hostedDomain}`}
            type="email"
            value={email}
          />
          <button
            className="auth-email-send-button"
            disabled={
              isSigningIn ||
              isRequestingCode ||
              email.trim().length === 0
            }
            type="submit"
          >
            {isRequestingCode ? "Sending..." : delivery ? "Resend code" : "Send code"}
          </button>
        </label>
      </form>

      {delivery ? (
        <form className="auth-form auth-email-inline auth-email-verify-inline" onSubmit={handleVerifyCode}>
          <label className="field">
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              onChange={(event) => {
                clearAuthMessage();
                setCode(event.target.value);
              }}
              placeholder="One-time code"
              ref={codeInputRef}
              type="text"
              value={code}
            />
          </label>

          <div className="auth-form-actions">
            <button
              className="primary-action"
              disabled={isSigningIn || code.trim().length === 0}
              type="submit"
            >
              Verify code
            </button>
          </div>
        </form>
      ) : (
        null
      )}
    </section>
  );
}
