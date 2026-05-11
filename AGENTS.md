# AGENTS.md — LinkUp Project State Handoff Document

> This file is the single source of truth for the LinkUp project.
> It was generated from a full Claude conversation session and reflects the exact current state of the codebase.
> Read this entire file before making any changes.

---

## 1. Project Overview

**LinkUp** is a full-stack project management web application.

| Layer            | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| Frontend         | React 18 + TypeScript + Vite + Tailwind CSS v4          |
| Backend          | Spring Boot 4.x + Java 21 + Hibernate/JPA               |
| Database         | MySQL 8.0                                               |
| Auth             | Custom JWT + Google OAuth2/OIDC                         |
| Containerization | Docker + Docker Compose                                 |
| UI Components    | shadcn/ui + lucide-react                                |
| State Management | Context API (domain state) + Redux Toolkit (theme only) |

---

## 2. Repository Structure

```
linkup/                          ← repo root (Spring Boot lives here)
  src/                           ← Spring Boot source (partner's code)
    main/java/com/softwareproject/LinkUp/
      controllers/
      dtos/
      entities/
      enums/
      exceptions/
      repos/
      sec/
      services/
  frontend/                      ← React app (your code)
    src/
      app/
        store.ts                 ← Redux store (theme only)
      contexts/
        AuthContext.tsx          ← Auth provider
        WorkspaceContext.tsx     ← Workspace provider
      components/
        Navbar.tsx
        Sidebar.tsx
        WorkspaceDropdown.tsx
        CreateWorkspaceDialog.tsx
        InviteMemberDialog.tsx
        UserProfileDialog.tsx
      hooks/
        useAuth.ts
        useWorkspace.ts
        useRedux.ts              ← typed useAppDispatch / useAppSelector
      pages/
        Auth.tsx
        Layout.tsx
        Dashboard.tsx
        Projects.tsx
        Team.tsx
        ProjectDetails.tsx
        TaskDetails.tsx
        OAuthCallback.tsx
      services/
        api.ts
        authService.ts
        userService.ts
        workspaceService.ts
      types/
        authDtos.ts
        userDtos.ts
        workspaceDtos.ts
      features/
        themeSlice.ts            ← Redux slice (only Redux usage in project)
      App.tsx
      main.tsx
    Dockerfile                   ← frontend Docker image
    nginx.conf                   ← SPA routing + static asset config
    .dockerignore
  Dockerfile                     ← Spring Boot Docker image
  docker-compose.yml             ← orchestrates all 3 services
  .env                           ← local only, never committed
  .env.example                   ← committed template
  pom.xml
```

---

## 3. Architecture: Data Flow

The project enforces a strict unidirectional data flow:

```
Component → Context Action → Service Layer → Backend API → Context State → Component
```

**Rules that must never be broken:**

- Components NEVER import from `services/` directly
- Components ONLY call context actions (`useAuth()`, `useWorkspace()`)
- Context actions call services, handle responses, update state
- Services are pure HTTP wrappers — no state, no side effects

---

## 4. Auth System

### 4.1 Two Auth Flows

**Standard (email/password):**

1. `Auth.tsx` calls `login()` or `register()` from `useAuth()`
2. `AuthContext` calls `authService.login()` → receives `AuthResponse`
3. `AuthContext` stores `token`, `user`, `workspaces` in localStorage
4. State is set, component re-renders, router redirects to `/`

**Google OAuth2:**

1. `Auth.tsx` calls `loginWithGoogle()` from `useAuth()`
2. Browser navigates to `http://localhost:8080/oauth2/authorization/google`
3. Spring handles OAuth handshake with Google
4. `OAuth2SuccessHandler.java` fires → builds `AuthResponse` **with image fields set to null** (see §10 — OAuth redirect URL size issue), base64-URL-encodes it as JSON, redirects to `http://localhost:3000/oauth2/callback?data=<base64-encoded-json>`
5. `OAuthCallback.tsx` reads `?data=` from URL, base64-decodes with `atob()`, parses as `AuthResponse`
6. Calls `handleOAuthCallback(token, userDTO, workspaceDTOList)` on `AuthContext` — identical to standard login
7. State is set; `OAuthCallback.tsx` immediately fires `refreshUser()` and `refreshWorkspaces()` **in parallel** to re-hydrate the stripped image fields
8. Router redirects to `/`

