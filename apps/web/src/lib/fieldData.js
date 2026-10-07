import { fieldZones } from '../data/sampleData.js';

export const FARM_BOUNDARY = [
  [28.6150, 77.2080],
  [28.6150, 77.2100],
  [28.6130, 77.2100],
  [28.6130, 77.2080],
];

export const FIELD_OPTIONS = fieldZones.map((field) => ({
  value: field.id,
  label: field.name,
}));

export function getFieldBoundary(field) {
  return field?.geometry.coordinates[0].map(([longitude, latitude]) => [latitude, longitude]) || [];
}

export function getFieldCenter(field) {
  const boundary = getFieldBoundary(field);
  if (!boundary.length) return [28.614, 77.209];
  return boundary.reduce(
    (center, [latitude, longitude]) => [center[0] + latitude / boundary.length, center[1] + longitude / boundary.length],
    [0, 0]
  );
}

export async function fetchSevenDayForecast(field) {
  const [latitude, longitude] = getFieldCenter(field);
  const params = new URLSearchParams({
    latitude: latitude.toFixed(6),
    longitude: longitude.toFixed(6),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '7',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error('Weather forecast is unavailable.');
  const result = await response.json();
  return result.daily.time.map((date, index) => ({
    date,
    high: result.daily.temperature_2m_max[index],
    low: result.daily.temperature_2m_min[index],
    rain: result.daily.precipitation_probability_max[index],
    wind: result.daily.wind_speed_10m_max[index],
    code: result.daily.weather_code[index],
  }));
}
