# CI/CD Integration Example

This example demonstrates how to integrate `algolia-codegen` into your CI/CD pipeline using GitHub Actions.

## Workflows Included

### 1. Automatic Type Generation (`codegen.yml`)

This workflow automatically generates Algolia types and commits them back to the repository.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via `workflow_dispatch`
- Daily schedule (midnight UTC)

**Features:**
- Generates types from Algolia indices
- Automatically commits changes if types are updated
- Creates PRs for scheduled runs

### 2. Pre-commit Type Check (`pre-commit-check.yml`)

This workflow ensures that generated types are always up to date in pull requests.

**Triggers:**
- Pull requests to `main` or `develop` branches

**Features:**
- Validates that types are current
- Fails the check if types need to be regenerated
- Provides clear error messages

## Setup

### 1. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

- `ALGOLIA_APP_ID`: Your Algolia Application ID
- `ALGOLIA_SEARCH_KEY`: Your Algolia Search API Key

**To add secrets:**
1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each secret with its value

### 2. Copy Workflows

Copy the workflow files to your repository:

```bash
mkdir -p .github/workflows
cp examples/ci-cd-integration/.github/workflows/* .github/workflows/
```

### 3. Customize Configuration

Update `algolia-codegen.ts` with your specific configuration:

```typescript
const config: AlgoliaCodegenConfig = {
  overwrite: true,
  generates: {
    'src/types/algolia.ts': {
      appId: process.env.ALGOLIA_APP_ID!,
      searchKey: process.env.ALGOLIA_SEARCH_KEY!,
      indexName: 'your_index_name',
    },
  },
};
```

## Usage Scenarios

### Scenario 1: Automatic Updates

The workflow runs daily and automatically updates types if your Algolia index structure changes:

1. Workflow triggers at midnight UTC
2. Types are generated from current Algolia index
3. If changes are detected, a PR is created
4. Review and merge the PR to update types

### Scenario 2: Pre-commit Validation

Before merging PRs, the workflow ensures types are up to date:

1. Developer creates a PR
2. Workflow runs and generates types
3. If types differ from committed types, check fails
4. Developer runs `pnpm codegen` locally and commits changes

### Scenario 3: Manual Trigger

You can manually trigger type generation:

1. Go to "Actions" tab in GitHub
2. Select "Generate Algolia Types" workflow
3. Click "Run workflow"
4. Types are generated and committed automatically

## Alternative CI/CD Platforms

### GitLab CI

```yaml
# .gitlab-ci.yml
generate-types:
  image: node:20
  before_script:
    - npm install -g pnpm
    - pnpm install
  script:
    - pnpm codegen
  only:
    - main
    - schedules
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  generate-types:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm codegen
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Generate Types') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install'
                sh 'pnpm codegen'
            }
        }
    }
}
```

## Best Practices

1. **Use Secrets**: Never commit Algolia credentials to your repository
2. **Schedule Regular Updates**: Run type generation on a schedule to catch schema changes
3. **Validate in PRs**: Use pre-commit checks to ensure types stay up to date
4. **Review Changes**: Always review auto-generated PRs before merging
5. **Monitor Failures**: Set up notifications for failed workflow runs

## Troubleshooting

### Workflow Fails with "Missing Secrets"

Ensure all required secrets are configured in GitHub repository settings.

### Types Not Updating

Check that:
- Algolia credentials are correct
- Index name matches your configuration
- Workflow has permission to commit changes

### Permission Errors

Ensure the GitHub token has write permissions:
- Go to repository settings
- Navigate to "Actions" → "General"
- Under "Workflow permissions", select "Read and write permissions"

