import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { apiClient } from "@/lib/api";
import type { SensorReading } from "@/types";

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function formatNumber(value: number | null, unit: string) {
  return value === null ? "—" : `${value.toFixed(1)}${unit}`;
}

export function DashboardPage() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.api.sensors.readings.$get({ query: { limit: "50" } });
    if (res.ok) {
      const data = await res.json();
      setReadings(data.readings);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const latest = readings[0] ?? null;
  const avgTemperature = average(readings.map((r) => r.temperature));
  const deviceCount = new Set(readings.map((r) => r.deviceId)).size;

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="bg-emerald-700 py-8 text-center text-white shadow">
        <h1 className="text-3xl font-bold tracking-wide">🌱 Garden</h1>
        <p className="mt-1 text-sm text-emerald-100">Live readings from the garden sensors</p>
      </div>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Latest Temperature" value={formatNumber(latest?.temperature ?? null, "°C")} />
          <StatCard label="Latest Humidity" value={formatNumber(latest?.humidity ?? null, "%")} />
          <StatCard label="Average Temperature" value={formatNumber(avgTemperature, "°C")} />
          <StatCard label="Sensors Reporting" value={deviceCount} />
        </div>
        <div className="rounded-lg bg-white shadow">
          {loading ? (
            <p className="p-6 text-slate-400">Loading…</p>
          ) : readings.length === 0 ? (
            <p className="p-6 text-slate-400">No sensor readings yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Temperature</th>
                  <th className="px-4 py-3 font-medium">Humidity</th>
                  <th className="px-4 py-3 font-medium">Battery</th>
                  <th className="px-4 py-3 font-medium">Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">{r.deviceId}</td>
                    <td className="px-4 py-3">{formatNumber(r.temperature, "°C")}</td>
                    <td className="px-4 py-3">{formatNumber(r.humidity, "%")}</td>
                    <td className="px-4 py-3">
                      {r.batteryVoltage === null ? "—" : `${r.batteryVoltage.toFixed(2)}V`}
                    </td>
                    <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
