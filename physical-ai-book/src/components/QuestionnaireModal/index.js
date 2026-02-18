import React, { useState } from "react";
import { useAuth } from "@site/src/components/AuthProvider";
import { authClient } from "@site/src/lib/auth-client";
import styles from "./styles.module.css";

const EXPERIENCE_LEVELS = [
  { value: "none", label: "No experience" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function QuestionnaireModal() {
  const { showQuestionnaire, setShowQuestionnaire } = useAuth();
  const [responses, setResponses] = useState({
    python_experience: "",
    cpp_experience: "",
    ros2_experience: "",
    robot_hardware_experience: "",
    sensor_experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setResponses((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const AUTH_SERVER_URL =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? "https://AR2107927-Physical-Humanoid-Robotics-Book.hf.space"
        : "http://localhost:3001";

    try {
      const payload = Object.fromEntries(
        Object.entries(responses).map(([k, v]) => [k, v || null])
      );

      await fetch(
        `${AUTH_SERVER_URL}/api/profile/questionnaire`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      setShowQuestionnaire(false);
    } catch {
      setError("Failed to save questionnaire. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setShowQuestionnaire(false);
  };

  if (!showQuestionnaire) return null;

  return (
    <div className={styles.overlay} onClick={handleSkip}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleSkip}>
          &times;
        </button>

        <h2 className={styles.title}>Tell us about your experience</h2>
        <p className={styles.subtitle}>
          This helps us personalize the learning experience for you
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Python Experience */}
          <div className={styles.question}>
            <label className={styles.questionLabel}>
              Python Programming Experience
            </label>
            <div className={styles.options}>
              {EXPERIENCE_LEVELS.map((level) => (
                <label key={level.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="python_experience"
                    value={level.value}
                    checked={responses.python_experience === level.value}
                    onChange={(e) =>
                      handleChange("python_experience", e.target.value)
                    }
                  />
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* C++ Experience */}
          <div className={styles.question}>
            <label className={styles.questionLabel}>
              C++ Programming Experience
            </label>
            <div className={styles.options}>
              {EXPERIENCE_LEVELS.map((level) => (
                <label key={level.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="cpp_experience"
                    value={level.value}
                    checked={responses.cpp_experience === level.value}
                    onChange={(e) =>
                      handleChange("cpp_experience", e.target.value)
                    }
                  />
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ROS 2 Experience */}
          <div className={styles.question}>
            <label className={styles.questionLabel}>
              ROS 2 (Robot Operating System) Experience
            </label>
            <div className={styles.options}>
              {EXPERIENCE_LEVELS.map((level) => (
                <label key={level.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="ros2_experience"
                    value={level.value}
                    checked={responses.ros2_experience === level.value}
                    onChange={(e) =>
                      handleChange("ros2_experience", e.target.value)
                    }
                  />
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Robot Hardware Experience */}
          <div className={styles.question}>
            <label className={styles.questionLabel}>
              Robot Hardware Experience
            </label>
            <div className={styles.options}>
              {EXPERIENCE_LEVELS.map((level) => (
                <label key={level.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="robot_hardware_experience"
                    value={level.value}
                    checked={
                      responses.robot_hardware_experience === level.value
                    }
                    onChange={(e) =>
                      handleChange("robot_hardware_experience", e.target.value)
                    }
                  />
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sensors/Microcontrollers Experience */}
          <div className={styles.question}>
            <label className={styles.questionLabel}>
              Sensors & Microcontrollers Experience
            </label>
            <div className={styles.options}>
              {EXPERIENCE_LEVELS.map((level) => (
                <label key={level.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="sensor_experience"
                    value={level.value}
                    checked={responses.sensor_experience === level.value}
                    onChange={(e) =>
                      handleChange("sensor_experience", e.target.value)
                    }
                  />
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Preferences"}
            </button>
            <button
              type="button"
              className={styles.skipButton}
              onClick={handleSkip}
              disabled={loading}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
