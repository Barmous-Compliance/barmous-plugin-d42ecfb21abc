# Barmous Compliance for Claude Code

This v0.3.0 bundle provides the same read-only Barmous CLI and local stdio MCP runtime as the Codex package, plus five Claude Code skills. No credential or company data is bundled and the plugin no longer asks users to paste a token into plugin settings.

## Install and log in

From the extracted plugin directory:

```powershell
npm install --global .
barmous login
barmous status
```

Browser login supports `1h`, `1d`, `7d`, `30d`, `60d`, `90d`, `180d`, `1y` (365 days), and `never`; `never` is the default. Use `--expires-in 7d` for a finite lifetime and `--profile NAME` for separate accounts. Legacy numeric `30`, `60`, and `90` values remain accepted. Non-expiring credentials remain revocable, no lifetime extends with activity, and existing profiles are never overwritten silently.

## Install the Claude plugin

```powershell
claude plugin marketplace add Barmous-Compliance/barmous-plugin-d42ecfb21abc
claude plugin install barmous-company-data@barmous
claude plugin enable barmous-company-data@barmous
```

For an extracted marketplace bundle, pass its root path to `claude plugin marketplace add` instead. Run `/reload-plugins`, then `/mcp`. The MCP starts logged out, advertises nine read-only tools, and reads the CLI profile lazily after login.

## Included skills

- `/barmous-company-data:barmous-company-brief`
- `/barmous-company-data:barmous-framework-review`
- `/barmous-company-data:barmous-findings-triage`
- `/barmous-company-data:barmous-evidence-gap-review`
- `/barmous-company-data:barmous-remediation-plan`

The backend derives company access from the credential and audits reads. This local stdio package has no mutation, tenant selector, raw evidence, file, billing, arbitrary API, or SQL tool. A future hosted MCP OAuth service is separate from this local credential profile.
