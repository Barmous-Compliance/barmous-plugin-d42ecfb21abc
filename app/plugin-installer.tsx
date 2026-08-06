"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import ProductMark, { type ProductId } from "./product-mark";

type ClientId = ProductId;
type ModeId = "mcp" | "cli";

type SetupStep = {
  title: string;
  description: string;
  command?: string;
  copyLabel?: string;
  status?: string;
  action?: {
    href: string;
    label: string;
    download?: boolean;
    external?: boolean;
  };
};

type ClientDefinition = {
  id: ClientId;
  label: string;
  maker: string;
  kind: "Plugin" | "Connector";
};

const CLIENT_IDS: ClientId[] = [
  "codex",
  "claude",
  "cursor",
  "antigravity",
  "perplexity",
  "kimi",
  "hermes",
];
const MODE_IDS: ModeId[] = ["mcp", "cli"];

const clients: ClientDefinition[] = [
  { id: "codex", label: "Codex", maker: "OpenAI", kind: "Plugin" },
  { id: "claude", label: "Claude Code", maker: "Anthropic", kind: "Plugin" },
  { id: "cursor", label: "Cursor", maker: "Anysphere", kind: "Plugin" },
  {
    id: "antigravity",
    label: "Antigravity",
    maker: "Google",
    kind: "Plugin",
  },
  {
    id: "perplexity",
    label: "Perplexity",
    maker: "Perplexity",
    kind: "Connector",
  },
  {
    id: "kimi",
    label: "Kimi Code",
    maker: "Moonshot AI",
    kind: "Plugin",
  },
  {
    id: "hermes",
    label: "Hermes",
    maker: "Nous Research",
    kind: "Connector",
  },
];

const REMOTE_MCP_URL = verifiedRemoteMcpUrl(
  process.env.NEXT_PUBLIC_BARMOUS_MCP_URL,
);
const GITHUB_SOURCE_URL =
  "https://github.com/Barmous-Compliance/barmous-plugin-d42ecfb21abc";
const CODEX_DOWNLOAD = "/downloads/barmous-compliance-codex-plugin-v0.3.0.zip";
const CLAUDE_DOWNLOAD = "/downloads/barmous-compliance-claude-plugin-v0.3.0.zip";
const LOCAL_PACKAGE_DOWNLOADS: Record<Exclude<ClientId, "codex" | "claude">, string> = {
  cursor: "/downloads/barmous-compliance-cursor-plugin-v0.3.0.zip",
  antigravity: "/downloads/barmous-compliance-antigravity-plugin-v0.3.0.zip",
  perplexity: "/downloads/barmous-compliance-perplexity-connector-v0.3.0.zip",
  kimi: "/downloads/barmous-compliance-kimi-code-plugin-v0.3.0.zip",
  hermes: "/downloads/barmous-compliance-hermes-connector-v0.3.0.zip",
};

