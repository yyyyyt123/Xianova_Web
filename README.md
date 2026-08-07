# Xianova Robotics Website

Official site for **Xianova Robotics（夏仙创新）** — zero-shot generalization for robot manipulation.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- next-intl (`/zh`, `/en`)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/zh`).

## Build

```bash
npm run build
npm start
```

## Structure

- `/[locale]` — home (hero + entry links)
- `/[locale]/technology` — ORGA technology
- `/[locale]/solutions` — products & solutions
- `/[locale]/about` — company & team
- `/[locale]/contact` — contact form

## Deploy

The organization repository is the source of truth. Its `main` branch is
automatically pushed to a public deployment mirror, which is the repository
connected to Vercel:

```text
Xianova-Robotics/website (main)
  -> GitHub Actions
  -> yyyyyt123/Xianova_Web (main)
  -> Vercel
  -> xianova.ai
```

Do not commit directly to `yyyyyt123/Xianova_Web`; changes there will not flow
back to the source repository.

The workflow is guarded so that the copy stored in the deployment mirror is
skipped there; this prevents recursive sync runs.

### One-time GitHub setup

1. Create an SSH key without a passphrase for this automation.
2. Add its public key to `yyyyyt123/Xianova_Web` under **Settings > Deploy
   keys**, with write access enabled.
3. Add its private key to `Xianova-Robotics/website` under **Settings > Secrets
   and variables > Actions** as a repository secret named
   `XIANOVA_WEB_DEPLOY_KEY`.
4. Run the **Sync deployment repository** workflow once, or push to `main`.

The workflow uses a repository-scoped deploy key rather than a personal access
token, so it does not depend on a developer account token or grant access to
unrelated repositories.

### One-time Vercel setup

1. Import `yyyyyt123/Xianova_Web` as a Vercel project.
2. Keep the project root at the repository root, use the Next.js framework
   preset, and select `main` as the Production Branch.
3. Add `xianova.ai` and `www.xianova.ai` in **Project Settings > Domains** and
   choose one as the canonical domain with a redirect from the other.

After that, every push to the source repository's `main` branch updates the
deployment mirror. Vercel sees that push and creates a production deployment.

Before updating the deployment mirror, the workflow performs a clean dependency
install and a production build. It also reconciles the mirror once per hour so
a transient GitHub-hosted runner scheduling failure is retried automatically.

> **Visibility note:** Keep the deployment mirror public unless all source
> commit authors have access to the Vercel project. For private Git repositories,
> Vercel checks commit-author access; on a Hobby team, the commit author must be
> the Hobby team owner.
