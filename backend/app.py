# ============================================================
# INCIDENTAI - FASTAPI BACKEND
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import requests


# ============================================================
# 1. CREATE FASTAPI APP
# ============================================================

app = FastAPI(
    title="IncidentAI",
    description="Autonomous Enterprise Incident Resolution Engine",
    version="1.0"
)


# ============================================================
# 2. ENABLE CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 3. LOAD V2 TRAINED MODELS
# ============================================================

models_v2 = joblib.load(
    "incident_ai_models_v2.pkl"
)

encoders_v2 = joblib.load(
    "incident_ai_encoders_v2.pkl"
)

scaler_v2 = joblib.load(
    "incident_ai_scaler_v2.pkl"
)

print("✅ IncidentAI V2 models loaded successfully")


# ============================================================
# 4. FEATURES EXPECTED BY ML MODEL
# ============================================================

FEATURES = [

    "cpu_usage_pct",

    "memory_usage_pct",

    "db_latency_sec",

    "api_latency_sec",

    "error_rate_pct",

    "disk_usage_pct",

    "network_latency_ms",

    "queue_depth",

    "connection_pool_usage_pct",

    "users_affected_pct",

    "blast_radius_services",

    "service_criticality",

    "alert_count"

]


# ============================================================
# 5. INPUT DATA MODELS
# ============================================================

class IncidentInput(BaseModel):

    cpu_usage_pct: float

    memory_usage_pct: float

    db_latency_sec: float

    api_latency_sec: float

    error_rate_pct: float

    disk_usage_pct: float

    network_latency_ms: float

    queue_depth: float

    connection_pool_usage_pct: float

    users_affected_pct: float

    blast_radius_services: float

    service_criticality: float

    alert_count: float


class URLInput(BaseModel):

    url: str


# ============================================================
# 6. ML PREDICTION FUNCTION
# ============================================================

def predict_incident(incident: dict):

    # Convert incident data into DataFrame
    X = pd.DataFrame(
        [incident]
    )[FEATURES]

    # Apply the same scaler used during training
    X_scaled = scaler_v2.transform(X)

    # Keep feature names
    X_scaled_df = pd.DataFrame(
        X_scaled,
        columns=FEATURES
    )


    # ----------------------------------------
    # ROOT CAUSE
    # ----------------------------------------

    root_pred = models_v2[
        "root_cause"
    ].predict(
        X_scaled_df
    )[0]

    root_cause = encoders_v2[
        "root_cause"
    ].inverse_transform(
        [root_pred]
    )[0]


    # ----------------------------------------
    # SEVERITY
    # ----------------------------------------

    severity_pred = models_v2[
        "severity"
    ].predict(
        X_scaled_df
    )[0]

    ml_severity = encoders_v2[
        "severity"
    ].inverse_transform(
        [severity_pred]
    )[0]


    # ----------------------------------------
    # IMPACT SCORE
    # ----------------------------------------

    impact_score = models_v2[
        "impact_score"
    ].predict(
        X_scaled_df
    )[0]


    # ----------------------------------------
    # RECOMMENDED ACTION
    # ----------------------------------------

    action_pred = models_v2[
        "recommended_action"
    ].predict(
        X_scaled_df
    )[0]

    recommended_action = encoders_v2[
        "recommended_action"
    ].inverse_transform(
        [action_pred]
    )[0]


    # ----------------------------------------
    # REMEDIATION RISK
    # ----------------------------------------

    risk_pred = models_v2[
        "remediation_risk"
    ].predict(
        X_scaled_df
    )[0]

    remediation_risk = encoders_v2[
        "remediation_risk"
    ].inverse_transform(
        [risk_pred]
    )[0]


    return {

        "root_cause":
            root_cause,

        "ml_severity":
            ml_severity,

        "impact_score":
            round(
                float(impact_score),
                2
            ),

        "recommended_action":
            recommended_action,

        "remediation_risk":
            remediation_risk

    }


# ============================================================
# 7. HYBRID DECISION ENGINE
# ============================================================