function verifiedRemoteMcpUrl(value: string | undefined): string {
  if (!value?.trim()) return "";
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function clientById(id: ClientId): ClientDefinition {
  return clients.find((client) => client.id === id) ?? clients[0];
}

function cursorRemoteConfig(endpoint: string) {
  return JSON.stringify(
    {
      mcpServers: {
        barmous: {
          url: endpoint,
        },
      },
    },
    null,
    2,
  );
}

function antigravityRemoteConfig(endpoint: string) {
  return JSON.stringify(
    {
      mcpServers: {
        barmous: {
          serverUrl: endpoint,
        },
      },
    },
    null,
    2,
  );
}

function kimiRemoteConfig(endpoint: string) {
  return JSON.stringify(
    {
      mcpServers: {
        barmous: {
          url: endpoint,
        },
      },
    },
    null,
    2,
  );
}

function remoteSetupStep(client: ClientDefinition, endpoint: string): SetupStep {
  if (client.id === "cursor") {
    return {
      title: "Add Barmous to Cursor",
      description:
        "Add this server to your user or project MCP configuration, then refresh Cursor's MCP tools.",
      command: cursorRemoteConfig(endpoint),
      copyLabel: "Copy Cursor configuration",
    };
  }

  if (client.id === "antigravity") {
    return {
      title: "Add Barmous to Antigravity",
      description: "Add this Streamable HTTP server definition in Manage MCP Servers.",
      command: antigravityRemoteConfig(endpoint),
      copyLabel: "Copy Antigravity configuration",
    };
  }

  if (client.id === "perplexity") {
    return {
      title: "Add a remote connector",
      description:
        "In Perplexity, open Account settings → Connectors → Add custom connector. Choose Remote, Streamable HTTP, and OAuth. Your plan or admin must allow custom connectors.",
      status: "Use the copied endpoint",
    };
  }

  if (client.id === "kimi") {
    return {
      title: "Add Barmous to Kimi Code",
      description:
        "Save this server in ~/.kimi-code/mcp.json, start a new Kimi Code session, run /mcp-config login barmous, then use /mcp to verify the connection.",
      command: kimiRemoteConfig(endpoint),
      copyLabel: "Copy Kimi Code configuration",
    };
  }

  if (client.id === "hermes") {
    return {
      title: "Add Barmous to Hermes",
      description:
        "Register the authenticated HTTP server, complete browser authorization, and test the connection before opening Hermes chat.",
      command: [
        `hermes mcp add barmous --url ${endpoint} --auth oauth`,
        "hermes mcp login barmous",
        "hermes mcp test barmous",
      ].join("\n"),
      copyLabel: "Copy Hermes commands",
    };
  }

  if (client.id === "claude") {
    return {
      title: "Add Barmous to Claude Code",
      description: "Register the verified HTTP endpoint, then confirm it with /mcp.",
      command: `claude mcp add --transport http barmous ${endpoint}\n/mcp`,
      copyLabel: "Copy Claude Code MCP commands",
    };
  }

  return {
    title: "Add the remote MCP",
    description:
      "Open Codex MCP settings, create a server named Barmous, and use the copied Streamable HTTP URL.",
    status: "Use the copied endpoint",
  };
}

function remoteSteps(client: ClientDefinition): SetupStep[] {
  if (!REMOTE_MCP_URL) {
    return [
      {
        title: "Remote MCP is being prepared",
        description:
          "The public Streamable HTTP endpoint has not been published. Barmous will show one verified URL here when the service and OAuth boundary are ready.",
        status: "Endpoint not available",
      },
      {
        title: `Keep ${client.label} ready`,
        description:
          client.id === "perplexity"
            ? "Custom remote connectors may require a paid plan and administrator approval. No connector needs to be created yet."
            : "No client configuration is required until the verified endpoint is published.",
        status: `${client.kind} setup pending`,
      },
      {
        title: "Sign in when available",
        description:
          "Connection will open Barmous in your browser. You will never paste an agent token or secret into the client.",
        status: "Browser authorization pending",
      },
    ];
  }

  return [
    {
      title: "Copy the Barmous MCP URL",
      description:
        "Use this single verified endpoint for the remote Barmous compliance connection.",
      command: REMOTE_MCP_URL,
      copyLabel: "Copy MCP endpoint",
    },
    remoteSetupStep(client, REMOTE_MCP_URL),
    {
      title: "Sign in and verify",
      description:
        "Complete Barmous browser authorization, then ask the client to check the current failing compliance tests.",
      command: "Show the failing compliance tests for this workspace.",
      copyLabel: "Copy verification prompt",
    },
  ];
}

function pluginCliSteps(client: ClientDefinition): SetupStep[] {
  const isCodex = client.id === "codex";
  return [
    {
      title: `Download the ${client.label} bundle`,
      description:
        "Download the verified v0.3.0 preview ZIP and extract it to a folder you control.",
      action: {
        href: isCodex ? CODEX_DOWNLOAD : CLAUDE_DOWNLOAD,
        label: `Download ${client.label} ZIP`,
        download: true,
      },
    },
    {
      title: "Install the CLI and plugin",
      description: isCodex
        ? "Open PowerShell in the extracted bundle root. Install the CLI, register the bundled marketplace, and enable the Codex plugin."
        : "Open PowerShell in the extracted bundle root. Install the CLI, add the bundled marketplace, and enable the Claude plugin.",
      command: isCodex
        ? [
            "npm install --global .\\plugins\\barmous-company-data",
            '$pluginRoot = (Resolve-Path ".").Path',
            "codex plugin marketplace add $pluginRoot",
            "codex plugin add barmous-company-data@barmous",
          ].join("\n")
        : [
            "npm install --global .\\plugins\\barmous-company-data",
            "claude plugin marketplace add .",
            "claude plugin install barmous-company-data@barmous",
            "claude plugin enable barmous-company-data@barmous",
          ].join("\n"),
    },
    {
      title: "Authorize and verify",
      description: isCodex
        ? "Login defaults to a revocable non-expiring profile. Choose 1h, 1d, 7d, 30d, 60d, 90d, 180d, 1y, or never, then start a new Codex task and run /mcp."
        : "Login defaults to a revocable non-expiring profile. Choose 1h, 1d, 7d, 30d, 60d, 90d, 180d, 1y, or never, then reload Claude plugins and run /mcp.",
      command: isCodex
        ? ["barmous login", "barmous status", "/mcp in Codex"].join("\n")
        : ["barmous login", "barmous status", "/reload-plugins", "/mcp"].join("\n"),
    },
  ];
}

function localPackageCliSteps(
  client: ClientDefinition & { id: Exclude<ClientId, "codex" | "claude"> },
): SetupStep[] {
  let finalStep: SetupStep;

  if (client.id === "cursor") {
    finalStep = {
      title: "Load the Cursor plugin",
      description:
        "Copy the extracted folder to ~/.cursor/plugins/local/barmous-company-data, then restart Cursor or run Developer: Reload Window. The MCP definition and five skills are already included.",
      status: "Plugin folder included",
    };
  } else if (client.id === "antigravity") {
    finalStep = {
      title: "Install the Antigravity plugin",
      description:
        "Install the extracted plugin folder. Antigravity loads its bundled mcp_config.json and five compliance skills.",
      command: "agy plugin install <full-path-to-extracted-folder>\n/mcp",
      copyLabel: "Copy Antigravity install command",
    };
  } else if (client.id === "kimi") {
    finalStep = {
      title: "Install the Kimi Code plugin",
      description:
        "Install the extracted folder, reload plugins, then verify the bundled Barmous MCP server. Kimi loads kimi.plugin.json directly.",
      command: [
        "/plugins install <full-path-to-extracted-folder>",
        "/reload",
        "/mcp",
      ].join("\n"),
      copyLabel: "Copy Kimi Code install steps",
    };
  } else if (client.id === "hermes") {
    finalStep = {
      title: "Connect and test Hermes",
      description:
        "Register the local stdio server, test it, then start a new Hermes chat. The same definition can also be stored under mcp_servers in ~/.hermes/config.yaml.",
      command: [
        "hermes mcp add barmous --command barmous --args mcp",
        "hermes mcp test barmous",
        "hermes chat",
      ].join("\n"),
      copyLabel: "Copy Hermes commands",
    };
  } else {
    finalStep = {
      title: "Add the local connector",
      description:
        "Perplexity local MCP currently requires its macOS app and helper. Add a Simple connector with this server command; other platforms should use remote MCP when available.",
      command: "barmous mcp",
      copyLabel: "Copy Perplexity server command",
    };
  }

  return [
    {
      title: "Download the " + client.label + " package",
      description:
        "Download the verified client-specific ZIP and extract it to a folder you control.",
      action: {
        href: LOCAL_PACKAGE_DOWNLOADS[client.id],
        label: "Download " + client.label + " ZIP",
        download: true,
      },
    },
    {
      title: "Install and authorize Barmous",
      description:
        "Login opens Barmous. Match the short code, choose the exact company, review the read-only scopes, and approve the default revocable non-expiring profile or choose 1h, 1d, 7d, 30d, 60d, 90d, 180d, or 1y.",
      command: [
        "npm install --global ./runtime",
        "barmous login",
        "barmous status",
      ].join("\n"),
    },
    finalStep,
  ];
}

function cliSteps(client: ClientDefinition): SetupStep[] {
  if (client.id === "codex" || client.id === "claude") {
    return pluginCliSteps(client);
  }
  return localPackageCliSteps(
    client as ClientDefinition & { id: Exclude<ClientId, "codex" | "claude"> },
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-2.85 17.54c.45.08.62-.2.62-.44v-1.72c-2.53.55-3.06-1.08-3.06-1.08-.41-1.06-1.02-1.34-1.02-1.34-.83-.57.06-.56.06-.56.92.07 1.4.95 1.4.95.82 1.41 2.14 1 2.66.77.08-.6.32-1 .58-1.23-2.02-.23-4.14-1.02-4.14-4.51 0-1 .35-1.81.94-2.45-.1-.23-.41-1.16.08-2.42 0 0 .77-.25 2.48.94A8.6 8.6 0 0 1 12 7.15a8.5 8.5 0 0 1 2.26.3c1.72-1.19 2.48-.94 2.48-.94.5 1.26.19 2.19.1 2.42.58.64.93 1.45.93 2.45 0 3.5-2.13 4.27-4.15 4.5.33.29.62.86.62 1.74v2.48c0 .24.16.52.62.43A9 9 0 0 0 12 3Z" />
    </svg>
  );
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the compatibility copy path.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command was rejected");
}

function CommandBox({ value, label = "Copy command" }: { value: string; label?: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  async function handleCopy() {
    try {
      await copyText(value);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), 1600);
  }

  const buttonLabel =
    copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : label;

  return (
    <div className="command-box">
      <code>{value}</code>
      <button
        className={
          copyState === "copied"
            ? "copy-button is-copied"
            : copyState === "failed"
              ? "copy-button is-copy-failed"
              : "copy-button"
        }
        type="button"
        onClick={handleCopy}
        aria-label={buttonLabel}
        aria-live="polite"
      >
        <CopyIcon />
        <span>{copyState === "copied" ? "Copied" : copyState === "failed" ? "Failed" : "Copy"}</span>
      </button>
    </div>
  );
}

function readUrlState(): { client: ClientId; mode: ModeId } {
  const params = new URLSearchParams(window.location.search);
  const requestedClient = params.get("client");
  const requestedMode = params.get("mode") as ModeId | null;
  const normalizedClient =
    requestedClient === "gemini" ? "antigravity" : requestedClient;
  if (requestedClient === "gemini") {
    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.searchParams.set("client", "antigravity");
    window.history.replaceState({}, "", canonicalUrl);
  }
  return {
    client:
      normalizedClient && CLIENT_IDS.includes(normalizedClient as ClientId)
        ? (normalizedClient as ClientId)
        : "codex",
    mode: requestedMode && MODE_IDS.includes(requestedMode) ? requestedMode : "mcp",
  };
}

function writeUrlState(client: ClientId, mode: ModeId) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("client", client);
  nextUrl.searchParams.set("mode", mode);
  nextUrl.hash = "installer";
  window.history.pushState({}, "", nextUrl);
}

