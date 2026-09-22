import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import {
  summarizeReadingsForChartRange,
  type SensorChartRange,
} from "../backend/routes/sensors";
import type { SensorReading } from "../db/schema";

function makeStoredReading(
  overrides: Partial<SensorReading> = {},
  createdAt = "2026-09-12T12:00:00.000Z",
): SensorReading {
  return {
    id: 1,
    deviceId: "esp32-c3-garden-01",
    sensorType: "SHT31_SOIL_NODE",
    temperature: 24,
    temperatureC: 24,
    temperatureF: 75.2,
    temperatureSensorPin: 1,
    temperatureSensorSdaPin: 6,
    temperatureSensorSclPin: 7,
    temperatureSensorI2cAddress: 68,
    temperatureSensorConnected: true,
    temperatureSensorCount: 1,
    humidity: 50,
    batteryVoltage: 3.8,
    moistureSensorRawAdc: 900,
    moistureSensorAirValue: 4000,
    moistureSensorWaterValue: 1500,
    moistureSensorMoisturePercent: 40,
    moistureSensorPercent: 40,
    moistureSensorCalibratedPercent: 41,
    moistureSensorPin: 0,
    moistureSensorProbe1AoPin: 0,
    moistureSensorProbe1RawAdc: 1000,
    moistureSensorProbe1MoisturePercent: 32,
    moistureSensorProbe1PowerPin: 21,
    moistureSensorProbe2AoPin: 1,
    moistureSensorProbe2RawAdc: 1100,
    moistureSensorProbe2MoisturePercent: 36,
    moistureSensorProbe2PowerPin: 20,
    moistureSensorReadingTimeMs: 700,
    sensorTimestamp: 10,
    createdAt: new Date(createdAt),
    ...overrides,
  };
}

function summarize(range: SensorChartRange, readings: SensorReading[]) {
  return summarizeReadingsForChartRange(readings, range);
}

async function createActiveSessionCookie() {
  const email = `chart-${crypto.randomUUID()}@example.com`;
  const password = "S3nsor-Chart-Test!";
  const signUpRes = await SELF.fetch("https://example.com/api/auth/sign-up/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: env.BETTER_AUTH_URL,
    },
    body: JSON.stringify({
      email,
      name: "Chart Tester",
      password,
    }),
  });
  expect(signUpRes.ok).toBe(true);

  await env.DB.prepare(`UPDATE users SET status = 'active' WHERE email = ?`).bind(email).run();

  const signInRes = await SELF.fetch("https://example.com/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: env.BETTER_AUTH_URL,
    },
    body: JSON.stringify({ email, password }),
  });
  expect(signInRes.ok).toBe(true);

  const sessionCookie = signInRes.headers.get("set-cookie");
  expect(sessionCookie).toBeTruthy();
  return sessionCookie!.split(";", 1)[0];
}

