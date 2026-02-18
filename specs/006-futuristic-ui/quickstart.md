# Quick Start: Implementing Futuristic UI Theme

**Purpose**: Guide for developers implementing the 006-futuristic-ui feature
**Date**: 2026-02-18
**Audience**: React/Docusaurus developers

---

## Prerequisites

- Node.js 16+ installed
- Docusaurus 3.x project running (`physical-ai-book`)
- Git knowledge (branch management)
- Basic CSS knowledge

## What You'll Build

By end of implementation, the textbook will have:
- ✅ Dark futuristic color palette across all pages
- ✅ Animated robot arm and humanoid character on homepage
- ✅ Neon glow effects on interactive elements
- ✅ Smooth page transitions
- ✅ WCAG AA accessibility compliance
- ✅ Graceful degradation on older browsers

---

## Phase 1: Global Theme Setup (P1-P2 Foundation)

### Step 1.1: Create Theme CSS Files

**File**: `physical-ai-book/src/css/futuristic-theme.css`

```css
/**
 * Futuristic Color Palette
 * WCAG AA compliant - all text combinations verified
 */

:root {
  /* Primary Colors */
  --color-bg-dark: #0a0e27;        /* Deep space black - main background */
  --color-bg-darker: #050811;      /* Darker variant for depth */
  --color-bg-light: #1a1f3a;       /* Lighter variant for contrast */

  /* Neon Accents */
  --color-accent-cyan: #00d4ff;    /* Primary neon - tech/robot */
  --color-accent-magenta: #ff006e; /* Secondary neon - energy */
  --color-accent-green: #00ff41;   /* Tertiary neon - success/status */

  /* Text Colors */
  --color-text-primary: #e0e0e0;   /* Main text - WCAG AAA on dark bg */
  --color-text-secondary: #b0b0b0; /* Secondary text - WCAG AAA */
  --color-text-muted: #808080;     /* Muted text - disabled/placeholder */

  /* UI Elements */
  --color-border: #404040;         /* Borders, dividers */
  --color-border-light: #606060;   /* Light borders */

  /* Semantic Colors */
  --color-error: #ff4455;          /* Error/danger - derived from palette */
  --color-warning: #ffaa00;        /* Warning - orange */
  --color-success: var(--color-accent-green); /* Success */
  --color-info: var(--color-accent-cyan);     /* Info */

  /* Shadows (Neon Glow) */
  --shadow-glow-sm: 0 0 5px var(--color-accent-cyan);
  --shadow-glow-md: 0 0 10px var(--color-accent-cyan);
  --shadow-glow-lg: 0 0 20px var(--color-accent-cyan);
  --shadow-glow-magenta: 0 0 10px var(--color-accent-magenta);

  /* Typography */
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-family-mono: SFMono-Regular, Fira Code, Inconsolata, monospace;

  /* Line Heights */
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

### Step 1.2: Create Animations CSS

**File**: `physical-ai-book/src/css/animations.css`

```css
/**
 * Futuristic Animations
 * All animations respect prefers-reduced-motion for accessibility
 */

/* ===== ROBOT ARM ANIMATION ===== */
@keyframes robot-arm-move {
  0% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(45deg) translateY(-10px);
  }
  50% {
    transform: rotate(45deg) translateY(-15px);
  }
  75% {
    transform: rotate(25deg) translateY(-5px);
  }
  100% {
    transform: rotate(0deg) translateY(0);
  }
}

.robot-arm {
  animation: robot-arm-move 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  transform-origin: 50% 100%;
  will-change: transform;
}

/* ===== CHARACTER BREATHING ANIMATION ===== */
@keyframes breathe {
  0%, 100% {
    transform: translateY(0px);
    opacity: 1;
  }
  50% {
    transform: translateY(-8px);
    opacity: 0.95;
  }
}

.humanoid {
  animation: breathe 3s ease-in-out infinite;
  will-change: transform;
}

/* ===== NEON GLOW EFFECT ===== */
@keyframes glow-pulse {
  0% {
    box-shadow: 0 0 5px var(--color-accent-cyan);
  }
  50% {
    box-shadow: 0 0 20px var(--color-accent-cyan);
  }
  100% {
    box-shadow: 0 0 5px var(--color-accent-cyan);
  }
}

.neon-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* ===== PAGE TRANSITION ANIMATION ===== */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-transition {
  animation: fade-in 300ms ease-out;
}

/* ===== FLOATING PARTICLES (OPTIONAL) ===== */
@keyframes float {
  from {
    transform: translateY(100vh) translateX(0px);
    opacity: 0;
  }
  to {
    transform: translateY(-100vh) translateX(20px);
    opacity: 1;
  }
}

