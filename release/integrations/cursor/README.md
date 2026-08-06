# Barmous Compliance for Cursor

This is a portable Cursor Agent Plugin containing five compliance skills and the local read-only Barmous MCP server.

## Install

1. Extract this ZIP.
2. From the extracted folder, install the browser-authorized Barmous CLI:

```powershell
npm install --global ./runtime
barmous login
barmous status
```

3. Copy the extracted plugin folder to `~/.cursor/plugins/local/barmous-company-data`.
4. Restart Cursor or run **Developer: Reload Window**.
5. Open Cursor's Customize page and verify that the Barmous skills and MCP server are enabled.

Cursor loads `plugin.json`, `mcp.json`, and the `skills/` directory from the extracted plugin. The MCP process reads the local Barmous profile created by browser login. No token belongs in the plugin configuration.
