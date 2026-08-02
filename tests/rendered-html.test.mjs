import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const releases = [
  {
    product: "Codex",
    name: "barmous-compliance-codex-plugin-v0.1.0.zip",
    bytes: 989189,
    checksum:
      "D9363EDC4FF9B2B42D97CB55A77A26FB6C557E4720AE5FEE8DA550A53044D987",
  },
  {
    product: "Claude Code",
    name: "barmous-compliance-claude-plugin-v0.1.0.zip",
    bytes: 211582,
    checksum:
      "827599DA3FF7186DEC276D7B3690F90C8BD6BF092BADD2F4A363C68F1C815789",
  },
];

const retiredDownload =
  "barmous-company-data-codex-plugin-0.1.0-codex.20260802110450.zip";

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

test("server-renders both clean v0.1.0 plugin downloads", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Barmous Compliance \| AI Workspace Plugins<\/title>/i);
  assert.match(html, /Bring Barmous compliance context into Codex and Claude Code\./i);
  assert.match(html, />v0\.1\.0</i);
  for (const release of releases) {
    assert.match(html, new RegExp(`/downloads/${release.name}`));
    assert.match(html, new RegExp(release.checksum));
  }
  assert.doesNotMatch(html, /Public by link|Link-only preview|not access-controlled/i);
  assert.doesNotMatch(html, /0\.1\.0\+codex|20260802110450/i);
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
  await assert.rejects(
    access(new URL(`../public/downloads/${retiredDownload}`, import.meta.url)),
  );
});

test("publishes a valid Claude marketplace source", async () => {
  const [marketplaceText, pluginText, mcpText] = await Promise.all([
    readFile(new URL("../.claude-plugin/marketplace.json", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../plugins/barmous-company-data/.claude-plugin/plugin.json",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../plugins/barmous-company-data/.mcp.json", import.meta.url),
      "utf8",
    ),
  ]);
  const marketplace = JSON.parse(marketplaceText);
  const plugin = JSON.parse(pluginText);
  const mcp = JSON.parse(mcpText);

  assert.equal(marketplace.name, "barmous");
  assert.equal(marketplace.plugins[0].source, "./plugins/barmous-company-data");
  assert.equal(plugin.name, "barmous-company-data");
  assert.equal(plugin.version, "0.1.0");
  assert.equal(plugin.defaultEnabled, false);
  assert.equal(plugin.userConfig.agent_token.sensitive, true);
  assert.equal(mcp.barmous.type, "stdio");
  assert.equal(mcp.barmous.args[0], "${CLAUDE_PLUGIN_ROOT}/mcp/server.mjs");
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

test("keeps the static Pages release synchronized", async () => {
  const html = await readFile(
    new URL("../docs/index.html", import.meta.url),
    "utf8",
  );
  assert.match(
    html,
    /name="robots" content="noindex, nofollow, noarchive, noimageindex"/i,
  );
  assert.match(html, />v0\.1\.0</i);
  assert.doesNotMatch(html, /Public by link|Link-only preview|not access-controlled/i);

  for (const release of releases) {
    assert.match(html, new RegExp(`href="downloads/${release.name}"`));
    const archive = await readFile(
      new URL(`../docs/downloads/${release.name}`, import.meta.url),
    );
    assert.equal(archive.byteLength, release.bytes, release.product);
    assert.equal(digest(archive), release.checksum, release.product);
  }
  await assert.rejects(
    access(new URL(`../docs/downloads/${retiredDownload}`, import.meta.url)),
  );
});
