# 🏭 Industrial Predictive Maintenance Platform

### Digital Twin • Machine Learning • Real-Time MQTT Telemetry • Intelligent Maintenance Decisions

An industrial predictive maintenance platform that monitors an eight-machine fleet, estimates Remaining Useful Life (RUL), evaluates equipment health and translates machine-learning predictions into actionable maintenance recommendations.

Built using Python, FastAPI, React, Scikit-learn and MQTT, the platform combines digital twin simulation, predictive analytics and real-time industrial telemetry within a unified monitoring system.

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?logo=python" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi" />
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/MQTT-Messaging-660066" />
  <img src="https://img.shields.io/badge/Machine_Learning-Scikit--learn-orange?logo=scikitlearn" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
</p>

---

## 📌 Overview

Unexpected industrial equipment failures can cause production downtime, increased maintenance costs and operational risks.

Traditional maintenance approaches often rely on fixed servicing schedules or reactive repairs. This project explores a predictive approach by continuously monitoring machine telemetry and estimating equipment degradation.

The platform simulates an industrial fleet of eight machines (`M-001` to `M-008`) and provides:

* Real-time machine health monitoring.
* Remaining Useful Life (RUL) prediction in days.
* Machine degradation and sensor telemetry visualization.
* Intelligent maintenance recommendations.
* Inspection priority and servicing schedules.
* MQTT-based external telemetry ingestion.
* Historical analytics and model evaluation.

The system separates predictive modelling from maintenance decision-making, allowing model predictions to be translated into actionable servicing policies.

---

## ✨ Key Features

### 1. Digital Twin Simulation

* Simulates eight independent industrial machines.
* Generates temperature, vibration and motor-current telemetry.
* Models machine degradation and operational variations.
* Supports synchronized machine simulation.
* Generates synthetic telemetry for development and testing.

### 2. Predictive Maintenance

* Random Forest regression for Remaining Useful Life estimation.
* Sensor preprocessing and feature scaling.
* Batch inference across the machine fleet.
* Temporal filtering of displayed RUL predictions.
* Machine health and degradation monitoring.

### 3. Intelligent Maintenance Decision Engine

Converts predicted RUL and machine health into maintenance actions.

| Predicted RUL | Status                 | Maintenance Action            |
| ------------- | ---------------------- | ----------------------------- |
| > 700 days    | Healthy                | Continue normal operation     |
| 400–700 days  | Monitor                | Increase monitoring frequency |
| 150–400 days  | Preventive Maintenance | Schedule maintenance          |
| 30–150 days   | Warning                | Perform servicing soon        |
| < 30 days     | Critical               | Immediate intervention        |

### 4. MQTT-Based Telemetry Streaming

Supports external machine telemetry through an MQTT messaging architecture.

* Mosquitto MQTT broker support.
* FastAPI MQTT subscriber.
* Configurable MQTT broker and topic.
* Multi-machine telemetry payloads.
* One-second interval telemetry publisher.
* Live ingestion from another laptop over a local network.

### 5. Interactive SCADA Dashboard

The React frontend provides four primary views:

* **Dashboard:** Live machine monitoring and sensor metrics.
* **Analytics:** Historical trends and comparative analysis.
* **Maintenance:** RUL predictions, servicing recommendations and inspection priorities.
* **Evaluation:** Model diagnostics and evaluation metrics.

---

## 🏗️ System Architecture

The platform supports two interchangeable operating modes.

### Mode 1 – Simulation Mode

```text
       8-Machine Digital Twin Simulator
                    |
                    v
          Synchronized Telemetry
                    |
                    v
          Feature Preprocessing
                    |
                    v
         Random Forest RUL Model
                    |
                    v
       Maintenance Decision Engine
                    |
                    v
              FastAPI Backend
                    |
                    v
             React Dashboard
```

### Mode 2 – MQTT Live Ingestion Mode

```text
 External Sensor / Telemetry Publisher
                    |
                    v
              MQTT Broker
               Mosquitto
                    |
                    v
          FastAPI MQTT Subscriber
                    |
                    v
          Batch ML Inference
                    |
                    v
       Maintenance Decision Engine
                    |
                    v
             React Dashboard
```

The two modes allow the application to operate either as a standalone digital twin simulation or as a telemetry-driven monitoring platform.

---

## 🧠 Machine Learning Pipeline

The predictive maintenance pipeline follows these stages:

```text
      Industrial Sensor Telemetry
                    |
                    v
            Feature Extraction
                    |
                    v
          StandardScaler
                    |
                    v
       Random Forest Regressor
                    |
                    v
       Predicted RUL (Days)
                    |
                    v
        Temporal RUL Filtering
                    |
                    v
      Maintenance Decision Engine
                    |
          +---------+---------+
          |         |         |
          v         v         v
       Health    Priority   Recommended
       Status    Level       Action
```

### Model Details

| Component       | Implementation                          |
| --------------- | --------------------------------------- |
| Prediction Task | Remaining Useful Life Regression        |
| Primary Model   | Random Forest Regressor                 |
| Preprocessing   | StandardScaler                          |
| Input Features  | Temperature, Vibration, Motor Current   |
| Output          | Predicted Remaining Useful Life in days |
| Decision Layer  | Rule-based Maintenance Engine           |

