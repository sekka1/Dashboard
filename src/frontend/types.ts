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
  humidity: number;
  batteryVoltage: number | null;
  createdAt: string;
}

export interface UpdateUserInput {
  role?: UserRole;
  status?: UserStatus;
}
