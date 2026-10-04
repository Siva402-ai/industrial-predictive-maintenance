#!/usr/bin/env python3
"""
Industrial Predictive Maintenance - MQTT Telemetry Publisher

Simulates physical SCADA sensor telemetry and publishes JSON payloads to an MQTT broker.
Can be run on a separate laptop or device (Laptop 1) to stream live industrial sensor data
over the local network to the FastAPI backend (Laptop 2).

Usage:
  python mqtt_publisher.py --broker localhost --port 1883 --topic factory/telemetry --interval 1.0
  python mqtt_publisher.py --broker 192.168.1.50 --topic factory/telemetry
"""

import sys
import os
import time
import json
import argparse
import datetime
import logging

# Ensure local modules can be loaded
base_dir = os.path.dirname(os.path.abspath(__file__))
for folder in ['simulator', 'preprocessing', 'model', 'utils']:
    folder_path = os.path.join(base_dir, folder)
    if os.path.exists(folder_path) and folder_path not in sys.path:
        sys.path.append(folder_path)
if base_dir not in sys.path:
    sys.path.append(base_dir)

from simulator import FleetSimulator, RealTimeMachineSimulator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("mqtt_publisher")

def parse_args():
    parser = argparse.ArgumentParser(
        description="MQTT Telemetry Publisher for Industrial Predictive Maintenance",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "--broker",
        default=os.getenv("MQTT_BROKER_HOST", "localhost"),
        help="MQTT broker IP or hostname"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("MQTT_BROKER_PORT", "1883")),
        help="MQTT broker port"
    )
    parser.add_argument(
        "--topic",
        default=os.getenv("MQTT_TOPIC", "factory/telemetry"),
        help="MQTT topic to publish sensor telemetry to"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Telemetry publication interval in seconds"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=-1,
        help="Number of ticks to publish (-1 for continuous stream)"
    )
    parser.add_argument(
        "--mode",
        choices=["fleet", "single"],
        default="fleet",
        help="Publish all 8 fleet machines simultaneously ('fleet') or a single machine ('single')"
    )
    parser.add_argument(
        "--machine-id",
        default="M-001",
        help="Machine ID when using --mode single"
    )
    return parser.parse_args()


def main():
    args = parse_args()

    try:
        import paho.mqtt.client as mqtt
    except ImportError:
        logger.error("paho-mqtt is required. Run 'pip install paho-mqtt' to install.")
        sys.exit(1)

    client_id = f"pm_publisher_{int(time.time())}"
    if hasattr(mqtt, "CallbackAPIVersion"):
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=client_id, protocol=mqtt.MQTTv311)
    else:
        client = mqtt.Client(client_id=client_id, protocol=mqtt.MQTTv311)

    connected = False

    def on_connect(c, userdata, flags, rc, *extra):
        nonlocal connected
        code = rc if isinstance(rc, int) else getattr(rc, "value", 0)
        if code == 0:
            connected = True
            logger.info(f"Connected to MQTT broker at {args.broker}:{args.port}")
        else:
            logger.error(f"Connection failed with return code {code}")

    def on_disconnect(c, userdata, *extra):
        nonlocal connected
        connected = False
        logger.warning(f"Disconnected from MQTT broker at {args.broker}:{args.port}")

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect

    logger.info("=" * 65)
    logger.info("🏭 Industrial Predictive Maintenance — MQTT Publisher")
    logger.info("=" * 65)
    logger.info(f"Target Broker: {args.broker}:{args.port}")
    logger.info(f"Target Topic:  {args.topic}")
    logger.info(f"Stream Mode:   {args.mode.upper()}")
    logger.info(f"Interval:      {args.interval}s")
    logger.info("=" * 65)

    try:
        client.connect(args.broker, args.port, keepalive=60)
        client.loop_start()
    except Exception as e:
        logger.error(f"Could not initiate connection to MQTT broker at {args.broker}:{args.port}: {e}")
        logger.error("Ensure your MQTT broker (e.g., Mosquitto, EMQX, HiveMQ) is running.")
        sys.exit(1)

    # Wait briefly for connection
    wait_sec = 0
    while not connected and wait_sec < 5:
        time.sleep(0.5)
        wait_sec += 0.5

    if not connected:
        logger.warning(f"Connection pending to {args.broker}:{args.port}. Continuing in background...")

    # Initialize simulation engines
    if args.mode == "fleet":
        engine = FleetSimulator(max_lifespan_days=250, degradation_factor=1.8)
    else:
        engine = RealTimeMachineSimulator(max_lifespan_days=250, degradation_factor=1.8)

    ticks_sent = 0
    try:
        while args.count < 0 or ticks_sent < args.count:
            if args.mode == "fleet":
                records = engine.step()
                payload = {
                    "tick": engine.tick,
                    "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "machines": records
                }
                summary_str = f"Fleet Tick #{engine.tick:04d} | 8 Machines | Avg Temp: {sum(r['Temperature'] for r in records)/len(records):.1f}°C"
            else:
                record = engine.step()
                record["Machine_ID"] = args.machine_id
                payload = record
                summary_str = (
                    f"Day {record['Day']:03d} | {args.machine_id} | "
                    f"Temp: {record['Temperature']}°C | Vib: {record['Vibration']}mm/s | "
                    f"Health: {record['Machine_Health']}% | RUL: {record['Remaining_Useful_Life_Days']}d"
                )

            json_bytes = json.dumps(payload).encode("utf-8")
            result = client.publish(args.topic, json_bytes, qos=1)

            ticks_sent += 1
            logger.info(f"📤 Published #{ticks_sent:04d} -> Topic: '{args.topic}' | {summary_str}")

            time.sleep(args.interval)

    except KeyboardInterrupt:
        logger.info("\nPublisher stopped by user (Ctrl+C).")
    finally:
        client.loop_stop()
        client.disconnect()
        logger.info("MQTT Publisher disconnected cleanly.")

if __name__ == "__main__":
    main()