### 4.2 AuthResponse Shape

```typescript
interface AuthResponse {
  token: string;
  userDTO: UserDTO;
  workspaceDTOList: WorkspaceDTO[];
}
```

Backend returns this on both `/auth/login` and `/auth/register`.

> **Note:** In the OAuth2 redirect path, `userDTO.image` and all `workspaceDTOList[].imageUrl` fields are intentionally `null`. The frontend re-fetches these via `GET /users/me` and `GET /workspaces/my` immediately after the callback. Standard login/register return full data as normal.

### 4.3 Bootstrap (Page Refresh)

On mount, `AuthContext` reads `token`, `user`, `workspaces` from localStorage. No API calls made on bootstrap. Data was stored at login time (including images re-fetched after OAuth callback).

### 4.4 localStorage Keys

```
token       ← JWT string
user        ← JSON stringified UserDTO (full, including image)
workspaces  ← JSON stringified WorkspaceDTO[] (full, including imageUrl)
```

### 4.5 JWT Interceptor

`api.ts` attaches `Authorization: Bearer <token>` to every request.
On 401 response: only redirects to `/auth` if a token **exists** in localStorage.
A failed login (401, no token) lets the error propagate to the component for toast display.

---

## 5. State Management

### 5.1 Redux (theme only)

Redux is intentionally kept minimal — theme toggle only.

```
store.ts → themeSlice.ts
```

Use `useAppDispatch()` and `useAppSelector()` from `hooks/useRedux.ts`.
Never use plain `useDispatch` or `useSelector` — they are untyped.

### 5.2 AuthContext

Owns: `user`, `workspaces`, `loading`

Actions exposed to components:

- `login(credentials)` → calls authService, applies AuthResponse
- `register(data)` → calls authService, applies AuthResponse
- `loginWithGoogle()` → browser redirect
- `handleOAuthCallback(token, userDTO, workspaceDTOList)` → applies full AuthResponse (same as login/register)
- `refreshUser()` → calls `GET /users/me`, updates `user` in state + localStorage; used after OAuth callback to re-hydrate stripped image field
- `refreshWorkspaces()` → calls `GET /workspaces/my`, updates `workspaces` in state + localStorage; used after OAuth callback to re-hydrate stripped imageUrl fields
- `logout()` → clears localStorage + state
- `setUser` / `setWorkspaces` → escape hatches for optimistic updates

### 5.3 WorkspaceContext

Owns: `currentWorkspace`, `members`, `membersLoading`

Actions:

- `selectWorkspace(id)` → switches current workspace
- `createWorkspace(data)` → POST + updates list
- `inviteMember(data)` → POST + re-fetches members
- `removeMember(workspaceId, userId)` → DELETE + optimistic removal
- `editMemberRole(data)` → PATCH + optimistic update
- `deleteWorkspace(id)` → DELETE + removes from list

**Important:** `WorkspaceContext` has a `defaultValue` (not null) to prevent crashes during transitional renders between login and first render of protected routes.

### 5.4 Context Tree (main.tsx)

```
AuthProvider
  └── WorkspaceBridge (reads workspaces from AuthContext, passes as prop)
        └── WorkspaceProvider
              └── App
```

`WorkspaceBridge` is the glue component that feeds `AuthContext.workspaces` into `WorkspaceProvider` as props without creating a circular dependency.

---

## 6. Backend API Reference

Base URL: `http://localhost:8080`

### Auth Endpoints (public)

| Method | Path             | Body          | Response       |
| ------ | ---------------- | ------------- | -------------- |
| POST   | `/auth/register` | `RegisterDTO` | `AuthResponse` |
| POST   | `/auth/login`    | `LoginDTO`    | `AuthResponse` |

### User Endpoints (JWT required)

