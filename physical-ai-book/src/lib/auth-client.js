import { createAuthClient } from "better-auth/react";

const AUTH_SERVER_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://auth-physical-ai.up.railway.app"
    : "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: AUTH_SERVER_URL,
  fetchOptions: {
    credentials: "include",
  },
});
