import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { getDb } from "../../db";
import { sensorReadings, type NewSensorReading, type SensorReading } from "../../db/schema";
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

type SensorReadingPayload = z.infer<typeof sensorReadingSchema>;

const chartRangeSchema = z.object({
  range: z.enum(["1h", "12h", "24h", "7d"]).catch("24h"),
});

export type SensorChartRange = z.infer<typeof chartRangeSchema>["range"];

export const SENSOR_CHART_RANGE_CONFIG: Record<
  SensorChartRange,
  { bucketMs: number; windowMs: number }
> = {
  "1h": { bucketMs: 60_000, windowMs: 60 * 60 * 1_000 },
  "12h": { bucketMs: 10 * 60_000, windowMs: 12 * 60 * 60 * 1_000 },
  "24h": { bucketMs: 15 * 60_000, windowMs: 24 * 60 * 60 * 1_000 },
  "7d": { bucketMs: 60 * 60_000, windowMs: 7 * 24 * 60 * 60 * 1_000 },
};

const AVERAGED_SENSOR_FIELDS = [
  "temperature",
  "temperatureC",
  "temperatureF",
  "humidity",
  "batteryVoltage",
  "moistureSensorRawAdc",
  "moistureSensorAirValue",
  "moistureSensorWaterValue",
  "moistureSensorMoisturePercent",
  "moistureSensorPercent",
  "moistureSensorCalibratedPercent",
  "moistureSensorProbe1RawAdc",
  "moistureSensorProbe1MoisturePercent",
  "moistureSensorProbe2RawAdc",
  "moistureSensorProbe2MoisturePercent",
  "moistureSensorReadingTimeMs",
] as const satisfies readonly (keyof SensorReading)[];

type AveragedSensorField = (typeof AVERAGED_SENSOR_FIELDS)[number];
const ROUNDED_AVERAGED_SENSOR_FIELDS = [
  "moistureSensorRawAdc",
  "moistureSensorAirValue",
  "moistureSensorWaterValue",
  "moistureSensorProbe1RawAdc",
  "moistureSensorProbe2RawAdc",
  "moistureSensorReadingTimeMs",
] as const satisfies readonly AveragedSensorField[];
const ROUNDED_AVERAGED_SENSOR_FIELD_SET = new Set<AveragedSensorField>(ROUNDED_AVERAGED_SENSOR_FIELDS);

function timestampMs(value: Date | string) {
  return new Date(value).getTime();
}

function normalizeAveragedValue(field: AveragedSensorField, value: number | null) {
  if (value === null) return null;
  return ROUNDED_AVERAGED_SENSOR_FIELD_SET.has(field) ? Math.round(value) : value;
}

interface RawChartReadingRow {
  id: number;
  deviceId: string;
  sensorType: string | null;
  temperature: number | null;
  temperatureC: number | null;
  temperatureF: number | null;
  temperatureSensorPin: number | null;
  temperatureSensorSdaPin: number | null;
  temperatureSensorSclPin: number | null;
  temperatureSensorI2cAddress: number | null;
  temperatureSensorConnected: number | null;
  temperatureSensorCount: number | null;
  humidity: number | null;
  batteryVoltage: number | null;
  moistureSensorRawAdc: number | null;
  moistureSensorAirValue: number | null;
  moistureSensorWaterValue: number | null;
  moistureSensorMoisturePercent: number | null;
  moistureSensorPercent: number | null;
  moistureSensorCalibratedPercent: number | null;
  moistureSensorPin: number | null;
  moistureSensorProbe1AoPin: number | null;
  moistureSensorProbe1RawAdc: number | null;
  moistureSensorProbe1MoisturePercent: number | null;
  moistureSensorProbe1PowerPin: number | null;
  moistureSensorProbe2AoPin: number | null;
  moistureSensorProbe2RawAdc: number | null;
  moistureSensorProbe2MoisturePercent: number | null;
  moistureSensorProbe2PowerPin: number | null;
  moistureSensorReadingTimeMs: number | null;
  bucketCreatedAt: number;
}

