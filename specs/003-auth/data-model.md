# Data Model: Authentication & Background Questionnaire (003-auth)

**Date**: 2026-02-15
**Branch**: `003-auth`

## Entities

### User (better-auth core + custom fields)

The user entity stores account information and questionnaire responses. Core fields are managed by better-auth; custom fields are added via `additionalFields`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | Yes | Primary key (auto-generated) |
| name | string | Yes | Display name |
| email | string | Yes | Unique email address |
| emailVerified | boolean | Yes | Email verification status (always false for hackathon) |
| image | string | No | Profile image URL |
| createdAt | datetime | Yes | Account creation timestamp |
| updatedAt | datetime | Yes | Last update timestamp |
| python_experience | string | No | None/Beginner/Intermediate/Advanced |
| cpp_experience | string | No | None/Beginner/Intermediate/Advanced |
| ros2_experience | string | No | None/Beginner/Intermediate/Advanced |
| robot_hardware_experience | string | No | None/Beginner/Intermediate/Advanced |
| sensor_experience | string | No | None/Beginner/Intermediate/Advanced |
| questionnaire_completed | boolean | No | Whether questionnaire has been filled (default: false) |

**Constraints**:
- email must be unique
- experience fields accept only: "none", "beginner", "intermediate", "advanced"

### Session (better-auth managed)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Primary key |
| userId | string (FK → user.id) | Yes | Associated user |
| token | string | Yes | Unique session token |
| expiresAt | datetime | Yes | Session expiry (7 days default) |
| ipAddress | string | No | Client IP |
| userAgent | string | No | Client user agent |
| createdAt | datetime | Yes | Session creation time |
| updatedAt | datetime | Yes | Last activity time |

### Account (better-auth managed)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Primary key |
| userId | string (FK → user.id) | Yes | Associated user |
| accountId | string | Yes | Provider-specific account ID |
| providerId | string | Yes | Auth provider ("credential" for email/password) |
| password | string | No | Hashed password (for email/password auth) |
| createdAt | datetime | Yes | Creation timestamp |
| updatedAt | datetime | Yes | Update timestamp |

### Verification (better-auth managed)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Primary key |
| identifier | string | Yes | What's being verified (email) |
| value | string | Yes | Verification token |
| expiresAt | datetime | Yes | Token expiry |
| createdAt | datetime | Yes | Creation timestamp |
| updatedAt | datetime | Yes | Update timestamp |

## Relationships

```
User 1 ──── N Session (one user has many sessions)
User 1 ──── N Account (one user has many auth providers)
```

## State Transitions

### User Questionnaire State
```
Account Created → questionnaire_completed: false
                  ↓
Questionnaire Submitted → questionnaire_completed: true
                          (experience fields populated)
                  ↓
Profile Updated → experience fields updated
                  (questionnaire_completed stays true)
```

### Session Lifecycle
```
Sign In → Session Created (token + expiry)
        → Session Active (until expiry or signout)
        → Sign Out → Session Deleted
        → Expired → Session Invalid (auto-cleaned)
```
