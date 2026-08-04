# Barmous Compliance AI workspace plugins

This repository publishes evaluation preview downloads for the Barmous Compliance read-only CLI and local MCP plugins for Codex and Claude Code.

- Download page: <https://barmous-compliance.github.io/barmous-plugin-d42ecfb21abc/>
- Published source: `docs/`
- Release version: `v0.2.0`
- Codex SHA-256: `06A05BF0F1B745FA4C8C8DEB4425C1685A48CD43545223CD91EECD3F95731E42`
- Claude Code SHA-256: `8FABFA35C8755A32F98BE11BBC6865E87D269BF341A3745880932E041E72E8D5`

The landing page is marked `noindex`, `nofollow`, and `noarchive`.

## Browser authorization

Install the CLI from either extracted bundle, then authorize a company-scoped, read-only profile in Barmous:

```powershell
npm install --global .\plugins\barmous-company-data
barmous login
barmous status
```

`barmous login` defaults to 30 days. Choose 60 or 90 days and keep multiple accounts separate with named profiles:

```powershell
barmous login --expires-in 60 --profile work
barmous login --expires-in 90 --profile audit
barmous status --profile work
```

The browser shows the exact company, scopes, and expiry before approval. Credentials are stored locally outside plugin configuration, can be revoked, and never extend beyond the approved expiry. The bundled MCP server runs locally over stdio; this release does not claim or require a hosted remote MCP endpoint.

## Verification

```powershell
npm install
npm test
npm run lint
npm audit --omit=dev
```

The test suite renders the application, verifies the static Pages artifact, checks both ZIP files by byte size and SHA-256 digest, and inspects the archives for the CLI, local MCP server, manifests, and five skills.

## Distribution

This is an evaluation preview, not an open-source release. See `docs/PREVIEW_DISTRIBUTION_NOTICE.md` and `docs/THIRD_PARTY_NOTICES.md`.