async function fetchChartReadings(db: Env["DB"], range: SensorChartRange): Promise<SensorReading[]> {
  const { bucketMs, windowMs } = SENSOR_CHART_RANGE_CONFIG[range];
  const bucketSeconds = Math.floor(bucketMs / 1_000);
  const sinceSeconds = Math.floor((Date.now() - windowMs) / 1_000);
  const results = await db
    .prepare(
      `WITH bucketed AS (
        SELECT
          *,
          CAST(created_at / ? AS INTEGER) * ? AS bucket_created_at,
          ROW_NUMBER() OVER (
            PARTITION BY device_id, CAST(created_at / ? AS INTEGER)
            ORDER BY created_at DESC, id DESC
          ) AS row_rank
        FROM sensor_readings
        WHERE created_at >= ?
      )
      SELECT
        MAX(CASE WHEN row_rank = 1 THEN id END) AS id,
        device_id AS deviceId,
        MAX(CASE WHEN row_rank = 1 THEN sensor_type END) AS sensorType,
        AVG(temperature) AS temperature,
        AVG(temperature_c) AS temperatureC,
        AVG(temperature_f) AS temperatureF,
        MAX(CASE WHEN row_rank = 1 THEN temperature_sensor_pin END) AS temperatureSensorPin,
        MAX(CASE WHEN row_rank = 1 THEN temperature_sensor_sda_pin END) AS temperatureSensorSdaPin,
        MAX(CASE WHEN row_rank = 1 THEN temperature_sensor_scl_pin END) AS temperatureSensorSclPin,
        MAX(CASE WHEN row_rank = 1 THEN temperature_sensor_i2c_address END) AS temperatureSensorI2cAddress,
        MAX(CASE WHEN row_rank = 1 THEN temperature_sensor_connected END) AS temperatureSensorConnected,
        MAX(CASE WHEN row_rank = 1 THEN temperature_sensor_count END) AS temperatureSensorCount,
        AVG(humidity) AS humidity,
        AVG(battery_voltage) AS batteryVoltage,
        AVG(moisture_sensor_raw_adc) AS moistureSensorRawAdc,
        AVG(moisture_sensor_air_value) AS moistureSensorAirValue,
        AVG(moisture_sensor_water_value) AS moistureSensorWaterValue,
        AVG(moisture_sensor_moisture_percent) AS moistureSensorMoisturePercent,
        AVG(moisture_sensor_percent) AS moistureSensorPercent,
        AVG(moisture_sensor_calibrated_percent) AS moistureSensorCalibratedPercent,
        MAX(CASE WHEN row_rank = 1 THEN moisture_sensor_pin END) AS moistureSensorPin,
        MAX(CASE WHEN row_rank = 1 THEN moisture_sensor_probe_1_ao_pin END) AS moistureSensorProbe1AoPin,
        AVG(moisture_sensor_probe_1_raw_adc) AS moistureSensorProbe1RawAdc,
        AVG(moisture_sensor_probe_1_moisture_percent) AS moistureSensorProbe1MoisturePercent,
        MAX(CASE WHEN row_rank = 1 THEN moisture_sensor_probe_1_power_pin END) AS moistureSensorProbe1PowerPin,
        MAX(CASE WHEN row_rank = 1 THEN moisture_sensor_probe_2_ao_pin END) AS moistureSensorProbe2AoPin,
        AVG(moisture_sensor_probe_2_raw_adc) AS moistureSensorProbe2RawAdc,
        AVG(moisture_sensor_probe_2_moisture_percent) AS moistureSensorProbe2MoisturePercent,
        MAX(CASE WHEN row_rank = 1 THEN moisture_sensor_probe_2_power_pin END) AS moistureSensorProbe2PowerPin,
        AVG(moisture_sensor_reading_time_ms) AS moistureSensorReadingTimeMs,
        bucket_created_at AS bucketCreatedAt
      FROM bucketed
      GROUP BY device_id, bucket_created_at
      ORDER BY bucketCreatedAt ASC, device_id ASC`,
    )
    .bind(bucketSeconds, bucketSeconds, bucketSeconds, sinceSeconds)
    .all<RawChartReadingRow>();

  return (results.results ?? []).flatMap(
    ({ bucketCreatedAt, temperatureSensorConnected, temperature, humidity, ...row }) => {
      if (temperature === null || humidity === null) {
        return [];
      }

      const reading: SensorReading = {
        ...row,
        temperature,
        humidity,
        temperatureSensorConnected:
          temperatureSensorConnected === null ? null : Boolean(temperatureSensorConnected),
        sensorTimestamp: null,
        createdAt: new Date(bucketCreatedAt * 1_000),
      };
      const readingMetrics = reading as Record<AveragedSensorField, number | null>;

      for (const field of AVERAGED_SENSOR_FIELDS) {
        readingMetrics[field] = normalizeAveragedValue(field, readingMetrics[field]);
      }

      return reading;
    },
  );
}