| Method | Path        | Body             | Response  |
| ------ | ----------- | ---------------- | --------- |
| GET    | `/users/me` | —                | `UserDTO` |
| PATCH  | `/users/me` | `UpdatedUserDTO` | `String`  |
| DELETE | `/users/me` | —                | `String`  |

### Workspace Endpoints (JWT required)

| Method | Path                                            | Body/Params       | Response             |
| ------ | ----------------------------------------------- | ----------------- | -------------------- |
| POST   | `/workspaces/create`                            | `WorkspaceDTO`    | `WorkspaceDTO`       |
| GET    | `/workspaces/my`                                | —                 | `List<WorkspaceDTO>` |
| POST   | `/workspaces/adduser`                           | `AddingMemberDTO` | `String`             |
| GET    | `/workspaces/getmembers/{workspaceId}`          | path var          | `List<UserRoleDTO>`  |
| DELETE | `/workspaces/removeuser/{workspaceId}/{userId}` | path vars         | `String`             |
| PATCH  | `/workspaces/editrole`                          | `EditingRoleDTO`  | `String`             |
| DELETE | `/workspaces/delete/{workspaceId}`              | path var          | `String`             |

### OAuth2

| Flow             | URL                                                                            |
| ---------------- | ------------------------------------------------------------------------------ |
| Initiate         | `GET http://localhost:8080/oauth2/authorization/google`                        |
| Callback (React) | `GET http://localhost:3000/oauth2/callback?data=<base64-encoded-AuthResponse>` |

---

## 7. TypeScript DTO Interfaces

### authDtos.ts

```typescript
interface LoginDTO {
  email: string;
  password: string;
}
interface RegisterDTO {
  email: string;
  name: string;
  password: string;
  imageUrl?: string;
}
interface AuthResponse {
  token: string;
  userDTO: UserDTO;
  workspaceDTOList: WorkspaceDTO[];
}
```

### userDtos.ts

```typescript
interface UserDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
}
interface UpdatedUserDTO {
  email?: string;
  name?: string;
  password?: string;
  image?: string;
}
```

### workspaceDtos.ts

```typescript
interface WorkspaceDTO {
  id: string;
  name: string;
  imageUrl: string | null;
  slug: string;
  description: string | null;
}
type WorkspaceRole = "OWNER" | "MEMBER"; // only two roles — no ADMIN
interface UserRoleDTO {
  userDTO: UserDTO;
  role: WorkspaceRole;
}
interface CreateWorkspacePayload {
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}
interface AddingMemberDTO {
  userEmail: string;
  workSpaceId: string;
  workSpaceRole: WorkspaceRole;
}
interface EditingRoleDTO {
  userId: string;
  workSpaceId: string;
  newRole: WorkspaceRole;
}
```

---

## 8. Completed Domains

### ✅ User Domain

- Register, Login, Google OAuth2
- View profile, Edit profile, Delete account
- JWT session management
- Bootstrap from localStorage on refresh

### ✅ Workspace Domain

- Create workspace
- List user's workspaces (from AuthResponse on standard login; from `GET /workspaces/my` after OAuth login)
- Switch between workspaces (WorkspaceDropdown in Sidebar)
- Get workspace members (fetched when workspace selected)
- Add member (direct add by email, not email invite)
- Remove member (owner only)
- Edit member role (owner only)
- Delete workspace (owner only)

### ✅ Infrastructure

- Docker Compose (MySQL + Spring Boot + React/nginx)
- CORS configured in SecurityConfig.java
- Environment variable injection via .env
- Multi-stage Docker builds for both services

---

## 9. Pending / Not Yet Implemented

These are known incomplete items — do not implement without explicit instruction:

- **Projects domain** — not started on backend
- **Tasks domain** — not started on backend
- **Email invite system** — backend not built; invite button is disabled in UI
- **Active Projects / Total Tasks counts in Team page** — currently hardcoded mock values (`MOCK_ACTIVE_PROJECTS = 4`, `MOCK_TOTAL_TASKS = 23`); replace when projects/tasks domains are implemented
- **`POST /workspaces/create` returns `WorkspaceDTO`** — backend was updated to return DTO; verify this is deployed

---

## 10. Known Issues & Decisions

