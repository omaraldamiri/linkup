-- =============================================================================
-- LinkUp — SQL query reference (manual / DBA / debugging)
-- =============================================================================
-- This file does NOT replace schema creation (use Hibernate ddl-auto or export DDL).
-- Full demo INSERTs live in: scripts/seed-demo-data.sql
-- Run order (fresh dev DB): 1) optional reset below  2) seed-demo-data.sql
-- =============================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 1) Introspection
-- ---------------------------------------------------------------------------

-- SHOW TABLES;
-- SHOW CREATE TABLE users\G
-- SHOW CREATE TABLE workspaces\G
-- SHOW CREATE TABLE workspace_members\G
-- SHOW CREATE TABLE workspace_invitations\G
-- SHOW CREATE TABLE projects\G
-- SHOW CREATE TABLE project_members\G
-- SHOW CREATE TABLE tasks\G
-- SHOW CREATE TABLE comments\G

-- SELECT TABLE_NAME, TABLE_ROWS
-- FROM information_schema.TABLES
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_TYPE = 'BASE TABLE'
-- ORDER BY TABLE_NAME;

-- ---------------------------------------------------------------------------
-- 2) Row counts (sanity check after seed or app use)
-- ---------------------------------------------------------------------------

SELECT 'users' AS tbl, COUNT(*) AS n FROM users
UNION ALL SELECT 'workspaces', COUNT(*) FROM workspaces
UNION ALL SELECT 'workspace_members', COUNT(*) FROM workspace_members
UNION ALL SELECT 'workspace_invitations', COUNT(*) FROM workspace_invitations
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'project_members', COUNT(*) FROM project_members
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'comments', COUNT(*) FROM comments;

-- ---------------------------------------------------------------------------
-- 3) DEV ONLY — wipe all application data (destructive; removes every user)
-- ---------------------------------------------------------------------------
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE comments;
-- TRUNCATE TABLE tasks;
-- TRUNCATE TABLE project_members;
-- TRUNCATE TABLE projects;
-- TRUNCATE TABLE workspace_invitations;
-- TRUNCATE TABLE workspace_members;
-- TRUNCATE TABLE workspaces;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- 4) Remove only seed-demo-data.sql rows (fixed UUID prefixes), then re-seed
--    Safe if you never assign real users those IDs. Order: children first.
-- ---------------------------------------------------------------------------

-- DELETE FROM comments WHERE id LIKE '50000000-0000-4000-8000-%';
-- DELETE FROM tasks WHERE id LIKE '40000000-0000-4000-8000-%';
-- DELETE FROM project_members WHERE id LIKE '31000000-0000-4000-8000-%';
-- DELETE FROM projects WHERE id LIKE '30000000-0000-4000-8000-%';
-- DELETE FROM workspace_invitations WHERE id LIKE '22000000-0000-4000-8000-%';
-- DELETE FROM workspace_members WHERE id LIKE '21000000-0000-4000-8000-%';
-- DELETE FROM workspaces WHERE id LIKE '20000000-0000-4000-8000-%';
-- DELETE FROM users WHERE id LIKE '10000000-0000-4000-8000-%';

-- ---------------------------------------------------------------------------
-- 5) Sample reads (joins similar to app services)
-- ---------------------------------------------------------------------------

-- Workspaces a user belongs to (JPQL: WorkspaceRepository)
-- SET @user_id = '10000000-0000-4000-8000-000000000001';
-- SELECT DISTINCT w.*
-- FROM workspaces w
-- INNER JOIN workspace_members wm ON wm.workspace_id = w.id
-- WHERE wm.user_id = @user_id;

-- Projects where user is a member (JPQL: ProjectRepository)
-- SET @user_id = '10000000-0000-4000-8000-000000000001';
-- SELECT DISTINCT p.*
-- FROM projects p
-- INNER JOIN project_members pm ON pm.project_id = p.id
-- WHERE pm.user_id = @user_id;

-- Count tasks in a workspace for a user (JPQL: TaskRepository.countByWorkspaceForUser)
-- SET @user_id = '10000000-0000-4000-8000-000000000001';
-- SET @workspace_id = '20000000-0000-4000-8000-000000000001';
-- SELECT COUNT(*) AS task_count
-- FROM tasks t
-- INNER JOIN projects p ON p.id = t.project_id
-- INNER JOIN workspaces w ON w.id = p.workspace_id
-- INNER JOIN project_members pm ON pm.project_id = p.id
-- WHERE w.id = @workspace_id AND pm.user_id = @user_id;

-- Tasks due in a window (Spring Data method name — no custom @Query)
-- SELECT t.id, t.title, t.due_time, t.task_status
-- FROM tasks t
-- WHERE t.due_time BETWEEN '2026-05-01 00:00:00' AND '2026-05-31 23:59:59'
--   AND t.task_status <> 'DONE';

-- ---------------------------------------------------------------------------
-- 6) Optional: list emails from seed users
-- ---------------------------------------------------------------------------

-- SELECT id, email, name, o_auth2_user FROM users WHERE email LIKE '%@example.com' ORDER BY email;
