from pymavlink import mavutil


pixhawk_connection = None


def connect_pixhawk(port="/dev/ttyACM0", baud=115200):
    """
    Connect Raspberry Pi to Pixhawk through USB.
    """

    global pixhawk_connection

    try:
        print(f"Connecting to Pixhawk on {port}...")

        pixhawk_connection = mavutil.mavlink_connection(
            port,
            baud=baud
        )

        print("Waiting for Pixhawk heartbeat...")

        pixhawk_connection.wait_heartbeat()

        print(
            f"Pixhawk connected: "
            f"system={pixhawk_connection.target_system}, "
            f"component={pixhawk_connection.target_component}"
        )

        return True

    except Exception as e:
        print(f"Pixhawk connection error: {e}")
        pixhawk_connection = None
        return False


def get_gps():
    """
    Get GPS information from Pixhawk.
    """

    if pixhawk_connection is None:
        print("Pixhawk is not connected.")
        return None

    msg = pixhawk_connection.recv_match(
        type="GLOBAL_POSITION_INT",
        blocking=True,
        timeout=2
    )

    if msg is None:
        return None

    return {
        "latitude": msg.lat / 10000000.0,
        "longitude": msg.lon / 10000000.0,
        "altitude": msg.relative_alt / 1000.0
    }


def get_battery():
    """
    Get battery information from Pixhawk.
    """

    if pixhawk_connection is None:
        print("Pixhawk is not connected.")
        return None

    msg = pixhawk_connection.recv_match(
        type="SYS_STATUS",
        blocking=True,
        timeout=2
    )

    if msg is None:
        return None

    return {
        "voltage": msg.voltage_battery / 1000.0,
        "current": msg.current_battery / 100.0,
        "battery_remaining": msg.battery_remaining
    }


def get_altitude():
    """
    Get current relative altitude.
    """

    gps_data = get_gps()

    if gps_data is None:
        return None

    return gps_data["altitude"]


def disconnect_pixhawk():
    """
    Close Pixhawk connection.
    """

    global pixhawk_connection

    if pixhawk_connection is not None:
        pixhawk_connection.close()
        pixhawk_connection = None
        print("Pixhawk disconnected.")


if __name__ == "__main__":
    connected = connect_pixhawk()

    if connected:
        print("GPS:", get_gps())
        print("Battery:", get_battery())
        print("Altitude:", get_altitude())

        disconnect_pixhawk()