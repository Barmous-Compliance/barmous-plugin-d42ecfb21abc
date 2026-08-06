# Barmous Compliance integration packages

This v0.3.0 release contains one package for every client shown on the Barmous MCP and CLI setup page:

- OpenAI plugin source for ChatGPT Work and Codex
- Claude Code marketplace plugin
- Cursor Agent Plugin
- Google Antigravity plugin
- Perplexity connector setup kit
- Kimi Code installable plugin
- Hermes connector setup kit

The packages all use the same read-only Barmous CLI and local stdio MCP runtime. No credential, company data, pasted token, or private endpoint is included. Run `barmous login` after installation; the default credential lifetime is non-expiring but remains revocable.

The package type is intentionally different where a client does not support an uploadable plugin ZIP. Read the README inside each package before installing it.
