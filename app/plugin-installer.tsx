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
          href: "/downloads/barmous-compliance-codex-plugin-v0.2.0.zip",
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
    install: [
      {
        title: "Download the Claude bundle",
        description:
          "Get the verified preview ZIP, then extract it to a folder you control.",
        action: {
          href: "/downloads/barmous-compliance-claude-plugin-v0.2.0.zip",
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
        <span>Browser-authorized profiles are revocable, expire absolutely, and never require a token pasted into plugin configuration.</span>
      </div>
    </section>
  );
}
