---
name: content-personalizer
description: Personalizes chapter content based on user's software and hardware background. Use when implementing the per-chapter personalization button or the content adaptation logic.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Content Personalizer

You are an expert in building content personalization systems. You implement the per-chapter personalization feature for the Physical AI textbook.

## How It Works

1. Logged-in user clicks "Personalize for Me" button at the top of a chapter
2. System fetches user's background profile (from `user_profiles` table)
3. Chapter content is sent to an LLM with the user's profile context
4. LLM adapts the content to the user's level and hardware
5. Personalized content replaces the default content in the UI

## Personalization Rules

### Based on Programming Level

| Level | Adaptation |
|-------|-----------|
| Beginner | Add more explanation for code, explain syntax, include setup steps |
| Intermediate | Standard content, brief explanations |
| Advanced | Skip basics, focus on advanced patterns, show optimizations |
| Expert | Minimal explanation, focus on edge cases and architecture |

### Based on Hardware

| Hardware | Adaptation |
|----------|-----------|
| Has RTX GPU | Show native Isaac Sim workflows |
| No RTX GPU | Emphasize cloud alternatives (AWS RoboMaker, Omniverse Cloud) |
| Has Jetson | Include Jetson deployment examples |
| No Jetson | Focus on simulation-only workflows |
| Has Robot | Include real-hardware exercises |
| No Robot | Focus on simulation capstone |

### Based on Language Experience

| Known Languages | Adaptation |
|----------------|-----------|
| Python only | Standard (course is Python-primary) |
| C++ | Add C++ ROS 2 equivalents, mention ament_cmake |
| JavaScript | Draw web dev analogies (pub/sub ≈ event emitters) |
| No Python | Add Python crash-course boxes |

## Architecture

```
┌──────────────────────────────────────────┐
│         Docusaurus Chapter Page          │
│  ┌────────────────────────────────────┐  │
│  │  [🎯 Personalize for Me]  button  │  │
│  └──────────────┬─────────────────────┘  │
│                 │ click                   │
│  ┌──────────────▼─────────────────────┐  │
│  │  PersonalizeButton component       │  │
│  │  1. Get user profile from context  │  │
│  │  2. Get current chapter content    │  │
│  │  3. Call /api/personalize          │  │
│  │  4. Replace content in DOM         │  │
│  └──────────────┬─────────────────────┘  │
└─────────────────┼────────────────────────┘
                  │ POST
                  ▼
┌──────────────────────────────────────────┐
│          FastAPI Backend                 │
│  POST /api/personalize                   │
│  {                                       │
│    chapter_id: "module-1/03-nodes",      │
│    user_id: "uuid",                      │
│    content: "# Chapter content..."       │
│  }                                       │
│                                          │
│  → Fetch user_profile from Neon          │
│  → Build personalization prompt          │
│  → Stream adapted content via OpenAI     │
│  → Return personalized Markdown          │
└──────────────────────────────────────────┘
```

## API Endpoint

```python
@router.post("/api/personalize")
async def personalize_chapter(request: PersonalizeRequest):
    # 1. Get user profile
    profile = await get_user_profile(request.user_id)

    # 2. Build system prompt based on profile
    system_prompt = build_personalization_prompt(profile)

    # 3. Call OpenAI to adapt content
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Adapt this chapter:\n\n{request.content}"}
        ],
        stream=True
    )

    return StreamingResponse(stream_response(response))


def build_personalization_prompt(profile: UserProfile) -> str:
    return f"""You are an expert educator adapting textbook content.

Student Profile:
- Programming: {profile.programming_level}
- Languages: {', '.join(profile.known_languages)}
- Linux: {profile.linux_experience}
- AI/ML: {profile.ai_ml_experience}
- Robotics: {profile.robotics_experience}
- Has NVIDIA GPU: {profile.has_nvidia_gpu} ({profile.gpu_model or 'N/A'})
- Has Jetson: {profile.has_jetson} ({profile.jetson_model or 'N/A'})
- Has Robot: {profile.has_robot_hardware}
- Goal: {profile.primary_goal}

Adaptation Rules:
1. Adjust technical depth to match their programming level
2. Use analogies from languages they know
3. If they lack an RTX GPU, replace Isaac Sim sections with cloud alternatives
4. If they have a Jetson, add Jetson-specific deployment notes
5. If beginner in Linux, add terminal command explanations
6. Keep the same chapter structure (headings, code blocks, exercises)
7. Output valid Markdown with the same formatting conventions
8. Do NOT remove any content - only adapt, explain more, or add relevant context"""
```

## React Component

```jsx
// src/components/PersonalizeButton/index.jsx
import React, { useState } from 'react';
import { useSession } from '../Auth/AuthProvider';

export default function PersonalizeButton() {
  const { user } = useSession();
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState(null);

  const handlePersonalize = async () => {
    if (!user) {
      alert('Please sign in to personalize content');
      return;
    }

    if (isPersonalized) {
      // Restore original
      restoreOriginalContent(originalContent);
      setIsPersonalized(false);
      return;
    }

    setLoading(true);
    const content = getCurrentChapterContent();
    setOriginalContent(content);

    const response = await fetch('/api/personalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapter_id: window.location.pathname,
        content: content,
      }),
      credentials: 'include',
    });

    const personalized = await response.json();
    replaceChapterContent(personalized.content);
    setIsPersonalized(true);
    setLoading(false);
  };

  return (
    <button onClick={handlePersonalize} disabled={loading}>
      {loading ? 'Personalizing...' :
       isPersonalized ? '↩ Show Original' : '🎯 Personalize for Me'}
    </button>
  );
}
```

## Caching Strategy

- Cache personalized content in `localStorage` keyed by `userId + chapterId`
- Invalidate cache when user updates their profile
- TTL: 24 hours
- This avoids repeated API calls for the same chapter
