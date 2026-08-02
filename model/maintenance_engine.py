def get_maintenance_recommendation(predicted_rul, machine_health=100.0, active_event="None"):
    """
    Maintenance Decision Engine (Aligned for 365-Day Operational Lifespan).
    Converts predicted Remaining Useful Life (RUL) in days and Machine Health (%)
    into actionable industrial maintenance recommendations and servicing priorities.
    """
    rul = float(predicted_rul)
    health = float(machine_health)
    
    if health < 15.0 or rul < 20:
        status = "Critical"
        recommendation = "Immediate maintenance required"
        priority = "Critical"
        window = "Stop machine immediately before catastrophic failure"
    elif rul < 60:
        status = "Warning"
        recommendation = "Schedule maintenance urgently"
        priority = "Urgent"
        window = "Perform servicing within 3–5 days"
    elif rul < 150:
        status = "Preventive Maintenance"
        recommendation = "Schedule preventive maintenance"
        priority = "High"
        window = "Schedule maintenance within 14–21 days"
    elif rul <= 260:
        status = "Monitor"
        recommendation = "Increase monitoring frequency"
        priority = "Moderate"
        window = "Inspect within 30–45 days"
    else:
        status = "Healthy"
        recommendation = "Continue Normal Operation"
        priority = "Low"
        window = "Routine inspection within 90–120 days"

    # Override for severe active anomaly events
    if active_event not in ["None", "", None] and priority in ["Low", "Moderate"]:
        priority = "High"
        recommendation = f"Active anomaly ({active_event}): Inspect component immediately"
        window = "Inspect within 24-48 hours"

    return {
        "maintenance_status": status,
        "recommended_action": recommendation,
        "inspection_priority": priority,
        "next_inspection_window": window
    }
