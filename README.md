# Barmous Compliance AI workspace plugins

This repository publishes evaluation preview downloads for the Barmous Compliance Codex and Claude Code plugins.

- Download page: <https://barmous-compliance.github.io/barmous-plugin-d42ecfb21abc/>
- Published source: `docs/`
- Release version: `v0.1.0`
- Codex SHA-256: `D9363EDC4FF9B2B42D97CB55A77A26FB6C557E4720AE5FEE8DA550A53044D987`
- Claude Code SHA-256: `827599DA3FF7186DEC276D7B3690F90C8BD6BF092BADD2F4A363C68F1C815789`

The landing page is marked `noindex`, `nofollow`, and `noarchive`.

## Verification

```powershell
npm install
npm test
npm run lint
npm audit --omit=dev
```

The test suite renders the application, verifies the static Pages artifact, and checks both published ZIP files by byte size and SHA-256 digest.

## Distribution

This is an evaluation preview, not an open-source release. See `docs/PREVIEW_DISTRIBUTION_NOTICE.md` and `docs/THIRD_PARTY_NOTICES.md`.
