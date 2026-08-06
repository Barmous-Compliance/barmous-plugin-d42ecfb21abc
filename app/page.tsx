import Image from "next/image";
import releaseManifest from "../release/integration-downloads.generated.json";
import PluginInstaller from "./plugin-installer";
import ProductMark, { type ProductId } from "./product-mark";

const releaseVersion = "v" + releaseManifest.version;
const downloads = releaseManifest.packages.map((download) => ({
  ...download,
  productId: download.id as ProductId,
  path: "/downloads/" + download.filename,
}));
const allDownload = {
  ...releaseManifest.all,
  path: "/downloads/" + releaseManifest.all.filename,
};

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 9 5 5 5-5" />
    </svg>
  );
}

function SafeguardIcon({ type }: { type: "scope" | "company" | "audit" }) {
  if (type === "company") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 21V6l7-3 7 3v15M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6" />
      </svg>
    );
  }

  if (type === "audit") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5h10M9 10h10M9 15h6M4 5l1 1 2-2M4 10l1 1 2-2M4 15l1 1 2-2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.5 2.8 8.3 7 10 4.2-1.7 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <header className="site-header" aria-label="Barmous Compliance">
        <a
          className="brand"
          href="https://barmous.ae/"
          aria-label="Return to Barmous Compliance website"
        >
          <Image src="/barmous-mark.png" alt="" width={46} height={46} unoptimized />
          <span>
            <strong>Barmous</strong>
            <small>Compliance</small>
          </span>
        </a>
        <div className="header-release" aria-label="Current plugin release">
          <span><i /> Verified preview</span>
          <code>{releaseVersion}</code>
        </div>
      </header>

      <div className="setup-stage" id="top">
        <section className="hero" aria-labelledby="hero-heading">
          <h1 id="hero-heading">Barmous MCP &amp; CLI for the AI tools you already use.</h1>
          <p>
            Connect released compliance context through one verified setup flow for
            Codex, Claude Code, Cursor, Antigravity, Perplexity, Kimi Code, and Hermes.
          </p>
          <ul className="trust-list" aria-label="Plugin safeguards">
            <li><span><SafeguardIcon type="scope" /></span> Read-only CLI + MCP</li>
            <li><span><SafeguardIcon type="company" /></span> Browser-authorized profiles</li>
            <li><span><SafeguardIcon type="audit" /></span> No pasted secrets</li>
          </ul>
        </section>

        <PluginInstaller />
      </div>

      <details className="release-disclosure" id="downloads">
        <summary className="release-summary">
          <span className="release-summary-copy">
            <small>Verified {releaseVersion} packages</small>
            <strong>Download integration packages</strong>
            <span>7 client packages plus one complete ZIP</span>
          </span>
          <span className="release-summary-action">
            Downloads
            <ChevronIcon />
          </span>
        </summary>

        <div className="release-content">
          <a
            className="download-all"
            href={allDownload.path}
            download
            aria-label="Download all Barmous integrations as one ZIP"
          >
            <span className="download-all-icon"><DownloadIcon /></span>
            <span>
              <small>Complete bundle</small>
              <strong>Download all integrations</strong>
              <span>Every client package, manifest, and SHA-256 list</span>
            </span>
            <span>{allDownload.size}</span>
          </a>
          <div className="download-all-checksum">
            <span>Complete bundle SHA-256</span>
            <code>{allDownload.sha256}</code>
          </div>

          <section className="release-section" aria-labelledby="release-heading">
            <div className="release-overview">
              <div className="release-intro">
                <h2 id="release-heading">Everything you need, nothing sensitive included.</h2>
                <p>
                  Every client gets its real supported format: plugin source where
                  plugins exist, and an MCP setup kit where they do not. No credential
                  or company data is bundled.
                </p>
              </div>
              <dl className="release-meta">
                <div><dt>Version</dt><dd>{releaseVersion}</dd></div>
                <div><dt>Released</dt><dd>07 Aug 2026</dd></div>
                <div><dt>Runtime</dt><dd>Node.js 22.12–24.x</dd></div>
                <div><dt>Lifetime</dt><dd>Never default · 1h to 1y optional</dd></div>
              </dl>
            </div>

            <div
              className="release-downloads"
              role="list"
              aria-label="Barmous integration package downloads"
            >
              {downloads.map((download) => (
                <article className="release-download" role="listitem" key={download.product}>
                  <div className="download-heading">
                    <ProductMark product={download.productId} className="platform-mark" />
                    <span>
                      <small>{download.maker} · {download.packageType}</small>
                      <strong>{download.product}</strong>
                    </span>
                  </div>
                  <p className="download-method">{download.installMethod}</p>
                  <a
                    className="download-button"
                    href={download.path}
                    download
                    aria-label={"Download " + download.product + " package ZIP"}
                  >
                    <DownloadIcon />
                    Download ZIP
                    <small>{download.size}</small>
                  </a>
                  <div className="checksum">
                    <span>SHA-256</span>
                    <code>{download.sha256}</code>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </details>

      <footer>
        <span>© 2026 Barmous Compliance</span>
        <span className="footer-links">
          <a href="PREVIEW_DISTRIBUTION_NOTICE.md">Preview terms</a>
          <a href="THIRD_PARTY_NOTICES.md">Third-party notices</a>
        </span>
      </footer>
    </main>
  );
}