def incident_ai_decision(
    prediction: dict,
    incident: dict
):

    root_cause = prediction[
        "root_cause"
    ]

    impact_score = prediction[
        "impact_score"
    ]

    recommended_action = prediction[
        "recommended_action"
    ]

    remediation_risk = prediction[
        "remediation_risk"
    ]

    users = incident[
        "users_affected_pct"
    ]

    error_rate = incident[
        "error_rate_pct"
    ]

    criticality = incident[
        "service_criticality"
    ]

    blast_radius = incident[
        "blast_radius_services"
    ]


    # ----------------------------------------
    # BUSINESS IMPACT RULES
    # ----------------------------------------

    if (

        users >= 20

        and error_rate >= 30

        and criticality >= 90

    ):

        final_severity = "CRITICAL"


    elif (

        users >= 15

        or error_rate >= 20

        or criticality >= 80

    ):

        final_severity = "HIGH"


    elif impact_score >= 30:

        final_severity = "MEDIUM"


    else:

        final_severity = "LOW"


    # ----------------------------------------
    # DECISION ENGINE
    # ----------------------------------------

    if final_severity == "CRITICAL":

        decision = (
            "HUMAN_APPROVAL_REQUIRED"
        )

        decision_reason = (

            "Critical business service affected. "

            "Human approval required before remediation."

        )


    elif remediation_risk == "HIGH":

        decision = (
            "HUMAN_APPROVAL_REQUIRED"
        )

        decision_reason = (

            "Remediation risk is HIGH. "

            "Human approval required."

        )


    elif remediation_risk == "MEDIUM":

        decision = (
            "HUMAN_APPROVAL_REQUIRED"
        )

        decision_reason = (

            "Remediation risk is MEDIUM. "

            "Human approval required."

        )


    else:

        decision = "AUTO_EXECUTE"

        decision_reason = (

            "Low-risk remediation detected. "

            "Automatic execution permitted."

        )


    # ----------------------------------------
    # FINAL RESULT
    # ----------------------------------------

    return {

        "root_cause":
            root_cause,

        "impact_score":
            impact_score,

        "severity":
            final_severity,

        "recommended_action":
            recommended_action,

        "remediation_risk":
            remediation_risk,

        "decision":
            decision,

        "decision_reason":
            decision_reason,

        "affected_users_pct":
            users,

        "affected_services":
            blast_radius

    }


# ============================================================
# 8. ROOT API
# ============================================================

@app.get("/")
def home():

    return {

        "system":
            "IncidentAI",

        "status":
            "running",

        "message":
            "Autonomous Enterprise Incident Resolution Engine"

    }


# ============================================================
# 9. ORIGINAL MANUAL INCIDENT API
# ============================================================

@app.post(
    "/api/analyze-incident"
)
def analyze_incident(
    incident: IncidentInput
):

    incident_data = (
        incident.model_dump()
    )

    prediction = predict_incident(
        incident_data
    )

    final_result = incident_ai_decision(
        prediction,
        incident_data
    )

    return final_result


# ============================================================
# 10. LIVE ALERT DATA SOURCE
# ============================================================

@app.get("/api/live-alerts")
def get_live_alerts():

    return {

        "timestamp":
            "2026-09-19T10:01:15",

        "alerts": [

            {
                "alert_id":
                    "ALT-001",

                "service":
                    "Payment Database",

                "metric":
                    "CPU Usage",

                "value":
                    96,

                "unit":
                    "%"
            },

            {
                "alert_id":
                    "ALT-002",

                "service":
                    "Payment Database",

                "metric":
                    "Database Latency",

                "value":
                    2.8,

                "unit":
                    "sec"
            },

            {
                "alert_id":
                    "ALT-003",

                "service":
                    "Payment API",

                "metric":
                    "API Latency",

                "value":
                    5.2,

                "unit":
                    "sec"
            },

            {
                "alert_id":
                    "ALT-004",

                "service":
                    "Payment API",

                "metric":
                    "Error Rate",

                "value":
                    34,

                "unit":
                    "%"
            },

            {
                "alert_id":
                    "ALT-005",

                "service":
                    "Checkout",

                "metric":
                    "Failure Rate",

                "value":
                    27,

                "unit":
                    "%"
            },

            {
                "alert_id":
                    "ALT-006",

                "service":
                    "Authentication",

                "metric":
                    "Error Rate",

                "value":
                    8,

                "unit":
                    "%"
            },

            {
                "alert_id":
                    "ALT-007",

                "service":
                    "Cache",

                "metric":
                    "Latency",

                "value":
                    1.8,

                "unit":
                    "sec"
            },

            {
                "alert_id":
                    "ALT-008",

                "service":
                    "Message Queue",

                "metric":
                    "Queue Depth",

                "value":
                    3200,

                "unit":
                    "messages"
            },

            {
                "alert_id":
                    "ALT-009",

                "service":
                    "Application Server",

                "metric":
                    "Memory Usage",

                "value":
                    94,

                "unit":
                    "%"
            },

            {
                "alert_id":
                    "ALT-010",

                "service":
                    "Network",

                "metric":
                    "Network Latency",

                "value":
                    350,

                "unit":
                    "ms"
            }

        ]

    }


