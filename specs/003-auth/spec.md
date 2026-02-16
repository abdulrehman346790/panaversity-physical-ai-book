# Feature Specification: Authentication & Background Questionnaire

**Feature Branch**: `003-auth`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "better-auth signup/signin with background questionnaire collecting user's software experience (Python, C++, ROS) and hardware experience (robots, sensors) at signup to enable content personalization"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign Up with Email and Password (Priority: P1)

A new student visiting the Physical AI textbook wants to create an account. They click a "Sign Up" button visible on the book pages, fill in their email address and password, and submit the form. The system creates their account and signs them in automatically.

**Why this priority**: Without signup, no user accounts exist. This is the foundation for all other auth features and for storing the background questionnaire data that enables personalization.

**Independent Test**: Can be fully tested by clicking Sign Up, entering email/password, submitting, and verifying the user is signed in with a visible profile indicator. Delivers immediate account creation value.

**Acceptance Scenarios**:

1. **Given** a student is on any book page and is not signed in, **When** they click "Sign Up", **Then** a signup form appears requesting email and password.
2. **Given** the signup form is open, **When** the student enters a valid email and password (minimum 8 characters) and submits, **Then** an account is created and they are automatically signed in.
3. **Given** the signup form is open, **When** the student enters an email that is already registered, **Then** the system displays a clear error message ("An account with this email already exists") and suggests signing in instead.
4. **Given** the signup form is open, **When** the student enters an invalid email or a password shorter than 8 characters, **Then** the system displays inline validation errors before submission.

---

### User Story 2 - Sign In and Sign Out (Priority: P1)

A returning student wants to sign in to their existing account. They click "Sign In", enter their email and password, and are authenticated. They can also sign out when they want.

**Why this priority**: Equal to P1 because returning users must be able to access their accounts. Without signin, signup is pointless — users can only use the system once.

**Independent Test**: Can be tested by creating an account (US1), signing out, then signing back in with the same credentials and verifying the session is restored.

**Acceptance Scenarios**:

1. **Given** a student has an existing account, **When** they click "Sign In" and enter their email and password, **Then** they are authenticated and see their profile indicator.
2. **Given** a student is signed in, **When** they click "Sign Out", **Then** their session ends and the UI reverts to showing Sign Up/Sign In buttons.
3. **Given** a student enters incorrect credentials, **When** they submit the sign-in form, **Then** the system displays "Invalid email or password" without revealing which field is wrong.
4. **Given** a student is signed in and closes the browser, **When** they return to the book within a reasonable time, **Then** their session persists and they remain signed in.

---

### User Story 3 - Background Questionnaire at Signup (Priority: P2)

After a student successfully creates an account, they are presented with a background questionnaire that collects their experience levels. The questionnaire asks about software experience (Python, C++, ROS 2) and hardware experience (robots, sensors). This data is stored in their profile and used later for content personalization.

**Why this priority**: The questionnaire is the bridge between auth and personalization. However, it's not required for account creation — the system should work without it (users can skip it). It's an enhancement that enables feature 004-personalization.

**Independent Test**: Can be tested by completing signup, verifying the questionnaire appears, filling it out, and confirming the responses are saved to the user's profile. Also test skipping the questionnaire.

**Acceptance Scenarios**:

1. **Given** a student has just completed signup, **When** the account is created, **Then** a background questionnaire modal appears asking about their experience.
2. **Given** the questionnaire is displayed, **When** the student rates their Python experience (None/Beginner/Intermediate/Advanced), C++ experience, ROS 2 experience, robot hardware experience, and sensor experience, **Then** each selection is captured.
3. **Given** the questionnaire is displayed, **When** the student clicks "Skip for now", **Then** the questionnaire closes, the account is fully functional, and they can complete the questionnaire later from their profile.
4. **Given** the student has completed the questionnaire, **When** the data is submitted, **Then** all responses are saved to their user profile and a confirmation message appears.

---

### User Story 4 - View and Edit Profile (Priority: P3)

A signed-in student wants to view their profile information or update their background questionnaire answers. They click on their profile indicator and see their email and questionnaire responses, with the ability to edit them.

**Why this priority**: Profile management is a nice-to-have. The core flow (signup -> questionnaire -> personalization) works without it, but students should be able to correct their answers if they change their experience level.

**Independent Test**: Can be tested by signing in, opening the profile, verifying stored questionnaire data is displayed correctly, editing an answer, saving, and confirming the update persists.

**Acceptance Scenarios**:

