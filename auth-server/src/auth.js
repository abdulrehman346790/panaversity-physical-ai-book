import { betterAuth } from "better-auth";
import pg from "pg";

const { Pool } = pg;

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      python_experience: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      cpp_experience: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      ros2_experience: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      robot_hardware_experience: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      sensor_experience: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      questionnaire_completed: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // update session every 24 hours
  },
  trustedOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000"],
});
