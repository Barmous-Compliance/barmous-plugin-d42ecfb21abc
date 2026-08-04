# Barmous Compliance for Codex

This v0.2.0 bundle provides two read-only clients for the same company-scoped Barmous access:

- a standalone `barmous` CLI; and
- a local stdio MCP server plus five Codex compliance skills.

No credential or company data is included. Browser login creates an absolute 30, 60, or 90-day credential; 30 days is the default. The CLI stores it in a restricted named profile that the bundled MCP reads lazily.

## Requirements

- Node.js `>=22.12 <25`
- npm `>=10 <12`
- an authorized Barmous developer/customer account

## Install the CLI from this extracted bundle

Run this from the plugin directory containing `package.json`:

```powershell
npm install --global .
barmous --version
barmous login
barmous status
```

Choose another lifetime or a named account profile when needed:

```powershell
barmous login --expires-in 60 --profile work
barmous status --profile work
```

Login always prints a verification URL and short code. It never prints the device secret, PKCE verifier, or issued credential. Existing named profiles are not overwritten; log out first or choose a different name.

## Install the Codex plugin

From the downloaded marketplace bundle root:

```powershell
$pluginRoot = (Resolve-Path ".").Path
codex plugin marketplace add $pluginRoot
codex plugin add barmous-company-data@barmous
```

Start a new Codex task and run `/mcp`. The server and all nine read-only tools appear even when logged out. Run `barmous login`, then invoke a tool; the long-running MCP process reads the new profile without a restart.

Environment credentials remain an explicit CI/manual fallback. `BARMOUS_API_URL` and `BARMOUS_AGENT_TOKEN` must always be set together and override profiles without cross-mixing.

## Included skills

- `barmous-company-brief`
- `barmous-framework-review`
- `barmous-findings-triage`
- `barmous-evidence-gap-review`
- `barmous-remediation-plan`

## Security boundary

The CLI and local MCP call only the authenticated read-only Barmous API. They cannot select another company or create, update, delete, upload, download, expose raw evidence, or run arbitrary API/SQL requests. Logout revokes remotely before deleting locally; `--force` is only for local cleanup when remote revocation cannot be confirmed.

This is a local stdio MCP. A future hosted Streamable HTTP MCP with OAuth is a separate product and credential boundary; this package does not claim to provide it.
