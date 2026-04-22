import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";

import "./App.css";
import {
  clearStoredSessionToken,
  exchangeGoogleCredential,
  fetchAuthConfig,
  fetchCurrentUser,
  loadGoogleIdentityScript,
  loadStoredSessionToken,
  signOutFromGoogle,
  type AuthConfig,
  type GoogleCredentialResponse,
  type SessionUser,
  storeSessionToken,
  validateSession,
} from "./auth";
import { operationsSnapshot } from "./data/mockData";
import type { RoleFilter } from "./types";

const roleFilters: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "All access" },
  { key: "students", label: "Students" },
  { key: "mentors", label: "Mentors" },
  { key: "admins", label: "Admins" },
];

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while checking your session.";
}

export default function App() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authBooting, setAuthBooting] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const visiblePortals = operationsSnapshot.portals.filter((portal) => {
    return roleFilter === "all" || portal.roles.includes(roleFilter);
  });
  const enforcedAuthConfig = authConfig?.enabled ? authConfig : null;
  const googleClientId = enforcedAuthConfig?.googleClientId ?? null;
  const hostedDomain = enforcedAuthConfig?.hostedDomain ?? "";

  const completionRate = Math.round(
    (operationsSnapshot.metrics.completionRate / 1) * 100,
  );

  const handleGoogleCredential = useEffectEvent(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setAuthMessage("Google did not return a credential to verify.");
        return;
      }

      setIsSigningIn(true);
      setAuthMessage(null);

      try {
        const session = await exchangeGoogleCredential(response.credential);
        storeSessionToken(session.token);
        startTransition(() => {
          setSessionUser(session.user);
        });
      } catch (error) {
        clearStoredSessionToken();
        setAuthMessage(toErrorMessage(error));
      } finally {
        setIsSigningIn(false);
      }
    },
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      try {
        const config = await fetchAuthConfig();
        if (cancelled) {
          return;
        }

        setAuthConfig(config);

        if (!config.enabled) {
          return;
        }

        const storedToken = loadStoredSessionToken();
        if (!storedToken) {
          return;
        }

        try {
          const user = await fetchCurrentUser(storedToken);
          if (cancelled) {
            return;
          }

          startTransition(() => {
            setSessionUser(user);
          });
        } catch {
          clearStoredSessionToken();
        }
      } catch (error) {
        if (!cancelled) {
          setAuthMessage(toErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setAuthBooting(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionUser || !enforcedAuthConfig) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void (async () => {
        const isValid = await validateSession();
        if (!isValid) {
          clearStoredSessionToken();
          signOutFromGoogle();
          startTransition(() => {
            setSessionUser(null);
          });
          setAuthMessage("Your session expired. Please sign in again.");
        }
      })();
    }, 5 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enforcedAuthConfig, sessionUser]);

  useEffect(() => {
    if (authBooting || sessionUser || !googleClientId) {
      return;
    }

    const activeGoogleClientId = googleClientId;
    const activeHostedDomain = hostedDomain;
    const buttonSlot = googleButtonRef.current;
    if (!buttonSlot) {
      return;
    }

    let cancelled = false;

    async function setupGoogleButton() {
      try {
        await loadGoogleIdentityScript();
        const activeButtonSlot = googleButtonRef.current;
        if (cancelled || !window.google || !activeButtonSlot) {
          return;
        }

        activeButtonSlot.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: activeGoogleClientId,
          callback: (response) => {
            void handleGoogleCredential(response);
          },
          hd: activeHostedDomain,
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(activeButtonSlot, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
          logo_alignment: "left",
        });
      } catch (error) {
        if (!cancelled) {
          setAuthMessage(toErrorMessage(error));
        }
      }
    }

    void setupGoogleButton();

    return () => {
      cancelled = true;
      buttonSlot.innerHTML = "";
    };
  }, [authBooting, googleClientId, hostedDomain, sessionUser]);

  const handleSignOut = () => {
    clearStoredSessionToken();
    signOutFromGoogle();
    startTransition(() => {
      setSessionUser(null);
    });
    setAuthMessage(null);
  };

  if (authBooting) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Google SSO</p>
          <h1>Loading sign-in requirements for MECO Robotics.</h1>
          <p className="auth-body">
            Checking the server-side auth configuration before the dashboard opens.
          </p>
        </section>
      </main>
    );
  }

  if (!authConfig) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Google SSO</p>
          <h1>Couldn&apos;t load the authentication configuration.</h1>
          <p className="auth-body">
            The web app could not confirm the server-side sign-in rules, so access is
            paused until the API is reachable again.
          </p>
          {authMessage ? <p className="auth-error">{authMessage}</p> : null}
        </section>
      </main>
    );
  }

  if (enforcedAuthConfig && !sessionUser) {
    return (
      <main className="page-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Google SSO</p>
          <h1>
            Sign in with your {enforcedAuthConfig.hostedDomain} Google account.
          </h1>
          <p className="auth-body">
            The browser dashboard is restricted to verified MECO Robotics members.
            Google verifies the account, and the API then issues a short-lived app
            session for the dashboard.
          </p>
          <div className="auth-chip-row">
            <span className="auth-chip">
              Hosted domain: {enforcedAuthConfig.hostedDomain}
            </span>
            <span className="auth-chip">Google ID token + API session</span>
          </div>
          <div className="google-button-slot" ref={googleButtonRef} />
          <p className="auth-note">
            {isSigningIn
              ? "Verifying your Google identity..."
              : `Choose a Google Workspace account from the ${enforcedAuthConfig.hostedDomain} domain.`}
          </p>
          {authMessage ? <p className="auth-error">{authMessage}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="session-strip">
        {sessionUser ? (
          <div className="session-card">
            <div className="session-identity">
              {sessionUser.picture ? (
                <img
                  alt={sessionUser.name}
                  className="session-avatar"
                  referrerPolicy="no-referrer"
                  src={sessionUser.picture}
                />
              ) : (
                <div className="session-avatar session-avatar-fallback">
                  {sessionUser.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="session-title">Signed in as {sessionUser.name}</p>
                <p className="session-copy">{sessionUser.email}</p>
              </div>
            </div>
            <button
              className="secondary-action session-action"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="session-card session-card-warning">
            <div>
              <p className="session-title">Google SSO is ready in code.</p>
              <p className="session-copy">
                Add the Google OAuth client ID on the server to turn on
                {authConfig.hostedDomain ? ` ${authConfig.hostedDomain}` : ""} sign-in
                enforcement.
              </p>
            </div>
            <span className="auth-chip">Configuration pending</span>
          </div>
        )}
      </section>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MECO Robotics Browser Access</p>
          <h1>Operations, reviews, and planning dashboards for the whole team.</h1>
          <p className="hero-body">
            This React web app is the desktop companion to the mobile workflow. It
            gives mentors and admins a wider surface for subsystem health, QA queues,
            purchasing, meeting oversight, and planning metrics without pushing those
            heavier workflows into the mobile UI.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#portals">
              Explore role portals
            </a>
            <a className="secondary-action" href="#deployment">
              View deployment model
            </a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="orb orb-orange" />
          <div className="orb orb-blue" />
          <div className="signal-card">
            <span>Readiness</span>
            <strong>{completionRate}%</strong>
            <p>Tasks completed with work-log and mentor QA signals preserved.</p>
          </div>
          <div className="signal-grid">
            {operationsSnapshot.topSignals.map((signal) => (
              <article className="signal-tile" key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <p>{signal.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Summary metrics">
        {operationsSnapshot.summaryCards.map((card) => (
          <article className="summary-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="panel-section" id="portals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Role Portals</p>
            <h2>Website access tuned for how each group works.</h2>
          </div>
          <div className="filter-row" role="tablist" aria-label="Role filters">
            {roleFilters.map((filter) => (
              <button
                key={filter.key}
                className={filter.key === roleFilter ? "filter active" : "filter"}
                onClick={() => setRoleFilter(filter.key)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="portal-grid">
          {visiblePortals.map((portal) => (
            <article className="portal-card" key={portal.title}>
              <div className="card-topline">
                <span>{portal.topline}</span>
                <strong>{portal.metric}</strong>
              </div>
              <h3>{portal.title}</h3>
              <p>{portal.description}</p>
              <ul>
                {portal.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading stacked">
          <div>
            <p className="eyebrow">Workflow Coverage</p>
            <h2>Everything from the requirements doc has a browser home.</h2>
          </div>
          <p className="section-copy">
            The website carries the wider operational views while keeping the same
            completion rules as mobile: required work logs, mentor-backed QA,
            documentation evidence, and linked manufacturing or purchase dependencies.
          </p>
        </div>

        <div className="workflow-grid">
          {operationsSnapshot.workflowLanes.map((lane) => (
            <article className="workflow-card" key={lane.title}>
              <div className="workflow-heading">
                <h3>{lane.title}</h3>
                <span>{lane.metric}</span>
              </div>
              <p>{lane.summary}</p>
              <div className="tag-row">
                {lane.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-section dashboard-layout">
        <div className="board-card">
          <p className="eyebrow">Subsystem Board</p>
          <h2>At-a-glance progress for standups and mentor review.</h2>
          <div className="subsystem-list">
            {operationsSnapshot.subsystems.map((subsystem) => (
              <article className="subsystem-row" key={subsystem.name}>
                <div>
                  <h3>{subsystem.name}</h3>
                  <p>
                    Lead {subsystem.lead} | Mentor {subsystem.mentor}
                  </p>
                </div>
                <div className="progress-block">
                  <span>{subsystem.progress}% complete</span>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${subsystem.progress}%` }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="board-column">
          <article className="stack-card">
            <p className="eyebrow">Escalations</p>
            <h3>Today&apos;s issues that need leadership attention.</h3>
            <ul className="bullet-list">
              {operationsSnapshot.escalations.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="stack-card">
            <p className="eyebrow">Planning Metrics</p>
            <h3>Metrics gathered for next-build estimation.</h3>
            <ul className="metric-list">
              {operationsSnapshot.metricsTable.map((metric) => (
                <li key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="panel-section deployment-section" id="deployment">
        <div className="section-heading stacked">
          <div>
            <p className="eyebrow">Deployment Shape</p>
            <h2>Three repos, one platform story.</h2>
          </div>
          <p className="section-copy">
            React web and mobile both talk to the shared VPS-hosted API. The web app
            ships as static assets behind nginx, while the server repo owns the
            Fastify API, Prisma schema, and Postgres deployment.
          </p>
        </div>

        <div className="deployment-grid">
          {operationsSnapshot.deploymentCards.map((card) => (
            <article className="deployment-card" key={card.title}>
              <span>{card.repo}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <ul>
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
