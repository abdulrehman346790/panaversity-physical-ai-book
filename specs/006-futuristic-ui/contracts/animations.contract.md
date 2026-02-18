# CSS Animation Contract

**Purpose**: Define standardized animation specifications for consistent futuristic feel
**Version**: 1.0
**Date**: 2026-02-18

---

## Animation Registry

### Core Animations

#### 1. Robot Arm Movement

```
Name: robot-arm-move
Duration: 4000ms (4s)
Timing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
Loop: infinite
Transform Origin: 50% 100%
Performance: 60 FPS (GPU-accelerated with transform)
Accessibility: Disabled via @media (prefers-reduced-motion: reduce)
```

**Keyframes**:
| % | Transform |
|----|-----------|
| 0% | rotate(0deg) translateY(0) |
| 25% | rotate(45deg) translateY(-10px) |
| 50% | rotate(45deg) translateY(-15px) |
| 75% | rotate(25deg) translateY(-5px) |
| 100% | rotate(0deg) translateY(0) |

**CSS**:
```css
@keyframes robot-arm-move {
  0% { transform: rotate(0deg) translateY(0); }
  25% { transform: rotate(45deg) translateY(-10px); }
  50% { transform: rotate(45deg) translateY(-15px); }
  75% { transform: rotate(25deg) translateY(-5px); }
  100% { transform: rotate(0deg) translateY(0); }
}

.robot-arm {
  animation: robot-arm-move 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  transform-origin: 50% 100%;
  will-change: transform;
}
```

---

#### 2. Character Breathing

```
Name: breathe
Duration: 3000ms (3s)
Timing: ease-in-out
Loop: infinite
Transform: translateY (vertical movement only)
Performance: 60 FPS (will-change optimized)
Accessibility: Disabled via @media (prefers-reduced-motion: reduce)
```

**Keyframes**:
| % | Transform | Opacity |
|----|-----------|---------|
| 0% | translateY(0px) | 1.0 |
| 50% | translateY(-8px) | 0.95 |
| 100% | translateY(0px) | 1.0 |

**CSS**:
```css
@keyframes breathe {
  0%, 100% { transform: translateY(0px); opacity: 1; }
  50% { transform: translateY(-8px); opacity: 0.95; }
}

.humanoid {
  animation: breathe 3s ease-in-out infinite;
  will-change: transform;
}
```

---

#### 3. Neon Glow Pulse

```
Name: glow-pulse
Duration: 2000ms (2s)
Timing: ease-in-out
Loop: infinite
Property: box-shadow (intensity variation)
Performance: 60 FPS
Accessibility: Disabled via prefers-reduced-motion
```

**Keyframes**:
| % | box-shadow |
|----|-----------|
| 0% | 0 0 5px var(--color-accent-cyan) |
| 50% | 0 0 20px var(--color-accent-cyan) |
| 100% | 0 0 5px var(--color-accent-cyan) |

