import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const downloadName =
  "barmous-company-data-codex-plugin-0.1.0-codex.20260802110450.zip";
const expectedChecksum =
  "8C938340C455B34684D9AF77140D6793D879725B3A616163FEE577E2DC367290";

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

test("server-renders the Barmous plugin download page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Barmous Compliance \| Codex Plugin Preview<\/title>/i);
  assert.match(html, /Your company(?:&apos;|&#x27;|')s compliance context, available in Codex\./i);
  assert.match(html, /Public by link/i);
  assert.match(html, /not access-controlled/i);
  assert.match(html, new RegExp(`/downloads/${downloadName}`));
  assert.match(html, new RegExp(expectedChecksum));
  assert.match(html, /noindex/i);
  assert.match(html, /nofollow/i);
});

test("ships the exact verified plugin archive", async () => {
  const archiveUrl = new URL(`../public/downloads/${downloadName}`, import.meta.url);
  await access(archiveUrl);
  const archive = await readFile(archiveUrl);
  const checksum = createHash("sha256").update(archive).digest("hex").toUpperCase();
  assert.equal(archive.byteLength, 989188);
  assert.equal(checksum, expectedChecksum);
});

test("removes the disposable starter preview", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
  await access(new URL("../public/barmous-mark.png", import.meta.url));
});

test("keeps the GitHub Pages artifact link-only and byte-identical", async () => {
  const [html, archive] = await Promise.all([
    readFile(new URL("../docs/index.html", import.meta.url), "utf8"),
    readFile(new URL(`../docs/downloads/${downloadName}`, import.meta.url)),
  ]);
  assert.match(html, /name="robots" content="noindex, nofollow, noarchive, noimageindex"/i);
  assert.match(html, new RegExp(`href="downloads/${downloadName}"`));
  assert.match(html, /Anyone with the URL can download or reshare/i);
  assert.equal(archive.byteLength, 989188);
  assert.equal(
    createHash("sha256").update(archive).digest("hex").toUpperCase(),
    expectedChecksum,
  );
});
