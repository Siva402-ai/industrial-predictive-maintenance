# Industrial Predictive Maintenance Platform

An industrial-grade **Digital Twin SCADA & Machine Learning System** that monitors fleet equipment in real time, predicts **Remaining Useful Life (RUL)** in days, evaluates anomaly severity, and provides automated maintenance decision recommendations.

---

## 🏗️ Architecture & Data Modes

The system operates in two interchangeable data modes configured via the `DATA_MODE` environment variable:

```
MODE 1: SIMULATION MODE (Default)
Fleet Simulator ──> FastAPI Clock Loop ──> Batch ML Inference ──> RUL Filter & Decision Engine ──> React UI

MODE 2: MQTT LIVE INGESTION MODE
Laptop 1 / IoT Publisher ──> MQTT Broker ──> FastAPI MQTT Subscriber ──> Batch ML Inference ──> RUL Filter & Decision Engine ──> React UI
```

---

## ⚙️ Environment Variables & Configuration

| Variable | Default Value | Description |
|---|---|---|
| `DATA_MODE` | `simulation` | Data mode: `simulation` (internal fleet simulator) or `mqtt` (live subscriber) |
| `MQTT_BROKER_HOST` | `localhost` | Hostname or IP address of the MQTT broker |
| `MQTT_BROKER_PORT` | `1883` | Port number of the MQTT broker |
| `MQTT_TOPIC` | `factory/telemetry` | MQTT topic subscribed to by backend / published by telemetry generator |
| `MQTT_CLIENT_ID` | `pm_backend_XXXXXX` | Unique MQTT client identifier |
| `MQTT_USERNAME` | *(empty)* | Optional MQTT broker username |
| `MQTT_PASSWORD` | *(empty)* | Optional MQTT broker password |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
# Python backend & ML dependencies
pip install -r requirements.txt

# React frontend dependencies
cd frontend
npm install
cd ..
```

---

### 2. Running Mode 1: Simulation Mode (Single Laptop / Standalone)

In this mode, the backend runs its internal 8-machine synchronized physics simulator.

#### Terminal 1 — Start FastAPI Backend:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

#### Terminal 2 — Start React Dashboard:
```bash
cd frontend
npm.cmd run dev
```

* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`)
* **Backend API Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **System Status API:** [http://127.0.0.1:8000/api/status](http://127.0.0.1:8000/api/status)

---

### 3. Running Mode 2: MQTT Live Ingestion Mode

In this mode, the backend subscribes to an external MQTT broker (e.g., Mosquitto, EMQX, HiveMQ) and feeds incoming sensor packets into the machine learning & maintenance engine.

#### Step A — Start an MQTT Broker
You can use a local broker like Mosquitto or any cloud/LAN broker on port `1883`:
```bash
# Example if using Mosquitto
mosquitto -v -p 1883
```

#### Step B — Start FastAPI in MQTT Mode:
```powershell
# PowerShell
$env:DATA_MODE="mqtt"
$env:MQTT_BROKER_HOST="localhost"
$env:MQTT_TOPIC="factory/telemetry"
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
```bash
# Linux / macOS / Bash
DATA_MODE=mqtt MQTT_BROKER_HOST=localhost python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

#### Step C — Start React Dashboard:
```bash
cd frontend
npm.cmd run dev
```

#### Step D — Start MQTT Telemetry Publisher:
```bash
# Stream 8-machine fleet telemetry at 1-second intervals
python mqtt_publisher.py --broker localhost --port 1883 --topic factory/telemetry --interval 1.0
```

---

## 📡 MQTT Topic & JSON Payload Format

### Target Topic: `factory/telemetry`

#### Payload Format A: Multi-Machine Fleet Array (Recommended)
```json
{
  "tick": 1,
  "timestamp": "2026-10-04 23:30:00",
  "machines": [
    {
      "Timestamp": "2026-10-04 23:30:00",
      "Machine_ID": "M-001",
      "Machine_Name": "Turbine Motor Unit A1",
      "Temperature": 62.45,
      "Vibration": 0.21,
      "Motor_Current": 8.05,
      "Pressure": 5.02,
      "RPM": 1749.8,
      "Flow_Rate": 155.4,
      "Oil_Temperature": 49.8,
      "Power_Consumption": 14.5,
      "Acoustic_Noise": 45.2,
      "Machine_Health": 98.5,
      "Active_Event": "None",
      "Remaining_Useful_Life_Days": 250
    }
  ]
}
```

#### Payload Format B: Single Machine Telemetry Record
```json
{
  "Timestamp": "2026-10-04 23:30:00",
  "Machine_ID": "M-001",
  "Machine_Name": "Turbine Motor Unit A1",
  "Temperature": 64.12,
  "Vibration": 0.28,
  "Motor_Current": 8.35,
  "Pressure": 5.10,
  "RPM": 1748.2,
  "Flow_Rate": 154.0,
  "Oil_Temperature": 50.1,
  "Power_Consumption": 15.0,
  "Acoustic_Noise": 46.0,
  "Machine_Health": 96.0,
  "Active_Event": "None",
  "Remaining_Useful_Life_Days": 240
}
```

---

## 💻 Two-Laptop MQTT Demo Setup (Over Local Wi-Fi/LAN)

Demonstrates remote SCADA telemetry streaming across two separate physical machines on the same network.

```
┌───────────────────────────────────────┐             ┌─────────────────────────────────────────┐
│              LAPTOP 1                 │             │                LAPTOP 2                 │
│  (Sensor Simulator / IoT Gateway)     │             │    (SCADA Server & React Dashboard)     │
│                                       │             │                                         │
│ • Runs: mqtt_publisher.py             │  Wi-Fi/LAN  │ • Runs: MQTT Broker (e.g., Mosquitto)   │
│ • Streams telemetry to Laptop 2 IP   ──────MQTT────>│ • Runs: FastAPI Backend (DATA_MODE=mqtt)│
│                                       │  Port 1883  │ • Runs: React + Vite SCADA UI           │
└───────────────────────────────────────┘             └─────────────────────────────────────────┘
```

### Step 1: Connect Both Laptops to the Same Wi-Fi Network
* Find Laptop 2's LAN IP address (e.g., on Windows run `ipconfig` -> `IPv4 Address: 192.168.1.50`).

### Step 2: On Laptop 2 (Backend & Dashboard Receiver)
1. Start MQTT Broker on Laptop 2 listening on `0.0.0.0:1883`.
2. Start FastAPI Backend in MQTT mode:
   ```powershell
   $env:DATA_MODE="mqtt"
   $env:MQTT_BROKER_HOST="127.0.0.1"
   $env:MQTT_TOPIC="factory/telemetry"
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```
3. Start React Dashboard on Laptop 2:
   ```powershell
   cd frontend
   npm.cmd run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

### Step 3: On Laptop 1 (Field Simulator / Sensor Publisher)
1. Copy or clone the repository to Laptop 1 and install dependencies (`pip install -r requirements.txt`).
2. Run the publisher pointing to Laptop 2's IP:
   ```bash
   python mqtt_publisher.py --broker 192.168.1.50 --port 1883 --topic factory/telemetry --interval 1.0
   ```
3. Laptop 1 will stream live telemetry into Laptop 2's MQTT broker, where the ML model continuously predicts RUL and displays live updates on the React dashboard in real time!
