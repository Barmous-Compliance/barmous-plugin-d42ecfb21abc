# Barmous Compliance for Kimi Code

This is an installable Kimi Code plugin. Its root `kimi.plugin.json` declares five compliance skills and the bundled local stdio MCP server.

## Install

1. Extract this ZIP.
2. Install and authorize the Barmous CLI:

```powershell
npm install --global ./runtime
barmous login
barmous status
```

3. In Kimi Code, install the extracted directory with `/plugins install <full-path-to-extracted-folder>`.
4. Run `/reload` or start a new session.
5. Use `/plugins mcp enable barmous-company-data barmous` if the server was disabled, then verify it with `/mcp`.

Kimi also supports ZIP URLs and GitHub URLs after this package is hosted. No credential is bundled; the MCP server reads the local browser-authorized Barmous profile.
