# Data Model: Futuristic Robotics-Themed UI

**Purpose**: Define the component hierarchy, data flow, and visual state model for the UI redesign
**Date**: 2026-02-18
**Feature**: 006-futuristic-ui

---

## Visual Component Hierarchy

```
ThemeContext (React context for global theme state - optional)
│
└─ Docusaurus Layout
   │
   ├─ Navbar
   │  ├── Logo + Branding
   │  ├── Navigation Links (with neon active state)
   │  └── Mobile Menu (dark themed)
   │
   ├─ Main Content
   │  ├─ HomePage (special hero section)
   │  │  ├── RobotArm (animated SVG)
   │  │  ├── HumanoidCharacter (with breathing animation)
   │  │  ├── CircuitPattern (background decoration)
   │  │  └── ParticleBackground (ambient effects - optional)
   │  │
   │  └─ Chapter/Doc Pages (generic dark theme)
   │     ├── Sidebar (dark with neon accents)
   │     ├── Content area (dark bg, light text)
   │     ├── Code blocks (preserved colors, no dark overlay)
   │     └── Admonitions (dark backgrounds with neon left border)
   │
   └─ Footer
      ├── Links (neon colored)
      ├── Copyright
      └── Social icons (with hover glow)
```

---

## Component Definitions

### 1. RobotArm Component

**Purpose**: Animated robot arm on homepage

**Visual State**:
```
RobotArm (SVG)
├── Base (fixed)
├── Shoulder Joint (rotates 0-45°)
├── Elbow Joint (rotates 0-60°)
└── Gripper/End effector (opens/closes)
```

**Animation**:
- Name: `robot-arm`
- Duration: 4 seconds
- Loop: infinite
- Sequence:
  1. Rotate shoulder up (1s)
  2. Rotate elbow out (1s)
  3. Close gripper (0.5s)
  4. Return to start (1.5s)

**CSS**:
```css
@keyframes robot-arm {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(45deg); }
  50% { transform: rotate(45deg) translateY(-10px); }
  75% { transform: rotate(20deg) translateY(-5px); }
  100% { transform: rotate(0deg); }
}

.robot-arm {
  animation: robot-arm 4s ease-in-out infinite;
  transform-origin: 50% 100%; /* Pivot at base */
}

@media (prefers-reduced-motion: reduce) {
  .robot-arm { animation: none; }
}
```

### 2. HumanoidCharacter Component

**Purpose**: Idle character animation on homepage

**Visual State**:
```
HumanoidCharacter
├── Head (circle)
├── Torso (rectangle)
├── Arms (2x lines with subtle sway)
└── Legs (2x lines with subtle shift)
```

**Animation**:
- Name: `breathe`
- Duration: 3 seconds
- Loop: infinite
- Effect: Subtle up-down breathing motion (3-5px)

**CSS**:
```css
@keyframes breathe {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.humanoid {
  animation: breathe 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .humanoid { animation: none; }
}
```

### 3. NeonButton Component

**Purpose**: Interactive button with hover glow effect

**Visual States**:
- **Default**: Dark background, neon text, no glow
- **Hover**: Neon glow shadow, text brightens
- **Active**: Stronger glow, color invert

**CSS**:
```css
.neon-btn {
  background: var(--color-bg-darker);
  color: var(--color-accent-cyan);
  border: 1px solid var(--color-accent-cyan);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.neon-btn:hover {
  box-shadow: 0 0 10px var(--color-accent-cyan),
              inset 0 0 10px rgba(0, 212, 255, 0.1);
  text-shadow: 0 0 10px var(--color-accent-cyan);
  transform: scale(1.05);
}

.neon-btn:active {
  box-shadow: 0 0 20px var(--color-accent-cyan);
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .neon-btn:hover { transform: none; }
}
```

### 4. CircuitPattern Background

**Purpose**: Tech-inspired background decoration

**Visual Design**:
- Subtle geometric circuit board pattern
- SVG or CSS gradients + background-image
- Low opacity (~0.05-0.1) so text remains readable
- Positioned behind main content

**Implementation**:
- Option A: SVG background-image (scalable, clean)
- Option B: CSS gradient + repeating pattern (no external dependencies)

### 5. ParticleBackground Component (Optional)

**Purpose**: Ambient floating particles for visual interest

**Visual State**:
- Small circles floating upward
- Varying opacity and size
- Continuous loop

**Animation**:
- Name: `float`
- Duration: 15-30 seconds (slower = subtle)
- Loop: infinite
- Motion: linear upward movement

**CSS**:
```css
@keyframes float {
  from { transform: translateY(100vh) opacity(0); }
  to { transform: translateY(-100vh); opacity(1); }
}

.particle {
  position: fixed;
  width: 2-10px;
  height: 2-10px;
  background: var(--color-accent-cyan);
  border-radius: 50%;
  opacity: 0.2-0.5;
  animation: float 20s linear infinite;
  /* Stagger particles with animation-delay */
}

@media (prefers-reduced-motion: reduce) {
  .particle { display: none; /* Hide particles */ }
}
```

---

## Global Theme Variables

**CSS Custom Properties** (defined in `:root`):

