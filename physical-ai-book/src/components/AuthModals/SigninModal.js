import React, { useState } from "react";
import { authClient } from "@site/src/lib/auth-client";
import { useAuth } from "@site/src/components/AuthProvider";
import styles from "./styles.module.css";

export default function SigninModal({ onClose, onSwitchToSignup }) {
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signinError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signinError) {
        setError("Invalid email or password.");
        return;
      }

      await refreshSession();
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
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account?{" "}
          <button className={styles.switchLink} onClick={onSwitchToSignup}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
