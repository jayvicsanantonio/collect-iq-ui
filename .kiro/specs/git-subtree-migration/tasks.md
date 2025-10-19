# Implementation Plan

- [x] 1. Pre-migration validation and backup
  - Verify working directory is clean with no uncommitted changes
  - Ensure current branch is main and up to date
  - Run workspace validation tests (pnpm install, pnpm web:build)
  - Create backup branch named `backup-before-subtree-migration`
  - _Requirements: 5.1, 5.2_

- [x] 2. Configure Git remote for external repository
  - Add Git remote named `web-ui` pointing to https://github.com/jayvicsanantonio/collect-iq-ui.git
  - Fetch remote branches to verify connectivity
  - Verify remote is correctly configured with `git remote -v`
  - _Requirements: 1.2, 1.5_

- [x] 3. Remove existing apps/web directory
  - Use `git rm -rf apps/web` to remove the directory from Git tracking
  - Commit the removal with descriptive message
  - Verify apps/web is completely removed from working directory
  - _Requirements: 1.1_

- [x] 4. Add collect-iq-ui as Git subtree
  - Execute `git subtree add --prefix=apps/web web-ui main --squash` to integrate external repository
  - Verify subtree commit is created in Git history
  - Check that apps/web directory now contains content from collect-iq-ui
  - Confirm Git log shows subtree integration commit
  - _Requirements: 1.3, 1.4, 2.4_

- [x] 5. Verify workspace configuration and functionality
  - Run `pnpm install` to restore dependencies
  - Execute `pnpm web:build` to verify build succeeds
  - Check that workspace references to @collect-iq/web are valid
  - Verify package.json and pnpm-workspace.yaml are correctly configured
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Test synchronization operations
  - Test pull operation with `git subtree pull --prefix=apps/web web-ui main --squash` (dry-run if possible)
  - Test push operation with `git subtree push --prefix=apps/web web-ui main` (dry-run if possible)
  - Verify no errors occur during sync operations
  - Document any issues encountered
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 7. Create documentation for subtree workflow
  - Create `apps/web/SUBTREE.md` with setup explanation and common commands
  - Update root `README.md` with section explaining apps/web subtree setup
  - Document pull command: `git subtree pull --prefix=apps/web web-ui main --squash`
  - Document push command: `git subtree push --prefix=apps/web web-ui main`
  - Include troubleshooting guide for common issues (merge conflicts, failed push)
  - Add workflow guidance for when to work in monorepo vs external repo
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Document rollback procedure
  - Create rollback instructions in documentation
  - Document command to return to backup: `git checkout backup-before-subtree-migration`
  - Document command to reset main: `git reset --hard backup-before-subtree-migration`
  - Include verification steps after rollback
  - _Requirements: 5.2, 5.5_

- [x] 9. Final verification and cleanup
  - Run full test suite to ensure nothing is broken
  - Verify all monorepo commands work correctly
  - Test development workflow (make change, commit, build)
  - Confirm subtree is properly integrated with `git log --grep="git-subtree-dir: apps/web"`
  - Delete backup branch if migration is successful (optional)
  - _Requirements: 5.4_
