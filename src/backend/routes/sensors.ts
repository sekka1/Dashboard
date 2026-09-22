import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { getDb } from "../../db";
import { sensorReadings } from "../../db/schema";
import { requireAuth, type AppVariables } from "../middleware/rbac";
import type { Env } from "../env";

const sensorReadingSchema = z.object({
  device_id: z.string().min(1).max(100),
  sensor_type: z.string().min(1).max(100).optional(),
  temperature: z.number().optional(),
  temperature_c: z.number().optional(),
  temperature_f: z.number().optional(),
  temperature_sensor_pin: z.number().int().optional(),
  temperature_sensor_sda_pin: z.number().int().optional(),
  temperature_sensor_scl_pin: z.number().int().optional(),
  temperature_sensor_i2c_address: z.number().int().optional(),
  temp_sensor_to_92_temperature: z.number().optional(),
  temp_sensor_to_92_temperature_c: z.number().optional(),
  temp_sensor_to_92_temperature_f: z.number().optional(),
  temp_sensor_to_92_sda_pin: z.number().int().optional(),
  temp_sensor_to_92_scl_pin: z.number().int().optional(),
  temp_sensor_to_92_i2c_address: z.number().int().optional(),
  temp_sensor_to_92_connected: z.boolean().optional(),
  temp_sensor_to_92_count: z.number().int().optional(),
  temp_sensor_to_92_humidity: z.number().optional(),
  temperature_sensor_connected: z.boolean().optional(),
  temperature_sensor_count: z.number().int().optional(),
  humidity: z.number().optional(),
  battery_voltage: z.number().optional(),
  moisture_sensor_raw_adc: z.number().int().optional(),
  moisture_sensor_air_value: z.number().int().optional(),
  moisture_sensor_water_value: z.number().int().optional(),
  moisture_sensor_moisture_percent: z.number().optional(),
  moisture_sensor_percent: z.number().optional(),
  moisture_sensor_calibrated_percent: z.number().optional(),
  moisture_sensor_pin: z.number().int().optional(),
  soil_moisture_probe_prone_raw_adc: z.number().int().optional(),
  soil_moisture_probe_prone_air_value: z.number().int().optional(),
  soil_moisture_probe_prone_water_value: z.number().int().optional(),
  soil_moisture_probe_prone_moisture_percent: z.number().optional(),
  soil_moisture_probe_prone_percent: z.number().optional(),
  soil_moisture_probe_prone_calibrated_percent: z.number().optional(),
  soil_moisture_probe_prone_probe_1_ao_pin: z.number().int().optional(),
  soil_moisture_probe_prone_probe_1_raw_adc: z.number().int().optional(),
  soil_moisture_probe_prone_probe_1_moisture_percent: z.number().optional(),
  soil_moisture_probe_prone_probe_1_power_pin: z.number().int().optional(),
  soil_moisture_probe_prone_probe_2_ao_pin: z.number().int().optional(),
  soil_moisture_probe_prone_probe_2_raw_adc: z.number().int().optional(),
  soil_moisture_probe_prone_probe_2_moisture_percent: z.number().optional(),
  soil_moisture_probe_prone_probe_2_power_pin: z.number().int().optional(),
  soil_moisture_probe_prone_reading_time_ms: z.number().int().optional(),
  moisture_sensor_reading_time_ms: z.number().int().optional(),
  // Accepted for compatibility with sensors that include an epoch timestamp;
  // the worker always records the time the reading was received.
  timestamp: z.number().int().optional(),
}).superRefine((body, ctx) => {
  const temperature = body.temperature ?? body.temp_sensor_to_92_temperature;
  if (temperature === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "number",
      received: "undefined",
      path: ["temperature"],
    });
  }

  const humidity = body.humidity ?? body.temp_sensor_to_92_humidity;
  if (humidity === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "number",
      received: "undefined",
      path: ["humidity"],
    });
  }
});

/**
 * Public ingestion endpoint used by garden sensor devices. This is
 * authenticated with a shared SENSOR_API_TOKEN header rather than a user
 * session, since the caller is a device, not a signed-in dashboard user.
 */
