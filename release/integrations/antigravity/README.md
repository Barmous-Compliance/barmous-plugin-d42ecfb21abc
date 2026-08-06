# Barmous Compliance for Antigravity

This is a Google Antigravity plugin containing five compliance skills and the local read-only Barmous MCP server.

## Install

1. Extract this ZIP.
2. Install the browser-authorized Barmous CLI from the extracted folder:

```powershell
npm install --global ./runtime
barmous login
barmous status
```

3. Install the extracted plugin directory:

```text
agy plugin install <full-path-to-extracted-folder>
```

For workspace-only use, place the folder under `.agents/plugins/barmous-company-data`. For Antigravity IDE, a global plugin can also be placed under `~/.gemini/config/plugins/barmous-company-data`.

Open `/mcp` or the Customizations page after installation and verify the Barmous server. The included `mcp_config.json` launches the bundled stdio server; it does not contain a credential.
