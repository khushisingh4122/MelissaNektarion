import time


def start_pump(duration=2):
    """
    Run the pollination pump for a specified duration.

    duration:
        Pump runtime in seconds.
    """

    print(f"Pollination pump ON for {duration} seconds")

    # Hardware control will be added here later.
    # Example:
    # GPIO.output(PUMP_PIN, GPIO.HIGH)

    time.sleep(duration)

    # Example:
    # GPIO.output(PUMP_PIN, GPIO.LOW)

    print("Pollination pump OFF")


def pollinate_flower():
    """
    Perform one pollination action.
    """

    print("Starting pollination...")
    start_pump(2)
    print("Pollination completed!")


if __name__ == "__main__":
    pollinate_flower()