.particle {
  animation: float 20s linear infinite;
  will-change: transform;
}

/* ===== BUTTON HOVER ANIMATION ===== */
@keyframes button-glow {
  from {
    box-shadow: 0 0 10px var(--color-accent-cyan);
  }
  to {
    box-shadow: 0 0 20px var(--color-accent-cyan), inset 0 0 10px rgba(0, 212, 255, 0.2);
  }
}

.btn-neon:hover {
  animation: button-glow 200ms ease-out forwards;
  transform: scale(1.05);
  transition: all var(--transition-fast);
}

/* ===== ACCESSIBILITY: RESPECT USER PREFERENCE ===== */
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations for users with motion sensitivity */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Step 1.3: Update custom.css

**File**: `physical-ai-book/src/css/custom.css`

Add at the top:
```css
@import url('./futuristic-theme.css');
@import url('./animations.css');

/* ===== GLOBAL DARK THEME ===== */
html {
  --ifm-color-primary: var(--color-accent-cyan);
  --ifm-color-primary-dark: #00a8cc;
  --ifm-color-primary-darker: #007a96;
  --ifm-color-primary-darkest: #005a72;
  --ifm-color-primary-light: #66e6ff;
  --ifm-color-primary-lighter: #99f0ff;
  --ifm-color-primary-lightest: #ccf8ff;

  --ifm-color-secondary: var(--color-accent-magenta);
  --ifm-color-secondary-dark: #cc005a;
  --ifm-color-secondary-darker: #991044;
  --ifm-color-secondary-darkest: #661f33;
  --ifm-color-secondary-light: #ff3388;
  --ifm-color-secondary-lighter: #ff66aa;
  --ifm-color-secondary-lightest: #ff99cc;

  --ifm-background-color: var(--color-bg-dark);
  --ifm-background-surface-color: var(--color-bg-darker);

  --ifm-font-color-base: var(--color-text-primary);
  --ifm-font-color-base-inverse: var(--color-bg-dark);

  --ifm-color-content: var(--color-text-primary);
  --ifm-link-color: var(--color-accent-cyan);
  --ifm-link-hover-color: var(--color-accent-magenta);

  --ifm-table-border-color: var(--color-border);
  --ifm-blockquote-border-color: var(--color-accent-cyan);

  --ifm-hr-border-color: var(--color-border);
  --ifm-menu-color: var(--color-text-secondary);
  --ifm-menu-color-active: var(--color-accent-cyan);

  --ifm-toc-border-color: var(--color-border);
}

body {
  background-color: var(--color-bg-dark);
  color: var(--color-text-primary);
}

/* Code blocks - preserve syntax highlighting */
pre {
  background-color: var(--color-bg-darker) !important;
  border: 1px solid var(--color-border) !important;
}

/* Links - neon cyan */
a {
  color: var(--color-accent-cyan);
  text-decoration: none;
  transition: all var(--transition-normal);
}

a:hover {
  color: var(--color-accent-magenta);
  text-decoration: underline;
}

/* Buttons - neon styling */
.button {
  background: var(--color-bg-darker);
  border: 2px solid var(--color-accent-cyan);
  color: var(--color-accent-cyan);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.button:hover {
  box-shadow: var(--shadow-glow-md);
  text-shadow: 0 0 8px var(--color-accent-cyan);
}

.button.primary {
  background: transparent;
  border-color: var(--color-accent-cyan);
  color: var(--color-accent-cyan);
}

.button.primary:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2), var(--shadow-glow-md);
}

/* Sidebars - dark with neon hover */
.sidebar {
  background: var(--color-bg-darker);
}

.menu__link {
  color: var(--color-text-secondary);
}

.menu__link:hover {
  color: var(--color-accent-cyan);
  box-shadow: inset -2px 0 0 var(--color-accent-cyan);
}

/* Admonitions - dark boxes with neon left border */
.alert {
  background: var(--color-bg-darker);
  border-left: 4px solid var(--color-accent-cyan);
}

.alert.alert-info {
  border-color: var(--color-accent-cyan);
}

.alert.alert-warning {
  border-color: var(--color-accent-green);
}

.alert.alert-danger {
  border-color: var(--color-error);
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Phase 2: Homepage Hero Component (P1 - Animations)

### Step 2.1: Create RobotArm SVG Component

**File**: `physical-ai-book/src/components/RobotArm/index.jsx`

```jsx
import React from 'react';
import styles from './styles.module.css';

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
      <circle cx="100" cy="245" r="8" fill="#00d4ff" />

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
```

**File**: `physical-ai-book/src/components/RobotArm/styles.module.css`

```css
.robotArm {
  width: 200px;
  height: 300px;
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.5));
  animation: robot-arm-move 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  transform-origin: 100px 250px;
}

