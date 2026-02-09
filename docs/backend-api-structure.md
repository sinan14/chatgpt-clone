# Backend API Structure (Chat App)

## Guiding principles
- Keep authentication responses focused on auth only (tokens, user profile basics).
- Load app-specific data (GPT catalog, conversations, preferences) via separate endpoints or a single bootstrap endpoint.
- Avoid coupling login/signup to data that changes frequently or is large.

## Recommendation
Use a **lean auth response** plus a **separate bootstrap endpoint** called immediately after login/signup.

Why:
- Auth responses should be small, cacheable, and stable.
- GPTs list and chats are domain data that can change independently.
- Allows refresh of data without re-authenticating.

## Suggested API shape
Base: `/api/*`

### Auth
- `POST /api/signup`
  - Request: `name`, `email`, `password`
  - Response: `accessToken`, `refreshToken`, `user`

- `POST /api/login`
  - Request: `email`, `password`
  - Response: `accessToken`, `refreshToken`, `user`

Auth response (minimal):
- `user`: `id`, `name`, `email`, `role?`
- `accessToken`: short-lived (e.g., 15m)
- `refreshToken`: longer-lived (httpOnly cookie or returned for storage)

### Prompt
- `POST /api/prompt`
  - Request: `conversationId`, `message`, `model`, `gptName?`
  - Response: `message`, `usage?`, `conversationId`

### Bootstrap (recommended)
- `GET /api/bootstrap`
  - Auth: Bearer token
  - Response:
    - `gpts`: list of available GPTs (id, name, category, isFeatured)
    - `conversations`: recent chats (id, title, updatedAt)
    - `preferences`: selected model, last active GPT, UI prefs
    - `limits?`: usage limits, plan, rate status (optional)
    - `flags?`: feature flags or rollouts (optional)

### Optional: split endpoints (if you prefer)
- `GET /api/gpts`
- `GET /api/conversations`
- `GET /api/preferences`
 - `GET /api/flags`

## Client flow (lean auth + bootstrap)
1. `POST /api/signup` or `POST /api/login`
2. Store tokens + user
3. Immediately call `GET /api/bootstrap`
4. Render GPT list + chats + preferences
5. Use `POST /api/prompt` for chat

## Data flow details
Login/Signup:
- Validate credentials
- Return tokens + minimal user info only
- Do not return GPTs or chats here

Bootstrap:
- Returns the data needed to render the sidebar and chat defaults
- Can be refreshed on demand (e.g., when GPT catalog changes)

Prompt:
- Should accept `model` and `gptName` so backend can route
- Consider streaming response for better UX

## Notes
- If you must include extra data in auth responses, keep it small (e.g., minimal user profile only).
- Consider paginating conversations for large histories.
- Use cursor pagination for conversations to avoid large payloads.
