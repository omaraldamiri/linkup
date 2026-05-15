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
        UserContext.tsx          ← User mutation provider
        ProjectContext.tsx       ← Project provider (scoped to current workspace)
        TaskContext.tsx          ← Task provider (scoped to current project)
        CommentContext.tsx       ← Comment provider (scoped to current task)
      components/
        Navbar.tsx
        Sidebar.tsx
        WorkspaceDropdown.tsx
        CreateWorkspaceDialog.tsx
        InviteMemberDialog.tsx
        UserProfileDialog.tsx
        ProjectTasks.tsx         ← Task list table + filters + role-gated actions
        ProjectSettings.tsx      ← Leader-only project edit + member management
        ProjectAnalytics.tsx
        ProjectCalendar.tsx
        ProjectsSidebar.tsx      ← Sidebar project nav (real data, Members tab)
        CreateTaskDialog.tsx     ← Leader-only task creation dialog
        AddProjectMember.tsx
      hooks/
        useAuth.ts
        useWorkspace.ts
        useUser.ts
        useProject.ts
        useTask.ts
        useComment.ts
        useRedux.ts              ← typed useAppDispatch / useAppSelector
      pages/
        Auth.tsx
        Layout.tsx
        Dashboard.tsx
        Projects.tsx
        Team.tsx
        ProjectDetails.tsx
        TaskDetails.tsx          ← Task info + comment panel
        OAuthCallback.tsx
      services/
        api.ts
        authService.ts
        userService.ts
        workspaceService.ts
        projectService.ts
        taskService.ts
        commentService.ts
      types/
        authDtos.ts
        userDtos.ts
        workspaceDtos.ts
        projectDtos.ts
        taskDtos.ts
        commentDtos.ts
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
- Components ONLY call context actions (`useAuth()`, `useWorkspace()`, `useProject()`, `useTask()`, `useComment()`)
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
- `updateWorkspaces(updated)` → canonical way to mutate workspace list from outside AuthContext; writes to both state and localStorage atomically
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

### 5.4 UserContext

Owns: `saving`, `deleting`

Actions:

- `updateUser(data)` → PATCH `/users/me`, propagates partial update up to AuthContext via `onUserChange` prop
- `deleteUser()` → DELETE `/users/me`, calls `onUserDelete` prop which triggers AuthContext logout

Receives `onUserChange` and `onUserDelete` callbacks as props from `UserBridge` in `main.tsx`. This is how it writes back to AuthContext without a circular dependency.

### 5.5 ProjectContext

Owns: `projects`, `currentProject`, `currentUserRole`, `projectMembers`, `projectsLoading`, `membersLoading`

Actions:

- `selectProject(id)` → sets currentProject from loaded list
- `createProject(data)` → POST + appends to list + auto-selects new project
- `editProject(id, data)` → PATCH + re-fetches project details
- `changeProjectStatus(id, status)` → PATCH + optimistic update
- `deleteProject(id)` → DELETE + removes from list + selects next project
- `addProjectMember(projectId, email)` → POST + re-fetches members
- `removeProjectMember(projectId, userId)` → DELETE + optimistic removal
- `editProjectMemberRole(data)` → PATCH + optimistic role update
- `refreshProjects()` → re-fetches full project list

Receives `workspaceId: string | null` as prop from `ProjectBridge`. Fetches all user projects on mount, then filters in-memory by `workspaceId` — so `projects` is always the workspace-scoped view.

`currentUserRole` is derived directly from `currentProject.currentUserRole` — no separate state.

### 5.6 TaskContext

Owns: `tasks`, `currentTask`, `tasksLoading`

Actions:

- `selectTask(id)` → sets currentTask from loaded list
- `createTask(projectId, data)` → POST + appends to list (leader only by convention — enforced in UI)
- `deleteTask(taskId)` → DELETE + removes from list + clears currentTask if it was selected (leader only)
- `updateTaskStatus(taskId, status)` → PATCH + optimistic update (all members)
- `changeAssignee(taskId, email)` → PATCH + optimistic update (leader only)
- `refreshTasks()` → re-fetches task list for current project

Receives `projectId: string | null` as prop from `TaskBridge`. Auto-fetches tasks when `projectId` changes. Clears tasks and currentTask when project changes.

### 5.7 CommentContext

Owns: `comments`, `commentsLoading`

Actions:

- `createComment(content)` → POST + appends returned DTO to list (all members)

Receives `taskId: string | null` as prop from `CommentBridge`. Auto-fetches comments when `taskId` changes. Does not expose `deleteComment` — that endpoint exists on the backend but is not implemented in the frontend.

