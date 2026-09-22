import joblib
import pandas as pd
import numpy as np
import os

class PredictiveMaintenanceModel:
    def __init__(self, model_path="models/rf_rul_model.pkl", scaler_path="models/scaler.pkl"):
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

    def predict_rul(self, temperature, vibration, current, pressure=60.0, rpm=1750.0, flow_rate=50.0, oil_temperature=50.0, power_consumption=25.0):
        preds = self.predict_rul_batch([{
            "Temperature": temperature,
            "Vibration": vibration,
            "Motor_Current": current,
            "Pressure": pressure,
            "RPM": rpm,
            "Flow_Rate": flow_rate,
            "Oil_Temperature": oil_temperature,
            "Power_Consumption": power_consumption
        }])
        return preds[0] if preds else 0

    def predict_rul_batch(self, records_or_df):
        """
        Executes TRUE BATCH ML INFERENCE for all machines in a single pass.
        Accepts a DataFrame or list of dicts containing all 8 telemetry features.
        Executes EXACTLY ONE scaler.transform() and ONE model.predict() call for the entire fleet batch.
        Returns a list of integer RUL predictions.
        """
        if not self.model or not self.scaler:
            if isinstance(records_or_df, list):
                return [0] * len(records_or_df)
            return [0] * len(records_or_df.index)

        if isinstance(records_or_df, list):
            df = pd.DataFrame(records_or_df)
        else:
            df = records_or_df

        feature_cols = [
            "Temperature", "Vibration", "Motor_Current",
            "Pressure", "RPM", "Flow_Rate", "Oil_Temperature", "Power_Consumption"
        ]
        # Fill missing features if any record lacks optional 8th feature
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0.0

        X_features = df[feature_cols]
        X_scaled = self.scaler.transform(X_features)
        raw_preds = self.model.predict(X_scaled)
        return [max(0, int(round(p))) for p in raw_preds]


def filter_displayed_rul(raw_prediction, prev_displayed_rul=None, health=100.0):
    """
    Temporal smoothing filter for displayed Remaining Useful Life (RUL).
    - Monotonic non-increasing.
    - Smoothly decrements (1–3 days per step based on ML prediction and degradation rate).
    - Preserves gradual day-by-day degradation while tracking raw Random Forest predictions closely.
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
