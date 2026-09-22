import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const CHART_RANGE_OPTIONS = [
  { value: "1h", label: "Last hour", summary: "1-minute summaries" },
  { value: "12h", label: "Last 12 hours", summary: "10-minute summaries" },
  { value: "24h", label: "Last 24 hours", summary: "15-minute summaries" },
  { value: "7d", label: "Last 7 days", summary: "Hourly summaries" },
] as const;

type ChartRange = (typeof CHART_RANGE_OPTIONS)[number]["value"];

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function formatNumber(value: number | null, unit: string) {
  return value === null ? "—" : `${value.toFixed(1)}${unit}`;
}

function formatChartTime(value: number, range: ChartRange) {
  if (range === "7d") {
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
    });
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DashboardPage() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [chartReadings, setChartReadings] = useState<SensorReading[]>([]);
  const [chartRange, setChartRange] = useState<ChartRange>("24h");
  const [loading, setLoading] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const chartRequestIdRef = useRef(0);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.api.sensors.readings.$get({ query: { limit: "50" } });
    if (res.ok) {
      const data = await res.json();
      setReadings(data.readings);
    }
    setLoading(false);
  }, []);

  const fetchChartReadings = useCallback(async (range: ChartRange) => {
    const requestId = chartRequestIdRef.current + 1;
    chartRequestIdRef.current = requestId;
    setLoadingCharts(true);
    const res = await apiClient.api.sensors["chart-readings"].$get({ query: { range } });
    if (chartRequestIdRef.current !== requestId) return;
    if (res.ok) {
      const data = await res.json();
      setChartReadings(data.readings);
    } else {
      setChartReadings([]);
    }
    setLoadingCharts(false);
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  useEffect(() => {
    fetchChartReadings(chartRange);
  }, [chartRange, fetchChartReadings]);

  const latest = readings[0] ?? null;
  const avgTemperature = average(readings.map((r) => r.temperature));
  const deviceCount = new Set(readings.map((r) => r.deviceId)).size;
  const tableRows = readings.slice(0, TABLE_ROW_LIMIT);
  const chartRangeOption = CHART_RANGE_OPTIONS.find((option) => option.value === chartRange);
  const metricSeries = useMemo(
    () =>
      Object.fromEntries(
        SENSOR_GRAPH_METRICS.map((metric) => [metric.key, buildSeriesByDevice(chartReadings, metric)]),
      ),
    [chartReadings],
  );

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="bg-emerald-700 py-8 text-center text-white shadow">
        <h1 className="text-3xl font-bold tracking-wide">🌱 Garden</h1>
        <p className="mt-1 text-sm text-emerald-100">Live readings from the garden sensors</p>
      </div>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Chart window
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {chartRangeOption?.label ?? "Last 24 hours"}
            </h2>
            <p className="text-sm text-slate-500">
              {chartRangeOption?.summary ?? "15-minute summaries"} keep the charts readable on any
              screen.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Time range
            <select
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value as ChartRange)}
            >
              {CHART_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
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
                {loadingCharts ? (
                  <p className="py-10 text-center text-slate-400">Loading chart…</p>
                ) : chartReadings.length === 0 || series.data.length === 0 ? (
                  <p className="py-10 text-center text-slate-400">No sensor readings yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={series.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(t) => formatChartTime(t, chartRange)}
                      />
                      <YAxis
                        domain={metric.boolean ? [0, 1] : undefined}
                        ticks={metric.boolean ? [0, 1] : undefined}
                        label={
                          metric.boolean
                            ? { value: "No = 0, Yes = 1", angle: -90, position: "insideLeft" }
                            : undefined
                        }
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
