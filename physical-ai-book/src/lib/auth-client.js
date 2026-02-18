import { createAuthClient } from "better-auth/react";

const AUTH_SERVER_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://AR2107927-Physical-Humanoid-Robotics-Book.hf.space"
    : "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: AUTH_SERVER_URL,
  fetchOptions: {
    credentials: "include",
  },
});
