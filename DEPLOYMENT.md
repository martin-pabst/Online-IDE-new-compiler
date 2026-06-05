# Deployment Documentation

OnlineIDE uses a hybrid deployment model consisting of a static web frontend hosted on Cloudflare Pages (with a GitHub Pages fallback) and a Dockerized backup/backend.

---

## 1. Frontend Web App (Cloudflare Pages & GitHub Pages Fallback)

The main frontend web application is hosted on **Cloudflare Pages**, which automatically builds and deploys branches of the repository. Additionally, a backup fallback is deployed to **GitHub Pages** during release builds.

### Release Workflow & Branch Management

We maintain two primary deployment environments on Cloudflare Pages using Git branches:

- **Develop / Staging / Previews:**
  - Branch: `preview`
  - Instead of building all commits across all feature branches, preview deployments are managed via GitHub Actions.
  - Whenever a Pull Request is opened, synchronized, reopened, or marked ready for review (and is not a draft), the [Push PR to Preview Branch](.github/workflows/push_preview.yml) workflow automatically force-pushes the PR head commit to the `preview` branch.
  - Cloudflare Pages is configured to build only the `preview` branch for preview deployments, saving significant build minutes.
- **Production:**
  - Branch: `release`
  - Cloudflare Pages is configured to build and deploy any commit on `release` directly to the **Production environment**.

### Automated Releases & GitHub Pages Fallback

Releases are managed using GitHub Actions via the [Manage Release Branch](.github/workflows/release.yml) workflow:

1. When a new GitHub Release is **published** (or the workflow is manually dispatched), the workflow triggers automatically.
2. The workflow checks out the repository at the release's git tag, writes the version to `VERSION` and `package.json`, commits/pushes to the default development branch (e.g., `main`), and force-pushes the commit to the `release` branch.
3. Force-pushing to `release` triggers Cloudflare Pages to build and deploy to production.
4. During the build, the app reads the application version from the `package.json` file.
5. In parallel to the Cloudflare trigger, the workflow builds the static frontend and deploys it to GitHub Pages.

#### GitHub Pages Setup Requirements

For the GitHub Pages fallback deployment to succeed, configure the following settings in the repository:
1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set the **Source** to **GitHub Actions** (instead of "Deploy from a branch").
3. (Optional) If you use a custom domain for GitHub Pages, set the `CUSTOM_DOMAIN` repository variable.

---

## 2. Docker Containers (Self-Hosted Staging/Production)

We build and deploy Docker images to our container registry and can deploy them to our self-hosted server via the [Build and Deploy Docker image](.github/workflows/deploy_docker.yml) workflow.

### Triggering Docker Deploys

The Docker workflow runs on:
- Any `pull_request` when marked **Ready for review**, or when synchronized.
- When a new GitHub **Release** is created.
- Manual triggers via `workflow_dispatch`.

### Required Repository Secrets & Variables

To support Docker builds and server SSH deployments, configure the variables and secrets listed in the GitHub settings (refer to `.github/workflows/deploy_docker.yml` for the exact environment schema).
