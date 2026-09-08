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
        humidity: 65.2,
        battery_voltage: 3.82,
        timestamp: 1,
      }),
    });
    expect(postRes.status).toBe(201);
    expect(await postRes.json()).toEqual({ success: true });

    const stored = await env.DB.prepare(
      "SELECT created_at FROM sensor_readings WHERE device_id = ? ORDER BY id DESC LIMIT 1",
    )
      .bind("esp32-c3-garden-01")
      .first<{ created_at: number }>();
    expect(stored).not.toBeNull();
    expect(stored!.created_at).toBeGreaterThanOrEqual(
      Math.floor(receivedAtBeforePost / 1000),
    );
    expect(stored!.created_at).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
  });
});
