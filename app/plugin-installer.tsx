"use client";

import { useState } from "react";
import ProductMark, { type ProductId } from "./product-mark";

type ClientId = ProductId;
type ModeId = "install" | "connect";

type SetupStep = {
  title: string;
  description: string;
  command?: string;
  action?: {
    href: string;
    label: string;
    download?: boolean;
    external?: boolean;
  };
};

const clients: { id: ClientId; label: string; maker: string }[] = [
  { id: "codex", label: "Codex", maker: "OpenAI" },
  { id: "claude", label: "Claude Code", maker: "Anthropic" },
];

const modes: { id: ModeId; label: string }[] = [
  { id: "install", label: "Install" },
  { id: "connect", label: "Connect" },
];

const flows: Record<ClientId, Record<ModeId, SetupStep[]>> = {
  codex: {
    install: [
      {
        title: "Download the Codex bundle",
        description:
          "Get the verified preview ZIP, then extract it to a folder you control.",
        action: {
          href: "/downloads/barmous-compliance-codex-plugin-v0.1.0.zip",
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
        command: ["/mcp", "Ask: Brief me on our current compliance posture."].join("\n"),
      },
    ],
  },
  claude: {
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
          href: "/downloads/barmous-compliance-claude-plugin-v0.1.0.zip",
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
  if (!copied) {
    throw new Error("Copy command was rejected");
  }
}

function CommandBox({ value }: { value: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    try {
      await copyText(value);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  const copyLabel =
    copyState === "copied"
      ? "Command copied"
      : copyState === "failed"
        ? "Copy failed"
        : "Copy command";

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
        aria-label={copyLabel}
        aria-live="polite"
      >
        <CopyIcon />
        <span>
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Failed"
              : "Copy"}
        </span>
      </button>
    </div>
  );
}

export default function PluginInstaller() {
  const [client, setClient] = useState<ClientId>("codex");
  const [mode, setMode] = useState<ModeId>("install");
  const steps = flows[client][mode];

  return (
    <section
      className="installer"
      id="installer"
      aria-labelledby="installer-heading"
      data-active-client={client}
    >
      <div className="installer-topbar">
        <div className="client-tabs" role="group" aria-label="Choose your AI workspace">
          {clients.map((item) => (
            <button
              className={client === item.id ? "client-tab is-active" : "client-tab"}
              type="button"
              aria-pressed={client === item.id}
              data-client={item.id}
              key={item.id}
              onClick={() => setClient(item.id)}
            >
              <ProductMark product={item.id} className="client-mark" />
              <span>
                <strong>{item.label}</strong>
                <small>{item.maker}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="mode-tabs" role="group" aria-label="Choose setup stage">
          {modes.map((item) => (
            <button
              className={mode === item.id ? "mode-tab is-active" : "mode-tab"}
              type="button"
              aria-pressed={mode === item.id}
              data-mode={item.id}
              key={item.id}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="installer-heading">
        <div>
          <h2 id="installer-heading">
            Set up Barmous for {clients.find((item) => item.id === client)?.label}
          </h2>
        </div>
        <span className="local-mcp-badge"><i /> Local MCP · read-only</span>
      </div>

      <div
        className="setup-grid"
        aria-live="polite"
        key={client + mode}
      >
        {steps.map((step, index) => (
          <article className="setup-step" key={step.title}>
            <span className="step-number">{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <div className="step-control">
              {step.command ? <CommandBox value={step.command} /> : null}
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
        <span>Use a scoped token and revoke it immediately if exposed.</span>
      </div>
    </section>
  );
}
