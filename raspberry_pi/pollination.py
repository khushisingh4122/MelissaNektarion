import time
import os
import threading

try:
    import RPi.GPIO as GPIO
except ImportError:
    GPIO = None


PUMP_PIN = int(os.getenv("PUMP_GPIO_PIN", "18"))
MAX_PUMP_SECONDS = float(os.getenv("MAX_PUMP_SECONDS", "30"))
_pump_running = False
_pump_timer = None
_pump_lock = threading.Lock()


def setup_pump():
    if GPIO is None:
        if os.getenv("REQUIRE_PUMP", "true").strip().lower() in {"1", "true", "yes", "on"}:
            raise RuntimeError("RPi.GPIO is required for the pollination pump.")
        return False
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(PUMP_PIN, GPIO.OUT, initial=GPIO.LOW)
        return True
    except Exception as error:
        print(f"Pump setup error: {error}")
        return False


def set_pump(running):
    global _pump_running, _pump_timer
    with _pump_lock:
        if _pump_timer is not None:
            _pump_timer.cancel()
            _pump_timer = None
        if GPIO is None:
            _pump_running = bool(running)
            print(f"Pump {'ON' if running else 'OFF'} (GPIO unavailable; simulation mode)")
        else:
            try:
                GPIO.output(PUMP_PIN, GPIO.HIGH if running else GPIO.LOW)
                _pump_running = bool(running)
            except Exception as error:
                _pump_running = False
                print(f"Pump output error: {error}")
        if running:
            _pump_timer = threading.Timer(MAX_PUMP_SECONDS, emergency_stop)
            _pump_timer.daemon = True
            _pump_timer.start()


def emergency_stop():
    """Force the pump off after a safety timeout or emergency event."""
    set_pump(False)


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