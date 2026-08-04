const flows = {
  codex: {
    label: "Codex",
    install: [
      {
        title: "Download the Codex bundle",
        description:
          "Get the verified preview ZIP, then extract it to a folder you control.",
        action: {
          href: "downloads/barmous-compliance-codex-plugin-v0.2.0.zip",
          label: "Download Codex ZIP",
          download: true,
        },
      },
      {
        title: "Install the CLI and plugin",
        description:
          "Open PowerShell in the extracted bundle root. This installs the local CLI and registers the bundled Codex marketplace.",
        command: [
          "npm install --global .\\plugins\\barmous-company-data",
          '$pluginRoot = (Resolve-Path ".").Path',
          "codex plugin marketplace add $pluginRoot",
          "codex plugin add barmous-company-data@barmous",
        ].join("\n"),
      },
      {
        title: "Verify the local MCP",
        description:
          "Complete the Connect steps, start a new Codex task, and confirm the Barmous local server and nine read-only tools.",
        command: "/mcp",
      },
    ],
    connect: [
      {
        title: "Authorize in your browser",
        description:
          "Login opens Barmous. Match the short code, choose the exact company, review four read-only scopes, and approve 30 days.",
        command: "barmous login",
      },
      {
        title: "Choose a named profile",
        description:
          "Optional: keep accounts separate and choose either 60 or 90 days. These examples create work and audit profiles.",
        command: [
          "barmous login --expires-in 60 --profile work",
          "barmous login --expires-in 90 --profile audit",
          "barmous status --profile work",
        ].join("\n"),
      },
      {
        title: "Check the active profile",
        description:
          "Confirm the default profile in your terminal, then run /mcp in Codex. Access is revocable and never extends beyond its approved expiry.",
        command: "barmous status",
      },
    ],
  },
  claude: {
    label: "Claude Code",
    install: [
      {
        title: "Download the Claude bundle",
        description:
          "Get the verified preview ZIP, then extract it to a folder you control.",
        action: {
          href: "downloads/barmous-compliance-claude-plugin-v0.2.0.zip",
          label: "Download Claude ZIP",
          download: true,
        },
      },
      {
        title: "Install the CLI and plugin",
        description:
          "Open PowerShell in the extracted bundle root. Install the local CLI, add this marketplace, and enable the plugin.",
        command: [
          "npm install --global .\\plugins\\barmous-company-data",
          "claude plugin marketplace add .",
          "claude plugin install barmous-company-data@barmous",
          "claude plugin enable barmous-company-data@barmous",
        ].join("\n"),
      },
      {
        title: "Verify the local MCP",
        description:
          "Complete the Connect steps, reload plugins, and confirm the Barmous local server and nine read-only tools.",
        command: ["/reload-plugins", "/mcp"].join("\n"),
      },
    ],
    connect: [
      {
        title: "Authorize in your browser",
        description:
          "Login opens Barmous. Match the short code, choose the exact company, review four read-only scopes, and approve 30 days.",
        command: "barmous login",
      },
      {
        title: "Choose a named profile",
        description:
          "Optional: keep accounts separate and choose either 60 or 90 days. These examples create work and audit profiles.",
        command: [
          "barmous login --expires-in 60 --profile work",
          "barmous login --expires-in 90 --profile audit",
          "barmous status --profile work",
        ].join("\n"),
      },
      {
        title: "Check the active profile",
        description:
          "Confirm the default profile in your terminal, then run /reload-plugins and /mcp in Claude Code. Expiry is absolute and access can be revoked earlier.",
        command: "barmous status",
      },
    ],
  },
};

const arrowIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"></path></svg>';
const copyIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>';

const state = {
  client: "codex",
  mode: "install",
};

const grid = document.querySelector("[data-setup-grid]");
const title = document.querySelector("[data-installer-title]");
const installer = document.querySelector(".installer");
const clientButtons = [...document.querySelectorAll("[data-client]")];
const modeButtons = [...document.querySelectorAll("[data-mode]")];

function createCommandBox(command) {
  const box = document.createElement("div");
  box.className = "command-box";

  const code = document.createElement("code");
  code.textContent = command;
  box.append(code);

  const button = document.createElement("button");
  button.className = "copy-button";
  button.type = "button";
  button.dataset.copy = "";
  button.setAttribute("aria-label", "Copy command");
  button.setAttribute("aria-live", "polite");
  button.innerHTML = copyIcon + "<span>Copy</span>";
  box.append(button);

  return box;
}

function createAction(action) {
  const link = document.createElement("a");
  link.className = "step-action";
  link.href = action.href;
  if (action.download) {
    link.setAttribute("download", "");
  }
  link.append(document.createTextNode(action.label));
  link.insertAdjacentHTML("beforeend", arrowIcon);
  return link;
}

function render() {
  const client = flows[state.client];
  const steps = client[state.mode];

  title.textContent = "Set up Barmous for " + client.label;
  installer.dataset.activeClient = state.client;

  clientButtons.forEach((button) => {
    const active = button.dataset.client === state.client;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  modeButtons.forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  grid.replaceChildren();

  steps.forEach((step, index) => {
    const article = document.createElement("article");
    article.className = "setup-step";

    const number = document.createElement("span");
    number.className = "step-number";
    number.textContent = String(index + 1);

    const heading = document.createElement("h3");
    heading.textContent = step.title;

    const description = document.createElement("p");
    description.textContent = step.description;

    const control = document.createElement("div");
    control.className = "step-control";
    if (step.command) {
      control.append(createCommandBox(step.command));
    }
    if (step.action) {
      control.append(createAction(step.action));
    }

    article.append(number, heading, description, control);
    grid.append(article);
  });
}

async function copyText(value) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
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
  if (!copied) {
    throw new Error("Copy command was rejected");
  }
}

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    const code = copyButton.closest(".command-box").querySelector("code");
    try {
      await copyText(code.textContent);
      copyButton.setAttribute("aria-label", "Command copied");
      copyButton.classList.add("is-copied");
      copyButton.querySelector("span").textContent = "Copied";
      window.setTimeout(() => {
        copyButton.setAttribute("aria-label", "Copy command");
        copyButton.classList.remove("is-copied");
        copyButton.querySelector("span").textContent = "Copy";
      }, 1600);
    } catch {
      copyButton.setAttribute("aria-label", "Copy failed");
      copyButton.classList.add("is-copy-failed");
      copyButton.querySelector("span").textContent = "Failed";
      window.setTimeout(() => {
        copyButton.setAttribute("aria-label", "Copy command");
        copyButton.classList.remove("is-copy-failed");
        copyButton.querySelector("span").textContent = "Copy";
      }, 1600);
    }
  }
});

clientButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.client = button.dataset.client;
    render();
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    render();
  });
});
