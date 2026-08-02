import sys
import os
import asyncio
import logging
import uvicorn

# Set up logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

# Ensure project modules are discoverable
base_dir = os.path.dirname(os.path.abspath(__file__))
for folder in ['simulator', 'preprocessing', 'model', 'utils']:
    folder_path = os.path.join(base_dir, folder)
    if os.path.exists(folder_path) and folder_path not in sys.path:
        sys.path.append(folder_path)
if base_dir not in sys.path:
    sys.path.append(base_dir)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import datetime
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from simulator import RealTimeMachineSimulator
from predict import PredictiveMaintenanceModel, get_future_trend
from maintenance_engine import get_maintenance_recommendation
from preprocessing import load_data, preprocess_data
from utils import get_status_color

app = FastAPI(title="Industrial Predictive Maintenance API - Real-Time Engine")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_service = PredictiveMaintenanceModel()
sim_engine = RealTimeMachineSimulator(max_lifespan_days=365, degradation_factor=1.8, degradation_start_day=150)

# Load CSV dataset exclusively for model evaluation metrics (/api/model)
df_eval = load_data()
df_eval.ffill(inplace=True)

class SimulationState:
    def __init__(self):
        self.auto_play = False
        self.simulation_speed = 1.0
        self.history_records = []
        self.prev_smoothed_rul = None

sim_state = SimulationState()

def generate_next_telemetry_step():
    """Advances the real-time machine simulator by 1 tick, computes RUL prediction, applies EMA smoothing, and passes to Maintenance Decision Engine."""
    record = sim_engine.step()
    temp = float(record.get("Temperature", 35.0))
    vib = float(record.get("Vibration", 0.2))
    curr = float(record.get("Motor_Current", 8.0))
    health = float(record.get("Machine_Health", 100.0))
    active_event = str(record.get("Active_Event", "None"))
    
    raw_pred_rul = model_service.predict_rul(temp, vib, curr)
    if sim_state.prev_smoothed_rul is None:
        smoothed_rul = float(raw_pred_rul)
    else:
        # EMA temporal smoothing (alpha = 0.35) for stable RUL progression without oscillating
        smoothed_rul = 0.35 * float(raw_pred_rul) + 0.65 * sim_state.prev_smoothed_rul
    sim_state.prev_smoothed_rul = smoothed_rul
    pred_rul = max(0, int(round(smoothed_rul)))
    
    maint_info = get_maintenance_recommendation(pred_rul, health, active_event)
    
    record["Predicted_RUL"] = pred_rul
    record["Machine_Status"] = maint_info["maintenance_status"]
    record["Recommended_Action"] = maint_info["recommended_action"]
    record["Inspection_Priority"] = maint_info["inspection_priority"]
    record["Next_Inspection_Window"] = maint_info["next_inspection_window"]
    
    sim_state.history_records.append(record)
    
    # Cap total in-memory history size to prevent unbounded memory growth
    if len(sim_state.history_records) > 1000:
        sim_state.history_records.pop(0)
        
    return record

# Generate initial baseline step on server startup
if not sim_state.history_records:
    generate_next_telemetry_step()

async def simulation_clock_loop():
    """
    Backend simulation clock loop.
    Continuously ticks the simulation engine according to sim_state.simulation_speed
    when sim_state.auto_play is True.
    """
    while True:
        try:
            if sim_state.auto_play:
                generate_next_telemetry_step()
                sleep_time = max(0.05, float(sim_state.simulation_speed))
                await asyncio.sleep(sleep_time)
            else:
                await asyncio.sleep(0.2)
        except Exception as e:
            logger.error(f"Error in simulation_clock_loop: {e}", exc_info=True)
            await asyncio.sleep(0.5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_clock_loop())

