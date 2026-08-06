# Barmous Compliance MCP and CLI connections

This repository publishes evaluation preview packages for the Barmous Compliance read-only CLI and local MCP runtime. The download page provides the real supported format for every displayed client: plugin source for OpenAI Codex/ChatGPT, Claude Code, Cursor, Antigravity, and Kimi Code; connector setup kits for Perplexity and Hermes; plus one all-in-one ZIP.

- Download page: <https://barmous-compliance.github.io/barmous-plugin-d42ecfb21abc/>
- Published source: `docs/`
- Release version: `v0.3.0`
- Generated manifest: `release/integration-downloads.generated.json`
- Reproducible package builder: `scripts/build-integration-downloads.ps1`
- Complete bundle: `public/downloads/barmous-compliance-all-integrations-v0.3.0.zip`

The landing page is marked `noindex`, `nofollow`, and `noarchive`.

The official Barmous marketplace listing is marked `Coming soon` and is not linked until a verified listing URL is supplied.

## Browser authorization

Install the CLI from the extracted package using the path shown in its README, then authorize a company-scoped, read-only profile in Barmous. The client-specific packages use `runtime`; the Codex and Claude marketplace bundles use `plugins/barmous-company-data`.

```powershell
npm install --global .\runtime
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
& .\scripts\build-integration-downloads.ps1
npm test
npm run lint
npm audit --omit=dev
```

The deterministic builder creates the five additional client packages, copies all seven packages into the complete bundle, writes SHA-256 metadata, and mirrors the exact bytes into `public/downloads` and `docs/downloads`. The test suite renders the application, verifies the static Pages artifact, checks every ZIP by byte size and SHA-256 digest, and inspects the archives for the expected manifests, CLI, MCP runtime, skills, and absence of credential-like material.

ZIP does not imply that every client has a generic upload screen. Install each package using the instructions inside it: marketplace source where supported, local plugin folders for Cursor, Antigravity, and Kimi Code, and MCP configuration for Perplexity and Hermes.

## Distribution

This is an evaluation preview, not an open-source release. See `docs/PREVIEW_DISTRIBUTION_NOTICE.md` and `docs/THIRD_PARTY_NOTICES.md`.
