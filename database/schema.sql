-- ============================================================================
--  Rathod Brothers — Earthmovers & Heavy Machinery Services
--  MySQL schema
--
--  Usage:
--    mysql -u root -p < database/schema.sql
--
--  Or let the app create everything for you:
--    npm run db:migrate      (creates database + tables if missing)
--
--  Notes:
--    * utf8mb4 throughout so Indic names / emoji in enquiries store correctly.
--    * Passwords are NEVER stored in plain text. The `admins.password_hash`
--      column stores a bcrypt hash produced by the seed script
--      (npm run db:seed). There is deliberately no default admin password
--      checked into this repository.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `rathod_brothers`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `rathod_brothers`;

-- ---------------------------------------------------------------------------
-- admins — staff accounts for the /admin dashboard
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(120)  NOT NULL,
  `email`         VARCHAR(190)  NOT NULL,
  `password_hash` VARCHAR(255)  NOT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- enquiries — quote / project requests submitted from the website
--
-- status is constrained at the database level as well as in the API so that a
-- bug (or a manual edit) cannot introduce an unknown workflow state.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(120) NOT NULL,
  `phone`          VARCHAR(32)  NOT NULL,
  `service`        VARCHAR(80)  NOT NULL,
  `pickup`         VARCHAR(180) DEFAULT NULL,
  `destination`    VARCHAR(180) DEFAULT NULL,
  `preferred_date` DATE         DEFAULT NULL,
  `message`        TEXT         DEFAULT NULL,
  `status`         ENUM('NEW','CONTACTED','IN_PROGRESS','COMPLETED','CANCELLED')
                   NOT NULL DEFAULT 'NEW',
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enquiries_status`     (`status`),
  KEY `idx_enquiries_created_at` (`created_at`),
  KEY `idx_enquiries_phone`      (`phone`),
  KEY `idx_enquiries_service`    (`service`),
  -- Supports the admin search box (name / phone / pickup / destination).
  FULLTEXT KEY `ft_enquiries_search` (`name`, `phone`, `pickup`, `destination`, `message`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
