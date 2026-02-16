import React, { useState } from "react";
import { useAuth } from "@site/src/components/AuthProvider";
import SignupModal from "@site/src/components/AuthModals/SignupModal";
import SigninModal from "@site/src/components/AuthModals/SigninModal";
import ProfilePanel from "@site/src/components/ProfilePanel";
import styles from "./styles.module.css";

export default function AuthButton() {
  const { user, isLoading, isAuthenticated, authAvailable, signOut } =
    useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!authAvailable) return null;
  if (isLoading) return null;

  return (
    <>
      <div className={styles.authContainer}>
        {isAuthenticated ? (
          <div className={styles.userMenu}>
            <button
              className={styles.avatarButton}
              onClick={() => setShowProfile(!showProfile)}
              title={user.email}
            >
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </button>
            <button className={styles.signOutButton} onClick={signOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <div className={styles.authButtons}>
            <button
              className={styles.signInButton}
              onClick={() => setShowSignin(true)}
            >
              Sign In
            </button>
            <button
              className={styles.signUpButton}
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToSignin={() => {
            setShowSignup(false);
            setShowSignin(true);
          }}
        />
      )}

      {showSignin && (
        <SigninModal
          onClose={() => setShowSignin(false)}
          onSwitchToSignup={() => {
            setShowSignin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showProfile && (
        <ProfilePanel onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
