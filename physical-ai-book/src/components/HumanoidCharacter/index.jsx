import React from 'react';
import styles from './styles.module.css';

/**
 * HumanoidCharacter Component
 * Animated humanoid character with breathing animation
 */
export default function HumanoidCharacter() {
  return (
    <svg
      className={styles.humanoid}
      viewBox="0 0 100 200"
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="200"
      role="img"
      aria-label="Humanoid robot character"
    >
      <title>Humanoid Robot Character</title>
      <desc>A simple humanoid character with breathing animation</desc>

      {/* Head */}
      <circle cx="50" cy="30" r="20" fill="#00d4ff" />
      {/* Eyes */}
      <circle cx="44" cy="25" r="3" fill="#0a0e27" />
      <circle cx="56" cy="25" r="3" fill="#0a0e27" />
      {/* Smile */}
      <path d="M 44 35 Q 50 40 56 35" stroke="#0a0e27" strokeWidth="2" fill="none" />

      {/* Torso */}
      <rect x="40" y="55" width="20" height="45" fill="#00d4ff" />
      <line x1="50" y1="65" x2="50" y2="90" stroke="#ff006e" strokeWidth="1" opacity="0.5" />

      {/* Arms */}
      <line
        x1="40"
        y1="70"
        x2="20"
        y2="80"
        stroke="#00d4ff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="60"
        y1="70"
        x2="80"
        y2="80"
        stroke="#00d4ff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Hands */}
      <circle cx="20" cy="80" r="5" fill="#00ff41" />
      <circle cx="80" cy="80" r="5" fill="#00ff41" />

      {/* Legs */}
      <line x1="45" y1="100" x2="42" y2="140" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" />
      <line x1="55" y1="100" x2="58" y2="140" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" />

      {/* Feet */}
      <circle cx="42" cy="145" r="4" fill="#00ff41" />
      <circle cx="58" cy="145" r="4" fill="#00ff41" />
    </svg>
  );
}
