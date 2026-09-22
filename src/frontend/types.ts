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
  sensorType: string | null;
  temperature: number;
  temperatureC: number | null;
  temperatureF: number | null;
  temperatureSensorPin: number | null;
  temperatureSensorSdaPin: number | null;
  temperatureSensorSclPin: number | null;
  temperatureSensorI2cAddress: number | null;
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
  moistureSensorProbe1AoPin: number | null;
  moistureSensorProbe1RawAdc: number | null;
  moistureSensorProbe1MoisturePercent: number | null;
  moistureSensorProbe1PowerPin: number | null;
  moistureSensorProbe2AoPin: number | null;
  moistureSensorProbe2RawAdc: number | null;
  moistureSensorProbe2MoisturePercent: number | null;
  moistureSensorProbe2PowerPin: number | null;
  moistureSensorReadingTimeMs: number | null;
  sensorTimestamp: number | null;
  createdAt: string;
}

export interface UpdateUserInput {
  role?: UserRole;
  status?: UserStatus;
}