@app.get("/api/status")
def get_status():
    try:
        return {
            "status": "online",
            "machine_id": "MCH-802X",
            "machine_name": "Turbine Motor Unit A1",
            "data_source": "Real-Time Machine Simulation Engine",
            "model": "Random Forest Regressor",
            "current_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        logger.error(f"Error in GET /api/status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch system status: {str(e)}")

@app.get("/api/current")
def get_current():
    try:
        if not sim_state.history_records:
            generate_next_telemetry_step()
            
        row = sim_state.history_records[-1]
        
        temp = float(row.get("Temperature", 35.0))
        vib = float(row.get("Vibration", 0.2))
        curr = float(row.get("Motor_Current", 8.0))
        health = float(row.get("Machine_Health", 100.0))
        
        predicted_rul = int(row.get("Predicted_RUL", model_service.predict_rul(temp, vib, curr)))
        stage_text, stage_color = get_status_color(health)
        
        alert_status = "Healthy" if health >= 80 else ("Slight Wear" if health >= 60 else ("Moderate Wear" if health >= 40 else "Critical"))
        
        return {
            "current_idx": len(sim_state.history_records) - 1,
            "total_records": max(1000, len(sim_state.history_records)),
            "timestamp": str(row.get("Timestamp", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))),
            "temperature": round(temp, 2),
            "vibration": round(vib, 2),
            "motor_current": round(curr, 2),
            "machine_health": round(health, 1),
            "machine_status": stage_text,
            "actual_rul_days": int(row.get("Remaining_Useful_Life_Days", 0)),
            "predicted_rul_days": predicted_rul,
            "alert_status": alert_status,
            "auto_play": sim_state.auto_play,
            "simulation_speed": sim_state.simulation_speed,
            "active_event": row.get("Active_Event", "None")
        }
    except Exception as e:
        logger.error(f"Error in GET /api/current: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch current telemetry: {str(e)}")

@app.get("/api/history")
def get_history():
    try:
        if not sim_state.history_records:
            generate_next_telemetry_step()
            
        records = sim_state.history_records.copy()
        
        # Helper for trend extrapolation
        def make_trend_dict(col_name):
            vals = [float(r.get(col_name, 0.0)) for r in records]
            if not vals:
                vals = [0.0]
            history_window = vals[-50:] if len(vals) > 50 else vals
            future_vals = get_future_trend(history_window, steps=20)
            return {
                "actual": vals,
                "predicted_future": future_vals
            }
            
        return {
            "records": records,
            "temperature_trend": make_trend_dict("Temperature"),
            "vibration_trend": make_trend_dict("Vibration"),
            "motor_current_trend": make_trend_dict("Motor_Current"),
            "machine_health_trend": make_trend_dict("Machine_Health"),
            "rul_trend": make_trend_dict("Predicted_RUL")
        }
    except Exception as e:
        logger.error(f"Error in GET /api/history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch history trends: {str(e)}")

@app.get("/api/maintenance")
def get_maintenance_status():
    try:
        if not sim_state.history_records:
            generate_next_telemetry_step()
            
        row = sim_state.history_records[-1]
        temp = float(row.get("Temperature", 35.0))
        vib = float(row.get("Vibration", 0.2))
        curr = float(row.get("Motor_Current", 8.0))
        health = float(row.get("Machine_Health", 100.0))
        pred_rul = int(row.get("Predicted_RUL", model_service.predict_rul(temp, vib, curr)))
        active_event = str(row.get("Active_Event", "None"))
        
        maint_info = get_maintenance_recommendation(pred_rul, health, active_event)
        
        return {
            "predicted_rul_days": pred_rul,
            "machine_health": round(health, 1),
            "maintenance_status": maint_info["maintenance_status"],
            "recommended_action": maint_info["recommended_action"],
            "inspection_priority": maint_info["inspection_priority"],
            "next_inspection_window": maint_info["next_inspection_window"],
            "timestamp": str(row.get("Timestamp", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))),
            "temperature": round(temp, 2),
            "vibration": round(vib, 2),
            "motor_current": round(curr, 2)
        }
    except Exception as e:
        logger.error(f"Error in GET /api/maintenance: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch maintenance status: {str(e)}")