### Issue: OAuth2 redirect URL exceeds nginx header buffer limit

**Problem:** After a Google OAuth user updated their profile image or workspace image (stored as base64 MEDIUMTEXT, up to 16MB), `OAuth2SuccessHandler` was serializing the full `AuthResponse` including those base64 blobs, base64-encoding the whole thing, and embedding it in the `Location` redirect header. nginx's default `large_client_header_buffers` is 4×8KB (32KB total). Any image larger than ~24KB (after double base64 encoding) caused an HTTP 500 on the redirect, permanently blocking the user from signing in again via Google.

**Fix applied (two parts):**

_Backend — `OAuth2SuccessHandler.java`:_ `userDTO.image` is now set to `null` and each `WorkspaceDTO.imageUrl` is set to `null` before serialization. The redirect URL stays small regardless of what is stored in the DB.

_Frontend — `OAuthCallback.tsx`:_ After `handleOAuthCallback()` applies the token and minimal data, `refreshUser()` and `refreshWorkspaces()` are fired in parallel (`Promise.all`) to re-hydrate the stripped image fields via `GET /users/me` and `GET /workspaces/my`. Both calls are fire-and-forget — the user is authenticated and navigated to `/` regardless of whether they succeed.

### Issue: `UserService.updateUser` email check threw on own email

**Problem:** `userRepository.findByEmail(updatedUserDTO.getEmail()).isPresent()` would find the current user's own record and throw `EmailAlreadyExistsException`, making it impossible to submit a profile update that included the user's own current email. Also called `findByEmail(null)` when email was not in the update payload, which has undefined JPA behavior.

**Fix applied:** The check now only runs when `updatedUserDTO.getEmail() != null`, and uses `.ifPresent()` with an ID comparison to exclude the current user:

```java
if (updatedUserDTO.getEmail() != null) {
    userRepository.findByEmail(updatedUserDTO.getEmail()).ifPresent(existing -> {
        if (!existing.getId().equals(user.getId()))
            throw new EmailAlreadyExistsException("Email trying to update already exists");
    });
}
```

### Issue: WorkspaceContext null crash on login

**Problem:** After login, `navigate("/")` fires before `WorkspaceContext` propagates new workspaces, causing `useWorkspace()` to return null mid-render.
**Fix applied:** `WorkspaceContext` uses a `defaultValue` object (not null) so destructuring never crashes.

### Issue: lightningcss Windows binary in Docker

**Problem:** `npm ci` inside Docker was using Windows-generated `package-lock.json` which locked `lightningcss-win32` binary.
**Fix applied:** Frontend Dockerfile uses `RUN rm -f package-lock.json && npm install` to force Linux binary resolution.

### Issue: 401 interceptor swallowing login errors

**Problem:** Failed login returned 401, triggering redirect to `/auth` before toast could fire.
**Fix applied:** Interceptor only redirects if a `token` exists in localStorage (expired session), not on fresh 401s.

### Decision: Redux kept for theme only

Redux is intentionally not removed. `themeSlice` uses localStorage to persist dark/light mode and applies the class to `document.documentElement`. All other state is Context API.

### Decision: No `workspaceSlice` in Redux

`workspaceSlice` was removed from Redux entirely. Workspace state lives in `WorkspaceContext`. The Redux store only has `theme` reducer.

### Issue: `UsernameNotFoundException` in `inviteMember` triggered 401 redirect

**Problem:** `WorkspaceService.inviteMember` threw `UsernameNotFoundException` (Spring Security exception) when a user email wasn't found. Spring returns 401 for this, and the frontend axios interceptor (seeing a token exists) redirects to `/auth`.
**Fix applied:** Changed to throw `UserNotFoundException` (custom exception, handled by `GlobalExceptionHandler` returning 400), so the error is shown as a toast instead of redirecting.

### Issue: `imageUrl` / `image` columns too short for base64 data URLs

