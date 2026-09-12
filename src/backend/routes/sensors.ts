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
  temperature: z.number(),
  temperature_c: z.number().optional(),
  temperature_f: z.number().optional(),
  temperature_sensor_pin: z.number().int().optional(),
  temperature_sensor_connected: z.boolean().optional(),
  temperature_sensor_count: z.number().int().optional(),
  humidity: z.number(),
  battery_voltage: z.number().optional(),
  moisture_sensor_raw_adc: z.number().int().optional(),
  moisture_sensor_air_value: z.number().int().optional(),
  moisture_sensor_water_value: z.number().int().optional(),
  moisture_sensor_moisture_percent: z.number().optional(),
  moisture_sensor_percent: z.number().optional(),
  moisture_sensor_calibrated_percent: z.number().optional(),
  moisture_sensor_pin: z.number().int().optional(),
  moisture_sensor_reading_time_ms: z.number().int().optional(),
  // Accepted for compatibility with sensors that include an epoch timestamp;
  // the worker always records the time the reading was received.
  timestamp: z.number().int().optional(),
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
    const reading = {
      deviceId: body.device_id,
      temperature: body.temperature,
      temperatureC: body.temperature_c ?? body.temperature,
      temperatureF: body.temperature_f ?? null,
      temperatureSensorPin: body.temperature_sensor_pin ?? null,
      temperatureSensorConnected: body.temperature_sensor_connected ?? null,
      temperatureSensorCount: body.temperature_sensor_count ?? null,
      humidity: body.humidity,
      batteryVoltage: body.battery_voltage ?? null,
      moistureSensorRawAdc: body.moisture_sensor_raw_adc ?? null,
      moistureSensorAirValue: body.moisture_sensor_air_value ?? null,
      moistureSensorWaterValue: body.moisture_sensor_water_value ?? null,
      moistureSensorMoisturePercent: body.moisture_sensor_moisture_percent ?? null,
      moistureSensorPercent: body.moisture_sensor_percent ?? null,
      moistureSensorCalibratedPercent: body.moisture_sensor_calibrated_percent ?? null,
      moistureSensorPin: body.moisture_sensor_pin ?? null,
      moistureSensorReadingTimeMs: body.moisture_sensor_reading_time_ms ?? null,
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
