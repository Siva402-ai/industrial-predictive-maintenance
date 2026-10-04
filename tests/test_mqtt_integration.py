import sys
import os
import unittest
import json

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for folder in ['simulator', 'preprocessing', 'model', 'utils']:
    p = os.path.join(base_dir, folder)
    if os.path.exists(p) and p not in sys.path:
        sys.path.append(p)
if base_dir not in sys.path:
    sys.path.append(base_dir)

from mqtt_service import MQTTService, MQTTConfig
from main import process_raw_telemetry_batch, sim_state, sim_engine

class TestMQTTIntegration(unittest.TestCase):
    def setUp(self):
        self.mqtt_service = MQTTService()

    def test_mqtt_config_defaults(self):
        cfg = MQTTConfig()
        self.assertIn(cfg.data_mode, ["simulation", "mqtt"])
        self.assertEqual(cfg.broker_port, 1883)
        self.assertTrue(len(cfg.topic) > 0)

    def test_normalize_single_dict(self):
        raw = {
            "Machine_ID": "M-001",
            "Temperature": 65.4,
            "Vibration": 0.28,
            "Motor_Current": 8.4,
            "Pressure": 60.1,
            "RPM": 1750.0,
            "Flow_Rate": 50.0,
            "Oil_Temperature": 52.0,
            "Power_Consumption": 25.5,
            "Machine_Health": 95.0,
            "Remaining_Useful_Life_Days": 230
        }
        normalized = self.mqtt_service._normalize_telemetry(raw)
        self.assertEqual(len(normalized), 1)
        self.assertEqual(normalized[0]["Machine_ID"], "M-001")
        self.assertEqual(normalized[0]["Temperature"], 65.4)
        self.assertEqual(normalized[0]["Source"], "mqtt")

    def test_normalize_batch_list(self):
        raw = [
            {"Machine_ID": "M-001", "Temperature": 63.0},
            {"Machine_ID": "M-002", "Temperature": 64.0}
        ]
        normalized = self.mqtt_service._normalize_telemetry(raw)
        self.assertEqual(len(normalized), 2)
        self.assertEqual(normalized[0]["Machine_ID"], "M-001")
        self.assertEqual(normalized[1]["Machine_ID"], "M-002")

    def test_normalize_envelope_dict(self):
        raw = {
            "tick": 42,
            "timestamp": "2026-10-04 12:00:00",
            "machines": [
                {"Machine_ID": "M-003", "Temperature": 68.0, "Vibration": 0.35}
            ]
        }
        normalized = self.mqtt_service._normalize_telemetry(raw)
        self.assertEqual(len(normalized), 1)
        self.assertEqual(normalized[0]["Machine_ID"], "M-003")
        self.assertEqual(normalized[0]["Temperature"], 68.0)

    def test_process_raw_telemetry_batch_e2e(self):
        raw_batch = [
            {
                "Timestamp": "2026-10-04 23:20:00",
                "Machine_ID": "M-001",
                "Temperature": 64.0,
                "Vibration": 0.22,
                "Motor_Current": 8.1,
                "Pressure": 60.0,
                "RPM": 1750.0,
                "Flow_Rate": 50.0,
                "Oil_Temperature": 50.0,
                "Power_Consumption": 25.0,
                "Machine_Health": 98.0,
                "Remaining_Useful_Life_Days": 240
            }
        ]
        processed = process_raw_telemetry_batch(raw_batch, source="mqtt")
        self.assertEqual(len(processed), 1)
        record = processed[0]
        self.assertIn("Predicted_RUL", record)
        self.assertIn("Machine_Status", record)
        self.assertIn("Recommended_Action", record)
        self.assertIn("Inspection_Priority", record)
        self.assertEqual(record["Source"], "mqtt")

if __name__ == "__main__":
    unittest.main()
