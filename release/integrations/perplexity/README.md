# Barmous Compliance for Perplexity

This is a connector setup kit, not a fake plugin archive. Perplexity supports custom remote MCP connectors and a local MCP helper in its macOS app.

## Local MCP

1. Extract this ZIP.
2. Install and authorize the Barmous CLI:

```powershell
npm install --global ./runtime
barmous login
barmous status
```

3. In Perplexity's local MCP helper, create a Simple connector and use the command in `config/LOCAL_COMMAND.txt`.

## Remote MCP

The verified public Barmous Streamable HTTP endpoint has not been released. `config/REMOTE_CONNECTOR.md` records the safe setup fields without inventing a URL or asking for a pasted agent token. When Barmous publishes the endpoint, Perplexity may require an eligible plan and administrator approval.