.shoulder {
  transform-origin: 100px 245px;
  animation: shoulder-rotate 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

.elbow {
  transform-origin: 100px 180px;
  animation: elbow-rotate 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

.gripper {
  transform-origin: 100px 100px;
}

@keyframes shoulder-rotate {
  0%, 100% { transform: rotate(0deg); }
  25%, 75% { transform: rotate(45deg); }
}

@keyframes elbow-rotate {
  0%, 100% { transform: rotate(0deg); }
  25%, 75% { transform: rotate(60deg); }
}
```

### Step 2.2: Create HumanoidCharacter Component

**File**: `physical-ai-book/src/components/HumanoidCharacter/index.jsx`

```jsx
import React from 'react';
import styles from './styles.module.css';

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
      <line x1="40" y1="70" x2="20" y2="80" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="70" x2="80" y2="80" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" />

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
```

**File**: `physical-ai-book/src/components/HumanoidCharacter/styles.module.css`

```css
.humanoid {
  width: 100px;
  height: 200px;
  animation: breathe 3s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.4));
}

@keyframes breathe {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
```

### Step 2.3: Create Homepage Hero Component

**File**: `physical-ai-book/src/components/HomepageHero/index.jsx`

```jsx
import React from 'react';
import styles from './styles.module.css';
import RobotArm from '../RobotArm';
import HumanoidCharacter from '../HumanoidCharacter';

export default function HomepageHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <div className={styles.circuitPattern}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.robotsContainer}>
          <div className={styles.robot}>
            <RobotArm />
          </div>
          <div className={styles.character}>
            <HumanoidCharacter />
          </div>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>
            Physical AI & <br /> Humanoid Robotics
          </h1>
          <p className={styles.subtitle}>
            Explore the future of robotics through hands-on learning
          </p>
          <button className={styles.cta}>Start Learning</button>
        </div>
      </div>
    </section>
  );
}
```

**File**: `physical-ai-book/src/components/HomepageHero/styles.module.css`

```css
.hero {
  position: relative;
  width: 100%;
  height: 600px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="none" stroke="%2300d4ff" width="99" height="99"/><rect fill="none" stroke="%2300d4ff" x="20" y="20" width="60" height="60"/></svg>');
}

.circuitPattern {
  width: 100%;
  height: 100%;
  background-repeat: repeat;
}

.container {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 40px;
  max-width: 1200px;
  padding: 0 20px;
}

.robotsContainer {
  display: flex;
  gap: 60px;
  align-items: flex-end;
}

.robot {
  animation: float-up 6s ease-in-out infinite;
}

.character {
  animation: float-up 6s ease-in-out infinite 1s;
}

@keyframes float-up {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.content {
  flex: 1;
  color: #e0e0e0;
}

.title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #e0e0e0;
  line-height: 1.2;
}

.title {
  background: linear-gradient(135deg, #e0e0e0, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  color: #b0b0b0;
  margin-bottom: 30px;
}

.cta {
  padding: 12px 32px;
  background: transparent;
  border: 2px solid #00d4ff;
  color: #00d4ff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 200ms ease;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0);
}

.cta:hover {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.8), inset 0 0 10px rgba(0, 212, 255, 0.2);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .hero {
    height: 400px;
  }

  .container {
    flex-direction: column;
    gap: 20px;
  }

  .robotsContainer {
    gap: 30px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
```

---

## Running Your Implementation

### Build & Test
```bash
# Build Docusaurus
npm run build

# Start development server
npm run start

# Visit http://localhost:3000
```

### Verify
- ✅ Homepage displays robot animations
- ✅ Dark theme applied to all pages
- ✅ Buttons glow on hover
- ✅ Text readable (WCAG AA)
- ✅ Disable animations in browser DevTools → Rendering → Emulate CSS media feature → prefers-reduced-motion: reduce
  - Verify static theme still works

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Animations jittery | Add `will-change: transform` to animated elements |
| Too slow/fast | Adjust keyframe animation duration (in seconds) |
| Glow not visible | Check `filter: drop-shadow` syntax; must use `filter` not `box-shadow` for SVG |
| Mobile animations stutter | Reduce animation complexity or disable on mobile via media query |
| Contrast fails | Verify text color is #e0e0e0 or lighter on #0a0e27 background |

---

## Next Steps

After Phase 1-2, proceed to:
- Phase 3: Apply dark theme to all chapter pages
- Phase 4: Implement interactive animations (button hovers, page transitions)
- Phase 5: Redesign header/footer
- Phase 6: Accessibility testing & mobile optimization

See `tasks.md` (generated by `/sp.tasks`) for detailed checklist.

