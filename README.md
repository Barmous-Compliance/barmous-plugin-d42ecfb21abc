# Barmous Compliance Codex plugin preview

This repository publishes the public-by-link evaluation preview of the Barmous Compliance Codex plugin.

- Download page: <https://barmous-compliance.github.io/barmous-plugin-d42ecfb21abc/>
- Published source: `docs/`
- Plugin version: `0.1.0+codex.20260802110450`
- SHA-256: `8C938340C455B34684D9AF77140D6793D879725B3A616163FEE577E2DC367290`

The page and its randomized URL are marked `noindex`, `nofollow`, and `noarchive`. This discourages search discovery but is not access control: anyone with the URL can download or reshare the package.

## Verification

```powershell
npm install
npm test
npm run lint
npm audit --omit=dev
```

The test suite renders the application, verifies the static Pages artifact, and checks the published ZIP byte size and SHA-256 digest.

## Distribution

This is an evaluation preview, not an open-source release. See `docs/PREVIEW_DISTRIBUTION_NOTICE.md` and `docs/THIRD_PARTY_NOTICES.md`.
