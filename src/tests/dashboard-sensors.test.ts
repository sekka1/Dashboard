import { describe, expect, it } from "vitest";
import { buildSeriesByDevice, SENSOR_GRAPH_METRICS } from "../frontend/lib/sensor-metrics";
import type { SensorReading } from "../frontend/types";

function getMetric(key: (typeof SENSOR_GRAPH_METRICS)[number]["key"]) {
  const metric = SENSOR_GRAPH_METRICS.find((candidate) => candidate.key === key);
  expect(metric).toBeDefined();
  return metric!;
}

const baseReading: SensorReading = {
  id: 1,
  deviceId: "esp32-c3-garden-01",
  sensorType: "SHT31_SOIL_NODE",
  temperature: 29.3,
  temperatureC: 29.25,
  temperatureF: 84.65,
  temperatureSensorPin: 1,
  temperatureSensorSdaPin: 6,
  temperatureSensorSclPin: 7,
  temperatureSensorI2cAddress: 68,
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
  moistureSensorProbe1AoPin: 0,
  moistureSensorProbe1RawAdc: 3550,
  moistureSensorProbe1MoisturePercent: 0,
  moistureSensorProbe1PowerPin: 21,
  moistureSensorProbe2AoPin: 1,
  moistureSensorProbe2RawAdc: 3496,
  moistureSensorProbe2MoisturePercent: 0,
  moistureSensorProbe2PowerPin: 20,
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
      "temperatureSensorSdaPin",
      "temperatureSensorSclPin",
      "temperatureSensorI2cAddress",
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
      "moistureSensorProbe1AoPin",
      "moistureSensorProbe1RawAdc",
      "moistureSensorProbe1MoisturePercent",
      "moistureSensorProbe1PowerPin",
      "moistureSensorProbe2AoPin",
      "moistureSensorProbe2RawAdc",
      "moistureSensorProbe2MoisturePercent",
      "moistureSensorProbe2PowerPin",
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
      getMetric("temperatureSensorConnected"),
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

  it("aligns readings by shared sensor timestamps when devices report the same sample", () => {
    const firstReceivedAt = "2026-09-12T00:00:00.000Z";
    const secondReceivedAt = "2026-09-12T00:00:05.000Z";
    const series = buildSeriesByDevice(
      [
        {
          ...baseReading,
          id: 2,
          deviceId: "esp32-c3-garden-02",
          createdAt: secondReceivedAt,
          sensorTimestamp: 81,
          humidity: 44,
        },
        {
          ...baseReading,
          deviceId: "esp32-c3-garden-01",
          createdAt: firstReceivedAt,
          sensorTimestamp: 81,
          humidity: 42,
        },
      ],
      getMetric("humidity"),
    );

    expect(series.data).toEqual([
      {
        time: new Date(firstReceivedAt).getTime(),
        "esp32-c3-garden-01": 42,
        "esp32-c3-garden-02": 44,
      },
    ]);
  });

  it("does not merge distant samples that reuse the same sensor timestamp", () => {
    const series = buildSeriesByDevice(
      [
        baseReading,
        {
          ...baseReading,
          id: 2,
          deviceId: "esp32-c3-garden-02",
          createdAt: "2026-09-12T01:01:05.000Z",
        },
      ],
      getMetric("humidity"),
    );

    expect(series.data).toHaveLength(2);
  });
});
