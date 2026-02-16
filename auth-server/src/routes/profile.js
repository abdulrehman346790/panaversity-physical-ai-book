import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import pg from "pg";

const { Pool } = pg;

const VALID_LEVELS = ["none", "beginner", "intermediate", "advanced"];

const QUESTIONNAIRE_FIELDS = [
  "python_experience",
  "cpp_experience",
  "ros2_experience",
  "robot_hardware_experience",
  "sensor_experience",
];

function validateExperienceLevel(value) {
  if (value === null || value === undefined) return true;
  return VALID_LEVELS.includes(value);
}

export function profileRouter(auth) {
  const router = Router();
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  });

  // GET /api/profile/questionnaire
  router.get("/questionnaire", async (req, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await pool.query(
        `SELECT python_experience, cpp_experience, ros2_experience,
                robot_hardware_experience, sensor_experience,
                "questionnaireCompleted" as questionnaire_completed
         FROM "user" WHERE id = $1`,
        [session.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("GET /questionnaire error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/profile/questionnaire
  router.post("/questionnaire", async (req, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const body = req.body || {};

      // Validate experience levels
      for (const field of QUESTIONNAIRE_FIELDS) {
        if (body[field] !== undefined && !validateExperienceLevel(body[field])) {
          return res.status(400).json({
            error: `Invalid value for ${field}. Must be one of: ${VALID_LEVELS.join(", ")}`,
          });
        }
      }

      const result = await pool.query(
        `UPDATE "user" SET
          python_experience = COALESCE($1, python_experience),
          cpp_experience = COALESCE($2, cpp_experience),
          ros2_experience = COALESCE($3, ros2_experience),
          robot_hardware_experience = COALESCE($4, robot_hardware_experience),
          sensor_experience = COALESCE($5, sensor_experience),
          "questionnaireCompleted" = true,
          "updatedAt" = NOW()
         WHERE id = $6
         RETURNING python_experience, cpp_experience, ros2_experience,
                   robot_hardware_experience, sensor_experience,
                   "questionnaireCompleted" as questionnaire_completed`,
        [
          body.python_experience || null,
          body.cpp_experience || null,
          body.ros2_experience || null,
          body.robot_hardware_experience || null,
          body.sensor_experience || null,
          session.user.id,
        ]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("POST /questionnaire error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/profile/questionnaire
  router.put("/questionnaire", async (req, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const body = req.body || {};

      for (const field of QUESTIONNAIRE_FIELDS) {
        if (body[field] !== undefined && !validateExperienceLevel(body[field])) {
          return res.status(400).json({
            error: `Invalid value for ${field}. Must be one of: ${VALID_LEVELS.join(", ")}`,
          });
        }
      }

      const result = await pool.query(
        `UPDATE "user" SET
          python_experience = COALESCE($1, python_experience),
          cpp_experience = COALESCE($2, cpp_experience),
          ros2_experience = COALESCE($3, ros2_experience),
          robot_hardware_experience = COALESCE($4, robot_hardware_experience),
          sensor_experience = COALESCE($5, sensor_experience),
          "questionnaireCompleted" = true,
          "updatedAt" = NOW()
         WHERE id = $6
         RETURNING python_experience, cpp_experience, ros2_experience,
                   robot_hardware_experience, sensor_experience,
                   "questionnaireCompleted" as questionnaire_completed`,
        [
          body.python_experience || null,
          body.cpp_experience || null,
          body.ros2_experience || null,
          body.robot_hardware_experience || null,
          body.sensor_experience || null,
          session.user.id,
        ]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("PUT /questionnaire error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
