# AlumiNet API & WebSocket Reference

## REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new student or alumni account.
- `POST /api/auth/login` - Authenticate user, returns access token & user profile.
- `POST /api/auth/refresh` - Rotate and issue new access token.
- `POST /api/auth/logout` - Clear auth session and cookies.

### Mentorship & Matching (`/api/mentors`)
- `GET /api/mentors` - List all verified alumni mentors.
- `GET /api/mentors/matches` - Returns algorithmically matched alumni based on student profile (>= 70% cutoff).
- `POST /api/mentors/sessions` - Book a 1-on-1 mentorship session.
- `GET /api/mentors/sessions` - Fetch scheduled mentorship sessions for current user.

### Generative AI Suite (`/api/ai`)
- `POST /api/ai/chat` - Message the AlumiBot AI career assistant (`qwen/qwen3.8-27b`).
- `GET /api/ai/skill-gap?targetRole=:role` - Generate skill gap analysis and roadmap.
- `GET /api/ai/interview-questions?role=:role&level=:level` - Generate tiered interview prep questions.
- `GET /api/ai/forum-suggestion/:postId` - Generate AI contextual answer for a discussion post.

### Community & Networking
- `/api/forum` - Discussion board threads, upvotes, and comments.
- `/api/events` - Alumni-hosted webinars and RSVP management.
- `/api/jobs` - Job and internship postings with referral requests.
- `/api/study-groups` - Collaborative peer learning groups.
- `/api/achievements` - Gamification badges and milestone points.

---

## Real-Time WebSocket Events (`Socket.io`)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Client -> Server | Handshake auth token | Authenticates socket connection via JWT. |
| `online_users` | Server -> Client | `Array<userId>` | Broadcasts list of active online users. |
| `join_room` | Client -> Server | `room` | Joins a 1-on-1 direct message room. |
| `send_message` | Client -> Server | `{ room, content, type, fileUrl }` | Sends and broadcasts message to room members. |
| `typing` | Client -> Server | `{ room, isTyping }` | Broadcasts live typing indicator. |
| `mark_messages_read` | Client -> Server | `{ room }` | Updates read receipts in database and emits to peers. |
| `delete_message` | Client -> Server | `{ room, messageId }` | Soft-deletes message and broadcasts update. |
