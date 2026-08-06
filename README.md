# Barmous Compliance MCP and CLI connections

This repository publishes evaluation preview downloads for the Barmous Compliance read-only CLI and local MCP plugins for Codex and Claude Code. The setup page also explains how Cursor, Gemini + Antigravity, Perplexity, Kimi Code, and Hermes connect as MCP clients without pretending they have separate plugin ZIPs.

- Download page: <https://barmous-compliance.github.io/barmous-plugin-d42ecfb21abc/>
- Published source: `docs/`
- Release version: `v0.3.0`
- Codex bytes: `1,203,409`
- Codex SHA-256: `D7D2499D1AF2F5B5B434D185BB0F0A260ED6F1947ACD913E954B07FDFD8DA65F`
- Claude Code bytes: `422,667`
- Claude Code SHA-256: `C6C6CF6A8C138D88B1F31A4B28F9486A8F0C1577C50D15905C150BF58BD2A7F5`

The landing page is marked `noindex`, `nofollow`, and `noarchive`.

The official Barmous marketplace listing is marked `Coming soon` and is not linked until a verified listing URL is supplied.

## Browser authorization

Install the CLI from either extracted bundle, then authorize a company-scoped, read-only profile in Barmous:

```powershell
npm install --global .\plugins\barmous-company-data
barmous login
barmous status
```

`barmous login` defaults to a revocable non-expiring credential. Choose `1h`, `1d`, `7d`, `30d`, `60d`, `90d`, `180d`, `1y`, or `never`, and keep multiple accounts separate with named profiles:

```powershell
barmous login --expires-in 7d --profile work
barmous login --expires-in 1y --profile audit
barmous status --profile work
```

`1y` means 365 days, and legacy numeric `30`, `60`, and `90` values remain accepted. The browser shows the exact company, scopes, and lifetime before approval. Credentials are stored locally outside plugin configuration, remain revocable, and never extend with activity. The bundled MCP server runs locally over stdio.

## Remote MCP gate

The interactive application reads one optional build-time value, `NEXT_PUBLIC_BARMOUS_MCP_URL`. When it is absent, the MCP setup mode says `Remote MCP is being prepared`, disables endpoint actions, and does not invent a hostname or ask for a pasted secret. Only set this value to the complete verified Streamable HTTP endpoint after the hosted service and its separate browser-authorization boundary are deployed.

The checked-in GitHub Pages mirror intentionally keeps its `barmous-mcp-url` metadata value empty, so the published v0.3.0 page remains in the honest prepared state until a real endpoint release updates it.

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
