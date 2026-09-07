import { hc } from "hono/client";
import type { AppType } from "../../backend";

export const apiClient = hc<AppType>("/");