# ============================================================
# 11. CONVERT RAW ALERTS INTO ML FEATURES
# ============================================================

def convert_alerts_to_incident_features(
    alerts
):

    # ----------------------------------------
    # DEFAULT VALUES
    # ----------------------------------------

    incident = {

        "cpu_usage_pct":
            20,

        "memory_usage_pct":
            20,

        "db_latency_sec":
            0.5,

        "api_latency_sec":
            0.5,

        "error_rate_pct":
            0,

        "disk_usage_pct":
            20,

        "network_latency_ms":
            20,

        "queue_depth":
            0,

        "connection_pool_usage_pct":
            20,

        "users_affected_pct":
            0,

        "blast_radius_services":
            1,

        "service_criticality":
            50,

        "alert_count":
            len(alerts)

    }


    affected_services = set()


    # ----------------------------------------
    # READ EACH ALERT
    # ----------------------------------------

    for alert in alerts:

        service = str(
            alert.get(
                "service",
                ""
            )
        ).lower()

        metric = str(
            alert.get(
                "metric",
                ""
            )
        ).lower()

        value = float(
            alert.get(
                "value",
                0
            )
        )


        affected_services.add(
            service
        )


        # ------------------------------------
        # CPU
        # ------------------------------------

        if "cpu" in metric:

            incident[
                "cpu_usage_pct"
            ] = value


        # ------------------------------------
        # MEMORY
        # ------------------------------------

        elif "memory" in metric:

            incident[
                "memory_usage_pct"
            ] = value


        # ------------------------------------
        # DATABASE LATENCY
        # ------------------------------------

        elif (

            "database latency"
            in metric

            or

            "db latency"
            in metric

        ):

            incident[
                "db_latency_sec"
            ] = value


        # ------------------------------------
        # API LATENCY
        # ------------------------------------

        elif "api latency" in metric:

            incident[
                "api_latency_sec"
            ] = value


        # ------------------------------------
        # ERROR RATE
        # ------------------------------------

        elif "error rate" in metric:

            incident[
                "error_rate_pct"
            ] = value


        # ------------------------------------
        # FAILURE RATE
        # ------------------------------------

        elif "failure rate" in metric:

            incident[
                "error_rate_pct"
            ] = value


        # ------------------------------------
        # DISK
        # ------------------------------------

        elif "disk" in metric:

            incident[
                "disk_usage_pct"
            ] = value


        # ------------------------------------
        # NETWORK
        # ------------------------------------

        elif "network latency" in metric:

            incident[
                "network_latency_ms"
            ] = value


        # ------------------------------------
        # QUEUE
        # ------------------------------------

        elif "queue depth" in metric:

            incident[
                "queue_depth"
            ] = value


        # ------------------------------------
        # CONNECTION POOL
        # ------------------------------------

        elif "connection pool" in metric:

            incident[
                "connection_pool_usage_pct"
            ] = value


    # ----------------------------------------
    # BLAST RADIUS
    # ----------------------------------------

    incident[
        "blast_radius_services"
    ] = max(
        len(affected_services),
        1
    )


    # ----------------------------------------
    # ESTIMATE USER IMPACT
    # ----------------------------------------

    if incident[
        "error_rate_pct"
    ] > 0:

        incident[
            "users_affected_pct"
        ] = min(
            incident[
                "error_rate_pct"
            ],
            100
        )


    # ----------------------------------------
    # SERVICE CRITICALITY
    # ----------------------------------------

    critical_services = [

        "payment",

        "checkout",

        "database",

        "authentication",

        "order"

    ]


    for service in affected_services:

        if any(

            name in service

            for name in critical_services

        ):

            incident[
                "service_criticality"
            ] = 95

            break


    return incident