export function summarizeReadingsForChartRange(
  readings: SensorReading[],
  range: SensorChartRange,
) {
  const { bucketMs } = SENSOR_CHART_RANGE_CONFIG[range];
  const buckets = new Map<
    string,
    {
      bucketTime: number;
      latestReading: SensorReading;
      sums: Partial<Record<AveragedSensorField, number>>;
      counts: Partial<Record<AveragedSensorField, number>>;
    }
  >();

  const sortedReadings = [...readings].sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt));

  for (const reading of sortedReadings) {
    const createdAtMs = timestampMs(reading.createdAt);
    const bucketTime = Math.floor(createdAtMs / bucketMs) * bucketMs;
    const bucketKey = `${reading.deviceId}:${bucketTime}`;
    const bucket = buckets.get(bucketKey) ?? {
      bucketTime,
      latestReading: reading,
      sums: {},
      counts: {},
    };

    if (createdAtMs > timestampMs(bucket.latestReading.createdAt)) {
      bucket.latestReading = reading;
    }

    for (const field of AVERAGED_SENSOR_FIELDS) {
      const value = reading[field];
      if (typeof value !== "number") continue;
      bucket.sums[field] = (bucket.sums[field] ?? 0) + value;
      bucket.counts[field] = (bucket.counts[field] ?? 0) + 1;
    }

    buckets.set(bucketKey, bucket);
  }

  return Array.from(buckets.values())
    .map(({ bucketTime, latestReading, sums, counts }) => {
      const summary: SensorReading = {
        ...latestReading,
        createdAt: new Date(bucketTime),
        sensorTimestamp: null,
      };
      const summaryMetrics = summary as Record<AveragedSensorField, number | null>;

      for (const field of AVERAGED_SENSOR_FIELDS) {
        const count = counts[field] ?? 0;
        summaryMetrics[field] = normalizeAveragedValue(
          field,
          count === 0 ? latestReading[field] : sums[field]! / count,
        );
      }

      return summary;
    })
    .sort((a, b) => timestampMs(a.createdAt) - timestampMs(b.createdAt));
}

function firstDefined<T>(...values: (T | undefined)[]) {
  return values.find((value): value is T => value !== undefined);
}

function normalizeSensorReading(body: SensorReadingPayload): NewSensorReading {
  const temperature = firstDefined(body.temperature, body.temp_sensor_to_92_temperature);
  const humidity = firstDefined(body.humidity, body.temp_sensor_to_92_humidity);

  return {
    deviceId: body.device_id,
    sensorType: body.sensor_type ?? null,
    temperature: temperature!,
    temperatureC: firstDefined(
      body.temperature_c,
      body.temp_sensor_to_92_temperature_c,
      body.temperature,
      body.temp_sensor_to_92_temperature,
    ) ?? null,
    temperatureF: firstDefined(body.temperature_f, body.temp_sensor_to_92_temperature_f) ?? null,
    temperatureSensorPin: body.temperature_sensor_pin ?? null,
    temperatureSensorSdaPin:
      firstDefined(body.temperature_sensor_sda_pin, body.temp_sensor_to_92_sda_pin) ?? null,
    temperatureSensorSclPin:
      firstDefined(body.temperature_sensor_scl_pin, body.temp_sensor_to_92_scl_pin) ?? null,
    temperatureSensorI2cAddress:
      firstDefined(body.temperature_sensor_i2c_address, body.temp_sensor_to_92_i2c_address) ??
      null,
    temperatureSensorConnected:
      firstDefined(body.temperature_sensor_connected, body.temp_sensor_to_92_connected) ?? null,
    temperatureSensorCount:
      firstDefined(body.temperature_sensor_count, body.temp_sensor_to_92_count) ?? null,
    humidity: humidity!,
    batteryVoltage: body.battery_voltage ?? null,
    moistureSensorRawAdc:
      firstDefined(body.moisture_sensor_raw_adc, body.soil_moisture_probe_prone_raw_adc) ?? null,
    moistureSensorAirValue:
      firstDefined(body.moisture_sensor_air_value, body.soil_moisture_probe_prone_air_value) ??
      null,
    moistureSensorWaterValue:
      firstDefined(body.moisture_sensor_water_value, body.soil_moisture_probe_prone_water_value) ??
      null,
    moistureSensorMoisturePercent:
      firstDefined(
        body.moisture_sensor_moisture_percent,
        body.soil_moisture_probe_prone_moisture_percent,
      ) ?? null,
    moistureSensorPercent:
      firstDefined(body.moisture_sensor_percent, body.soil_moisture_probe_prone_percent) ?? null,
    moistureSensorCalibratedPercent:
      firstDefined(
        body.moisture_sensor_calibrated_percent,
        body.soil_moisture_probe_prone_calibrated_percent,
      ) ?? null,
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
      firstDefined(
        body.moisture_sensor_reading_time_ms,
        body.soil_moisture_probe_prone_reading_time_ms,
      ) ?? null,
    sensorTimestamp: body.timestamp ?? null,
    createdAt: new Date(),
  };
}

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
    const reading = normalizeSensorReading(body);
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
  })
  .get("/chart-readings", zValidator("query", chartRangeSchema), async (c) => {
    const { range } = c.req.valid("query");
    return c.json({ readings: await fetchChartReadings(c.env.DB, range) });
  });
