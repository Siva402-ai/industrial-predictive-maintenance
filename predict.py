import joblib
import pandas as pd
import numpy as np
import os

class PredictiveMaintenanceModel:
    """
    Unchanged default behavior: loads models/rf_rul_model.pkl + models/scaler.pkl,
    exactly as before.

    New, opt-in only: pass model_path explicitly (or set env var RUL_MODEL_PATH)
    to load a different trained regressor, e.g. models/gb_rul_model.pkl produced
    by train_gb_model.py. Nothing changes for existing callers that don't opt in.
    """
    def __init__(self, model_path=None, scaler_path="models/scaler.pkl"):
        if model_path is None:
            model_path = os.environ.get("RUL_MODEL_PATH", "models/rf_rul_model.pkl")

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if not os.path.exists(model_path):
            alt_model = os.path.join(base_dir, model_path)
            if os.path.exists(alt_model):
                model_path = alt_model
        if not os.path.exists(scaler_path):
            alt_scaler = os.path.join(base_dir, scaler_path)
            if os.path.exists(alt_scaler):
                scaler_path = alt_scaler

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
        else:
            self.model = None
            self.scaler = None

    def predict_rul(self, temperature, vibration, current):
        if not self.model or not self.scaler:
            return 0
            
        df = pd.DataFrame({
            "Temperature": [temperature],
            "Vibration": [vibration],
            "Motor_Current": [current]
        })
        
        X_scaled = self.scaler.transform(df)
        rul_pred = self.model.predict(X_scaled)[0]
        return max(0, int(rul_pred))

def filter_displayed_rul(raw_prediction, prev_displayed_rul=None, health=100.0):
    """
    Temporal smoothing filter for displayed Remaining Useful Life (RUL).
    - Monotonic non-increasing.
    - Smoothly decrements (1–3 days per step based on ML prediction and degradation rate).
    - Preserves gradual day-by-day degradation while tracking raw model predictions closely.
    - Converges smoothly to 0 when machine reaches terminal state (health = 0%).
    """
    raw_val = float(raw_prediction)
    h_val = float(health)
    
    if prev_displayed_rul is None:
        val_float = max(0.0, raw_val)
    else:
        prev_float = float(prev_displayed_rul)
        if prev_float <= 0.0:
            return 0.0, 0

        # Dynamic decay target blending day-advance with ML model prediction
        time_decay_target = prev_float - 1.0
        blended = 0.85 * time_decay_target + 0.15 * raw_val
        
        # If health is at terminal 0%, accelerate smooth convergence to 0 without instant hard jump
        if h_val <= 0.0:
            blended = min(blended, prev_float - 2.0)

        # Enforce smooth non-freezing monotonic upper bound (max decrement 0.51 to 3.0 per step)
        min_step_decrement = 0.51
        max_step_decrement = 3.0
        
        target_decrement = prev_float - blended
        clamped_decrement = max(min_step_decrement, min(max_step_decrement, target_decrement))
        
        val_float = max(0.0, prev_float - clamped_decrement)
        
    int_rul = max(0, int(round(val_float)))
    return val_float, int_rul



def get_future_trend(history_values, steps=20):
    """
    Extrapolates the next `steps` values based on polynomial trend fitting.
    Ensures seamless connection at index 0 to history_values[-1] with growing future uncertainty.
    """
    if len(history_values) < 2:
        return [history_values[-1]] * steps if history_values else [0] * steps
        
    x = np.arange(len(history_values))
    y = np.array(history_values)
    last_val = float(y[-1])
    
    # Fit recent trend (degree 2 polynomial if enough points, else linear)
    window = min(30, len(history_values))
    deg = 2 if window >= 10 else 1
    try:
        coef = np.polyfit(x[-window:], y[-window:], deg)
        poly1d_fn = np.poly1d(coef)
    except:
        coef = np.polyfit(x, y, 1)
        poly1d_fn = np.poly1d(coef)
        
    future_x = np.arange(len(history_values) - 1, len(history_values) - 1 + steps)
    base_future = poly1d_fn(future_x)
    
    # Offset base_future so future_y[0] matches last_val exactly for seamless connection
    offset = last_val - base_future[0]
    base_future = base_future + offset
    
    # Estimate noise / standard deviation from recent residuals
    recent_residuals = y[-window:] - poly1d_fn(x[-window:])
    std_dev = float(np.std(recent_residuals)) if len(recent_residuals) > 1 else 0.5
    std_dev = max(0.15, min(std_dev, 2.5))
    
    # Project into future with growing uncertainty fan
    np.random.seed(42)  # Fixed seed for consistent rendering across polling intervals
    future_y = [round(last_val, 2)]
    for i in range(1, steps):
        uncertainty_factor = (i / steps) * 0.75
        noise = float(np.random.normal(0, std_dev * uncertainty_factor))
        future_y.append(round(float(base_future[i] + noise), 2))
        
    return future_y
