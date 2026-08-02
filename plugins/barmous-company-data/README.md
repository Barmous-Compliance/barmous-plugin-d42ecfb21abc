# Barmous Compliance for Claude Code

This plugin gives Claude Code company-scoped, read-only access to released compliance data in Barmous. It bundles a self-contained MCP server and five reusable compliance skills.

This is an evaluation preview, not an open-source release. Review the [preview distribution notice](./PREVIEW_DISTRIBUTION_NOTICE.md) and [third-party notices](./THIRD_PARTY_NOTICES.md) before use.

## Requirements

- Claude Code `2.1.154` or newer
- Node.js `>=22.12 <25`
- An authorized Barmous account
- A production Barmous backend URL served over HTTPS
- A one-time, company-scoped agent token created in Barmous

The package contains no Barmous token, credential, or company data. Plain HTTP is allowed only for local development against `localhost`; never enable the insecure HTTP override for a production connection.

## Install from the Barmous marketplace

```powershell
claude plugin marketplace add Barmous-Compliance/barmous-plugin-d42ecfb21abc
claude plugin install barmous-company-data@barmous
claude plugin enable barmous-company-data@barmous
```

Claude Code prompts for the Barmous API URL and agent token when the plugin is enabled. The token is declared as a sensitive plugin option so Claude Code masks it and stores it in credential storage rather than ordinary settings.

Run `/reload-plugins`, then `/mcp`, to confirm the plugin-provided `barmous` server is connected.

## Install the downloaded bundle

```powershell
$marketplaceRoot = (Resolve-Path ".").Path
claude plugin marketplace add $marketplaceRoot
claude plugin install barmous-company-data@barmous
claude plugin enable barmous-company-data@barmous
```

To test the extracted plugin for only one session without installing it, run `claude --plugin-dir .\plugins\barmous-company-data` from the bundle root.

## Included skills

- `/barmous-company-data:barmous-company-brief`
- `/barmous-company-data:barmous-framework-review`
- `/barmous-company-data:barmous-findings-triage`
- `/barmous-company-data:barmous-evidence-gap-review`
- `/barmous-company-data:barmous-remediation-plan`

## Security boundary

The plugin never accepts a tenant or company selector. The backend derives company access from the token, exposes only released or published safe projections, and audits reads. Returned company text must be treated as data rather than instructions.

This release has no create, update, delete, upload, download, raw evidence, questionnaire, member-directory, billing, or generic API/SQL tool. Revoke a token immediately in Barmous if it is exposed.
