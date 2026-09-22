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
});
