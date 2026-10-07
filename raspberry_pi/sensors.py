def read_temperature_humidity():
    """
    Read temperature and humidity from the DHT22 sensor.

    The actual DHT22 hardware code will be added
    when the sensor is connected to the Raspberry Pi.
    """

    print("Reading DHT22 sensor...")

    # Hardware code will be added later.
    temperature = None
    humidity = None

    return temperature, humidity


def get_sensor_data():
    """
    Return all available sensor data.
    """

    temperature, humidity = read_temperature_humidity()

    return {
        "temperature": temperature,
        "humidity": humidity
    }


if __name__ == "__main__":
    data = get_sensor_data()
    print("Sensor data:", data)