function revealClientTab(button: HTMLButtonElement | null) {
  const scroller = button?.closest<HTMLElement>(".client-tab-scroll");
  if (!button || !scroller) return;
  const scrollerBounds = scroller.getBoundingClientRect();
  const buttonBounds = button.getBoundingClientRect();
  if (
    buttonBounds.left >= scrollerBounds.left &&
    buttonBounds.right <= scrollerBounds.right
  ) {
    return;
  }
  const centerDelta =
    buttonBounds.left +
    buttonBounds.width / 2 -
    (scrollerBounds.left + scrollerBounds.width / 2);
  scroller.scrollTo({
    left: Math.max(0, scroller.scrollLeft + centerDelta),
    behavior: "auto",
  });
}

export default function PluginInstaller() {
  const [client, setClient] = useState<ClientId>("codex");
  const [mode, setMode] = useState<ModeId>("mcp");
  const clientTabRefs = useRef<Partial<Record<ClientId, HTMLButtonElement | null>>>({});
  const modeTabRefs = useRef<Partial<Record<ModeId, HTMLButtonElement | null>>>({});
  const activeClient = clientById(client);
  const steps = useMemo(
    () => (mode === "mcp" ? remoteSteps(activeClient) : cliSteps(activeClient)),
    [activeClient, mode],
  );

  useEffect(() => {
    const syncFromUrl = () => {
      const next = readUrlState();
      setClient(next.client);
      setMode(next.mode);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    revealClientTab(clientTabRefs.current[client] ?? null);
  }, [client]);

  function chooseClient(nextClient: ClientId) {
    setClient(nextClient);
    writeUrlState(nextClient, mode);
  }

  function chooseMode(nextMode: ModeId) {
    setMode(nextMode);
    writeUrlState(client, nextMode);
  }

  function tabTargetIndex(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    length: number,
  ) {
    if (event.key === "Home") return 0;
    if (event.key === "End") return length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") return (index + 1) % length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") return (index - 1 + length) % length;
    return null;
  }

  function handleClientKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const targetIndex = tabTargetIndex(event, index, CLIENT_IDS.length);
    if (targetIndex === null) return;
    event.preventDefault();
    const nextClient = CLIENT_IDS[targetIndex];
    clientTabRefs.current[nextClient]?.focus();
    chooseClient(nextClient);
  }

  function handleModeKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const targetIndex = tabTargetIndex(event, index, MODE_IDS.length);
    if (targetIndex === null) return;
    event.preventDefault();
    const nextMode = MODE_IDS[targetIndex];
    modeTabRefs.current[nextMode]?.focus();
    chooseMode(nextMode);
  }

  return (
    <section
      className="installer"
      id="installer"
      aria-labelledby="installer-heading"
      data-active-client={client}
      data-active-mode={mode}
      data-remote-ready={REMOTE_MCP_URL ? "true" : "false"}
    >
      <div className="installer-topbar">
        <div className="client-tab-scroll">
          <div className="client-tabs" role="tablist" aria-label="Choose your AI workspace">
            {clients.map((item, index) => (
              <button
                className={client === item.id ? "client-tab is-active" : "client-tab"}
                type="button"
                role="tab"
                id={`client-tab-${item.id}`}
                aria-selected={client === item.id}
                aria-controls="setup-panel"
                tabIndex={client === item.id ? 0 : -1}
                data-client={item.id}
                key={item.id}
                ref={(node) => {
                  clientTabRefs.current[item.id] = node;
                }}
                onClick={() => chooseClient(item.id)}
                onKeyDown={(event) => handleClientKeyDown(event, index)}
              >
                <ProductMark product={item.id} className="client-mark" />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.kind}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mode-tabs" role="tablist" aria-label="Choose connection method">
          {MODE_IDS.map((item, index) => (
            <button
              className={mode === item ? "mode-tab is-active" : "mode-tab"}
              type="button"
              role="tab"
              id={`mode-tab-${item}`}
              aria-selected={mode === item}
              aria-controls="setup-panel"
              tabIndex={mode === item ? 0 : -1}
              data-mode={item}
              key={item}
              ref={(node) => {
                modeTabRefs.current[item] = node;
              }}
              onClick={() => chooseMode(item)}
              onKeyDown={(event) => handleModeKeyDown(event, index)}
            >
              {item === "mcp" ? "MCP" : "CLI"}
            </button>
          ))}
        </div>
      </div>

      <div className="installer-heading">
        <div>
          <h2 id="installer-heading">
            Connect {activeClient.label} with {mode === "mcp" ? "remote MCP" : "the Barmous CLI"}
          </h2>
          <p>
            {mode === "mcp"
              ? "Remote MCP will use the verified browser-authorized endpoint when it is published."
              : activeClient.id === "codex" || activeClient.id === "claude"
                ? "Download the verified marketplace source bundle, then install it from the extracted folder."
                : activeClient.kind === "Plugin"
                  ? "Download the verified plugin source ZIP, then install the extracted plugin folder."
                  : "Download the verified connector setup kit with the local CLI and MCP runtime."}
          </p>
        </div>
        <span className="connection-badge">
          <i /> {mode === "mcp" ? "Streamable HTTP" : "Local stdio"} · read-only
        </span>
      </div>

      <div
        className="setup-grid"
        id="setup-panel"
        role="tabpanel"
        aria-labelledby={`client-tab-${client} mode-tab-${mode}`}
        aria-live="polite"
        key={client + mode}
      >
        {steps.map((step, index) => (
          <article className="setup-step" key={step.title}>
            <span className="step-number">{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <div className="step-control">
              {step.command ? <CommandBox value={step.command} label={step.copyLabel} /> : null}
              {step.status ? (
                <div className="step-status" aria-disabled="true">
                  <span />
                  {step.status}
                </div>
              ) : null}
              {step.action ? (
                <a
                  className="step-action"
                  href={step.action.href}
                  download={step.action.download}
                  target={step.action.external ? "_blank" : undefined}
                  rel={step.action.external ? "noreferrer" : undefined}
                >
                  {step.action.label}
                  <ArrowIcon />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="installer-footer">
        <div className="marketplace-status" aria-label="Official marketplace status">
          <span>Official Barmous marketplace</span>
          <strong>Coming soon</strong>
        </div>
        <a href={GITHUB_SOURCE_URL} target="_blank" rel="noreferrer">
          <GithubIcon />
          GitHub source
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