### 5.8 Context Tree (main.tsx)

```
AuthProvider
  └── WorkspaceBridge → WorkspaceProvider
        └── UserBridge → UserProvider
              └── ProjectBridge → ProjectProvider
                    └── TaskBridge → TaskProvider
                          └── CommentBridge → CommentProvider
                                └── App
```

Each Bridge component sits _between_ two providers: it reads from the outer context and passes the current ID as a prop into the inner provider. This avoids circular dependencies and keeps each provider's scope clearly defined.

| Bridge          | Reads from                        | Feeds into        |
| --------------- | --------------------------------- | ----------------- |
| WorkspaceBridge | AuthContext.workspaces            | WorkspaceProvider |
| UserBridge      | AuthContext (logout, setUser)     | UserProvider      |
| ProjectBridge   | WorkspaceContext.currentWorkspace | ProjectProvider   |
| TaskBridge      | ProjectContext.currentProject     | TaskProvider      |
| CommentBridge   | TaskContext.currentTask           | CommentProvider   |

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

### Project Endpoints (JWT required)

| Method | Path                                        | Body/Params             | Response                   |
| ------ | ------------------------------------------- | ----------------------- | -------------------------- |
| POST   | `/projects/create`                          | `ProjectDTO`            | `ProjectDTO`               |
| GET    | `/projects/getprojects`                     | —                       | `List<ProjectDTO>`         |
| GET    | `/projects/details/{projectId}`             | path var                | `ProjectDTO`               |
| PATCH  | `/projects/editproject/{projectId}`         | `UpdateProjectDTO`      | `String`                   |
| PATCH  | `/projects/changestatus/{projectId}`        | `?status=STATUS`        | `String`                   |
| DELETE | `/projects/delete/{projectId}`              | path var                | `String`                   |
| POST   | `/projects/adduser/{projectId}`             | `?userEmail=EMAIL`      | `String`                   |
| DELETE | `/projects/deleteuser/{projectId}/{userId}` | path vars               | `String`                   |
| PATCH  | `/projects/editrole`                        | `EditingProjectRoleDTO` | `String`                   |
| GET    | `/projects/getmembers/{projectId}`          | path var                | `List<UserDTO>` ⚠️ see §10 |

### Task Endpoints (JWT required)

| Method | Path                             | Body/Params            | Response        |
| ------ | -------------------------------- | ---------------------- | --------------- |
| POST   | `/tasks/create/{projectId}`      | `TaskDTO` (body)       | `TaskDTO`       |
| GET    | `/tasks/getall/{projectId}`      | path var               | `List<TaskDTO>` |
| GET    | `/tasks/get/{taskId}`            | path var               | `TaskDTO`       |
| DELETE | `/tasks/delete/{taskId}`         | path var               | `String`        |
| PATCH  | `/tasks/updatestatus/{taskId}`   | `?status=STATUS`       | `String`        |
| PATCH  | `/tasks/changeassignee/{taskId}` | `?assigneeEmail=EMAIL` | `String`        |
| GET    | `/tasks/count/workspace/{workspaceId}` | path var | `number` |
| GET    | `/tasks/workspace/{workspaceId}` | path var | `List<TaskDTO>` |

> **Note on task params:** `updatestatus` and `changeassignee` both use `@RequestParam` — send as query params, not body. Sending in body silently fails.

### Comment Endpoints (JWT required)

| Method | Path                           | Body/Params     | Response            |
| ------ | ------------------------------ | --------------- | ------------------- |
| POST   | `/comments/create/{taskId}`    | `?content=TEXT` | `CommentDTO`        |
| GET    | `/comments/get/{taskId}`       | path var        | `List<CommentDTO>`  |
| DELETE | `/comments/delete/{commentId}` | path var        | `String` (not impl) |

> **Note on comment create:** `content` is `@RequestParam` — send as query param `?content=...`, not in the request body.

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

### projectDtos.ts

```typescript
type ProjectPriority = "LOW" | "MEDIUM" | "HIGH";
type ProjectStatus =
  | "ACTIVE"
  | "PLANNING"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";
type ProjectRole = "LEADER" | "VIEWER";

interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  projectPriority: ProjectPriority;
  projectStatus: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  progress: number | null;
  createdAt: string | null;
  workspaceId: string;
  addedEmails: string[] | null;
  currentUserRole: ProjectRole | null; // the authenticated user's role in this project
}
interface ProjectMemberRoleDTO {
  userDTO: UserDTO;
  role: ProjectRole;
}
interface CreateProjectPayload {
  name: string;
  workspaceId: string;
  description?: string;
  projectPriority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  addedEmails?: string[];
}
interface UpdateProjectPayload {
  name?: string;
  description?: string;
  projectPriority?: ProjectPriority;
  projectStatus?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  progress?: number;
}
interface EditingProjectRoleDTO {
  userId: string;
  projectId: string;
  newRole: ProjectRole;
}
```

