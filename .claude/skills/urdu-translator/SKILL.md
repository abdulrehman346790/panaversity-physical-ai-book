---
name: urdu-translator
description: Translates chapter content to Urdu with a per-chapter button. Use when implementing the Urdu translation feature, RTL layout support, or the translation API.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Urdu Translation Skill

You are an expert in implementing multilingual content translation. You implement the per-chapter Urdu translation feature for the Physical AI textbook.

## How It Works

1. Logged-in user clicks "اردو میں پڑھیں" (Read in Urdu) button at the top of each chapter
2. Chapter content is sent to the translation API
3. Content is translated to Urdu while preserving:
   - Code blocks (NOT translated)
   - Technical terms (kept in English with Urdu transliteration)
   - Markdown formatting
   - Diagrams and images
4. Translated content replaces the default English content
5. Layout switches to RTL (Right-to-Left)

## Translation Rules

### What Gets Translated
- Headings and paragraphs
- Bullet points and numbered lists
- Admonitions (tip, note, warning text)
- Exercise instructions
- Review questions

### What Does NOT Get Translated
- Code blocks and inline code
- Variable names and function names
- CLI commands
- URLs and links
- File paths
- Technical acronyms (ROS, URDF, SLAM, IMU, etc.)

### Technical Terms Handling
Keep English technical term with Urdu transliteration in parentheses on first use:
- Robot Operating System (روبوٹ آپریٹنگ سسٹم - ROS)
- Artificial Intelligence (مصنوعی ذہانت - AI)
- Simulation (سمیولیشن)
- Sensor (سینسر)

## Architecture

```
┌──────────────────────────────────────────┐
│         Docusaurus Chapter Page          │
│  ┌────────────────────────────────────┐  │
│  │  [اردو میں پڑھیں]  button        │  │
│  └──────────────┬─────────────────────┘  │
│                 │ click                   │
│  ┌──────────────▼─────────────────────┐  │
│  │  TranslateButton component         │  │
│  │  1. Get chapter Markdown content   │  │
│  │  2. Call /api/translate            │  │
│  │  3. Switch to RTL layout           │  │
│  │  4. Replace content with Urdu      │  │
│  └──────────────┬─────────────────────┘  │
└─────────────────┼────────────────────────┘
                  │ POST
                  ▼
┌──────────────────────────────────────────┐
│          FastAPI Backend                 │
│  POST /api/translate                     │
│  {                                       │
│    chapter_id: "module-1/03-nodes",      │
│    content: "# Chapter content...",      │
│    target_lang: "ur"                     │
│  }                                       │
│                                          │
│  → Parse content into translatable       │
│    segments and code blocks              │
│  → Translate text segments via OpenAI    │
│  → Reassemble with code blocks intact    │
│  → Cache translation in Neon Postgres    │
│  → Return translated Markdown            │
└──────────────────────────────────────────┘
```

## API Endpoint

```python
@router.post("/api/translate")
async def translate_chapter(request: TranslateRequest):
    # 1. Check cache first
    cached = await get_cached_translation(
        request.chapter_id, request.target_lang
    )
    if cached:
        return TranslateResponse(content=cached, cached=True)

    # 2. Parse content - separate code from text
    segments = parse_translatable_segments(request.content)

    # 3. Translate only text segments
    translated_segments = []
    for segment in segments:
        if segment.type == "code":
            translated_segments.append(segment)  # Keep code as-is
        else:
            translated = await translate_text(segment.text, "ur")
            translated_segments.append(
                Segment(type="text", text=translated)
            )

    # 4. Reassemble
    result = reassemble_segments(translated_segments)

    # 5. Cache in Neon Postgres
    await cache_translation(request.chapter_id, "ur", result)

    return TranslateResponse(content=result, cached=False)


def parse_translatable_segments(content: str) -> list[Segment]:
    """Split markdown into code blocks and text segments."""
    segments = []
    parts = re.split(r'(```[\s\S]*?```|`[^`]+`)', content)
    for part in parts:
        if part.startswith('```') or part.startswith('`'):
            segments.append(Segment(type="code", text=part))
        else:
            segments.append(Segment(type="text", text=part))
    return segments


async def translate_text(text: str, target_lang: str) -> str:
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"""You are an expert Urdu translator
for technical educational content. Translate the following to Urdu.

Rules:
- Keep technical terms in English with Urdu transliteration in parentheses on first use
- Do NOT translate code, variable names, commands, or file paths
- Keep Markdown formatting intact (headings, lists, bold, etc.)
- Use formal Urdu suitable for a university textbook
- Preserve all links and URLs as-is
- Keep acronyms (ROS, SLAM, IMU, GPU, etc.) in English"""},
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content
```

## RTL CSS Support

```css
/* src/css/urdu-rtl.css */
.chapter-content[dir="rtl"] {
  direction: rtl;
  text-align: right;
  font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
  font-size: 1.1rem;
  line-height: 2;
}

.chapter-content[dir="rtl"] code,
.chapter-content[dir="rtl"] pre {
  direction: ltr;
  text-align: left;
  font-family: 'Fira Code', monospace;
}

.chapter-content[dir="rtl"] .admonition {
  border-left: none;
  border-right: 4px solid var(--ifm-color-primary);
  padding-right: 1rem;
}
```

## React Component

```jsx
// src/components/TranslateButton/index.jsx
import React, { useState } from 'react';
import { useSession } from '../Auth/AuthProvider';

export default function TranslateButton() {
  const { user } = useSession();
  const [isUrdu, setIsUrdu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState(null);

  const handleTranslate = async () => {
    if (!user) {
      alert('Please sign in to use translation');
      return;
    }

    if (isUrdu) {
      restoreOriginalContent(originalContent);
      document.querySelector('.chapter-content')?.removeAttribute('dir');
      setIsUrdu(false);
      return;
    }

    setLoading(true);
    const content = getCurrentChapterContent();
    setOriginalContent(content);

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapter_id: window.location.pathname,
        content: content,
        target_lang: 'ur'
      }),
      credentials: 'include',
    });

    const translated = await response.json();
    replaceChapterContent(translated.content);
    document.querySelector('.chapter-content')?.setAttribute('dir', 'rtl');
    setIsUrdu(true);
    setLoading(false);
  };

  return (
    <button onClick={handleTranslate} disabled={loading}>
      {loading ? 'ترجمہ ہو رہا ہے...' :
       isUrdu ? '🔄 English' : '🌐 اردو میں پڑھیں'}
    </button>
  );
}
```

## Caching Strategy

### Postgres Cache Table

```sql
CREATE TABLE chapter_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id VARCHAR(255) NOT NULL,
  target_lang VARCHAR(10) NOT NULL DEFAULT 'ur',
  original_hash VARCHAR(64) NOT NULL,  -- SHA-256 of original content
  translated_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, target_lang, original_hash)
);
```

- Cache translations in Postgres to avoid repeated API calls
- Invalidate when content hash changes (chapter updated)
- Pre-translate popular chapters during ingestion
