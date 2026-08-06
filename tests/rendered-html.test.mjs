import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const releases = [
  {
    product: "Codex",
    name: "barmous-compliance-codex-plugin-v0.3.0.zip",
    root: "barmous-compliance-codex-plugin-v0.3.0",
    bytes: 1203409,
    checksum:
      "D7D2499D1AF2F5B5B434D185BB0F0A260ED6F1947ACD913E954B07FDFD8DA65F",
  },
  {
    product: "Claude Code",
    name: "barmous-compliance-claude-plugin-v0.3.0.zip",
    root: "barmous-compliance-claude-plugin-v0.3.0",
    bytes: 422667,
    checksum:
      "C6C6CF6A8C138D88B1F31A4B28F9486A8F0C1577C50D15905C150BF58BD2A7F5",
  },
];

const retiredDownloads = [
  "barmous-compliance-codex-plugin-v0.2.0.zip",
  "barmous-compliance-claude-plugin-v0.2.0.zip",
  "barmous-compliance-codex-plugin-v0.1.0.zip",
  "barmous-compliance-claude-plugin-v0.1.0.zip",
  "barmous-company-data-codex-plugin-0.1.0-codex.20260802110450.zip",
];

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function normalizeText(value) {
  return value.replace(/\r\n?/g, "\n").trimEnd();
}

function zipEntryNames(buffer) {
  const eocdSignature = 0x06054b50;
  const centralSignature = 0x02014b50;
  const minimumOffset = Math.max(0, buffer.length - 65557);
  let eocdOffset = -1;
  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }
  assert.notEqual(eocdOffset, -1, "ZIP end-of-central-directory record");
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  let cursor = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];
  for (let index = 0; index < entryCount; index += 1) {
    assert.equal(buffer.readUInt32LE(cursor), centralSignature, `ZIP central entry ${index}`);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const name = buffer
      .subarray(cursor + 46, cursor + 46 + nameLength)
      .toString("utf8")
      .replaceAll("\\", "/");
    entries.push(name);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

test("server-renders both clean v0.3.0 plugin downloads", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Barmous Compliance \| MCP &amp; CLI Connections<\/title>/i);
  assert.match(
    html,
    /Barmous MCP &amp; CLI for the AI tools you already use\./i,
  );
  assert.match(html, /class="setup-stage"/i);
  assert.match(html, /Connect .*Codex.* with .*remote MCP/i);
  for (const client of ["codex", "claude", "cursor", "gemini", "perplexity"]) {
    assert.match(html, new RegExp(`data-client="${client}"`, "i"));
  }
  assert.match(html, /Gemini \+ Antigravity/i);
  assert.match(html, /data-mode="mcp"/i);
  assert.match(html, /data-mode="cli"/i);
  assert.match(html, /Remote MCP is being prepared/i);
  assert.match(html, /Endpoint not available/i);
  assert.match(html, /Official Barmous marketplace/i);
  assert.match(html, /Coming soon/i);
  assert.match(html, /GitHub source/i);
  assert.doesNotMatch(html, /<a\b[^>]*>[^<]*Official Barmous marketplace/i);
  assert.doesNotMatch(html, /mcp\.barmous\.ae|BARMOUS_AGENT_TOKEN/i);
  assert.match(html, /never paste an agent token or secret/i);
  assert.match(html, />v0\.3\.0</i);
  assert.match(html, /Never default · 1h to 1y optional/i);
  for (const release of releases) {
    assert.match(html, new RegExp(`/downloads/${release.name}`));
    assert.match(html, new RegExp(release.checksum));
  }
  assert.doesNotMatch(html, /Public by link|Link-only preview|not access-controlled/i);
  assert.doesNotMatch(html, /0\.[23]\.0\+codex|0\.1\.0\+codex|20260802110450/i);
  assert.match(html, /noindex/i);
  assert.match(html, /nofollow/i);
});

test("ships both exact verified plugin archives", async () => {
  for (const release of releases) {
    const archiveUrl = new URL(
      `../public/downloads/${release.name}`,
      import.meta.url,
    );
    await access(archiveUrl);
    const archive = await readFile(archiveUrl);
    assert.equal(archive.byteLength, release.bytes, release.product);
    assert.equal(digest(archive), release.checksum, release.product);
  }
  for (const retiredDownload of retiredDownloads) {
    await assert.rejects(
      access(new URL(`../public/downloads/${retiredDownload}`, import.meta.url)),
    );
  }
});

