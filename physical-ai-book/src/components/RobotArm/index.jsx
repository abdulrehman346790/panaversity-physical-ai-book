import React from 'react';
import styles from './styles.module.css';

/**
 * RobotArm Component
 * Animated SVG robot arm with rotating joints
 */
export default function RobotArm() {
  return (
    <svg
      className={styles.robotArm}
      viewBox="0 0 200 300"
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="300"
      role="img"
      aria-label="Animated robot arm"
    >
      <title>Robot Arm Animation</title>
      <desc>A futuristic mechanical robot arm that rotates and extends</desc>

      {/* Base */}
      <rect x="85" y="250" width="30" height="30" fill="#00d4ff" />
      <circle cx="100" cy="245" r="8" fill="#00ff41" />

      {/* Shoulder joint */}
      <g className={styles.shoulder}>
        <rect x="85" y="180" width="30" height="60" fill="#00d4ff" />
        <circle cx="100" cy="180" r="10" fill="#00ff41" />
      </g>

      {/* Elbow section */}
      <g className={styles.elbow}>
        <rect x="85" y="100" width="30" height="80" fill="#00d4ff" />
        <circle cx="100" cy="100" r="10" fill="#00ff41" />
      </g>

      {/* Gripper */}
      <g className={styles.gripper}>
        <rect x="85" y="50" width="30" height="50" fill="#00d4ff" />
        <line x1="85" y1="65" x2="70" y2="55" stroke="#ff006e" strokeWidth="2" />
        <line x1="115" y1="65" x2="130" y2="55" stroke="#ff006e" strokeWidth="2" />
      </g>
    </svg>
  );
}
