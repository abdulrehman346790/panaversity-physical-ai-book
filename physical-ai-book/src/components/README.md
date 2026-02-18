# UI Components - Futuristic Robotics Theme

Feature: 006-futuristic-ui

## Component Tree

```
src/components/
├── RobotArm/                    # Animated SVG robot arm (homepage hero)
│   ├── index.jsx                # Component implementation
│   └── styles.module.css        # CSS Modules (robotArm animation)
│
├── HumanoidCharacter/           # Animated SVG humanoid robot (homepage hero)
│   ├── index.jsx                # Component implementation
│   └── styles.module.css        # CSS Modules (breathe animation)
│
├── HomepageHero/                # Main homepage hero section
│   ├── index.jsx                # Combines RobotArm + HumanoidCharacter + CTAs
│   └── styles.module.css        # Hero layout, circuit background, responsive
│
├── NeonButton/                  # Reusable button with neon glow hover effect
│   ├── index.jsx                # Component implementation
│   └── styles.module.css        # Neon glow on hover, scale transform
│
├── ParticleBackground/          # Floating particle effects background
│   ├── index.jsx                # Particle animation engine (CSS-based)
│   └── styles.module.css        # Particle styles, float animation
│
├── ChatWidget/                  # RAG chatbot widget (feature 002)
├── AuthButton/                  # Auth button (feature 003)
├── AuthModals/                  # Auth modals (feature 003)
├── AuthProvider/                # Auth context provider (feature 003)
├── PersonalizationButton/       # Personalization UI (feature 004)
├── PersonalizationProvider/     # Personalization context (feature 004)
├── TranslationButton/           # Urdu translation button (feature 005)
└── TranslationProvider/         # Translation context (feature 005)
```

## Design System

All components use CSS variables defined in `src/css/futuristic-theme.css`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg-dark` | `#0a0e27` | Primary background |
| `--color-bg-darker` | `#060918` | Darker backgrounds (navbar, footer) |
| `--color-accent-cyan` | `#00d4ff` | Primary accent, links, active states |
| `--color-accent-magenta` | `#ff006e` | Secondary accent, hover states |
| `--color-accent-green` | `#00ff41` | Code, success indicators |
| `--shadow-glow-sm/md/lg` | - | Neon glow effects on elements |
| `--transition-fast/normal/slow` | 150/300/500ms | Consistent transitions |

## Animations

All animations defined in `src/css/animations.css`:

| Animation | Duration | Element |
|-----------|----------|---------|
| `robot-arm-move` | 4s cubic-bezier | RobotArm shoulder joint |
| `breathe` | 3s ease-in-out | HumanoidCharacter torso |
| `float-up` | 6s ease-in-out | Hero container levitation |
| `glow-pulse` | 2s ease-in-out | Buttons and interactive elements |
| `fade-in` | 300ms ease | Page/section transitions |
| `particle-float` | variable | ParticleBackground particles |

## Accessibility

- All animations respect `prefers-reduced-motion: reduce`
- WCAG AA contrast ratios maintained (minimum 4.5:1)
- Screen reader friendly (animations do not affect content structure)
- Keyboard navigation unaffected by hover animations
