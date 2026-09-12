import { describe, expect, it } from "vitest";
import { buildSeriesByDevice, SENSOR_GRAPH_METRICS } from "../frontend/lib/sensor-metrics";
import type { SensorReading } from "../frontend/types";

const baseReading: SensorReading = {
  id: 1,
  deviceId: "esp32-c3-garden-01",
  temperature: 29.3,
  temperatureC: 29.25,
  temperatureF: 84.65,
  temperatureSensorPin: 1,
  temperatureSensorConnected: true,
  temperatureSensorCount: 1,
  humidity: 100,
  batteryVoltage: 0,
  moistureSensorRawAdc: 952,
  moistureSensorAirValue: 4000,
  moistureSensorWaterValue: 1500,
  moistureSensorMoisturePercent: 100,
  moistureSensorPercent: 100,
  moistureSensorCalibratedPercent: 100,
  moistureSensorPin: 0,
  moistureSensorReadingTimeMs: 81530,
  sensorTimestamp: 81,
  createdAt: "2026-09-12T00:00:00.000Z",
};

describe("sensor dashboard helpers", () => {
  it("tracks every incoming metric as a graphable series", () => {
    expect(SENSOR_GRAPH_METRICS.map((metric) => metric.key)).toEqual([
      "temperature",
      "temperatureC",
      "temperatureF",
      "temperatureSensorPin",
      "temperatureSensorConnected",
      "temperatureSensorCount",
      "humidity",
      "batteryVoltage",
      "moistureSensorRawAdc",
      "moistureSensorAirValue",
      "moistureSensorWaterValue",
      "moistureSensorMoisturePercent",
      "moistureSensorPercent",
      "moistureSensorCalibratedPercent",
      "moistureSensorPin",
      "moistureSensorReadingTimeMs",
    ]);
  });

  it("normalizes boolean sensor metrics into chartable numeric values", () => {
    const series = buildSeriesByDevice(
      [
        baseReading,
        {
          ...baseReading,
          id: 2,
          deviceId: "esp32-c3-garden-02",
          temperatureSensorConnected: false,
        },
      ],
      SENSOR_GRAPH_METRICS[4],
    );

    expect(series.devices).toEqual(["esp32-c3-garden-01", "esp32-c3-garden-02"]);
    expect(series.data).toEqual([
      {
        time: new Date(baseReading.createdAt).getTime(),
        "esp32-c3-garden-01": 1,
        "esp32-c3-garden-02": 0,
      },
    ]);
  });

  it("aligns readings by sensor timestamp when devices report the same sample", () => {
    const firstReceivedAt = "2026-09-12T00:00:00.000Z";
    const secondReceivedAt = "2026-09-12T00:00:05.000Z";
    const series = buildSeriesByDevice(
      [
        {
          ...baseReading,
          deviceId: "esp32-c3-garden-01",
          createdAt: firstReceivedAt,
          sensorTimestamp: 81,
          humidity: 42,
        },
        {
          ...baseReading,
          id: 2,
          deviceId: "esp32-c3-garden-02",
          createdAt: secondReceivedAt,
          sensorTimestamp: 81,
          humidity: 44,
        },
      ],
      SENSOR_GRAPH_METRICS[6],
    );

    expect(series.data).toEqual([
      {
        time: new Date(firstReceivedAt).getTime(),
        "esp32-c3-garden-01": 42,
        "esp32-c3-garden-02": 44,
      },
    ]);
  });
});