export const dataIngestRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>().post(
  "/",
  zValidator("json", sensorReadingSchema),
  async (c) => {
    const token = c.req.header("x-sensor-api-token");
    if (!token || token !== c.env.SENSOR_API_TOKEN) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const body = c.req.valid("json");
    const db = getDb(c.env.DB);
    const temperature = body.temperature ?? body.temp_sensor_to_92_temperature;
    const humidity = body.humidity ?? body.temp_sensor_to_92_humidity;
    const reading = {
      deviceId: body.device_id,
      sensorType: body.sensor_type ?? null,
      temperature: temperature!,
      temperatureC:
        body.temperature_c ??
        body.temp_sensor_to_92_temperature_c ??
        (body.temperature !== undefined
          ? body.temperature
          : body.temp_sensor_to_92_temperature ?? null),
      temperatureF: body.temperature_f ?? body.temp_sensor_to_92_temperature_f ?? null,
      temperatureSensorPin: body.temperature_sensor_pin ?? null,
      temperatureSensorSdaPin:
        body.temperature_sensor_sda_pin ?? body.temp_sensor_to_92_sda_pin ?? null,
      temperatureSensorSclPin:
        body.temperature_sensor_scl_pin ?? body.temp_sensor_to_92_scl_pin ?? null,
      temperatureSensorI2cAddress:
        body.temperature_sensor_i2c_address ?? body.temp_sensor_to_92_i2c_address ?? null,
      temperatureSensorConnected:
        body.temperature_sensor_connected ?? body.temp_sensor_to_92_connected ?? null,
      temperatureSensorCount: body.temperature_sensor_count ?? body.temp_sensor_to_92_count ?? null,
      humidity: humidity!,
      batteryVoltage: body.battery_voltage ?? null,
      moistureSensorRawAdc:
        body.moisture_sensor_raw_adc ?? body.soil_moisture_probe_prone_raw_adc ?? null,
      moistureSensorAirValue:
        body.moisture_sensor_air_value ?? body.soil_moisture_probe_prone_air_value ?? null,
      moistureSensorWaterValue:
        body.moisture_sensor_water_value ?? body.soil_moisture_probe_prone_water_value ?? null,
      moistureSensorMoisturePercent:
        body.moisture_sensor_moisture_percent ??
        body.soil_moisture_probe_prone_moisture_percent ??
        null,
      moistureSensorPercent:
        body.moisture_sensor_percent ?? body.soil_moisture_probe_prone_percent ?? null,
      moistureSensorCalibratedPercent:
        body.moisture_sensor_calibrated_percent ??
        body.soil_moisture_probe_prone_calibrated_percent ??
        null,
      moistureSensorPin: body.moisture_sensor_pin ?? null,
      moistureSensorProbe1AoPin: body.soil_moisture_probe_prone_probe_1_ao_pin ?? null,
      moistureSensorProbe1RawAdc: body.soil_moisture_probe_prone_probe_1_raw_adc ?? null,
      moistureSensorProbe1MoisturePercent:
        body.soil_moisture_probe_prone_probe_1_moisture_percent ?? null,
      moistureSensorProbe1PowerPin: body.soil_moisture_probe_prone_probe_1_power_pin ?? null,
      moistureSensorProbe2AoPin: body.soil_moisture_probe_prone_probe_2_ao_pin ?? null,
      moistureSensorProbe2RawAdc: body.soil_moisture_probe_prone_probe_2_raw_adc ?? null,
      moistureSensorProbe2MoisturePercent:
        body.soil_moisture_probe_prone_probe_2_moisture_percent ?? null,
      moistureSensorProbe2PowerPin: body.soil_moisture_probe_prone_probe_2_power_pin ?? null,
      moistureSensorReadingTimeMs:
        body.moisture_sensor_reading_time_ms ?? body.soil_moisture_probe_prone_reading_time_ms ?? null,
      sensorTimestamp: body.timestamp ?? null,
      createdAt: new Date(),
    };
    await db.insert(sensorReadings).values(reading);
    return c.json({ success: true }, 201);
  },
);

/** Authenticated dashboard API for reading garden sensor data. */
export const sensorsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>()
  .use("*", requireAuth)
  .get("/readings", async (c) => {
    const db = getDb(c.env.DB);
    const limitParam = Number(c.req.query("limit") ?? "100");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100;
    const rows = await db
      .select()
      .from(sensorReadings)
      .orderBy(desc(sensorReadings.createdAt))
      .limit(limit);
    return c.json({ readings: rows });
  });
