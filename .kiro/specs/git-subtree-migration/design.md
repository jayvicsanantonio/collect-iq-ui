# Design Document: Git Subtree Migration

## Overview

This design outlines the technical approach for migrating the `apps/web` directory to use the external `collect-iq-ui` repository as a Git subtree. The solution uses Git's built-in subtree functionality to maintain a clean integration between the monorepo and the external UI repository.

## Architecture

### Repository Structure

```
collect-iq/ (Parent Repository)
├── apps/
│   └── web/                    # Git subtree → collect-iq-ui
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── package.json
├── services/
├── packages/
├── infra/
└── .git/
    └── subtree-cache/          # Git subtree metadata
```

### Git Subtree Model

```
┌─────────────────────────────────────┐
│   collect-iq (Parent Repo)         │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  apps/web (Subtree)         │  │
│   │  ↕ sync                     │  │
│   │  https://github.com/        │  │
│   │  jayvicsanantonio/          │  │
│   │  collect-iq-ui              │  │
│   └─────────────────────────────┘  │
│                                     │
│   Other workspace packages...      │
└─────────────────────────────────────┘
```

## Components and Interfaces

### 1. Git Remote Configuration

**Purpose**: Establish connection to the external subtree repository

**Configuration**:

```bash
Remote Name: web-ui
Remote URL: https://github.com/jayvicsanantonio/collect-iq-ui.git
Branch: main
```

**Interface**:

- Git remote commands for adding/removing remotes
- Git fetch for retrieving remote changes

### 2. Subtree Integration

**Purpose**: Embed the external repository as a subdirectory

**Key Operations**:

- `git subtree add`: Initial integration of external repo
- `git subtree pull`: Pull changes from external repo
- `git subtree push`: Push changes to external repo
- `git subtree split`: Extract subtree history

**Subtree Prefix**: `apps/web`

### 3. Migration Workflow

**Phase 1: Preparation**

1. Create backup branch from current main
2. Verify current apps/web is committed
3. Add remote for collect-iq-ui

**Phase 2: Removal**

1. Remove existing apps/web directory
2. Commit the removal
3. This creates a clean slate for subtree addition

**Phase 3: Subtree Addition**

1. Add collect-iq-ui as subtree at apps/web
2. Git creates merge commit with subtree history
3. Verify workspace configuration

**Phase 4: Verification**

1. Run pnpm install
2. Verify build succeeds
3. Check workspace references

### 4. Synchronization Patterns

**Pulling Changes (External → Monorepo)**:

```bash
git subtree pull --prefix=apps/web web-ui main --squash
```

**Pushing Changes (Monorepo → External)**:

```bash
git subtree push --prefix=apps/web web-ui main
```

**Squash Strategy**: Use `--squash` to keep monorepo history clean

## Data Models

### Git Commit Structure

**Subtree Add Commit**:

```
commit: <hash>
author: <developer>
message: "Add 'apps/web' from commit '<external-hash>'"

Squashed commit of the following:
- Initial commit from collect-iq-ui
- [Additional commits if any]
```

**Subtree Pull Commit**:

```
commit: <hash>
author: <developer>
message: "Merge commit '<hash>' as 'apps/web'"

Squashed commit of the following:
- [External commits since last sync]
```

### Workspace Configuration

**pnpm-workspace.yaml** (unchanged):

```yaml
packages:
  - 'apps/*'
  - 'services/*'
  - 'packages/*'
```

**Root package.json** (unchanged):

- Workspace references remain valid
- Scripts continue to work

## Error Handling

### Merge Conflicts

**Scenario**: Changes in both repos conflict during pull

**Resolution**:

1. Git will pause with conflict markers
2. Developer resolves conflicts manually
3. Complete merge with `git commit`
4. Document conflict resolution in commit message

**Prevention**:

- Establish clear ownership boundaries
- Sync frequently to minimize divergence
- Use feature branches for large changes

### Failed Push

**Scenario**: Push to external repo fails (permissions, conflicts)

**Resolution**:

1. Verify remote repository access
2. Pull latest changes from external repo first
3. Resolve any conflicts
4. Retry push operation

**Fallback**:

- Manual push to external repo
- Cherry-pick commits if needed

### Workspace Integrity

**Scenario**: Subtree operation breaks workspace

**Resolution**:

1. Verify package.json exists in apps/web
2. Run `pnpm install` to restore node_modules
3. Check for missing dependencies
4. Rebuild if necessary

**Rollback**:

- Reset to backup branch
- Investigate issue before retrying

## Testing Strategy

### Pre-Migration Tests

