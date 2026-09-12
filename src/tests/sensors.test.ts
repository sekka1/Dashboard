import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Sensor data ingestion", () => {
  it("rejects unauthenticated requests to /api/sensors/readings", async () => {
    const res = await SELF.fetch("https://example.com/api/sensors/readings");
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
});