### taskDtos.ts

```typescript
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskType = "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";

interface TaskDTO {
  id: string; // requires backend fix — see §10
  title: string;
  description: string | null;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
  taskType: TaskType;
  dueTime: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  assigneeEmail: string;
  projectId: string;
}
interface CreateTaskPayload {
  title: string;
  assigneeEmail: string;
  description?: string;
  taskPriority?: TaskPriority;
  taskType?: TaskType;
  dueTime?: string; // ISO-8601: "2026-06-30T00:00:00"
}
```

### commentDtos.ts

```typescript
interface CommentDTO {
  content: string;
  userEmail: string;
  taskId: string;
  createdAt: string | null; // ISO-8601; see §10 for date format warning
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

### ✅ Project Domain

- Create project (with optional batch member add via `addedEmails`)
- List projects scoped to current workspace (fetched from `GET /projects/getprojects`, filtered in-memory by workspaceId)
- Select project (ProjectContext + URL param sync in ProjectDetails)
- Edit project details (name, description, priority, status, dates, progress)
- Change project status (optimistic update)
- Delete project
- Add project member by email
- Remove project member (leader only)
- Edit project member role (leader only)
- View members tab (leader: in Settings panel; viewer: in Members tab on project detail page)

### ✅ Task Domain

- Create task (leader only — gated in CreateTaskDialog and New Task button)
- List tasks for current project (auto-fetched when project changes)
- View task details (TaskDetails page)
- Delete task (leader only — trash icon in TaskDetails)
- Update task status (all members — dropdown in ProjectTasks table)
- Change task assignee (leader only — dropdown in Assignee column of ProjectTasks)

### ✅ Comment Domain

- Post comment on a task (all members)
- Get all comments for current task (auto-fetched when task changes via CommentBridge)
- Own comments right-aligned, others left-aligned (keyed off `comment.userEmail === user.email`)
- Ctrl/Cmd+Enter shortcut to submit
- Auto-scroll to latest comment on new post

### ✅ Infrastructure

- Docker Compose (MySQL + Spring Boot + React/nginx)
- CORS configured in SecurityConfig.java
- Environment variable injection via .env
- Multi-stage Docker builds for both services

---

## 9. Pending / Not Yet Implemented

---

## 10. Decisions

### Decision: Redux kept for theme only

Redux is intentionally not removed. `themeSlice` uses localStorage to persist dark/light mode and applies the class to `document.documentElement`. All other state is Context API.

### Decision: No `workspaceSlice` in Redux

`workspaceSlice` was removed from Redux entirely. Workspace state lives in `WorkspaceContext`. The Redux store only has `theme` reducer.

### Decision: Separate hook files from context files

Vite fast-refresh requires files to export either only components or only non-components. `AuthProvider` (component) lives in `AuthContext.tsx`. `useAuth` (hook) lives in `hooks/useAuth.ts`. Same pattern for all domains: workspace, user, project, task, comment.

### Decision: Settings removed from ProjectsSidebar

The sidebar's last project sub-item was changed from "Settings" to "Members" (linking to `tab=members`). Reason: the sidebar shows all workspace projects without knowing the user's role per project. Showing "Settings" in the sidebar would expose the link to viewers, who would hit an access-denied state on the project page. Leaders access Settings from the project detail page's own tab bar, which correctly gates it by `currentUserRole`.

### Decision: Task status is not sent on create

`CreateTaskPayload` does not include `taskStatus`. The backend always creates tasks as `TODO` and ignores any status field in the create body. The status dropdown was removed from `CreateTaskDialog` to avoid misleading the user.

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
- `src/main/java/.../dtos/TaskDTO.java` — added `private String id;` field and `.id(task.getId())` in every builder chain inside `TaskService.java` (`createTask`, `getTask`, `getTasks` stream map); required for all frontend task operations that reference a task by ID

---

## 15. shadcn Components Used

```bash
npx shadcn@latest add dropdown-menu   # Navbar user dropdown
npx shadcn@latest add dialog          # UserProfileDialog, WorkspaceDropdown create
npx shadcn@latest add alert-dialog    # Delete confirmations (ProjectSettings)
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