describe("Sensor data ingestion", () => {
  it("rejects unauthenticated requests to /api/sensors/readings", async () => {
    const res = await SELF.fetch("https://example.com/api/sensors/readings");
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated requests to /api/sensors/chart-readings", async () => {
    const res = await SELF.fetch("https://example.com/api/sensors/chart-readings?range=7d");
    expect(res.status).toBe(401);
  });

  it("rejects POST /data without a valid SENSOR_API_TOKEN", async () => {
    const res = await SELF.fetch("https://example.com/data", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ device_id: "esp32-c3-garden-01", temperature: 23.4, humidity: 65.2 }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects POST /data with an invalid payload even with a valid token", async () => {
    const res = await SELF.fetch("https://example.com/data", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sensor-api-token": env.SENSOR_API_TOKEN,
      },
      body: JSON.stringify({ device_id: "esp32-c3-garden-01" }),
    });
    expect(res.status).toBe(400);
  });

  it("accepts a valid sensor reading and stores it", async () => {
    const receivedAtBeforePost = Date.now();
    const postRes = await SELF.fetch("https://example.com/data", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sensor-api-token": env.SENSOR_API_TOKEN,
      },
      body: JSON.stringify({
        device_id: "esp32-c3-garden-01",
        temperature: 23.4,
        temperature_c: 23.4,
        temperature_f: 74.12,
        temperature_sensor_pin: 1,
        temperature_sensor_sda_pin: 6,
        temperature_sensor_scl_pin: 7,
        temperature_sensor_i2c_address: 68,
        temperature_sensor_connected: true,
        temperature_sensor_count: 1,
        humidity: 65.2,
        battery_voltage: 3.82,
        moisture_sensor_raw_adc: 952,
        moisture_sensor_air_value: 4000,
        moisture_sensor_water_value: 1500,
        moisture_sensor_moisture_percent: 100,
        moisture_sensor_percent: 100,
        moisture_sensor_calibrated_percent: 100,
        moisture_sensor_pin: 0,
        moisture_sensor_reading_time_ms: 81530,
        timestamp: 1,
      }),
    });
    expect(postRes.status).toBe(201);
    expect(await postRes.json()).toEqual({ success: true });

    const stored = await env.DB.prepare(
      `SELECT
        temperature,
        temperature_c,
        temperature_f,
        temperature_sensor_pin,
        temperature_sensor_sda_pin,
        temperature_sensor_scl_pin,
        temperature_sensor_i2c_address,
        temperature_sensor_connected,
        temperature_sensor_count,
        humidity,
        battery_voltage,
        moisture_sensor_raw_adc,
        moisture_sensor_air_value,
        moisture_sensor_water_value,
        moisture_sensor_moisture_percent,
        moisture_sensor_percent,
        moisture_sensor_calibrated_percent,
        moisture_sensor_pin,
        moisture_sensor_reading_time_ms,
        sensor_timestamp,
        created_at
      FROM sensor_readings
      WHERE device_id = ?
      ORDER BY id DESC
      LIMIT 1`,
    )
      .bind("esp32-c3-garden-01")
      .first<{
        temperature: number;
        temperature_c: number;
        temperature_f: number;
        temperature_sensor_pin: number;
        temperature_sensor_sda_pin: number;
        temperature_sensor_scl_pin: number;
        temperature_sensor_i2c_address: number;
        temperature_sensor_connected: number;
        temperature_sensor_count: number;
        humidity: number;
        battery_voltage: number;
        moisture_sensor_raw_adc: number;
        moisture_sensor_air_value: number;
        moisture_sensor_water_value: number;
        moisture_sensor_moisture_percent: number;
        moisture_sensor_percent: number;
        moisture_sensor_calibrated_percent: number;
        moisture_sensor_pin: number;
        moisture_sensor_reading_time_ms: number;
        sensor_timestamp: number;
        created_at: number;
      }>();
    expect(stored).not.toBeNull();
    expect(stored).toMatchObject({
      temperature: 23.4,
      temperature_c: 23.4,
      temperature_f: 74.12,
      temperature_sensor_pin: 1,
      temperature_sensor_sda_pin: 6,
      temperature_sensor_scl_pin: 7,
      temperature_sensor_i2c_address: 68,
      temperature_sensor_connected: 1,
      temperature_sensor_count: 1,
      humidity: 65.2,
      battery_voltage: 3.82,
      moisture_sensor_raw_adc: 952,
      moisture_sensor_air_value: 4000,
      moisture_sensor_water_value: 1500,
      moisture_sensor_moisture_percent: 100,
      moisture_sensor_percent: 100,
      moisture_sensor_calibrated_percent: 100,
      moisture_sensor_pin: 0,
      moisture_sensor_reading_time_ms: 81530,
      sensor_timestamp: 1,
    });
    expect(stored!.created_at).toBeGreaterThanOrEqual(
      Math.floor(receivedAtBeforePost / 1000),
    );
    expect(stored!.created_at).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
  });

  it("accepts the new sensor payload shape and stores the new fields", async () => {
    const postRes = await SELF.fetch("https://example.com/data", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sensor-api-token": env.SENSOR_API_TOKEN,
      },
      body: JSON.stringify({
        device_id: "esp32-c3-garden-02",
        sensor_type: "SHT31_SOIL_NODE",
        temp_sensor_to_92_temperature: 27.4,
        temp_sensor_to_92_temperature_c: 27.37,
        temp_sensor_to_92_temperature_f: 81.27,
        temp_sensor_to_92_sda_pin: 6,
        temp_sensor_to_92_scl_pin: 7,
        temp_sensor_to_92_i2c_address: 68,
        temp_sensor_to_92_connected: true,
        temp_sensor_to_92_count: 1,
        temp_sensor_to_92_humidity: 39.3,
        battery_voltage: 0,
        soil_moisture_probe_prone_raw_adc: 3550,
        soil_moisture_probe_prone_air_value: 3500,
        soil_moisture_probe_prone_water_value: 100,
        soil_moisture_probe_prone_moisture_percent: 0,
        soil_moisture_probe_prone_percent: 0,
        soil_moisture_probe_prone_calibrated_percent: 0,
        soil_moisture_probe_prone_probe_1_ao_pin: 0,
        soil_moisture_probe_prone_probe_1_raw_adc: 3550,
        soil_moisture_probe_prone_probe_1_moisture_percent: 0,
        soil_moisture_probe_prone_probe_1_power_pin: 21,
        soil_moisture_probe_prone_probe_2_raw_adc: 3496,
        soil_moisture_probe_prone_probe_2_moisture_percent: 0,
        soil_moisture_probe_prone_probe_2_power_pin: 20,
        soil_moisture_probe_prone_probe_2_ao_pin: 1,
        soil_moisture_probe_prone_reading_time_ms: 281285,
        timestamp: 281,
      }),
    });
    expect(postRes.status).toBe(201);
    expect(await postRes.json()).toEqual({ success: true });

    const stored = await env.DB.prepare(
      `SELECT
        sensor_type,
        temperature,
        temperature_c,
        temperature_f,
        temperature_sensor_sda_pin,
        temperature_sensor_scl_pin,
        temperature_sensor_i2c_address,
        temperature_sensor_connected,
        temperature_sensor_count,
        humidity,
        battery_voltage,
        moisture_sensor_raw_adc,
        moisture_sensor_air_value,
        moisture_sensor_water_value,
        moisture_sensor_moisture_percent,
        moisture_sensor_percent,
        moisture_sensor_calibrated_percent,
        moisture_sensor_probe_1_ao_pin,
        moisture_sensor_probe_1_raw_adc,
        moisture_sensor_probe_1_moisture_percent,
        moisture_sensor_probe_1_power_pin,
        moisture_sensor_probe_2_ao_pin,
        moisture_sensor_probe_2_raw_adc,
        moisture_sensor_probe_2_moisture_percent,
        moisture_sensor_probe_2_power_pin,
        moisture_sensor_reading_time_ms,
        sensor_timestamp
      FROM sensor_readings
      WHERE device_id = ?
      ORDER BY id DESC
      LIMIT 1`,
    )
      .bind("esp32-c3-garden-02")
      .first<{
        sensor_type: string;
        temperature: number;
        temperature_c: number;
        temperature_f: number;
        temperature_sensor_sda_pin: number;
        temperature_sensor_scl_pin: number;
        temperature_sensor_i2c_address: number;
        temperature_sensor_connected: number;
        temperature_sensor_count: number;
        humidity: number;
        battery_voltage: number;
        moisture_sensor_raw_adc: number;
        moisture_sensor_air_value: number;
        moisture_sensor_water_value: number;
        moisture_sensor_moisture_percent: number;
        moisture_sensor_percent: number;
        moisture_sensor_calibrated_percent: number;
        moisture_sensor_probe_1_ao_pin: number;
        moisture_sensor_probe_1_raw_adc: number;
        moisture_sensor_probe_1_moisture_percent: number;
        moisture_sensor_probe_1_power_pin: number;
        moisture_sensor_probe_2_ao_pin: number;
        moisture_sensor_probe_2_raw_adc: number;
        moisture_sensor_probe_2_moisture_percent: number;
        moisture_sensor_probe_2_power_pin: number;
        moisture_sensor_reading_time_ms: number;
        sensor_timestamp: number;
      }>();
    expect(stored).not.toBeNull();
    expect(stored).toMatchObject({
      sensor_type: "SHT31_SOIL_NODE",
      temperature: 27.4,
      temperature_c: 27.37,
      temperature_f: 81.27,
      temperature_sensor_sda_pin: 6,
      temperature_sensor_scl_pin: 7,
      temperature_sensor_i2c_address: 68,
      temperature_sensor_connected: 1,
      temperature_sensor_count: 1,
      humidity: 39.3,
      battery_voltage: 0,
      moisture_sensor_raw_adc: 3550,
      moisture_sensor_air_value: 3500,
      moisture_sensor_water_value: 100,
      moisture_sensor_moisture_percent: 0,
      moisture_sensor_percent: 0,
      moisture_sensor_calibrated_percent: 0,
      moisture_sensor_probe_1_ao_pin: 0,
      moisture_sensor_probe_1_raw_adc: 3550,
      moisture_sensor_probe_1_moisture_percent: 0,
      moisture_sensor_probe_1_power_pin: 21,
      moisture_sensor_probe_2_ao_pin: 1,
      moisture_sensor_probe_2_raw_adc: 3496,
      moisture_sensor_probe_2_moisture_percent: 0,
      moisture_sensor_probe_2_power_pin: 20,
      moisture_sensor_reading_time_ms: 281285,
      sensor_timestamp: 281,
    });
  });

  it("prefers legacy keys when both legacy and new aliases are posted together", async () => {
    const postRes = await SELF.fetch("https://example.com/data", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sensor-api-token": env.SENSOR_API_TOKEN,
      },
      body: JSON.stringify({
        device_id: "esp32-c3-garden-03",
        temperature: 20.5,
        temp_sensor_to_92_temperature: 27.4,
        humidity: 51.2,
        temp_sensor_to_92_humidity: 39.3,
        temperature_sensor_sda_pin: 4,
        temp_sensor_to_92_sda_pin: 6,
        moisture_sensor_raw_adc: 1111,
        soil_moisture_probe_prone_raw_adc: 3550,
      }),
    });
    expect(postRes.status).toBe(201);

    const stored = await env.DB.prepare(
      `SELECT
        temperature,
        humidity,
        temperature_sensor_sda_pin,
        moisture_sensor_raw_adc
      FROM sensor_readings
      WHERE device_id = ?
      ORDER BY id DESC
      LIMIT 1`,
    )
      .bind("esp32-c3-garden-03")
      .first<{
        temperature: number;
        humidity: number;
        temperature_sensor_sda_pin: number;
        moisture_sensor_raw_adc: number;
      }>();
    expect(stored).toMatchObject({
      temperature: 20.5,
      humidity: 51.2,
      temperature_sensor_sda_pin: 4,
      moisture_sensor_raw_adc: 1111,
    });
  });

  it("summarizes dense chart readings into averaged time buckets", () => {
    const summary = summarize("1h", [
      makeStoredReading(
        {
          id: 1,
          temperature: 20,
          humidity: 40,
          batteryVoltage: 3.7,
          temperatureSensorConnected: false,
        },
        "2026-09-12T12:00:05.000Z",
      ),
      makeStoredReading(
        {
          id: 2,
          temperature: 26,
          humidity: 52,
          batteryVoltage: 3.9,
          temperatureSensorConnected: true,
        },
        "2026-09-12T12:00:45.000Z",
      ),
    ]);

    expect(summary).toHaveLength(1);
    expect(summary[0]).toMatchObject({
      id: 2,
      deviceId: "esp32-c3-garden-01",
      temperature: 23,
      humidity: 46,
      batteryVoltage: 3.8,
      temperatureSensorConnected: true,
      sensorTimestamp: null,
      createdAt: new Date("2026-09-12T12:00:00.000Z"),
    });
  });

  it("keeps devices separate while using coarser buckets for longer ranges", () => {
    const summary = summarize("7d", [
      makeStoredReading({ id: 1, deviceId: "esp32-c3-garden-01", temperature: 18 }, "2026-09-12T12:10:00.000Z"),
      makeStoredReading({ id: 2, deviceId: "esp32-c3-garden-01", temperature: 22 }, "2026-09-12T12:40:00.000Z"),
      makeStoredReading({ id: 3, deviceId: "esp32-c3-garden-02", temperature: 30 }, "2026-09-12T12:25:00.000Z"),
      makeStoredReading({ id: 4, deviceId: "esp32-c3-garden-01", temperature: 28 }, "2026-09-12T13:05:00.000Z"),
    ]);

    expect(summary).toHaveLength(3);
    expect(summary.map((reading) => [reading.deviceId, reading.temperature, reading.createdAt])).toEqual([
      ["esp32-c3-garden-01", 20, new Date("2026-09-12T12:00:00.000Z")],
      ["esp32-c3-garden-02", 30, new Date("2026-09-12T12:00:00.000Z")],
      ["esp32-c3-garden-01", 28, new Date("2026-09-12T13:00:00.000Z")],
    ]);
  });

  it("returns summarized chart readings from the authenticated endpoint", async () => {
    const sessionCookie = await createActiveSessionCookie();
    const bucketStartMs = Math.floor((Date.now() - 5 * 60_000) / 60_000) * 60_000;
    const firstCreatedAt = Math.floor((bucketStartMs + 5_000) / 1_000);
    const secondCreatedAt = Math.floor((bucketStartMs + 45_000) / 1_000);

    await env.DB.prepare(
      `INSERT INTO sensor_readings (
        device_id,
        sensor_type,
        temperature,
        humidity,
        moisture_sensor_raw_adc,
        temperature_sensor_connected,
        moisture_sensor_reading_time_ms,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind("esp32-c3-garden-01", "SHT31_SOIL_NODE", 20, 40, 900, 0, 801, firstCreatedAt)
      .run();
    await env.DB.prepare(
      `INSERT INTO sensor_readings (
        device_id,
        sensor_type,
        temperature,
        humidity,
        moisture_sensor_raw_adc,
        temperature_sensor_connected,
        moisture_sensor_reading_time_ms,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind("esp32-c3-garden-01", "SHT31_SOIL_NODE", 26, 52, 901, 1, 802, secondCreatedAt)
      .run();

    const res = await SELF.fetch("https://example.com/api/sensors/chart-readings?range=1h", {
      headers: {
        cookie: sessionCookie,
        origin: env.BETTER_AUTH_URL,
      },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      readings: [
        {
          id: expect.any(Number),
          deviceId: "esp32-c3-garden-01",
          sensorType: "SHT31_SOIL_NODE",
          temperature: 23,
          temperatureC: null,
          temperatureF: null,
          temperatureSensorPin: null,
          temperatureSensorSdaPin: null,
          temperatureSensorSclPin: null,
          temperatureSensorI2cAddress: null,
          temperatureSensorConnected: true,
          temperatureSensorCount: null,
          humidity: 46,
          batteryVoltage: null,
          moistureSensorRawAdc: 901,
          moistureSensorAirValue: null,
          moistureSensorWaterValue: null,
          moistureSensorMoisturePercent: null,
          moistureSensorPercent: null,
          moistureSensorCalibratedPercent: null,
          moistureSensorPin: null,
          moistureSensorProbe1AoPin: null,
          moistureSensorProbe1RawAdc: null,
          moistureSensorProbe1MoisturePercent: null,
          moistureSensorProbe1PowerPin: null,
          moistureSensorProbe2AoPin: null,
          moistureSensorProbe2RawAdc: null,
          moistureSensorProbe2MoisturePercent: null,
          moistureSensorProbe2PowerPin: null,
          moistureSensorReadingTimeMs: 802,
          sensorTimestamp: null,
          createdAt: new Date(bucketStartMs).toISOString(),
        },
      ],
    });
  });
});
