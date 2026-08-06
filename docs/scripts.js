const CLIENT_IDS = [
  "codex",
  "claude",
  "cursor",
  "antigravity",
  "perplexity",
  "kimi",
  "hermes",
];
const MODE_IDS = ["mcp", "cli"];
const REMOTE_MCP_URL =
  document.querySelector('meta[name="barmous-mcp-url"]')?.content.trim() || "";

const clients = {
  codex: { label: "Codex", kind: "Plugin" },
  claude: { label: "Claude", kind: "Plugin" },
  cursor: { label: "Cursor", kind: "Connector" },
  antigravity: { label: "Antigravity", kind: "Connector" },
  perplexity: { label: "Perplexity", kind: "Connector" },
  kimi: { label: "Kimi Code", kind: "Connector" },
  hermes: { label: "Hermes", kind: "Connector" },
};

const arrowIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"></path></svg>';
const copyIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>';

function localConnectorConfig() {
  return JSON.stringify(
    {
      mcpServers: {
        barmous: {
          command: "barmous",
          args: ["mcp"],
        },
      },
    },
    null,
    2,
  );
}

function cursorRemoteConfig(endpoint) {
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

function kimiRemoteConfig(endpoint) {
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

function remoteSetupStep(clientId, endpoint) {
  if (clientId === "cursor") {
    return {
      title: "Add Barmous to Cursor",
      description:
        "Add this server to your user or project MCP configuration, then refresh Cursor's MCP tools.",
      command: cursorRemoteConfig(endpoint),
      copyLabel: "Copy Cursor configuration",
    };
  }

  if (clientId === "antigravity") {
    return {
      title: "Add Barmous to Antigravity",
      description:
        "Open Antigravity's Manage MCP Servers screen, create a Barmous server, and use the copied Streamable HTTP endpoint.",
      status: "Use the copied endpoint",
    };
  }

  if (clientId === "perplexity") {
    return {
      title: "Add a remote connector",
      description:
        "In Perplexity, open Account settings → Connectors → Add custom connector. Choose Remote, Streamable HTTP, and OAuth. Your plan or admin must allow custom connectors.",
      status: "Use the copied endpoint",
    };
  }

  if (clientId === "kimi") {
    return {
      title: "Add Barmous to Kimi Code",
      description:
        "Save this server in ~/.kimi-code/mcp.json, start a new Kimi Code session, run /mcp-config login barmous, then use /mcp to verify the connection.",
      command: kimiRemoteConfig(endpoint),
      copyLabel: "Copy Kimi Code configuration",
    };
  }

  if (clientId === "hermes") {
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

  if (clientId === "claude") {
    return {
      title: "Add the Barmous connector",
      description:
        "Open Claude's connector settings, add a custom remote connector named Barmous, and paste the copied Streamable HTTP URL.",
      status: "Use the copied endpoint",
    };
  }

  return {
    title: "Add the remote MCP",
    description:
      "Open Codex MCP settings, create a server named Barmous, and use the copied Streamable HTTP URL.",
    status: "Use the copied endpoint",
  };
}

function remoteSteps(clientId) {
  const client = clients[clientId];
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
          clientId === "perplexity"
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
    remoteSetupStep(clientId, REMOTE_MCP_URL),
    {
      title: "Sign in and verify",
      description:
        "Complete Barmous browser authorization, then ask the client to check the current failing compliance tests.",
      command: "Show the failing compliance tests for this workspace.",
      copyLabel: "Copy verification prompt",
    },
  ];
}

function pluginCliSteps(clientId) {
  const isCodex = clientId === "codex";
  const label = clients[clientId].label;
  return [
    {
      title: `Download the ${label} bundle`,
      description:
        "Download the verified v0.3.0 preview ZIP and extract it to a folder you control.",
      action: {
        href: isCodex
          ? "downloads/barmous-compliance-codex-plugin-v0.3.0.zip"
          : "downloads/barmous-compliance-claude-plugin-v0.3.0.zip",
        label: `Download ${label} ZIP`,
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

function connectorCliSteps(clientId) {
  let finalStep;
  if (clientId === "cursor") {
    finalStep = {
      title: "Add the local connector",
      description:
        "Add this configuration to Cursor's user or project MCP settings, then refresh the available tools.",
      command: localConnectorConfig(),
      copyLabel: "Copy Cursor configuration",
    };
  } else if (clientId === "antigravity") {
    finalStep = {
      title: "Add the local connector",
      description:
        "Use this MCP server definition in Antigravity's Manage MCP Servers screen. It launches the authenticated Barmous CLI over stdio.",
      command: localConnectorConfig(),
      copyLabel: "Copy Antigravity configuration",
    };
  } else if (clientId === "kimi") {
    finalStep = {
      title: "Configure Kimi Code and verify",
      description:
        "Save this JSON as ~/.kimi-code/mcp.json (or .kimi-code/mcp.json for this project), start a new Kimi Code session, and run /mcp to confirm Barmous is connected.",
      command: localConnectorConfig(),
      copyLabel: "Copy Kimi Code configuration",
    };
  } else if (clientId === "hermes") {
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
      title: "Install the Barmous CLI",
      description:
        "The current CLI is included in both verified v0.3.0 plugin bundles. Choose either bundle below, extract it, then run this command from its root.",
      command: "npm install --global .\\plugins\\barmous-company-data",
      action: { href: "#downloads", label: "Choose a verified bundle" },
    },
    {
      title: "Authorize this device",
      description:
        "Login opens Barmous. Match the short code, choose the exact company, review the read-only scopes, and approve the default revocable non-expiring profile or choose 1h, 1d, 7d, 30d, 60d, 90d, 180d, or 1y.",
      command: ["barmous login", "barmous status"].join("\n"),
    },
    finalStep,
  ];
}

function stepsFor(clientId, mode) {
  if (mode === "mcp") return remoteSteps(clientId);
  return clients[clientId].kind === "Plugin"
    ? pluginCliSteps(clientId)
    : connectorCliSteps(clientId);
}

const requestedParams = new URLSearchParams(window.location.search);
const requestedClient = requestedParams.get("client");
const requestedMode = requestedParams.get("mode");
const normalizedClient =
  requestedClient === "gemini" ? "antigravity" : requestedClient;
if (requestedClient === "gemini") {
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.searchParams.set("client", "antigravity");
  window.history.replaceState({}, "", canonicalUrl);
}
const state = {
  client: CLIENT_IDS.includes(normalizedClient) ? normalizedClient : "codex",
  mode: MODE_IDS.includes(requestedMode) ? requestedMode : "mcp",
};

const grid = document.querySelector("[data-setup-grid]");
const title = document.querySelector("[data-installer-title]");
const description = document.querySelector("[data-installer-description]");
const connectionBadge = document.querySelector("[data-connection-badge]");
const installer = document.querySelector(".installer");
const clientButtons = [...document.querySelectorAll("[data-client]")];
const modeButtons = [...document.querySelectorAll("[data-mode]")];

function revealClientTab(button) {
  const scroller = button?.closest(".client-tab-scroll");
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

function createCommandBox(command, label = "Copy command") {
  const box = document.createElement("div");
  box.className = "command-box";

  const code = document.createElement("code");
  code.textContent = command;
  box.append(code);

  const button = document.createElement("button");
  button.className = "copy-button";
  button.type = "button";
  button.dataset.copy = "";
  button.dataset.copyLabel = label;
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-live", "polite");
  button.innerHTML = copyIcon + "<span>Copy</span>";
  box.append(button);
  return box;
}

function createAction(action) {
  const link = document.createElement("a");
  link.className = "step-action";
  link.href = action.href;
  if (action.download) link.setAttribute("download", "");
  link.append(document.createTextNode(action.label));
  link.insertAdjacentHTML("beforeend", arrowIcon);
  return link;
}

function createStatus(status) {
  const element = document.createElement("div");
  element.className = "step-status";
  element.setAttribute("aria-disabled", "true");
  const dot = document.createElement("span");
  element.append(dot, document.createTextNode(status));
  return element;
}

function render() {
  const activeClient = clients[state.client];
  const steps = stepsFor(state.client, state.mode);
  const isRemote = state.mode === "mcp";

  title.textContent = `Connect ${activeClient.label} with ${isRemote ? "remote MCP" : "the Barmous CLI"}`;
  description.textContent =
    activeClient.kind === "Plugin"
      ? "Official marketplace listing coming soon. The verified GitHub preview remains available."
      : "This client connects through the open Barmous MCP interface; no client-specific ZIP is required.";
  connectionBadge.innerHTML = `<i></i> ${isRemote ? "Streamable HTTP" : "Local stdio"} · read-only`;
  installer.dataset.activeClient = state.client;
  installer.dataset.activeMode = state.mode;
  installer.dataset.remoteReady = REMOTE_MCP_URL ? "true" : "false";

  clientButtons.forEach((button) => {
    const active = button.dataset.client === state.client;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  revealClientTab(clientButtons.find((button) => button.dataset.client === state.client));
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  grid.setAttribute(
    "aria-labelledby",
    `client-tab-${state.client} mode-tab-${state.mode}`,
  );
  grid.replaceChildren();

  steps.forEach((step, index) => {
    const article = document.createElement("article");
    article.className = "setup-step";

    const number = document.createElement("span");
    number.className = "step-number";
    number.textContent = String(index + 1);
    const heading = document.createElement("h3");
    heading.textContent = step.title;
    const stepDescription = document.createElement("p");
    stepDescription.textContent = step.description;
    const control = document.createElement("div");
    control.className = "step-control";
    if (step.command) control.append(createCommandBox(step.command, step.copyLabel));
    if (step.status) control.append(createStatus(step.status));
    if (step.action) control.append(createAction(step.action));
    article.append(number, heading, stepDescription, control);
    grid.append(article);
  });
}

function writeUrlState() {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("client", state.client);
  nextUrl.searchParams.set("mode", state.mode);
  nextUrl.hash = "installer";
  window.history.pushState({}, "", nextUrl);
}

function selectClient(clientId, updateUrl = true) {
  state.client = clientId;
  if (updateUrl) writeUrlState();
  render();
}

function selectMode(mode, updateUrl = true) {
  state.mode = mode;
  if (updateUrl) writeUrlState();
  render();
}

function targetIndex(event, index, length) {
  if (event.key === "Home") return 0;
  if (event.key === "End") return length - 1;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") return (index + 1) % length;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") return (index - 1 + length) % length;
  return null;
}

function attachTabs(buttons, values, select) {
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(values[index]));
    button.addEventListener("keydown", (event) => {
      const nextIndex = targetIndex(event, index, buttons.length);
      if (nextIndex === null) return;
      event.preventDefault();
      buttons[nextIndex].focus();
      select(values[nextIndex]);
    });
  });
}

async function copyText(value) {
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
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command was rejected");
}

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (!copyButton) return;
  const code = copyButton.closest(".command-box").querySelector("code");
  const idleLabel = copyButton.dataset.copyLabel || "Copy command";
  try {
    await copyText(code.textContent);
    copyButton.setAttribute("aria-label", "Copied");
    copyButton.classList.add("is-copied");
    copyButton.querySelector("span").textContent = "Copied";
  } catch {
    copyButton.setAttribute("aria-label", "Copy failed");
    copyButton.classList.add("is-copy-failed");
    copyButton.querySelector("span").textContent = "Failed";
  }
  window.setTimeout(() => {
    copyButton.setAttribute("aria-label", idleLabel);
    copyButton.classList.remove("is-copied", "is-copy-failed");
    copyButton.querySelector("span").textContent = "Copy";
  }, 1600);
});

attachTabs(clientButtons, CLIENT_IDS, selectClient);
attachTabs(modeButtons, MODE_IDS, selectMode);
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("client");
  const mode = params.get("mode");
  const normalizedClient = clientId === "gemini" ? "antigravity" : clientId;
  if (clientId === "gemini") {
    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.searchParams.set("client", "antigravity");
    window.history.replaceState({}, "", canonicalUrl);
  }
  state.client = CLIENT_IDS.includes(normalizedClient) ? normalizedClient : "codex";
  state.mode = MODE_IDS.includes(mode) ? mode : "mcp";
  render();
});

render();
