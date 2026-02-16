import React, { useState } from "react";
import { authClient } from "@site/src/lib/auth-client";
import { useAuth } from "@site/src/components/AuthProvider";
import styles from "./styles.module.css";

export default function SignupModal({ onClose, onSwitchToSignin }) {
  const { refreshSession, setShowQuestionnaire, setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signupError } = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0],
      });

      if (signupError) {
        setError(
          signupError.message || "An account with this email already exists."
        );
        return;
      }

      if (data?.user) {
        setUser(data.user);
      }
      await refreshSession();
      setShowQuestionnaire(true);
      onClose();
    } catch {
      setError("Service unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>
          Sign up to personalize your learning experience
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="signup-name">Name (optional)</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <button className={styles.switchLink} onClick={onSwitchToSignin}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
