import { env } from "@/env";

export const AI_CONFIG = {
  url: env.VITE_AI_URL ?? "https://depth-crusher-guiding.ngrok-free.dev/v1",
  apiKey: env.VITE_AI_API_KEY ?? "APIKEY",
};