1. **Workspace Validation**
   - Run `pnpm install` successfully
   - Run `pnpm web:build` successfully
   - Verify all tests pass

2. **Git State Validation**
   - Ensure working directory is clean
   - Verify no uncommitted changes
   - Check current branch is main

### Post-Migration Tests

1. **Subtree Validation**
   - Verify apps/web directory exists
   - Check git log shows subtree commits
   - Confirm remote is configured

2. **Workspace Validation**
   - Run `pnpm install` successfully
   - Run `pnpm web:build` successfully
   - Verify all tests pass
   - Check workspace references work

3. **Sync Validation**
   - Test pull operation (dry-run)
   - Test push operation (dry-run)
   - Verify no errors in git operations

### Integration Tests

1. **Development Workflow**
   - Make change in apps/web
   - Commit and push to monorepo
   - Push to external repo
   - Verify change appears in collect-iq-ui

2. **External Change Workflow**
   - Make change in collect-iq-ui
   - Pull into monorepo
   - Verify change appears in apps/web
   - Test workspace still functions

## Migration Commands Reference

### Initial Setup

```bash
# 1. Create backup
git checkout -b backup-before-subtree-migration

# 2. Return to main
git checkout main

# 3. Add remote
git remote add web-ui https://github.com/jayvicsanantonio/collect-iq-ui.git
git fetch web-ui

# 4. Remove existing apps/web
git rm -rf apps/web
git commit -m "Remove apps/web in preparation for subtree migration"

# 5. Add subtree
git subtree add --prefix=apps/web web-ui main --squash -m "Add collect-iq-ui as subtree at apps/web"

# 6. Verify
pnpm install
pnpm web:build
```

### Ongoing Operations

```bash
# Pull changes from external repo
git subtree pull --prefix=apps/web web-ui main --squash

# Push changes to external repo
git subtree push --prefix=apps/web web-ui main

# View subtree log
git log --grep="git-subtree-dir: apps/web"
```

## Design Decisions and Rationales

### Why Git Subtree over Submodule?

**Decision**: Use Git subtree instead of Git submodule

**Rationale**:

- Subtree keeps code in the main repository (no separate clone needed)
- Simpler for contributors (no submodule init/update commands)
- Better integration with monorepo workflows
- No .gitmodules file to manage
- Works seamlessly with pnpm workspaces

**Trade-off**: Slightly more complex push/pull commands, but better DX overall

### Why Squash Strategy?

**Decision**: Use `--squash` flag for subtree operations

**Rationale**:

- Keeps monorepo history clean and linear
- Avoids polluting main repo with every external commit
- Easier to understand git log
- Reduces repository size growth

**Trade-off**: Loses granular external commit history in monorepo (still available in external repo)

### Why apps/web Path?

**Decision**: Keep subtree at existing `apps/web` path

**Rationale**:

- Maintains existing workspace structure
- No changes needed to package.json references
- Build scripts continue to work
- Minimal disruption to development workflow

**Trade-off**: None - this is the optimal path

### Backup Strategy

**Decision**: Create backup branch before migration

**Rationale**:

- Provides safety net for rollback
- Allows comparison if issues arise
- Low cost (just a branch reference)
- Can be deleted after successful migration

**Trade-off**: Minimal - just one extra branch

## Security Considerations

### Repository Access

- Ensure proper GitHub permissions for collect-iq-ui
- Use HTTPS or SSH based on authentication setup
- Verify push access before attempting subtree push

### Commit Signing

- Maintain GPG signing if currently enabled
- Subtree commits will be signed by the developer performing the operation

### Sensitive Data

- Verify no secrets in apps/web before making external repo public
- Check .env files are in .gitignore
- Review commit history for accidentally committed secrets

## Performance Considerations

### Repository Size

- Subtree adds external repo history to main repo
- Using --squash minimizes size impact
- Monitor .git directory size after migration

### Clone Time

- Subtree is part of main repo, so clone time includes it
- No additional clone operations needed (unlike submodules)
- Acceptable trade-off for better DX

### Build Performance

- No impact on build performance
- Workspace configuration unchanged
- pnpm continues to work as before

## Documentation Requirements

### README Updates

Create `apps/web/SUBTREE.md` with:

- Explanation of subtree setup
- Common commands for sync operations
- Troubleshooting guide
- Links to external repository

### Root README Updates

Add section explaining:

- apps/web is maintained as external repo
- Link to collect-iq-ui repository
- Link to subtree documentation

### Developer Onboarding

Update onboarding docs with:

- Explanation of subtree approach
- When to work in monorepo vs external repo
- Sync workflow and best practices
