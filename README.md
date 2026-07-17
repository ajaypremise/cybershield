# CyberShield Australia

Next.js App Router website for CyberShield Australia, including protected customer purchase confirmations and a secure digital-agreement workflow.

Production configuration, migrations, Resend DNS, private storage and legal-review steps are documented in [OPERATIONS.md](./OPERATIONS.md).

## Local verification

```text
pnpm install
pnpm prisma:generate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Copy `.env.example` to `.env.local` and supply development-only values before running database-backed pages locally.

