from pymavlink import mavutil


class Pixhawk:
    def __init__(self, baud: int = 57600):
        self.connection = None
        self.baud = baud

    def connect(self, connection_string: str, baud: int | None = None):
        print(f"Connecting to Pixhawk: {connection_string}")

        try:
            self.connection = mavutil.mavlink_connection(
                connection_string,
                baud=baud or self.baud,
            )

            print("Waiting for heartbeat...")

            self.connection.wait_heartbeat(timeout=10)

            print(
                f"Heartbeat received from "
                f"system={self.connection.target_system}, "
                f"component={self.connection.target_component}"
            )

            return True

        except Exception as e:
            self.connection = None
            print(f"Pixhawk connection failed: {e}")
            return False

    def disconnect(self):
        if self.connection is not None:
            self.connection.close()
            self.connection = None

    def get_gps(self):
        if self.connection is None:
            raise RuntimeError("Pixhawk is not connected")

        message = self.connection.recv_match(
            type="GLOBAL_POSITION_INT",
            blocking=True,
            timeout=5
        )

        if message is None:
            raise RuntimeError("GPS data not received")

        return {
            "latitude": message.lat / 10**7,
            "longitude": message.lon / 10**7,
            "altitude": message.relative_alt / 1000
        }

    def get_battery(self):
        if self.connection is None:
            raise RuntimeError("Pixhawk is not connected")

        message = self.connection.recv_match(
            type="SYS_STATUS",
            blocking=True,
            timeout=5
        )

        if message is None:
            raise RuntimeError("Battery data not received")

        return {
            "battery_voltage": message.voltage_battery / 1000,
            "battery_remaining": message.battery_remaining
        }

    def get_speed(self):
        if self.connection is None:
            raise RuntimeError("Pixhawk is not connected")

        message = self.connection.recv_match(
            type="VFR_HUD",
            blocking=True,
            timeout=5,
        )
        if message is None:
            raise RuntimeError("Speed data not received")

        return {
            "ground_speed": float(message.groundspeed),
            "air_speed": float(message.airspeed),
        }

    def get_altitude(self):
        if self.connection is None:
            raise RuntimeError("Pixhawk is not connected")

        message = self.connection.recv_match(
            type="GLOBAL_POSITION_INT",
            blocking=True,
            timeout=5
        )

        if message is None:
            raise RuntimeError("Altitude data not received")

        return message.relative_alt / 1000

    def get_mode(self):
        if self.connection is None:
            raise RuntimeError("Pixhawk is not connected")

        return self.connection.flightmode

    def is_armed(self):
        if self.connection is None:
            raise RuntimeError("Pixhawk is not connected")

        return self.connection.motors_armed()