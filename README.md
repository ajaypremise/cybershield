# CyberShield Australia

Next.js website with a customer-safe confirmation and digital-agreement workflow.

- `/portal` is the restricted agent workspace. It uses `AGENT_PORTAL_PASSWORD`, exact lookup only, masked lookup results and short-lived session-bound record tokens.
- `/admin` is the owner workspace. It uses `ADMIN_PASSWORD` and provides full search, customer corrections, notes, delivery history, reporting and audit events.
- `/sign/[token]` is the public single-use agreement signing surface.

The Vercel build command is unchanged. Database migrations are never run automatically during a build. Use the manually dispatched **Run Prisma Migration** GitHub Actions workflow after reviewing a migration.

Local checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.

