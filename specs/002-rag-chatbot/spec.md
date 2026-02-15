# Feature Specification: RAG Chatbot for Physical AI Textbook

**Feature Branch**: `002-rag-chatbot`
**Created**: 2026-02-13
**Status**: Draft
**Input**: User description: "RAG chatbot with FastAPI backend, Qdrant vector search, and OpenAI Agents SDK for the Physical AI textbook"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a Question About Course Content (Priority: P1)

A student reading the Physical AI & Humanoid Robotics textbook wants to ask a question about course material. They open the chatbot widget embedded in the book page, type a question like "What is the difference between ROS 2 topics and services?", and receive an accurate answer grounded in the textbook content with chapter/section citations.

**Why this priority**: This is the core value proposition. Without the ability to ask questions and get textbook-grounded answers, there is no chatbot. This single story delivers the complete RAG pipeline end-to-end.

**Independent Test**: Can be fully tested by opening the chatbot widget, typing a question about any chapter topic, and verifying the response is accurate, relevant, and cites the source chapter/section. Delivers immediate study assistance value.

**Acceptance Scenarios**:

1. **Given** the chatbot widget is open on any book page, **When** the student types "What is a ROS 2 node?" and submits, **Then** the chatbot returns an accurate answer based on textbook content within 10 seconds, citing the relevant chapter and section.
2. **Given** the chatbot widget is open, **When** the student asks a question about a topic covered in the book, **Then** the response includes at least one source citation (chapter name and section).
3. **Given** the chatbot widget is open, **When** the student asks a question completely unrelated to the textbook (e.g., "What's the weather?"), **Then** the chatbot politely declines and redirects to course-related topics.
4. **Given** the chatbot widget is open, **When** the student submits a question, **Then** the response streams incrementally (word-by-word/chunk-by-chunk) so the student sees progress immediately rather than waiting for the full response.

---

### User Story 2 - Multi-Turn Conversation (Priority: P2)

A student asks a follow-up question that references the previous exchange. For example, after asking about ROS 2 nodes, they ask "How do I create one in Python?" The chatbot remembers the prior context and provides a relevant continuation without the student re-explaining.

**Why this priority**: Conversation memory transforms the chatbot from a simple Q&A tool into a tutoring experience. Without it, every question is isolated and the student must constantly re-provide context.

**Independent Test**: Can be tested by asking an initial question, then a follow-up that uses pronouns or references ("it", "that", "more detail"), and verifying the response correctly uses prior context.

**Acceptance Scenarios**:

1. **Given** the student has asked "What is Gazebo?" and received an answer, **When** they ask "How does it integrate with ROS 2?", **Then** the chatbot correctly interprets "it" as Gazebo and answers about Gazebo-ROS 2 integration.
2. **Given** a conversation is in progress, **When** the student asks up to 10 follow-up questions, **Then** the chatbot maintains context across all turns within the same session.
3. **Given** the student closes the browser and returns later, **When** they start a new chat session, **Then** a fresh conversation begins (no stale context from prior sessions).

---

### User Story 3 - Ask About Selected Text (Priority: P3)

A student highlights/selects a passage of text on the book page, then clicks an "Ask about this" button. A chat prompt appears pre-filled with the selected text, allowing the student to ask a targeted question like "Explain this in simpler terms" or "Give me an example of this concept."

**Why this priority**: This bridges reading and understanding. It enables contextual help exactly where the student is struggling. However, it requires the basic chat (P1) to work first, and is an enhancement over general Q&A.

**Independent Test**: Can be tested by selecting any paragraph in a chapter, clicking the action button, typing a question, and verifying the response is grounded in both the selected text and relevant textbook context.

**Acceptance Scenarios**:

1. **Given** the student selects a paragraph about NVIDIA Isaac Sim, **When** they click "Ask about this" and type "Explain this simply", **Then** the chatbot provides a simplified explanation focused on the selected text, supplemented by textbook context.
2. **Given** the student selects text and asks a question, **When** the response is generated, **Then** it prioritizes the selected text as primary context while using broader textbook search as supplementary context.

---

### User Story 4 - Content Ingestion (Priority: P1)

A content administrator needs to ingest (or re-ingest) the textbook chapters so the chatbot has up-to-date content to search against. They trigger an ingestion process that parses all 16 MDX chapter files, splits them into searchable chunks, generates searchable representations, and stores them for retrieval.

**Why this priority**: Equal to P1 because without ingested content, the chatbot cannot answer any questions. The chatbot depends entirely on having searchable book content available.

**Independent Test**: Can be tested by running the ingestion process, then querying the search system to verify all 16 chapters are indexed and a sample search returns relevant chunks with correct metadata (chapter name, module, section).

**Acceptance Scenarios**:

1. **Given** all 16 MDX chapter files exist in the docs directory, **When** the ingestion process runs, **Then** all chapters are parsed, chunked, and stored as searchable content with metadata (chapter, module, section).
2. **Given** a chapter has been updated, **When** re-ingestion runs, **Then** the old content for that chapter is replaced with the new content (no duplicates).
3. **Given** ingestion completes, **When** a search is performed for "ROS 2 launch files", **Then** relevant chunks from the appropriate chapter(s) are returned with correct source attribution.

---

### User Story 5 - Chatbot Widget in Book (Priority: P2)

The chatbot appears as a floating widget (button + expandable panel) on every page of the Docusaurus book. Students can open/close it without leaving the page. The widget connects to the backend service and presents a clean chat interface.

**Why this priority**: The widget is the delivery mechanism. The backend (P1) works without it (via API), but students need this UI to actually use the chatbot within the book.