**Problem:** `@Column(length = 500)` on `Workspace.imageUrl` and `User.image` couldn't store base64 data URLs (often 100K+ chars) from the file upload inputs.
**Fix applied:** Changed both to `@Lob @Column(columnDefinition = "MEDIUMTEXT")` in the entity classes.
**Migration:** If DB already exists, run `ALTER TABLE users MODIFY image MEDIUMTEXT; ALTER TABLE workspaces MODIFY image_url MEDIUMTEXT;` or use `docker compose down -v` to recreate.

### Decision: Separate hook files from context files

Vite fast-refresh requires files to export either only components or only non-components. `AuthProvider` (component) lives in `AuthContext.tsx`. `useAuth` (hook) lives in `hooks/useAuth.ts`. Same pattern for workspace.

---

## 11. Environment Variables

```dotenv
# Database
DB_ROOT_PASSWORD="..."      # wrap in quotes if contains # or special chars
DB_USER=linkup_user
DB_PASSWORD="..."           # wrap in quotes if contains # or special chars

# JWT — generate with: openssl rand -hex 64 (minimum 256 bits)
JWT_SECRET=...

# Google OAuth2 — from Google Cloud Console
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Frontend
VITE_API_BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
```

**Critical:** Values containing `#` must be wrapped in double quotes or the `#` and everything after is treated as a comment.

---

## 12. Docker Commands

```bash
# First run / after code changes
docker compose up --build

# After first build (no code changes)
docker compose up

# Stop (keep DB volume)
docker compose down

# Stop + wipe database
docker compose down -v

# Rebuild only frontend (fastest iteration)
docker compose build --no-cache frontend
docker compose up

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Access MySQL
docker exec -it linkup-db mysql -u linkup_user -p linkup
```

---

## 13. Git Workflow

```bash
# Pull only backend src changes from partner
git fetch origin main
git checkout origin/main -- src

# Push your changes
git add .
git commit -m "feat: description"
git push origin main
```

---

## 14. Backend Files Modified by Frontend Developer

These Spring Boot files were written or modified during frontend integration — not originally from the backend developer:

- `src/main/java/.../sec/SecurityConfig.java` — added CORS bean, reads `FRONTEND_URL` from env
- `src/main/java/.../sec/OAuth2SuccessHandler.java` — strips `userDTO.image` and all `WorkspaceDTO.imageUrl` fields to `null` before building the redirect URL (prevents nginx header buffer overflow on users with base64 images); redirects to `http://localhost:3000/oauth2/callback?data=<base64-encoded-json>`
- `src/main/java/.../controllers/WorkspaceController.java` — added `User user =` line to `createWorkspace`, changed return type to `WorkspaceDTO`; added `GET /workspaces/my` endpoint for post-OAuth image re-hydration
- `src/main/java/.../services/WorkspaceService.java` — changed `createWorkSpace` return type from `void` to `WorkspaceDTO`, added return statement; changed `inviteMember` to throw `UserNotFoundException` instead of `UsernameNotFoundException` (prevents 401 redirect); added `getMyWorkspaces(User user)` method wrapping repo call + DTO mapping
- `src/main/java/.../services/UserService.java` — fixed `updateUser` email uniqueness check to exclude the current user and guard against null email input
- `src/main/java/.../entities/Workspace.java` — changed `imageUrl` from `@Column(length = 500)` to `@Lob @Column(columnDefinition = "MEDIUMTEXT")`
- `src/main/java/.../entities/User.java` — changed `image` from `@Column(length = 500)` to `@Lob @Column(columnDefinition = "MEDIUMTEXT")`

---

## 15. shadcn Components Used

```bash
npx shadcn@latest add dropdown-menu   # Navbar user dropdown
npx shadcn@latest add dialog          # UserProfileDialog, WorkspaceDropdown create
npx shadcn@latest add alert-dialog    # Delete confirmations
npx shadcn@latest add tabs            # UserProfileDialog view/edit tabs
```

---

## 16. Application URLs (local dev)

| Service          | URL                                         |
| ---------------- | ------------------------------------------- |
| React (Docker)   | http://localhost:3000                       |
| React (Vite dev) | http://localhost:5173                       |
| Spring Boot      | http://localhost:8080                       |
| MySQL            | localhost:3306                              |
| Swagger UI       | http://localhost:8080/swagger-ui/index.html |
