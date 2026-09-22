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


def get_speed():
    if pixhawk_connection is None:
        return None
    message = pixhawk_connection.recv_match(type="VFR_HUD", blocking=True, timeout=2)
    if message is None:
        return None
    return {
        "ground_speed": float(message.groundspeed),
        "air_speed": float(message.airspeed),
    }


def upload_mission(waypoints):
    if pixhawk_connection is None:
        raise RuntimeError("Pixhawk is not connected")
    pixhawk_connection.mav.mission_clear_all_send(
        pixhawk_connection.target_system,
        pixhawk_connection.target_component,
    )
    pixhawk_connection.mav.mission_count_send(
        pixhawk_connection.target_system,
        len(waypoints),
    )
    for index, waypoint in enumerate(waypoints):
        message = pixhawk_connection.recv_match(type="MISSION_REQUEST", blocking=True, timeout=5)
        if message is None:
            raise RuntimeError("Pixhawk did not request mission waypoint")
        pixhawk_connection.mav.mission_item_int_send(
            pixhawk_connection.target_system,
            pixhawk_connection.target_component,
            index,
            mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT_INT,
            mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,
            0,
            1,
            0,
            0,
            0,
            0,
            int(float(waypoint["latitude"]) * 10**7),
            int(float(waypoint["longitude"]) * 10**7),
            10,
        )
    pixhawk_connection.recv_match(type="MISSION_ACK", blocking=True, timeout=5)


def start_mission():
    if pixhawk_connection is None:
        raise RuntimeError("Pixhawk is not connected")
    pixhawk_connection.set_mode("AUTO")


def return_home():
    if pixhawk_connection is None:
        raise RuntimeError("Pixhawk is not connected")
    pixhawk_connection.mav.command_long_send(
        pixhawk_connection.target_system,
        pixhawk_connection.target_component,
        mavutil.mavlink.MAV_CMD_NAV_RETURN_TO_LAUNCH,
        0,
        0, 0, 0, 0, 0, 0, 0,
    )


def stop_mission():
    if pixhawk_connection is None:
        raise RuntimeError("Pixhawk is not connected")
    pixhawk_connection.set_mode("LOITER")


def land():
    if pixhawk_connection is None:
        raise RuntimeError("Pixhawk is not connected")
    pixhawk_connection.mav.command_long_send(
        pixhawk_connection.target_system,
        pixhawk_connection.target_component,
        mavutil.mavlink.MAV_CMD_NAV_LAND,
        0,
        0, 0, 0, 0, 0, 0, 0,
    )


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