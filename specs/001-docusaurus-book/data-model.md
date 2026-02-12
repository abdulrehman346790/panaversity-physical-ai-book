# Data Model: Docusaurus Physical AI Textbook

This feature is a static site (no database). The "data model" maps to the file system structure and MDX frontmatter schema.

## Entities

### Module (Directory)

Represents a thematic section of the course. Mapped to a directory under `docs/`.

| Attribute | Type | Description |
|-----------|------|-------------|
| label | string | Display name in sidebar (e.g., "Module 1: The Robotic Nervous System") |
| position | integer | Order in sidebar (1-5) |
| collapsed | boolean | Whether section starts collapsed in sidebar |
| description | string | Summary shown in generated index page |
| directory | path | `docs/<module-slug>/` |

**File**: `docs/<module-slug>/_category_.json`

### Chapter (MDX File)

Represents a single lesson within a module.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| sidebar_position | integer | Yes | Order within the module |
| title | string | Yes | Chapter title |
| description | string | Yes | SEO description (150-160 chars) |
| keywords | string[] | Yes | SEO keywords |
| content_body | markdown | Yes | Main chapter content (2000+ words) |
| learning_objectives | string[] | Yes | What student will learn |
| prerequisites | string[] | Yes | Required prior knowledge |
| exercises | Exercise[] | Yes | At least 1 hands-on exercise |
| takeaways | string[] | Yes | Summary bullet points |
| review_questions | string[] | Yes | Comprehension check questions |

**File**: `docs/<module-slug>/<position>-<slug>.mdx`

### Exercise (Embedded in Chapter)

An interactive learning activity within a chapter.

| Attribute | Type | Description |
|-----------|------|-------------|
| title | string | Exercise name |
| instructions | string[] | Step-by-step directions |
| expected_output | string | What the student should see |
| troubleshooting | string[] | Common issues and fixes |

### Appendix (MDX File)

Supplementary reference material.

| Attribute | Type | Description |
|-----------|------|-------------|
| sidebar_position | integer | Order within appendices |
| title | string | Appendix title |
| content | markdown | Reference content |

**File**: `docs/appendices/<position>-<slug>.mdx`

## Relationships

```
Course (root)
├── Module 1 (directory) → contains Chapters 1-5
├── Module 2 (directory) → contains Chapters 6-7
├── Module 3 (directory) → contains Chapters 8-10
├── Module 4 (directory) → contains Chapters 11-13
└── Appendices (directory) → contains 3 appendices
    Each Chapter → contains 1+ Exercises
    Each Chapter → references Prerequisites (other Chapters)
```

## Content Volume

| Module | Chapters | Estimated Words |
|--------|----------|-----------------|
| Intro (Weeks 1-2) | 2 | 4,000-6,000 |
| Module 1: ROS 2 (Weeks 3-5) | 3 | 6,000-12,000 |
| Module 2: Simulation (Weeks 6-7) | 2 | 4,000-8,000 |
| Module 3: NVIDIA Isaac (Weeks 8-10) | 3 | 6,000-12,000 |
| Module 4: VLA (Weeks 11-13) | 3 | 6,000-12,000 |
| Appendices | 3 | 3,000-6,000 |
| **Total** | **16** | **29,000-56,000** |