# ============================================================
# 12. FETCH URL + CORRELATE ALERTS + ML ANALYSIS
# ============================================================

@app.post(
    "/api/analyze-from-url"
)
def analyze_from_url(
    data: URLInput
):

    try:

        # ========================================
        # STEP 1 - FETCH DATA FROM URL
        # ========================================

        response = requests.get(

            data.url,

            timeout=10

        )

        response.raise_for_status()


        # ========================================
        # STEP 2 - READ JSON
        # ========================================

        data_json = (
            response.json()
        )


        # ========================================
        # STEP 3 - GET ALERTS
        # ========================================

        alerts = data_json.get(
            "alerts",
            []
        )


        if not alerts:

            raise HTTPException(

                status_code=400,

                detail=
                    "No alerts found in the provided URL."

            )


        # ========================================
        # STEP 4 - CORRELATE ALERTS
        # ========================================

        payment_services = {

            "Payment Database",

            "Payment API",

            "Checkout"

        }


        payment_alerts = []

        other_alerts = []


        for alert in alerts:

            service = alert.get(

                "service",

                ""

            )


            if service in payment_services:

                payment_alerts.append(
                    alert
                )

            else:

                other_alerts.append(
                    alert
                )


        incidents = []


        # ========================================
        # STEP 5 - PAYMENT INCIDENT
        # ========================================

        if payment_alerts:

            payment_incident = (

                convert_alerts_to_incident_features(

                    payment_alerts

                )

            )


            prediction = predict_incident(

                payment_incident

            )


            decision = incident_ai_decision(

                prediction,

                payment_incident

            )


            incidents.append({

                "incident_id":
                    "INC-001",

                "incident_name":
                    "Payment Service Incident",

                "alerts_correlated":
                    len(payment_alerts),

                "alert_ids": [

                    alert.get(
                        "alert_id",
                        "UNKNOWN"
                    )

                    for alert
                    in payment_alerts

                ],

                "services": list({

                    alert.get(
                        "service",
                        "Unknown"
                    )

                    for alert
                    in payment_alerts

                }),

                **decision

            })


        # ========================================
        # STEP 6 - OTHER INCIDENT
        # ========================================

        if other_alerts:

            other_incident = (

                convert_alerts_to_incident_features(

                    other_alerts

                )

            )


            prediction = predict_incident(

                other_incident

            )


            decision = incident_ai_decision(

                prediction,

                other_incident

            )


            incidents.append({

                "incident_id":
                    "INC-002",

                "incident_name":
                    "Infrastructure Incident",

                "alerts_correlated":
                    len(other_alerts),

                "alert_ids": [

                    alert.get(
                        "alert_id",
                        "UNKNOWN"
                    )

                    for alert
                    in other_alerts

                ],

                "services": list({

                    alert.get(
                        "service",
                        "Unknown"
                    )

                    for alert
                    in other_alerts

                }),

                **decision

            })


        # ========================================
        # STEP 7 - FINAL RESPONSE
        # ========================================

        return {

            "status":
                "success",

            "data_source":
                data.url,

            "alerts_received":
                len(alerts),

            "incidents_detected":
                len(incidents),

            "incidents":
                incidents

        }


    except requests.exceptions.RequestException as e:

        raise HTTPException(

            status_code=400,

            detail=
                f"Unable to fetch URL: {str(e)}"

        )


    except HTTPException:

        raise


    except ValueError:

        raise HTTPException(

            status_code=400,

            detail=
                "URL did not return valid JSON."

        )


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=
                f"Incident analysis failed: {str(e)}"

        )