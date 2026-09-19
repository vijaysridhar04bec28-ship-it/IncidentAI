import { useState } from "react";
import "./App.css";

const BACKEND_URL = "http://127.0.0.1:8000";

function App() {
  const [url, setUrl] = useState(
    "http://127.0.0.1:8000/api/live-alerts"
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeURL = async () => {
    if (!url.trim()) {
      setError("Please enter a valid alert source URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/analyze-from-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to analyze alert source."
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to connect to IncidentAI backend.");
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = () => {
    setResult(null);
    setError("");
  };

  const getSeverityClass = (severity) => {
    if (!severity) return "neutral";

    return severity.toLowerCase();
  };

  const getRiskClass = (risk) => {
    if (!risk) return "neutral";

    return risk.toLowerCase();
  };

  const getDecisionClass = (decision) => {
    if (!decision) return "neutral";

    return decision === "AUTO_EXECUTE"
      ? "auto"
      : "approval";
  };

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">AI</div>

          <div>
            <h2>IncidentAI</h2>
            <span>Autonomous Operations</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">MONITORING</p>

          <div className="nav-item active">
            <span>◈</span>
            Dashboard
          </div>

          <div className="nav-item">
            <span>◉</span>
            Live Alerts
          </div>

          <div className="nav-item">
            <span>▣</span>
            Incidents
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">INTELLIGENCE</p>

          <div className="nav-item">
            <span>✦</span>
            AI Analysis
          </div>

          <div className="nav-item">
            <span>⚙</span>
            Remediation
          </div>

          <div className="nav-item">
            <span>≡</span>
            Audit Logs
          </div>
        </div>

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Online</strong>
              <small>AI Engine Active</small>
            </div>
          </div>

          <div className="version">
            IncidentAI v1.0
          </div>

        </div>

      </aside>

      {/* MAIN AREA */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">

          <div>
            <div className="breadcrumb">
              Operations <span>/</span> Incident Dashboard
            </div>

            <h1>Incident Intelligence Center</h1>
          </div>

          <div className="topbar-right">

            <div className="live-indicator">
              <span className="pulse"></span>
              LIVE MONITORING
            </div>

            <div className="avatar">
              AI
            </div>

          </div>

        </header>


        {/* HERO */}
        <section className="hero-card">

          <div className="hero-content">

            <div className="hero-icon">
              ✦
            </div>

            <div>
              <div className="eyebrow">
                AUTONOMOUS INCIDENT RESOLUTION
              </div>

              <h2>
                Analyze your operational alerts
                <span> with AI</span>
              </h2>

              <p>
                Connect an alert source URL. IncidentAI automatically
                correlates alerts, identifies probable root cause,
                calculates business impact and recommends remediation.
              </p>
            </div>

          </div>

          <div className="ai-status">
            <span className="status-dot"></span>
            AI ENGINE READY
          </div>

        </section>


        {/* URL INPUT */}
        <section className="source-card">

          <div className="section-heading">

            <div>
              <span className="section-number">01</span>

              <div>
                <h3>Alert Source</h3>
                <p>
                  Provide a URL containing operational alert data.
                </p>
              </div>
            </div>

            {result && (
              <button
                className="reset-button"
                onClick={resetDemo}
              >
                ↻ Reset
              </button>
            )}

          </div>

          <div className="url-box">

            <div className="url-prefix">
              URL
            </div>

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/api/alerts"
            />

            <button
              className="analyze-button"
              onClick={analyzeURL}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  ANALYZING...
                </>
              ) : (
                <>
                  ✦ ANALYZE URL
                </>
              )}
            </button>

          </div>

          <div className="source-hint">
            <span>ⓘ</span>
            Expected response format: JSON containing an
            <code>alerts</code> array.
          </div>

        </section>


        {/* ERROR */}
        {error && (
          <div className="error-card">
            <div className="error-icon">!</div>

            <div>
              <strong>Analysis Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}


        {/* LOADING */}
        {loading && (
          <section className="processing-card">

            <div className="processing-animation">
              <div className="processing-ring"></div>
              <span>AI</span>
            </div>

            <div className="processing-content">

              <span className="eyebrow">
                PROCESSING ALERT STREAM
              </span>

              <h3>
                IncidentAI is analyzing your alerts...
              </h3>

              <div className="processing-steps">

                <span className="processing-active">
                  ✓ Fetch alerts
                </span>

                <span className="processing-active">
                  ✓ Normalize data
                </span>

                <span className="processing-active">
                  ◌ Correlate incidents
                </span>

                <span>
                  ◯ AI root cause analysis
                </span>

                <span>
                  ◯ Remediation decision
                </span>

              </div>

            </div>

          </section>
        )}


        {/* RESULTS */}
        {result && !loading && (

          <>

            {/* KPI ROW */}
            <section className="kpi-grid">

              <div className="kpi-card">

                <div className="kpi-icon blue">
                  ◉
                </div>

                <div>
                  <span>ALERTS RECEIVED</span>
                  <strong>{result.alerts_received}</strong>
                  <small>From source URL</small>
                </div>

              </div>


              <div className="kpi-card">

                <div className="kpi-icon purple">
                  ◈
                </div>

                <div>
                  <span>INCIDENTS DETECTED</span>
                  <strong>{result.incidents_detected}</strong>
                  <small>Correlated by AI</small>
                </div>

              </div>


              <div className="kpi-card">

                <div className="kpi-icon green">
                  ✓
                </div>

                <div>
                  <span>AI ENGINE</span>
                  <strong>ACTIVE</strong>
                  <small>Models responding</small>
                </div>

              </div>


              <div className="kpi-card">

                <div className="kpi-icon orange">
                  ⚡
                </div>

                <div>
                  <span>DATA SOURCE</span>
                  <strong className="source-active">
                    CONNECTED
                  </strong>
                  <small>Live URL analyzed</small>
                </div>

              </div>

            </section>


            {/* SOURCE INFO */}
            <section className="data-source-bar">

              <div className="source-live-icon">
                ●
              </div>

              <div>
                <span>ANALYZED DATA SOURCE</span>
                <strong>{result.data_source}</strong>
              </div>

              <div className="source-connected">
                ✓ CONNECTED
              </div>

            </section>


            {/* INCIDENT HEADER */}
            <div className="results-header">

              <div>
                <span className="section-number">02</span>

                <div>
                  <h2>Detected Incidents</h2>

                  <p>
                    AI-correlated operational events and
                    recommended response actions.
                  </p>
                </div>
              </div>

              <div className="incident-count">
                {result.incidents_detected} INCIDENT
                {result.incidents_detected !== 1 ? "S" : ""}
              </div>

            </div>


            {/* INCIDENTS */}
            <div className="incident-list">

              {result.incidents.map((incident, index) => (

                <article
                  className="incident-card"
                  key={incident.incident_id || index}
                >

                  {/* INCIDENT TOP */}
                  <div className="incident-header">

                    <div className="incident-title">

                      <div className="incident-id">
                        {incident.incident_id}
                      </div>

                      <div>
                        <h3>
                          {incident.incident_name}
                        </h3>

                        <p>
                          {incident.alerts_correlated} correlated
                          alerts across {incident.affected_services}{" "}
                          services
                        </p>
                      </div>

                    </div>

                    <div className="incident-badges">

                      <span
                        className={`severity-badge ${getSeverityClass(
                          incident.severity
                        )}`}
                      >
                        <span className="badge-dot"></span>
                        {incident.severity}
                      </span>

                      <span
                        className={`risk-badge ${getRiskClass(
                          incident.remediation_risk
                        )}`}
                      >
                        RISK: {incident.remediation_risk}
                      </span>

                    </div>

                  </div>


                  {/* INCIDENT METRICS */}
                  <div className="incident-metrics">

                    <div className="metric-box">

                      <span>ROOT CAUSE</span>

                      <strong>
                        {incident.root_cause}
                      </strong>

                    </div>


                    <div className="metric-box">

                      <span>IMPACT SCORE</span>

                      <strong className="impact-value">
                        {incident.impact_score}
                      </strong>

                      <div className="impact-bar">
                        <div
                          style={{
                            width: `${Math.min(
                              incident.impact_score,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>

                    </div>


                    <div className="metric-box">

                      <span>AFFECTED USERS</span>

                      <strong>
                        {incident.affected_users_pct}%
                      </strong>

                    </div>


                    <div className="metric-box">

                      <span>SERVICES</span>

                      <strong>
                        {incident.affected_services}
                      </strong>

                    </div>

                  </div>


                  {/* TWO COLUMN BODY */}
                  <div className="incident-body">


                    {/* LEFT */}
                    <div className="analysis-panel">

                      <div className="panel-title">
                        <span className="panel-icon purple">
                          ✦
                        </span>

                        <div>
                          <h4>AI Root Cause Analysis</h4>
                          <span>
                            Causal relationship detected
                          </span>
                        </div>
                      </div>


                      <div className="rca-flow">

                        <div className="rca-node">

                          <span className="node-number">
                            01
                          </span>

                          <div>
                            <strong>
                              Operational Alerts
                            </strong>

                            <small>
                              {incident.alerts_correlated} alerts
                              detected
                            </small>
                          </div>

                        </div>


                        <div className="flow-arrow">
                          ↓
                        </div>


                        <div className="rca-node">

                          <span className="node-number">
                            02
                          </span>

                          <div>
                            <strong>
                              Correlation Engine
                            </strong>

                            <small>
                              Related events grouped
                            </small>
                          </div>

                        </div>


                        <div className="flow-arrow">
                          ↓
                        </div>


                        <div className="rca-node root">

                          <span className="node-number">
                            03
                          </span>

                          <div>
                            <strong>
                              {incident.root_cause}
                            </strong>

                            <small>
                              Probable root cause
                            </small>
                          </div>

                        </div>

                      </div>


                      <div className="services-list">

                        <span>
                          AFFECTED SERVICES
                        </span>

                        <div>
                          {incident.services.map(
                            (service, serviceIndex) => (
                              <span
                                className="service-tag"
                                key={serviceIndex}
                              >
                                {service}
                              </span>
                            )
                          )}
                        </div>

                      </div>

                    </div>


                    {/* RIGHT */}
                    <div className="remediation-panel">

                      <div className="panel-title">

                        <span className="panel-icon green">
                          ⚡
                        </span>

                        <div>
                          <h4>Remediation Recommendation</h4>

                          <span>
                            AI decision engine
                          </span>
                        </div>

                      </div>


                      <div className="recommendation-box">

                        <span>
                          RECOMMENDED ACTION
                        </span>

                        <strong>
                          {incident.recommended_action}
                        </strong>

                      </div>


                      <div className="decision-box">

                        <div className="decision-row">

                          <span>Risk Level</span>

                          <strong
                            className={`risk-text ${getRiskClass(
                              incident.remediation_risk
                            )}`}
                          >
                            {incident.remediation_risk}
                          </strong>

                        </div>


                        <div className="decision-row">

                          <span>AI Decision</span>

                          <strong
                            className={`decision-text ${getDecisionClass(
                              incident.decision
                            )}`}
                          >
                            {incident.decision ===
                            "AUTO_EXECUTE"
                              ? "AUTO EXECUTE"
                              : "HUMAN APPROVAL"}
                          </strong>

                        </div>

                      </div>


                      <div className="decision-reason">

                        <span>DECISION REASON</span>

                        <p>
                          {incident.decision_reason}
                        </p>

                      </div>


                      <div className="action-buttons">

                        {incident.decision ===
                        "AUTO_EXECUTE" ? (
                          <button
                            className="execute-button"
                            onClick={() =>
                              alert(
                                "Remediation execution simulated successfully."
                              )
                            }
                          >
                            ⚡ EXECUTE REMEDIATION
                          </button>
                        ) : (
                          <>
                            <button
                              className="approve-button"
                              onClick={() =>
                                alert(
                                  "Human approval granted. Remediation execution simulated."
                                )
                              }
                            >
                              ✓ APPROVE & EXECUTE
                            </button>

                            <button
                              className="reject-button"
                              onClick={() =>
                                alert(
                                  "Remediation rejected."
                                )
                              }
                            >
                              ✕ REJECT
                            </button>
                          </>
                        )}

                      </div>

                    </div>

                  </div>


                  {/* ALERTS */}
                  <div className="alert-section">

                    <div className="alert-section-header">

                      <div>
                        <h4>
                          Correlated Alerts
                        </h4>

                        <span>
                          {incident.alert_ids.length} events
                          contributing to this incident
                        </span>
                      </div>

                      <span className="correlated-badge">
                        AI CORRELATED
                      </span>

                    </div>


                    <div className="alert-table">

                      {incident.alert_ids.map(
                        (alertId, alertIndex) => (

                          <div
                            className="alert-row"
                            key={alertId}
                          >

                            <span className="alert-number">
                              {String(
                                alertIndex + 1
                              ).padStart(2, "0")}
                            </span>

                            <strong>
                              {alertId}
                            </strong>

                            <span className="alert-related">
                              Related to incident
                            </span>

                            <span className="alert-check">
                              ✓
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>


                  {/* AUDIT */}
                  <div className="audit-section">

                    <div className="audit-title">

                      <span className="panel-icon blue">
                        ≡
                      </span>

                      <div>
                        <h4>Audit & Decision Trail</h4>

                        <span>
                          Complete processing history
                        </span>
                      </div>

                    </div>


                    <div className="timeline">

                      <div className="timeline-item completed">
                        <span></span>
                        <div>
                          <strong>Alerts detected</strong>
                          <small>
                            Operational events received
                          </small>
                        </div>
                      </div>

                      <div className="timeline-item completed">
                        <span></span>
                        <div>
                          <strong>
                            Alerts correlated
                          </strong>
                          <small>
                            {incident.alerts_correlated} alerts
                            grouped
                          </small>
                        </div>
                      </div>

                      <div className="timeline-item completed">
                        <span></span>
                        <div>
                          <strong>
                            Root cause identified
                          </strong>
                          <small>
                            {incident.root_cause}
                          </small>
                        </div>
                      </div>

                      <div className="timeline-item completed">
                        <span></span>
                        <div>
                          <strong>
                            Remediation recommended
                          </strong>
                          <small>
                            {incident.recommended_action}
                          </small>
                        </div>
                      </div>

                      <div className="timeline-item active">
                        <span></span>
                        <div>
                          <strong>
                            Decision recorded
                          </strong>
                          <small>
                            {incident.decision}
                          </small>
                        </div>
                      </div>

                    </div>

                  </div>

                </article>

              ))}

            </div>


            {/* PIPELINE */}
            <section className="pipeline-card">

              <div className="pipeline-header">

                <div>
                  <span className="eyebrow">
                    INCIDENTAI PROCESSING PIPELINE
                  </span>

                  <h3>
                    From raw alerts to intelligent resolution
                  </h3>
                </div>

                <span className="pipeline-status">
                  ● PIPELINE ACTIVE
                </span>

              </div>


              <div className="pipeline">

                <div className="pipeline-step">
                  <span>01</span>
                  <strong>Alert Source</strong>
                  <small>URL</small>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step">
                  <span>02</span>
                  <strong>Normalization</strong>
                  <small>Parse alerts</small>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step">
                  <span>03</span>
                  <strong>Correlation</strong>
                  <small>Group incidents</small>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step">
                  <span>04</span>
                  <strong>AI Analysis</strong>
                  <small>RCA + impact</small>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step">
                  <span>05</span>
                  <strong>Decision</strong>
                  <small>Risk evaluation</small>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step final">
                  <span>06</span>
                  <strong>Resolution</strong>
                  <small>Execute / approve</small>
                </div>

              </div>

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default App;