**Independent Test**: Can be tested by navigating to any book page, clicking the chat button to expand the widget, verifying it connects to the backend, and completing a full Q&A exchange within the widget.

**Acceptance Scenarios**:

1. **Given** a student is on any page of the book, **When** they look at the bottom-right corner, **Then** a chat button is visible and does not obstruct page content.
2. **Given** the chat button is visible, **When** the student clicks it, **Then** a chat panel expands with a text input, send button, and message area.
3. **Given** the chat panel is open, **When** the student types a message and presses Enter or clicks Send, **Then** the message appears in the chat history and a streaming response begins.
4. **Given** the chat panel is open, **When** the student clicks the close button, **Then** the panel collapses back to the button, and re-opening preserves the conversation.

---

### Edge Cases

- What happens when the backend service is unreachable? The widget should display a friendly error message ("Chatbot is currently unavailable. Please try again later.") and offer a retry button.
- What happens when the student sends an empty message? The send button should be disabled when the input is empty.
- What happens when the student sends an extremely long message (>2000 characters)? The system should truncate or reject with a character limit warning before submission.
- What happens when no relevant content is found for a query? The chatbot should honestly state "I couldn't find relevant information in the textbook for this question" and suggest rephrasing.
- What happens during ingestion if an MDX file is malformed? The ingestion process should log the error, skip the malformed file, and continue with remaining files.
- What happens if the student rapidly sends multiple messages? Messages should be queued and processed sequentially; the UI should disable the send button while a response is in progress.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a conversational chat interface embedded within the Docusaurus textbook that allows students to ask questions about course content.
- **FR-002**: System MUST search the textbook content to find relevant passages before generating answers, ensuring responses are grounded in actual course material.
- **FR-003**: System MUST include source citations (chapter name and section) in every answer that references textbook content.
- **FR-004**: System MUST stream responses incrementally to the student so they see words appearing progressively rather than waiting for the complete answer.
- **FR-005**: System MUST maintain conversation context within a session, allowing students to ask follow-up questions that reference previous exchanges.
- **FR-006**: System MUST support a "selected text" interaction where students can highlight text on the page and ask questions specifically about that passage.
- **FR-007**: System MUST provide a content ingestion pipeline that processes all 16 MDX chapter files into searchable chunks with metadata.
- **FR-008**: System MUST handle re-ingestion gracefully, replacing outdated content without creating duplicates.
- **FR-009**: System MUST politely decline questions unrelated to the textbook and redirect students to course topics.
- **FR-010**: System MUST display a health/connection status so students know if the chatbot service is available.
- **FR-011**: System MUST work from the GitHub Pages hosted book, communicating with the backend service via cross-origin requests.
- **FR-012**: System MUST enforce a character limit on student messages (maximum 2000 characters) with clear feedback.
- **FR-013**: System MUST disable message submission while a response is actively being generated.
- **FR-014**: System MUST provide a floating chat widget (bottom-right) that can be opened and closed without disrupting the reading experience.
- **FR-015**: System MUST preserve the current conversation when the widget is closed and re-opened on the same page.

### Key Entities

- **Chapter Chunk**: A searchable segment of textbook content. Attributes: text content, source chapter, module, section heading, position within chapter.
- **Conversation Session**: A sequence of exchanges between the student and chatbot. Attributes: session identifier, ordered list of messages, creation timestamp.
- **Chat Message**: A single exchange unit. Attributes: sender (student or chatbot), content text, timestamp, source citations (if chatbot message).
- **Ingestion Record**: Metadata about a completed ingestion run. Attributes: chapters processed, chunks created, timestamp, any errors encountered.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students receive an answer to their question within 10 seconds of submitting, with the first word appearing within 2 seconds (streaming).
- **SC-002**: 90% of questions about topics covered in the textbook receive answers that cite the correct source chapter.
- **SC-003**: All 16 chapters (approximately 400+ chunks) are successfully ingested and searchable.
- **SC-004**: The chatbot correctly handles follow-up questions that reference prior context in at least 80% of multi-turn conversations.
- **SC-005**: The chat widget loads and is interactive within 3 seconds of page load on standard broadband connections.
- **SC-006**: The system gracefully handles backend unavailability, showing a clear error message rather than a broken UI.
- **SC-007**: Students can complete a 5-question study session using only the chatbot without encountering errors or irrelevant responses.

## Assumptions

- The textbook content (16 MDX chapters) is stable and already deployed. Major content changes are infrequent.
- Students access the book via modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions).
- The chatbot backend is deployed as a separate service (not on GitHub Pages). Deployment details are deferred to the plan phase.
- Session persistence is within a single browser tab session. Cross-device session continuity is not required.
- The chatbot is read-only from the student's perspective - it answers questions but does not modify book content.
- Rate limiting will use reasonable defaults (e.g., max 30 messages per minute per session) to prevent abuse while not hindering legitimate study use.
- The free-tier model is acceptable for the hackathon demo. Production model selection is a deployment-time configuration decision.

## Dependencies

- **001-docusaurus-book**: The 16 MDX chapter files must exist and build successfully (DONE).
- **External services**: The chatbot requires an external vector search service and a relational database service for metadata/sessions. Specific providers are deferred to the plan phase.
- **Embedding service**: The system requires an external text embedding service to convert text into searchable representations.
- **Language model service**: The system requires access to a language model for generating conversational responses.

## Out of Scope

- User authentication (covered by feature 003-auth)
- Personalized content adaptation (covered by feature 004-personalization)
- Urdu translation of chatbot responses (covered by feature 005-urdu-translation)
- Admin dashboard for monitoring chatbot usage
- Chatbot usage analytics and reporting
- Offline/PWA chatbot functionality
- Voice input/output
- Image or diagram understanding within questions