**CSS**:
```css
@keyframes glow-pulse {
  0% { box-shadow: 0 0 5px var(--color-accent-cyan); }
  50% { box-shadow: 0 0 20px var(--color-accent-cyan); }
  100% { box-shadow: 0 0 5px var(--color-accent-cyan); }
}

.neon-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

---

#### 4. Page Transition

```
Name: fade-in
Duration: 300ms
Timing: ease-out
Loop: once (on page mount)
Properties: opacity + transform
Performance: 60 FPS
Accessibility: Enabled even in prefers-reduced-motion (brief, not distracting)
```

**Keyframes**:
| % | Opacity | Transform |
|----|---------|-----------|
| from | 0 | translateY(10px) |
| to | 1 | translateY(0) |

**CSS**:
```css
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
```

---

#### 5. Floating Particles

```
Name: float
Duration: 20000ms (20s)
Timing: linear
Loop: infinite
Path: translateY (100vh to -100vh) + translateX drift
Performance: 60 FPS with will-change
Accessibility: Disabled via prefers-reduced-motion
```

**Keyframes**:
| % | Transform | Opacity |
|----|-----------|---------|
| from | translateY(100vh) translateX(0px) | 0 |
| to | translateY(-100vh) translateX(20px) | 1 |

**CSS**:
```css
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
```

---

#### 6. Button Glow on Hover

```
Name: button-glow
Duration: 200ms
Timing: ease-out
Loop: once (on hover)
Property: box-shadow expansion
Performance: 60 FPS
Accessibility: Enabled (brief, essential feedback)
```

**Keyframes**:
| % | box-shadow |
|----|-----------|
| from | 0 0 10px var(--color-accent-cyan) |
| to | 0 0 20px var(--color-accent-cyan), inset 0 0 10px rgba(0, 212, 255, 0.2) |

**CSS**:
```css
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
  transition: all 150ms ease;
}
```

---

## Transition Specifications

### Standard Transitions

| Class | Property | Duration | Timing |
|-------|----------|----------|--------|
| `.link-hover` | color, text-shadow | 200ms | ease |
| `.button-hover` | all | 200ms | ease |
| `.sidebar-item-hover` | color, box-shadow | 150ms | ease |
| `.menu-expand` | max-height | 300ms | ease-out |
| `.fade-text` | opacity | 150ms | ease |

**CSS**:
```css
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}

a {
  transition: color var(--transition-normal), text-shadow var(--transition-normal);
}

.button {
  transition: all var(--transition-fast);
}

.sidebar__item {
  transition: color var(--transition-fast), box-shadow var(--transition-fast);
}
```

---

## Performance Guidelines

### GPU Acceleration Properties

Use only these properties for animations (hardware-accelerated):
- ✅ `transform` (translate, rotate, scale, skew)
- ✅ `opacity`
- ✅ `filter`

❌ **Avoid** (causes repaints/reflows):
- ❌ `top`, `left`, `width`, `height` (position/size changes)
- ❌ `background-color` (repaint required)
- ❌ `box-shadow` (use sparingly, not on high-frequency)

### will-change Hint

```css
/* Add to elements with complex animations */
.robot-arm {
  will-change: transform;
}

.humanoid {
  will-change: transform;
}

/* Avoid will-change on too many elements (limits browser optimization) */
```

### Performance Testing

```javascript
// In browser DevTools:
// 1. Open Performance tab
// 2. Record page load + animations
// 3. Check FPS meter (should maintain 60 FPS)
// 4. Look for "jank" (dropped frames, red bars)
```

---

## Accessibility Compliance

### Respecting User Motion Preferences

**WCAG 2.1 Success Criterion 2.3.3**

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations for users with motion sensitivity */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep focus/feedback animations (brief, essential) */
  .button:focus,
  .button:active {
    animation: none !important;
    box-shadow: 0 0 2px var(--color-accent-cyan);
  }
}
```

### Testing Motion Preferences

**macOS**:
- System Preferences > Accessibility > Display > Reduce motion ✓

**Windows 10/11**:
- Settings > Ease of Access > Display > Show animations toggle

**Browser DevTools**:
- Chrome: Rendering tab > "Emulate CSS media feature preference" > select "prefers-reduced-motion: reduce"

---

## Animation Stagger (for Multiple Elements)

**Pattern for staggered animations**:

```css
.particle:nth-child(1) { animation-delay: 0s; }
.particle:nth-child(2) { animation-delay: 0.5s; }
.particle:nth-child(3) { animation-delay: 1s; }
.particle:nth-child(4) { animation-delay: 1.5s; }
/* ... etc */
```

**Or dynamically in JavaScript**:
```javascript
const particles = document.querySelectorAll('.particle');
particles.forEach((p, i) => {
  p.style.animationDelay = `${i * 0.5}s`;
});
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Animations | 43+ | 16+ | 9+ | 12+ |
| CSS Transforms | 26+ | 16+ | 9+ | 12+ |
| will-change | 36+ | 36+ | 9.1+ | 15+ |
| @media (prefers-reduced-motion) | 74+ | 63+ | 10.1+ | 79+ |

**Fallback Strategy**: Static animations on older browsers (no visual degradation, just no motion)