The system uses a single RUL prediction model and a separate rule-based decision engine to avoid redundant predictions and provide deterministic maintenance recommendations.

---

## 📡 MQTT Integration

The project supports real-time telemetry ingestion through MQTT.

**Broker:** Eclipse Mosquitto
**Default Port:** `1883`
**Default Topic:** `factory/telemetry`

### Telemetry Flow

```text
Laptop 1                         Laptop 2
-----------                      -----------
MQTT Publisher                   Mosquitto Broker
      |                                 |
      |                                 v
      +---------- MQTT ----------> FastAPI Subscriber
                                        |
                                        v
                                  ML Inference
                                        |
                                        v
                                  React Dashboard
```

### Example Telemetry Payload

```json
{
  "tick": 1,
  "timestamp": "2026-10-04 23:30:00",
  "machines": [
    {
      "Machine_ID": "M-001",
      "Machine_Name": "Turbine Motor Unit A1",
      "Temperature": 62.45,
      "Vibration": 0.21,
      "Motor_Current": 8.05,
      "Pressure": 5.02,
      "RPM": 1749.8,
      "Flow_Rate": 155.4,
      "Machine_Health": 98.5,
      "Remaining_Useful_Life_Days": 250
    }
  ]
}
```

---

## 🛠️ Technology Stack

| Category         | Technologies                |
| ---------------- | --------------------------- |
| Programming      | Python, JavaScript          |
| Backend          | FastAPI, Uvicorn, Pydantic  |
| Frontend         | React.js, Vite              |
| Machine Learning | Scikit-learn, Random Forest |
| Data Processing  | NumPy, Pandas               |
| Preprocessing    | StandardScaler              |
| Messaging        | MQTT, Eclipse Mosquitto     |
| Visualization    | Plotly.js, React Plotly     |
| UI               | Tailwind CSS, Lucide React  |
| Version Control  | Git, GitHub                 |

---

## 🚀 Getting Started

### Prerequisites

Install the following:

* Python 3.10 or later.
* Node.js and npm.
* Git.
* Mosquitto MQTT Broker (required for MQTT mode).

### 1. Clone the Repository

```bash
git clone https://github.com/Siva402-ai/industrial-predictive-maintenance.git

cd industrial-predictive-maintenance
```

### 2. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Running the Application

### Option A – Simulation Mode

**Terminal 1: Start FastAPI Backend**

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 2: Start React Frontend**

```bash
cd frontend
npm run dev
```

Open the frontend using the local URL displayed by Vite.

Backend API documentation:

```text
http://127.0.0.1:8000/docs
```

System status:

```text
http://127.0.0.1:8000/api/status
```

### Option B – MQTT Live Ingestion Mode

**Step 1: Start Mosquitto**

```bash
mosquitto -v -p 1883
```

**Step 2: Start FastAPI in MQTT Mode**

Windows PowerShell:

```powershell
$env:DATA_MODE="mqtt"
$env:MQTT_BROKER_HOST="localhost"
$env:MQTT_TOPIC="factory/telemetry"

python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Linux / macOS:

```bash
DATA_MODE=mqtt MQTT_BROKER_HOST=localhost python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

**Step 3: Start React Frontend**

```bash
cd frontend
npm run dev
```

**Step 4: Start the Telemetry Publisher**

Open another terminal in the project root:

```bash
python mqtt_publisher.py --broker localhost --port 1883 --topic factory/telemetry --interval 1.0
```

The publisher streams simulated telemetry for the eight-machine fleet at one-second intervals.

---

## 📂 Project Structure

```text
industrial-predictive-maintenance/
│
├── data/
├── datasets/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── model/
│   ├── predict.py
│   ├── maintenance_engine.py
│   └── train_model.py
│
├── models/
├── preprocessing/
├── simulator/
├── tests/
├── utils/
│
├── main.py
├── mqtt_publisher.py
├── mqtt_service.py
├── predict.py
├── train_gb_model.py
├── requirements.txt
│
├── PROJECT_DOCUMENTATION.md
├── PROJECT_OVERVIEW.md
└── README.md
```

---

## 📊 Model Evaluation

The project includes a dedicated model evaluation interface to examine prediction performance and model diagnostics.

The documented model evaluation includes:

* Regression evaluation metrics.
* Predicted versus actual RUL analysis.
* Residual distribution visualization.
* Feature-related model diagnostics.

Evaluation results should be interpreted in the context of the synthetic simulation and training data. They should not be treated as verified industrial deployment performance.

---

## 🔮 Future Enhancements

* Integration with physical industrial IoT sensors.
* Persistent time-series database storage.
* WebSocket-based live dashboard updates.
* Advanced anomaly detection.
* Expanded predictive modelling experiments.
* Cloud deployment and infrastructure monitoring.
* Role-based access control.
* Automated maintenance scheduling.

---

## 👨‍💻 Author

**Siva Balaji B K**

Artificial Intelligence and Data Science
SRM Easwari Engineering College

GitHub: [Siva402-ai](https://github.com/Siva402-ai)

---

## ⭐ Project

If you find this project interesting, consider giving the repository a star!

**Repository:** [Industrial Predictive Maintenance](https://github.com/Siva402-ai/industrial-predictive-maintenance)