```css
:root {
  /* Colors */
  --color-bg-dark: #0a0e27;
  --color-bg-darker: #050811;
  --color-accent-cyan: #00d4ff;
  --color-accent-magenta: #ff006e;
  --color-accent-green: #00ff41;
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #b0b0b0;
  --color-border: #404040;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-family-mono: 'SFMono-Regular', 'Fira Code', monospace;

  /* Spacing (Docusaurus defaults + adjustments) */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Shadows (neon glow effect) */
  --shadow-glow-cyan: 0 0 10px var(--color-accent-cyan);
  --shadow-glow-magenta: 0 0 10px var(--color-accent-magenta);
  --shadow-glow-green: 0 0 10px var(--color-accent-green);
}
```

---

## Page States & Layouts

### Homepage (P1 Priority)

**Structure**:
```
<Page>
  <Navbar />
  <Hero>
    <RobotArm /> + <HumanoidCharacter /> + <CircuitPattern />
    <ParticleBackground /> (optional)
    <CallToAction buttons with neon styling>
  </Hero>
  <Section> "Explore Chapters" </Section>
  <Footer />
</Page>
```

**Styling**:
- Full-height hero with dark gradient background
- Robot centered, animations running
- Text overlays with neon accent color
- Buttons with glow effect

### Chapter Pages (P2 Priority)

**Structure**:
```
<Page dark-themed>
  <Navbar />
  <Sidebar dark-themed with neon accents>
  <Content>
    <h1> Chapter title </h1>
    <Markdown content with dark theme>
  </Content>
  <Footer />
</Page>
```

**Styling**:
- Dark background (#0a0e27)
- Light text (#e0e0e0) with 4.5:1 contrast
- Sidebar: dark (#050811) with neon link accents on hover
- Code blocks: preserve syntax highlighting (no dark overlay needed)
- Admonitions: dark boxes with neon left border

---

## Animation Sequence Diagram

```
HomePage Load
│
├─> RobotArm starts (4s loop)
│   ├─> 0-1s: Shoulder rotates up
│   ├─> 1-2s: Elbow extends
│   ├─> 2-2.5s: Gripper closes
│   └─> 2.5-4s: Return to start
│
├─> HumanoidCharacter starts (3s loop)
│   ├─> 0-1.5s: Breathe in (move up)
│   └─> 1.5-3s: Breathe out (move down)
│
├─> ParticleBackground spawns (staggered, 20s+ loops)
│   └─> Each particle floats up independently
│
└─> Button hovers (on-demand)
    └─> Glow effect + scale animation on `:hover`
```

---

## Responsive Behavior

### Desktop (1024px+)
- Full robot animations
- All particles visible
- Buttons full-size with glow effects
- Sidebar visible

### Tablet (768px - 1024px)
- Robot animations reduced size but still running
- Fewer particles (reduce motion overhead)
- Buttons slightly smaller
- Sidebar collapsible

### Mobile (<768px)
- Robot animations hidden or simplified (SVG still visible but static)
- Particles disabled (save battery on mobile)
- Buttons stack vertically, touch-friendly size
- Sidebar becomes hamburger menu

**Implementation**:
```css
/* Desktop - full animations */
@media (min-width: 1024px) {
  .robot-arm { animation: robot-arm 4s ease-in-out infinite; }
}

/* Tablet - reduced animations */
@media (max-width: 1023px) {
  .robot-arm {
    animation: robot-arm 5s ease-in-out infinite; /* Slower */
    transform: scale(0.8);
  }
}

/* Mobile - no animations */
@media (max-width: 767px) {
  .robot-arm { animation: none; }
  .particle { display: none; }
}
```

---

## Accessibility Model

### Contrast Ratios (WCAG AA)
- Text (#e0e0e0) on background (#0a0e27): 11.2:1 ✅ WCAG AAA
- Neon accents (#00d4ff) on background: 7.2:1 ✅ WCAG AAA
- Borders (#404040) on background: Sufficient for UI elements

### Motion Sensitivity
- All animations disabled with `prefers-reduced-motion: reduce` ✅
- Static theme fully functional without animations
- Keyboard navigation unaffected

### Screen Readers
- Robot SVGs include `<title>` and `<desc>` elements
- Animations don't interfere with semantic HTML
- Color not sole means of conveying information (e.g., buttons have icons + text)

---

## File Structure

```
src/
├── css/
│   ├── custom.css              # Global theme + color variables
│   ├── futuristic-theme.css    # Color palette definitions
│   └── animations.css          # Keyframe animations (reusable)
│
├── theme/
│   ├── Footer/
│   │   └── index.jsx           # Swizzled footer with dark theme
│   ├── Navbar/
│   │   └── index.jsx           # Swizzled navbar with neon accents
│   └── Layout/
│       └── index.jsx           # Swizzled layout wrapper
│
└── components/
    ├── HomepageHero/
    │   ├── index.jsx           # Hero section component
    │   └── styles.module.css   # Hero-specific styles
    ├── RobotArm/
    │   ├── index.jsx           # Robot arm animation
    │   ├── RobotArm.svg        # SVG graphic
    │   └── styles.module.css   # Animation styles
    ├── HumanoidCharacter/
    │   ├── index.jsx           # Character component
    │   └── styles.module.css   # Breathing animation
    ├── NeonButton/
    │   ├── index.jsx           # Reusable button component
    │   └── styles.module.css   # Glow effect styles
    └── ParticleBackground/
        ├── index.jsx           # Particle animation (optional)
        └── styles.module.css   # Particle styles
```

