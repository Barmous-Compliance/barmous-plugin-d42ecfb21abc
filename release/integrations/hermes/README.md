# Barmous Compliance for Hermes

This is a Hermes MCP connector and skills setup kit. Hermes configures external MCP servers under `mcp_servers`; it does not require a Python plugin wrapper for Barmous.

## Install

1. Extract this ZIP.
2. Install and authorize the Barmous CLI:

```powershell
npm install --global ./runtime
barmous login
barmous status
```

3. Either merge `config/hermes-config.yaml` into `~/.hermes/config.yaml`, or run the commands in `config/COMMANDS.txt`.
4. Copy the optional `skills/` folders into your Hermes skills directory if you want the five Barmous workflows alongside the MCP tools.
5. Run `hermes mcp test barmous`, then start a new Hermes chat.

No token is stored in the YAML. The `barmous` CLI reads the restricted local profile created by browser login.
