from camera import capture_image
from pollination import pollinate_flower
from sensors import get_sensor_data
from pixhawk import connect_pixhawk, get_gps, get_battery, disconnect_pixhawk


def main():
    print("=" * 50)
    print("MelissaNektarion Raspberry Pi System")
    print("=" * 50)

    # 1. Read environmental sensors
    print("\n[1] Reading sensors...")
    sensor_data = get_sensor_data()
    print("Sensor data:", sensor_data)

    # 2. Connect to Pixhawk
    print("\n[2] Connecting to Pixhawk...")
    pixhawk_connected = connect_pixhawk()

    if pixhawk_connected:
        print("GPS:", get_gps())
        print("Battery:", get_battery())

    # 3. Capture image
    print("\n[3] Capturing camera image...")
    image = capture_image()

    if image:
        print("Image:", image)

        # 4. Pollination action
        # This will later be triggered after the
        # flower-detection/mission logic.
        print("\n[4] Pollination system ready.")
        # pollinate_flower()

    # 5. Disconnect Pixhawk
    if pixhawk_connected:
        disconnect_pixhawk()

    print("\nMelissaNektarion system check complete.")


if __name__ == "__main__":
    main()