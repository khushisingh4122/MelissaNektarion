import time
import os

try:
    import RPi.GPIO as GPIO
except ImportError:
    GPIO = None


PUMP_PIN = int(os.getenv("PUMP_GPIO_PIN", "18"))
_pump_running = False


def setup_pump():
    if GPIO is None:
        return False
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PUMP_PIN, GPIO.OUT, initial=GPIO.LOW)
    return True


def set_pump(running):
    global _pump_running
    if GPIO is None:
        _pump_running = bool(running)
        print(f"Pump {'ON' if running else 'OFF'} (GPIO unavailable; simulation mode)")
        return
    GPIO.output(PUMP_PIN, GPIO.HIGH if running else GPIO.LOW)
    _pump_running = bool(running)


def start_pump(duration=2):
    """
    Run the pollination pump for a specified duration.

    duration:
        Pump runtime in seconds.
    """

    set_pump(True)
    try:
        time.sleep(duration)
    finally:
        set_pump(False)


def pollinate_flower():
    """
    Perform one pollination action.
    """

    print("Starting pollination...")
    start_pump(2)
    print("Pollination completed!")


if __name__ == "__main__":
    pollinate_flower()