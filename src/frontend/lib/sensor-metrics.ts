import type { SensorReading } from "../types";

export type SensorMetricKey =
  | "temperature"
  | "temperatureC"
  | "temperatureF"
  | "temperatureSensorPin"
  | "temperatureSensorConnected"
  | "temperatureSensorCount"
  | "humidity"
  | "batteryVoltage"
  | "moistureSensorRawAdc"
  | "moistureSensorAirValue"
  | "moistureSensorWaterValue"
  | "moistureSensorMoisturePercent"
  | "moistureSensorPercent"
  | "moistureSensorCalibratedPercent"
  | "moistureSensorPin"
  | "moistureSensorReadingTimeMs";

export interface SensorMetricDefinition {
  key: SensorMetricKey;
  title: string;
  unit?: string;
  boolean?: true;
}

interface SensorSeriesPoint extends Record<string, number> {
  time: number;
}

export const SENSOR_GRAPH_METRICS: SensorMetricDefinition[] = [
  { key: "temperature", title: "Temperature over time", unit: "°C" },
  { key: "temperatureC", title: "Temperature (C) over time", unit: "°C" },
  { key: "temperatureF", title: "Temperature (F) over time", unit: "°F" },
  { key: "temperatureSensorPin", title: "Temperature sensor pin over time" },
  {
    key: "temperatureSensorConnected",
    title: "Temperature sensor connected over time",
    boolean: true,
  },
  { key: "temperatureSensorCount", title: "Temperature sensor count over time" },
  { key: "humidity", title: "Humidity over time", unit: "%" },
  { key: "batteryVoltage", title: "Battery voltage over time", unit: "V" },
  { key: "moistureSensorRawAdc", title: "Moisture sensor raw ADC over time" },
  { key: "moistureSensorAirValue", title: "Moisture sensor air value over time" },
  { key: "moistureSensorWaterValue", title: "Moisture sensor water value over time" },
  {
    key: "moistureSensorMoisturePercent",
    title: "Moisture sensor moisture percent over time",
    unit: "%",
  },
  { key: "moistureSensorPercent", title: "Moisture sensor percent over time", unit: "%" },
  {
    key: "moistureSensorCalibratedPercent",
    title: "Moisture sensor calibrated percent over time",
    unit: "%",
  },
  { key: "moistureSensorPin", title: "Moisture sensor pin over time" },
  {
    key: "moistureSensorReadingTimeMs",
    title: "Moisture sensor reading time over time",
    unit: "ms",
  },
];

function normalizeMetricValue(reading: SensorReading, metric: SensorMetricDefinition) {
  const value = reading[metric.key];
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

export function buildSeriesByDevice(readings: SensorReading[], metric: SensorMetricDefinition) {
  const devices = Array.from(new Set(readings.map((r) => r.deviceId))).sort();
  const byTime = new Map<string, SensorSeriesPoint>();

  for (const reading of readings) {
    const value = normalizeMetricValue(reading, metric);
    if (value === null || value === undefined) continue;

    const time = new Date(reading.createdAt).getTime();
    const groupKey =
      reading.sensorTimestamp === null || reading.sensorTimestamp === undefined
        ? `received:${time}`
        : `sensor:${reading.sensorTimestamp}`;
    const existing = byTime.get(groupKey) ?? { time };
    existing[reading.deviceId] = value;
    byTime.set(groupKey, existing);
  }

  const data = Array.from(byTime.values()).sort((a, b) => a.time - b.time);
  return { devices, data };
}
