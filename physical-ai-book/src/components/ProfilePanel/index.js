import React, { useState, useEffect } from "react";
import { useAuth } from "@site/src/components/AuthProvider";
import styles from "./styles.module.css";

const EXPERIENCE_LEVELS = [
  { value: "none", label: "No experience" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function ProfilePanel({ onClose }) {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const AUTH_SERVER_URL =
    typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? "https://AR2107927-Physical-Humanoid-Robotics-Book.hf.space"
      : "http://localhost:3001";

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const res = await fetch(
          `${AUTH_SERVER_URL}/api/profile/questionnaire`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setQuestionnaire(data);
          setResponses(data);
        }
      } catch {
        setError("Failed to load questionnaire data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [AUTH_SERVER_URL]);

  const handleChange = (field, value) => {
    setResponses((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `${AUTH_SERVER_URL}/api/profile/questionnaire`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(responses),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setQuestionnaire(data);
        setIsEditing(false);
      } else {
        setError("Failed to save questionnaire");
      }
    } catch {
      setError("Service error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getLevelLabel = (value) => {
    const level = EXPERIENCE_LEVELS.find((l) => l.value === value);
    return level ? level.label : "Not specified";
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>My Profile</h3>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      </div>

      <div className={styles.content}>
        {/* User Info */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Account</h4>
          <div className={styles.field}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{user?.email}</span>
          </div>
          {user?.name && (
            <div className={styles.field}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{user.name}</span>
            </div>
          )}
        </div>

        {/* Questionnaire Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Background & Experience</h4>
            {!isEditing && questionnaire?.questionnaire_completed && (
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>

          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : questionnaire?.questionnaire_completed ? (
            isEditing ? (
              <div className={styles.editForm}>
                {/* Python */}
                <div className={styles.field}>
                  <label className={styles.label}>Python Experience</label>
                  <select
                    value={responses.python_experience || ""}
                    onChange={(e) =>
                      handleChange("python_experience", e.target.value)
                    }
                  >
                    <option value="">Select level...</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* C++ */}
                <div className={styles.field}>
                  <label className={styles.label}>C++ Experience</label>
                  <select
                    value={responses.cpp_experience || ""}
                    onChange={(e) =>
                      handleChange("cpp_experience", e.target.value)
                    }
                  >
                    <option value="">Select level...</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ROS 2 */}
                <div className={styles.field}>
                  <label className={styles.label}>ROS 2 Experience</label>
                  <select
                    value={responses.ros2_experience || ""}
                    onChange={(e) =>
                      handleChange("ros2_experience", e.target.value)
                    }
                  >
                    <option value="">Select level...</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Robot Hardware */}
                <div className={styles.field}>
                  <label className={styles.label}>Robot Hardware Experience</label>
                  <select
                    value={responses.robot_hardware_experience || ""}
                    onChange={(e) =>
                      handleChange("robot_hardware_experience", e.target.value)
                    }
                  >
                    <option value="">Select level...</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sensors */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Sensors & Microcontrollers Experience
                  </label>
                  <select
                    value={responses.sensor_experience || ""}
                    onChange={(e) =>
                      handleChange("sensor_experience", e.target.value)
                    }
                  >
                    <option value="">Select level...</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                  <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsEditing(false);
                      setResponses(questionnaire);
                      setError("");
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewForm}>
                <div className={styles.field}>
                  <span className={styles.label}>Python:</span>
                  <span className={styles.value}>
                    {getLevelLabel(questionnaire.python_experience)}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>C++:</span>
                  <span className={styles.value}>
                    {getLevelLabel(questionnaire.cpp_experience)}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>ROS 2:</span>
                  <span className={styles.value}>
                    {getLevelLabel(questionnaire.ros2_experience)}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Robot Hardware:</span>
                  <span className={styles.value}>
                    {getLevelLabel(questionnaire.robot_hardware_experience)}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Sensors & Microcontrollers:</span>
                  <span className={styles.value}>
                    {getLevelLabel(questionnaire.sensor_experience)}
                  </span>
                </div>
              </div>
            )
          ) : (
            <p className={styles.notCompleted}>
              You haven't completed the background questionnaire yet.{" "}
              <button
                className={styles.completeLink}
                onClick={() => setIsEditing(true)}
              >
                Complete it now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
