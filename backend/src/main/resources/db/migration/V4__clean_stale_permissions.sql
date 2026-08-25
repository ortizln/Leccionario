-- V4: Clean stale role_permissions before DataInitializer runs
-- PermissionCode enum evolves over time; stale values in this table cause
-- Hibernate to crash with "No enum constant" on startup.
-- DataInitializer will re-populate correct permissions on every boot.

DELETE FROM role_permissions;
