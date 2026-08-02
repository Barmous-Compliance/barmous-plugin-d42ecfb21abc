const flows = {
  codex: {
    label: "Codex",
    install: [
      {
        title: "Download the Codex bundle",
        description:
          "Get the verified preview ZIP, then extract it to a folder you control.",
        action: {
          href: "downloads/barmous-compliance-codex-plugin-v0.1.0.zip",
          label: "Download Codex ZIP",
          download: true,
        },
      },
      {
        title: "Install from PowerShell",
        description:
          "Open PowerShell in the extracted bundle root and run both commands.",
        command: [
          '$pluginRoot = (Resolve-Path ".").Path',
          "codex plugin marketplace add $pluginRoot",
          "codex plugin add barmous-company-data@barmous",
        ].join("\n"),
      },
      {
        title: "Connect, then verify",
        description:
          "Complete the Connect steps above, launch Codex from that PowerShell session, and run this check in a new task.",
        command: "/mcp",
      },
    ],
    connect: [
      {
        title: "Create scoped access",
        description:
          "In Barmous, open Settings → Agent access and create a read-only company token.",
        action: {
          href: "#requirements",
          label: "Review access requirements",
        },
      },
      {
        title: "Set connection details",
        description:
          "Set these in the PowerShell session that will launch Codex. Replace the placeholders locally—never paste a live token into this page.",
        command: [
          '$env:BARMOUS_API_URL="https://your-barmous-api.example"',
          '$env:BARMOUS_AGENT_TOKEN="<paste-token-locally>"',
          "codex",
        ].join("\n"),
      },
      {
        title: "Restart and confirm",
        description:
          "From that Codex session, start a fresh task and confirm the Barmous server.",
        command: [
          "/mcp",
          "Ask: Brief me on our current compliance posture.",
        ].join("\n"),
      },
    ],
  },
  claude: {
    label: "Claude Code",
    install: [
      {
        title: "Add the Barmous marketplace",
        description:
          "Register the official Barmous GitHub marketplace in Claude Code.",
        command:
          "claude plugin marketplace add Barmous-Compliance/barmous-plugin-d42ecfb21abc",
      },
      {
        title: "Install and enable",
        description:
          "Install the company-data plugin, then enable its secure connection prompts.",
        command: [
          "claude plugin install barmous-company-data@barmous",
          "claude plugin enable barmous-company-data@barmous",
        ].join("\n"),
      },
      {
        title: "Reload and verify",
        description:
          "Complete the API URL and token prompts, then run both slash commands.",
        command: ["/reload-plugins", "/mcp"].join("\n"),
        action: {
          href: "downloads/barmous-compliance-claude-plugin-v0.1.0.zip",
          label: "Or download the ZIP",
          download: true,
        },
      },
    ],
    connect: [
      {
        title: "Create scoped access",
        description:
          "In Barmous, open Settings → Agent access and create a read-only company token.",
        action: {
          href: "#requirements",
          label: "Review access requirements",
        },
      },
      {
        title: "Open plugin settings",
        description:
          "Use Claude Code’s installed-plugin screen to configure or replace the API URL and token.",
        command: "/plugin",
      },
      {
        title: "Reload and confirm",
        description:
          "Reload installed plugins, verify the Barmous MCP server, then start with a company brief.",
        command: [
          "/reload-plugins",
          "/mcp",
          "/barmous-company-data:barmous-company-brief",
        ].join("\n"),
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