test("publishes valid v0.3.0 Codex and Claude marketplace sources", async () => {
  const [
    codexMarketplaceText,
    codexPluginText,
    codexMcpText,
    codexPackageText,
    claudeMarketplaceText,
    claudeReleaseMarketplaceText,
    claudePluginText,
    claudeMcpText,
    claudePackageText,
  ] = await Promise.all([
    readFile(new URL("../.agents/plugins/marketplace.json", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../plugins/barmous-company-data/.codex-plugin/plugin.json",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../plugins/barmous-company-data/.mcp.json", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../plugins/barmous-company-data/package.json", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../.claude-plugin/marketplace.json", import.meta.url), "utf8"),
    readFile(
      new URL("../release/claude-marketplace.json", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../plugins/barmous-company-data-claude/.claude-plugin/plugin.json",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../plugins/barmous-company-data-claude/.mcp.json", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../plugins/barmous-company-data-claude/package.json", import.meta.url),
      "utf8",
    ),
  ]);
  const codexMarketplace = JSON.parse(codexMarketplaceText);
  const codexPlugin = JSON.parse(codexPluginText);
  const codexMcp = JSON.parse(codexMcpText);
  const codexPackage = JSON.parse(codexPackageText);
  const claudeMarketplace = JSON.parse(claudeMarketplaceText);
  const claudeReleaseMarketplace = JSON.parse(claudeReleaseMarketplaceText);
  const claudePlugin = JSON.parse(claudePluginText);
  const claudeMcp = JSON.parse(claudeMcpText);
  const claudePackage = JSON.parse(claudePackageText);

  assert.equal(codexMarketplace.name, "barmous");
  assert.equal(
    codexMarketplace.plugins[0].source.path,
    "./plugins/barmous-company-data",
  );
  assert.equal(codexPlugin.name, "barmous-company-data");
  assert.equal(codexPlugin.version, "0.3.0");
  assert.equal(codexPackage.version, "0.3.0");
  assert.equal(codexMcp.mcpServers.barmous.command, "node");
  assert.equal(codexMcp.mcpServers.barmous.args[0], "./mcp/server.mjs");

  assert.equal(claudeMarketplace.name, "barmous");
  assert.equal(
    claudeMarketplace.plugins[0].source,
    "./plugins/barmous-company-data-claude",
  );
  assert.equal(claudeReleaseMarketplace.name, claudeMarketplace.name);
  assert.equal(
    claudeReleaseMarketplace.plugins[0].source,
    "./plugins/barmous-company-data",
  );
  assert.equal(claudePlugin.name, "barmous-company-data");
  assert.equal(claudePlugin.version, "0.3.0");
  assert.equal(claudePlugin.defaultEnabled, false);
  assert.equal(claudePlugin.userConfig, undefined);
  assert.equal(claudePackage.version, "0.3.0");
  assert.equal(claudeMcp.barmous.type, "stdio");
  assert.equal(claudeMcp.barmous.args[0], "${CLAUDE_PLUGIN_ROOT}/mcp/server.mjs");
});

test("packages complete local CLI and MCP bundles without sensitive material", async () => {
  const requiredPluginFiles = [
    "package.json",
    "bin/barmous.mjs",
    "mcp/server.mjs",
    "skills/barmous-company-brief/SKILL.md",
    "skills/barmous-evidence-gap-review/SKILL.md",
    "skills/barmous-findings-triage/SKILL.md",
    "skills/barmous-framework-review/SKILL.md",
    "skills/barmous-remediation-plan/SKILL.md",
  ];

  for (const release of releases) {
    const archive = await readFile(
      new URL(`../public/downloads/${release.name}`, import.meta.url),
    );
    const entries = zipEntryNames(archive);
    const pluginRoot = `${release.root}/plugins/barmous-company-data`;
    const platformManifest =
      release.product === "Codex"
        ? `${release.root}/.agents/plugins/marketplace.json`
        : `${release.root}/.claude-plugin/marketplace.json`;
    const pluginManifest =
      release.product === "Codex"
        ? `${pluginRoot}/.codex-plugin/plugin.json`
        : `${pluginRoot}/.claude-plugin/plugin.json`;

    assert.ok(entries.includes(platformManifest), `${release.product} marketplace`);
    assert.ok(entries.includes(pluginManifest), `${release.product} manifest`);
    for (const file of requiredPluginFiles) {
      assert.ok(entries.includes(`${pluginRoot}/${file}`), `${release.product}: ${file}`);
    }
    assert.ok(entries.includes(`${release.root}/README.md`), `${release.product} README`);
    assert.ok(
      entries.includes(`${release.root}/PREVIEW_DISTRIBUTION_NOTICE.md`),
      `${release.product} preview notice`,
    );
    assert.equal(
      entries.some((entry) =>
        /(?:^|\/)(?:node_modules|\.env(?:\.|$)|credentials?(?:\.|$)|tokens?(?:\.|$)|\.git)(?:\/|$)/i.test(
          entry,
        ),
      ),
      false,
      `${release.product} excludes secrets and transient files`,
    );
    assert.equal(
      entries.some((entry) => /0\.[23]\.0\+codex|202608\d{8}/i.test(entry)),
      false,
      `${release.product} uses the clean release version`,
    );
  }
});

test("removes the disposable starter preview", async () => {
  const packageJson = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
  await assert.rejects(
    access(new URL("../app/_sites-preview/preview.css", import.meta.url)),
  );
  await access(new URL("../public/barmous-mark.png", import.meta.url));
});

test("ships synchronized official product marks", async () => {
  const productMarks = [
    {
      name: "openai.svg",
      checksum:
        "8E1B976BA47E927AC2928303FD5362FCADFEFD68743506510596F107DF676E58",
    },
    {
      name: "claude.svg",
      checksum:
        "6D53DB4BE375E899C937C26CF16684A80D6E869B1928D72B37748BEF2560E219",
    },
  ];

  for (const { name, checksum } of productMarks) {
    const [runtimeLogo, pagesLogo] = await Promise.all([
      readFile(new URL(`../public/logos/${name}`, import.meta.url)),
      readFile(new URL(`../docs/logos/${name}`, import.meta.url)),
    ]);
    assert.equal(Buffer.compare(runtimeLogo, pagesLogo), 0, name);
    assert.equal(digest(runtimeLogo), checksum, name);
    assert.match(runtimeLogo.toString("utf8"), /<svg\b/i, name);
  }
});

test("ships the synchronized Barmous font and its license", async () => {
  const [runtimeFont, pagesFont, runtimeLicense, pagesLicense] =
    await Promise.all([
      readFile(
        new URL("../public/fonts/noto-sans-variable.woff2", import.meta.url),
      ),
      readFile(
        new URL("../docs/fonts/noto-sans-variable.woff2", import.meta.url),
      ),
      readFile(new URL("../public/fonts/OFL.txt", import.meta.url), "utf8"),
      readFile(new URL("../docs/fonts/OFL.txt", import.meta.url), "utf8"),
    ]);

  assert.equal(Buffer.compare(runtimeFont, pagesFont), 0);
  assert.equal(
    digest(runtimeFont),
    "51CA196F49A33E79E7870FF88EBD2829A3F627A51E7D690986618F0E7AD2B52D",
  );
  assert.equal(normalizeText(runtimeLicense), normalizeText(pagesLicense));
  assert.match(runtimeLicense, /SIL OPEN FONT LICENSE Version 1\.1/i);
});

test("keeps the static Pages release synchronized", async () => {
  const [
    html,
    styles,
    runtimeStyles,
    script,
    pagesPreviewNotice,
    runtimePreviewNotice,
    pagesThirdPartyNotices,
    runtimeThirdPartyNotices,
  ] = await Promise.all([
    readFile(new URL("../docs/index.html", import.meta.url), "utf8"),
    readFile(new URL("../docs/styles.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../docs/scripts.js", import.meta.url), "utf8"),
    readFile(
      new URL("../docs/PREVIEW_DISTRIBUTION_NOTICE.md", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../public/PREVIEW_DISTRIBUTION_NOTICE.md", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../docs/THIRD_PARTY_NOTICES.md", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../public/THIRD_PARTY_NOTICES.md", import.meta.url),
      "utf8",
    ),
  ]);
  assert.equal(
    normalizeText(runtimePreviewNotice),
    normalizeText(pagesPreviewNotice),
  );
  assert.equal(
    normalizeText(runtimeThirdPartyNotices),
    normalizeText(pagesThirdPartyNotices),
  );
  assert.equal(
    normalizeText(runtimeStyles)
      .replace(/^@import "tailwindcss";\n\n/, "")
      .replaceAll('url("/fonts/', 'url("fonts/'),
    normalizeText(styles),
  );
  assert.match(
    html,
    /name="robots" content="noindex, nofollow, noarchive, noimageindex"/i,
  );
  assert.match(html, />v0\.3\.0</i);
  assert.match(html, /src="scripts\.js\?v=20260806\.1"/i);
  for (const client of ["codex", "claude", "cursor", "gemini", "perplexity"]) {
    assert.match(html, new RegExp(`data-client="${client}"`, "i"));
  }
  assert.match(html, /Gemini \+ Antigravity/i);
  assert.match(html, /data-mode="mcp"/i);
  assert.match(html, /data-mode="cli"/i);
  assert.match(html, /src="logos\/openai\.svg"/i);
  assert.match(html, /src="logos\/claude\.svg"/i);
  assert.match(html, /href="styles\.css\?v=20260806\.1"/i);
  assert.match(styles, /fonts\/noto-sans-variable\.woff2/i);
  assert.match(html, /class="setup-stage"/i);
  assert.equal(
    (html.match(/<article\b[^>]*\bsetup-step\b[^>]*>/gi) ?? []).length,
    3,
  );
  assert.match(html, /role="tablist"/i);
  assert.match(html, /role="tabpanel"/i);
  assert.match(html, /Remote MCP is being prepared/i);
  assert.match(html, /Endpoint not available/i);
  assert.match(html, /Official Barmous marketplace/i);
  assert.match(html, /GitHub source/i);
  assert.doesNotMatch(html, /class="(?:client|platform)-mark"[^>]*>[CA]</i);
  assert.match(script, /navigator\.clipboard/i);
  assert.match(script, /npm install --global/i);
  assert.match(script, /claude plugin marketplace add \./i);
  assert.match(script, /barmous login/i);
  assert.match(script, /barmous status/i);
  assert.match(script, /\/mcp/i);
  assert.match(script, /URLSearchParams/i);
  assert.match(script, /pushState/i);
  assert.match(script, /ArrowRight/i);
  assert.match(script, /REMOTE_MCP_URL/i);
  assert.match(script, /Remote MCP is being prepared/i);
  assert.match(script, /revocable non-expiring profile/i);
  for (const lifetime of ["1h", "1d", "7d", "30d", "60d", "90d", "180d", "1y", "never"]) {
    assert.match(script, new RegExp(`\\b${lifetime}\\b`, "i"));
  }
  assert.doesNotMatch(script, /BARMOUS_AGENT_TOKEN|paste-token/i);
  assert.doesNotMatch(html, /Public by link|Link-only preview|not access-controlled/i);
  assert.doesNotMatch(html + script, /mcp\.barmous\.ae|https:\/\/[^"'\s]*barmous[^"'\s]*\/mcp/i);

  for (const release of releases) {
    assert.match(html, new RegExp(`href="downloads/${release.name}"`));
    const [pagesArchive, runtimeArchive] = await Promise.all([
      readFile(new URL(`../docs/downloads/${release.name}`, import.meta.url)),
      readFile(new URL(`../public/downloads/${release.name}`, import.meta.url)),
    ]);
    assert.equal(pagesArchive.byteLength, release.bytes, release.product);
    assert.equal(digest(pagesArchive), release.checksum, release.product);
    assert.equal(Buffer.compare(pagesArchive, runtimeArchive), 0, release.product);
  }
  for (const retiredDownload of retiredDownloads) {
    await assert.rejects(
      access(new URL(`../docs/downloads/${retiredDownload}`, import.meta.url)),
    );
  }
});