1. **Given** a student is signed in, **When** they click their profile indicator, **Then** a profile panel shows their email and background questionnaire responses.
2. **Given** the profile panel is open, **When** the student changes their Python experience from "Beginner" to "Intermediate" and saves, **Then** the updated response is persisted.
3. **Given** a student skipped the questionnaire at signup, **When** they open their profile, **Then** they see the questionnaire with an option to complete it now.

---

### Edge Cases

- What happens when the authentication service is unreachable? The UI should display "Authentication service is currently unavailable" and allow read-only book access.
- What happens when a student's session expires? The system should silently clear the session and show Sign In/Sign Up buttons without disrupting the reading experience.
- What happens when a student tries to submit the questionnaire with no answers selected? The system should allow it (all fields are optional) and treat unanswered questions as "Not specified".
- What happens when a student opens the book in multiple tabs? Session state should be consistent — signing out in one tab should reflect in other tabs on next interaction.
- What happens when the password reset flow is needed? Password reset via email is out of scope for the hackathon. Students can create a new account.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a signup flow that accepts email address and password to create a new user account.
- **FR-002**: System MUST provide a signin flow that authenticates returning users with email and password.
- **FR-003**: System MUST provide a signout action that ends the current user session.
- **FR-004**: System MUST persist user sessions so that returning users within a reasonable timeframe remain signed in.
- **FR-005**: System MUST display a background questionnaire after successful signup to collect the student's experience levels.
- **FR-006**: System MUST collect software experience ratings for: Python, C++, and ROS 2, each on a scale of None/Beginner/Intermediate/Advanced.
- **FR-007**: System MUST collect hardware experience ratings for: robot hardware and sensors/microcontrollers, each on a scale of None/Beginner/Intermediate/Advanced.
- **FR-008**: System MUST allow students to skip the questionnaire at signup and complete it later from their profile.
- **FR-009**: System MUST store questionnaire responses in the user's profile for retrieval by the personalization feature.
- **FR-010**: System MUST validate email format and enforce a minimum password length of 8 characters with inline error feedback.
- **FR-011**: System MUST display the authentication state clearly — showing Sign Up/Sign In for unauthenticated users and a profile indicator for authenticated users.
- **FR-012**: System MUST allow authenticated users to view and edit their background questionnaire responses.
- **FR-013**: System MUST gracefully degrade when the auth service is unavailable — the book remains fully readable without authentication.
- **FR-014**: System MUST work from the GitHub Pages hosted book, communicating with the auth backend via cross-origin requests.
- **FR-015**: System MUST use secure session management with HTTP-only cookies.

### Key Entities

- **User Account**: A registered student. Attributes: email address, hashed password, creation timestamp, last signin timestamp.
- **Background Profile**: A student's self-reported experience levels. Attributes: Python experience, C++ experience, ROS 2 experience, robot hardware experience, sensor experience, completion status, last updated timestamp.
- **User Session**: An active authentication session. Attributes: session token, associated user, creation timestamp, expiry timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can complete the signup process (account creation) within 60 seconds.
- **SC-002**: Students can sign in to an existing account within 30 seconds.
- **SC-003**: The background questionnaire can be completed in under 2 minutes.
- **SC-004**: 100% of questionnaire responses are correctly stored and retrievable from the user's profile.
- **SC-005**: Sessions persist across browser restarts for at least 7 days.
- **SC-006**: The book remains fully readable and functional when the auth service is unavailable.
- **SC-007**: Auth UI elements (Sign Up/Sign In buttons, profile indicator) are visible and functional within 3 seconds of page load.

## Assumptions

- better-auth is the mandated authentication library (per constitution/tech stack).
- Email verification is not required for the hackathon demo — accounts are immediately active after signup.
- Password reset functionality is out of scope for the hackathon.
- OAuth/social login providers are not required — email/password is sufficient.
- The auth backend runs alongside the chatbot backend (same FastAPI service or separate).
- The background questionnaire has exactly 5 questions (3 software, 2 hardware), each with 4 fixed options (None/Beginner/Intermediate/Advanced).
- The personalization feature (004) will read the background profile data stored by this feature.

## Dependencies

- **001-docusaurus-book**: The book UI must exist to embed auth components (DONE).
- **External service**: Auth backend requires a database for user accounts and sessions.
- **002-rag-chatbot**: No hard dependency — auth and chatbot are independent. However, if deployed on the same backend, they share infrastructure.

## Out of Scope

- Content personalization logic (covered by feature 004-personalization)
- Email verification and password reset flows
- OAuth/social login (Google, GitHub, etc.)
- Admin user management dashboard
- Role-based access control (all authenticated users are equal)
- User analytics and login tracking dashboards
- Two-factor authentication (2FA)
