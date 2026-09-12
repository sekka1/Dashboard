import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/stat-card";
import { apiClient } from "@/lib/api";
import { buildSeriesByDevice, SENSOR_GRAPH_METRICS } from "@/lib/sensor-metrics";
import type { SensorReading } from "@/types";

const TABLE_ROW_LIMIT = 20;
const CHART_COLORS = ["#047857", "#2563eb", "#d97706", "#db2777", "#7c3aed", "#0891b2"];

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
  const tableRows = readings.slice(0, TABLE_ROW_LIMIT);
  const metricSeries = useMemo(
    () =>
      Object.fromEntries(
        SENSOR_GRAPH_METRICS.map((metric) => [metric.key, buildSeriesByDevice(readings, metric)]),
      ),
    [readings],
  );

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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SENSOR_GRAPH_METRICS.map((metric) => {
            const series = metricSeries[metric.key];

            return (
              <div key={metric.key} className="rounded-lg bg-white p-4 shadow">
                <h2 className="mb-2 text-sm font-medium text-slate-500">
                  {metric.title}
                  {metric.unit ? ` (${metric.unit})` : ""}
                </h2>
                {readings.length === 0 || series.data.length === 0 ? (
                  <p className="py-10 text-center text-slate-400">No sensor readings yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={series.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                      />
                      <YAxis
                        domain={metric.boolean ? [0, 1] : undefined}
                        ticks={metric.boolean ? [0, 1] : undefined}
                        unit={metric.unit}
                        tickFormatter={
                          metric.boolean ? (value) => (value === 1 ? "Yes" : "No") : undefined
                        }
                      />
                      <Tooltip
                        labelFormatter={(t) => new Date(t as number).toLocaleString()}
                        formatter={(value) => {
                          if (metric.boolean) return value === 1 ? "Yes" : "No";
                          if (typeof value === "number" && metric.unit) return `${value}${metric.unit}`;
                          return value;
                        }}
                      />
                      <Legend />
                      {series.devices.map((deviceId, i) => (
                        <Line
                          key={deviceId}
                          type="monotone"
                          dataKey={deviceId}
                          name={deviceId}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          connectNulls
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            );
          })}
        </div>
        <div className="rounded-lg bg-white shadow">
          <h2 className="px-4 pt-4 text-sm font-medium text-slate-500">Last {TABLE_ROW_LIMIT} readings</h2>
          {loading ? (
            <p className="p-6 text-slate-400">Loading…</p>
          ) : tableRows.length === 0 ? (
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
                {tableRows.map((r) => (
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