class PredictRequest(BaseModel):
    temperature: float
    vibration: float
    motor_current: float

@app.post("/api/predict")
def predict_rul(req: PredictRequest):
    try:
        rul = model_service.predict_rul(req.temperature, req.vibration, req.motor_current)
        return {"predicted_rul": rul}
    except Exception as e:
        logger.error(f"Error in POST /api/predict: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to calculate RUL prediction: {str(e)}")

@app.get("/api/model")
def get_model_evaluation():
    try:
        if not model_service.model or not model_service.scaler:
            raise HTTPException(status_code=500, detail="ML Model not loaded")
            
        X_train_scaled, X_test_scaled, y_train, y_test = preprocess_data(df_eval, is_training=True)
        y_pred = model_service.model.predict(X_test_scaled)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        feature_names = ["Temperature", "Vibration", "Motor_Current"]
        importances = model_service.model.feature_importances_.tolist()
        feature_importance = [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in zip(feature_names, importances)
        ]
        
        np.random.seed(42)
        sample_indices = np.random.choice(len(y_test), min(100, len(y_test)), replace=False)
        actual_samples = [round(float(x), 1) for x in y_test.iloc[sample_indices].tolist()]
        predicted_samples = [round(float(x), 1) for x in y_pred[sample_indices].tolist()]
        residuals = [round(float(a - p), 2) for a, p in zip(actual_samples, predicted_samples)]
        
        return {
            "algorithm": "Random Forest Regressor",
            "n_estimators": 100,
            "dataset_size": len(df_eval),
            "train_size": len(X_train_scaled),
            "test_size": len(X_test_scaled),
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "r2_score": round(float(r2), 4),
            "feature_importance": feature_importance,
            "scatter_plot": {
                "actual": actual_samples,
                "predicted": predicted_samples
            },
            "residuals": residuals
        }
    except Exception as e:
        logger.error(f"Error in GET /api/model: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch model metrics: {str(e)}")

@app.get("/api/logs")
def get_logs():
    try:
        recent = sim_state.history_records[-10:] if sim_state.history_records else []
        logs = []
        for r in recent:
            temp = float(r.get("Temperature", 35.0))
            vib = float(r.get("Vibration", 0.2))
            curr = float(r.get("Motor_Current", 8.0))
            health = float(r.get("Machine_Health", 100.0))
            pred_rul = int(r.get("Predicted_RUL", model_service.predict_rul(temp, vib, curr)))
            status, _ = get_status_color(health)
            
            logs.append({
                "timestamp": str(r.get("Timestamp", "")),
                "temperature": round(temp, 2),
                "vibration": round(vib, 2),
                "motor_current": round(curr, 2),
                "predicted_rul": pred_rul,
                "machine_health": round(health, 1),
                "status": status,
                "active_event": r.get("Active_Event", "None")
            })
            
        return {"logs": logs}
    except Exception as e:
        logger.error(f"Error in GET /api/logs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent logs: {str(e)}")

class ControlAction(BaseModel):
    action: str  # "start", "pause", "next", "reset", "set_speed"
    speed: float = 1.0

@app.post("/api/control")
def control_simulation(action: ControlAction):
    try:
        if action.action == "start":
            sim_state.auto_play = True
        elif action.action == "pause":
            sim_state.auto_play = False
        elif action.action == "next":
            generate_next_telemetry_step()
        elif action.action == "reset":
            sim_engine.reset()
            sim_state.history_records = []
            sim_state.prev_smoothed_rul = None
            generate_next_telemetry_step()
            sim_state.auto_play = False
        elif action.action == "set_speed":
            sim_state.simulation_speed = action.speed
                
        return {
            "current_idx": len(sim_state.history_records) - 1,
            "auto_play": sim_state.auto_play,
            "simulation_speed": sim_state.simulation_speed
        }
    except Exception as e:
        logger.error(f"Error in POST /api/control: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process control action: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
