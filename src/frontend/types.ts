export type UserRole = "admin" | "partner";
export type UserStatus = "active" | "pending" | "deactivated";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SensorReading {
  id: number;
  deviceId: string;
  temperature: number;
  temperatureC: number | null;
  temperatureF: number | null;
  temperatureSensorPin: number | null;
  temperatureSensorConnected: boolean | null;
  temperatureSensorCount: number | null;
  humidity: number;
  batteryVoltage: number | null;
  moistureSensorRawAdc: number | null;
  moistureSensorAirValue: number | null;
  moistureSensorWaterValue: number | null;
  moistureSensorMoisturePercent: number | null;
  moistureSensorPercent: number | null;
  moistureSensorCalibratedPercent: number | null;
  moistureSensorPin: number | null;
  moistureSensorReadingTimeMs: number | null;
  sensorTimestamp: number | null;
  createdAt: string;
}

export interface UpdateUserInput {
  role?: UserRole;
  status?: UserStatus;
}
