# Requirements Document

## Introduction

This specification defines the requirements for migrating the existing `apps/web` directory to use the external `collect-iq-ui` repository as a Git subtree. This will enable the UI codebase to be maintained as a separate repository while remaining integrated into the CollectIQ monorepo.

## Glossary

- **Parent Repository**: The main CollectIQ monorepo at `collect-iq`
- **Subtree Repository**: The external UI repository at `collect-iq-ui`
- **Git Subtree**: A Git feature that allows embedding one repository inside another as a subdirectory
- **Subtree Remote**: A Git remote reference to the external subtree repository
- **Monorepo**: A repository containing multiple projects/packages in a single repository

## Requirements

### Requirement 1: Repository Integration

**User Story:** As a developer, I want to integrate the collect-iq-ui repository as a subtree, so that UI changes can be maintained separately while staying synchronized with the main repository.

#### Acceptance Criteria

1. WHEN the migration is initiated, THE Parent Repository SHALL preserve the existing apps/web directory in Git history
2. THE Parent Repository SHALL add the Subtree Repository as a Git remote named "web-ui"
3. THE Parent Repository SHALL replace the apps/web directory with content from the Subtree Repository using git subtree add
4. WHEN the subtree is added, THE Parent Repository SHALL maintain a clean commit history showing the subtree integration
5. THE Parent Repository SHALL configure the subtree at the path "apps/web" pointing to the Subtree Repository

### Requirement 2: Bidirectional Synchronization

**User Story:** As a developer, I want to pull changes from collect-iq-ui and push changes back, so that both repositories stay synchronized.

#### Acceptance Criteria

1. WHEN changes exist in the Subtree Repository, THE Parent Repository SHALL pull those changes using git subtree pull
2. WHEN changes are made to apps/web in the Parent Repository, THE Parent Repository SHALL push those changes to the Subtree Repository using git subtree push
3. THE Parent Repository SHALL resolve merge conflicts during pull operations if they occur
4. THE Parent Repository SHALL maintain separate commit histories for both repositories
5. WHEN pulling or pushing, THE Parent Repository SHALL use the main branch of the Subtree Repository

### Requirement 3: Workspace Configuration Preservation

**User Story:** As a developer, I want the monorepo workspace configuration to continue working, so that pnpm commands and build processes remain functional.

#### Acceptance Criteria

1. WHEN the subtree is integrated, THE Parent Repository SHALL maintain the pnpm workspace configuration for apps/web
2. THE Parent Repository SHALL ensure package.json references to @collect-iq/web remain valid
3. WHEN running pnpm install, THE Parent Repository SHALL successfully resolve dependencies for apps/web
4. THE Parent Repository SHALL preserve all build scripts and configurations in apps/web
5. WHEN running monorepo commands, THE Parent Repository SHALL include apps/web in workspace operations

### Requirement 4: Documentation and Developer Guidance

**User Story:** As a developer, I want clear documentation on working with the subtree, so that I can effectively contribute to the UI codebase.

#### Acceptance Criteria

1. THE Parent Repository SHALL provide documentation explaining the subtree setup
2. THE Parent Repository SHALL document commands for pulling changes from collect-iq-ui
3. THE Parent Repository SHALL document commands for pushing changes to collect-iq-ui
4. THE Parent Repository SHALL document the workflow for making UI changes
5. THE Parent Repository SHALL include troubleshooting guidance for common subtree issues

### Requirement 5: Safety and Rollback

**User Story:** As a developer, I want the ability to rollback the migration if issues occur, so that the repository remains stable.

#### Acceptance Criteria

1. WHEN the migration begins, THE Parent Repository SHALL create a backup branch of the current state
2. THE Parent Repository SHALL document the rollback procedure
3. IF the migration fails, THE Parent Repository SHALL provide clear error messages
4. THE Parent Repository SHALL verify the subtree integration before completing the migration
5. WHEN verification fails, THE Parent Repository SHALL halt the migration and provide remediation steps
