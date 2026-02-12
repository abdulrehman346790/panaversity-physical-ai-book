---
paths:
  - "docs/**/*.mdx"
  - "docs/**/*.md"
---

# Docusaurus Content Rules

## Every MDX file MUST have
```yaml
---
sidebar_position: <number>
title: "<Title>"
description: "<150-160 char description>"
keywords: [keyword1, keyword2]
---
```

## Formatting
- Use `:::tip`, `:::note`, `:::warning`, `:::danger` for callouts
- Code blocks must have language tag: ```python, ```bash, ```yaml, etc.
- Use `title="filename.py"` on code blocks to show filenames
- Mermaid blocks: ```mermaid
- Keep paragraphs to 3-5 sentences
- Use tables for comparisons

## Imports for interactive components
```mdx
import PersonalizeButton from '@site/src/components/PersonalizeButton';
import TranslateButton from '@site/src/components/TranslateButton';

<PersonalizeButton />
<TranslateButton />
```

## Cross-references
- Use relative links: `[ROS 2 Basics](../module-1-ros2/02-ros2-architecture.mdx)`
- Never use absolute URLs for internal links
