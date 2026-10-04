import os
import json
import logging
import datetime
import uuid
from typing import Callable, Optional, List, Dict, Any

logger = logging.getLogger("mqtt_service")

class MQTTConfig:
    """Configuration loaded from environment variables."""
    def __init__(self):
        self.data_mode = os.getenv("DATA_MODE", "simulation").strip().lower()
        self.broker_host = os.getenv("MQTT_BROKER_HOST", "localhost").strip()
        self.broker_port = int(os.getenv("MQTT_BROKER_PORT", "1883").strip())
        self.topic = os.getenv("MQTT_TOPIC", "factory/telemetry").strip()
        self.client_id = os.getenv("MQTT_CLIENT_ID", f"pm_backend_{uuid.uuid4().hex[:6]}")
        self.username = os.getenv("MQTT_USERNAME", "").strip()
        self.password = os.getenv("MQTT_PASSWORD", "").strip()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "data_mode": self.data_mode,
            "broker_host": self.broker_host,
            "broker_port": self.broker_port,
            "topic": self.topic,
            "client_id": self.client_id
        }


class MQTTService:
    """
    Asynchronous MQTT Ingestion Service for Industrial Predictive Maintenance.
    Subscribes to sensor telemetry topics, parses and validates JSON payloads,
    and forwards telemetry into the machine learning & decision engine pipeline.
    """
    def __init__(self, config: Optional[MQTTConfig] = None):
        self.config = config or MQTTConfig()
        self.client = None
        self.telemetry_handler: Optional[Callable[[List[Dict[str, Any]]], None]] = None
        self.connected = False
        self.subscribed = False
        self.messages_received = 0
        self.last_message_time: Optional[str] = None
        self.last_error: Optional[str] = None
        self._is_running = False

    def is_mqtt_mode(self) -> bool:
        return self.config.data_mode == "mqtt"

    def set_telemetry_handler(self, handler: Callable[[List[Dict[str, Any]]], None]):
        """Sets callback function invoked when valid telemetry records are received."""
        self.telemetry_handler = handler

    def start(self):
        """Initializes and starts the MQTT client background network loop."""
        if not self.is_mqtt_mode():
            logger.info(f"MQTT Service idle. DATA_MODE is '{self.config.data_mode}' (simulation mode active).")
            return

        try:
            import paho.mqtt.client as mqtt
        except ImportError:
            err = "paho-mqtt library is not installed. Install with 'pip install paho-mqtt'."
            logger.error(err)
            self.last_error = err
            return

        try:
            # Support paho-mqtt v2.x and legacy v1.x
            if hasattr(mqtt, "CallbackAPIVersion"):
                self.client = mqtt.Client(
                    mqtt.CallbackAPIVersion.VERSION2,
                    client_id=self.config.client_id,
                    protocol=mqtt.MQTTv311
                )
            else:
                self.client = mqtt.Client(
                    client_id=self.config.client_id,
                    protocol=mqtt.MQTTv311
                )

            if self.config.username:
                self.client.username_pw_set(self.config.username, self.config.password)

            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message
            self.client.on_subscribe = self._on_subscribe

            logger.info(
                f"Connecting to MQTT Broker at {self.config.broker_host}:{self.config.broker_port} "
                f"(Topic: '{self.config.topic}', ClientID: '{self.config.client_id}')..."
            )
            self.client.connect_async(self.config.broker_host, self.config.broker_port, keepalive=60)
            self.client.loop_start()
            self._is_running = True

        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to start MQTT client: {e}", exc_info=True)

    def stop(self):
        """Stops the MQTT client network loop and disconnects."""
        if self.client and self._is_running:
            try:
                logger.info("Stopping MQTT subscriber...")
                self.client.loop_stop()
                self.client.disconnect()
            except Exception as e:
                logger.warning(f"Error disconnecting MQTT client: {e}")
            finally:
                self.connected = False
                self.subscribed = False
                self._is_running = False

    def _on_connect(self, client, userdata, flags, rc, *args):
        # Handle paho-mqtt v2 vs v1 callback signatures
        return_code = rc if isinstance(rc, int) else getattr(rc, "value", 0)
        if return_code == 0:
            self.connected = True
            self.last_error = None
            logger.info(f"Connected to MQTT Broker at {self.config.broker_host}:{self.config.broker_port}")
            client.subscribe(self.config.topic, qos=1)
            logger.info(f"Subscribing to topic: '{self.config.topic}' (QoS 1)")
        else:
            self.connected = False
            self.last_error = f"Connection failed with code {return_code}"
            logger.error(f"MQTT connection refused with code {return_code}")

    def _on_disconnect(self, client, userdata, *args):
        self.connected = False
        self.subscribed = False
        logger.warning(f"Disconnected from MQTT Broker {self.config.broker_host}:{self.config.broker_port}. Auto-reconnecting...")

    def _on_subscribe(self, client, userdata, mid, *args):
        self.subscribed = True
        logger.info(f"Successfully subscribed to topic: '{self.config.topic}'")

    def _on_message(self, client, userdata, message):
        """Processes incoming MQTT messages and invokes telemetry pipeline."""
        try:
            raw_payload = message.payload.decode("utf-8")
            self.messages_received += 1
            self.last_message_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            try:
                data = json.loads(raw_payload)
            except json.JSONDecodeError as json_err:
                logger.warning(f"Received invalid JSON on topic '{message.topic}': {raw_payload[:100]}... Error: {json_err}")
                return

            records = self._normalize_telemetry(data)
            if not records:
                logger.warning(f"Telemetry payload on '{message.topic}' contained no valid machine records: {data}")
                return

            if self.telemetry_handler:
                self.telemetry_handler(records)

        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Error handling incoming MQTT telemetry: {e}", exc_info=True)

    def _normalize_telemetry(self, data: Any) -> List[Dict[str, Any]]:
        """
        Normalizes various JSON structures (single dict, list of dicts, or envelope objects)
        into a consistent list of validated machine telemetry dictionaries.
        """
        raw_list = []
        if isinstance(data, list):
            raw_list = data
        elif isinstance(data, dict):
            # Check for envelope keys
            if "machines" in data and isinstance(data["machines"], list):
                raw_list = data["machines"]
            elif "data" in data and isinstance(data["data"], list):
                raw_list = data["data"]
            elif "telemetry" in data and isinstance(data["telemetry"], list):
                raw_list = data["telemetry"]
            else:
                raw_list = [data]
        else:
            return []

        validated = []
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        for idx, item in enumerate(raw_list):
            if not isinstance(item, dict):
                continue

            # Ensure minimum required fields with sensible fallbacks
            m_id = str(item.get("Machine_ID") or item.get("machine_id") or f"M-{idx+1:03d}")
            m_name = str(item.get("Machine_Name") or item.get("machine_name") or m_id)
            timestamp = str(item.get("Timestamp") or item.get("timestamp") or now_str)

            # Extract numeric telemetry with standard baseline defaults
            try:
                temp = float(item.get("Temperature", item.get("temperature", 62.0)))
                vib = float(item.get("Vibration", item.get("vibration", 0.20)))
                curr = float(item.get("Motor_Current", item.get("motor_current", 8.0)))
                press = float(item.get("Pressure", item.get("pressure", 60.0)))
                rpm = float(item.get("RPM", item.get("rpm", 1750.0)))
                flow = float(item.get("Flow_Rate", item.get("flow_rate", 50.0)))
                oil_temp = float(item.get("Oil_Temperature", item.get("oil_temperature", 50.0)))
                pwr = float(item.get("Power_Consumption", item.get("power_consumption", 25.0)))
                noise = float(item.get("Acoustic_Noise", item.get("acoustic_noise", 45.0)))
                health = float(item.get("Machine_Health", item.get("machine_health", 100.0)))
                active_event = str(item.get("Active_Event", item.get("active_event", "None")))
                actual_rul = int(item.get("Remaining_Useful_Life_Days", item.get("actual_rul_days", 250)))
            except (ValueError, TypeError) as parse_err:
                logger.warning(f"Error parsing numeric fields for {m_id}: {parse_err}")
                continue

            record = {
                "Timestamp": timestamp,
                "Machine_ID": m_id,
                "Machine_Name": m_name,
                "Temperature": round(temp, 2),
                "Vibration": round(vib, 2),
                "Motor_Current": round(curr, 2),
                "Pressure": round(press, 2),
                "RPM": round(rpm, 2),
                "Flow_Rate": round(flow, 2),
                "Oil_Temperature": round(oil_temp, 2),
                "Power_Consumption": round(pwr, 2),
                "Acoustic_Noise": round(noise, 2),
                "Machine_Health": round(health, 1),
                "Active_Event": active_event,
                "Remaining_Useful_Life_Days": actual_rul,
                "Source": "mqtt"
            }
            validated.append(record)

        return validated

    def get_status(self) -> Dict[str, Any]:
        """Returns MQTT connection and message statistics."""
        return {
            "mode": self.config.data_mode,
            "connected": self.connected,
            "subscribed": self.subscribed,
            "broker": f"{self.config.broker_host}:{self.config.broker_port}",
            "topic": self.config.topic,
            "client_id": self.config.client_id,
            "messages_received": self.messages_received,
            "last_message_time": self.last_message_time,
            "last_error": self.last_error
        }
