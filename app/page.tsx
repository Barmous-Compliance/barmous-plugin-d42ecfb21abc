import Image from "next/image";
import PluginInstaller from "./plugin-installer";
import ProductMark, { type ProductId } from "./product-mark";

const releaseVersion = "v0.1.0";

const downloads = [
  {
    product: "Codex",
    productId: "codex" as ProductId,
    maker: "OpenAI",
    path: "/downloads/barmous-compliance-codex-plugin-v0.1.0.zip",
    size: "966 KB",
    checksum:
      "D9363EDC4FF9B2B42D97CB55A77A26FB6C557E4720AE5FEE8DA550A53044D987",
  },
  {
    product: "Claude Code",
    productId: "claude" as ProductId,
    maker: "Anthropic",
    path: "/downloads/barmous-compliance-claude-plugin-v0.1.0.zip",
    size: "207 KB",
    checksum:
      "827599DA3FF7186DEC276D7B3690F90C8BD6BF092BADD2F4A363C68F1C815789",
  },
] as const;

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" />
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
        <a className="brand" href="#top" aria-label="Barmous Compliance home">
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

      <section className="hero" id="top">
        <h1>Connect your compliance workspace in three clear steps.</h1>
        <p className="hero-lede">
          Install the Barmous plugin for Codex or Claude Code, connect your
          company-scoped access, and start reviewing live readiness with
          audited, read-only tools.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#installer">
            Start setup <ArrowIcon />
          </a>
          <a
            className="button button-secondary"
            href="https://github.com/Barmous-Compliance/barmous-plugin-d42ecfb21abc"
            target="_blank"
            rel="noreferrer"
          >
            View plugin source
          </a>
        </div>
        <ul className="trust-list" aria-label="Plugin safeguards">
          <li><span><SafeguardIcon type="scope" /></span> Read-only access</li>
          <li><span><SafeguardIcon type="company" /></span> Company-scoped</li>
          <li><span><SafeguardIcon type="audit" /></span> Audited reads</li>
        </ul>
      </section>

      <PluginInstaller />

      <section className="release-section" id="requirements" aria-labelledby="release-heading">
        <div className="release-intro">
          <h2 id="release-heading">Everything you need, nothing sensitive included.</h2>
          <p>
            Packages contain the local MCP server and five Barmous compliance
            skills. No agent token, credentials, or company data are bundled.
          </p>
          <dl className="release-meta">
            <div><dt>Version</dt><dd>{releaseVersion}</dd></div>
            <div><dt>Released</dt><dd>02 Aug 2026</dd></div>
            <div><dt>Runtime</dt><dd>Node.js 22.12–24.x</dd></div>
            <div><dt>Access</dt><dd>Read-only</dd></div>
          </dl>
        </div>

        <div className="release-downloads" aria-label="Verified plugin downloads">
          {downloads.map((download) => (
            <article className="release-download" key={download.product}>
              <div className="download-heading">
                <ProductMark product={download.productId} className="platform-mark" />
                <span>
                  <small>{download.maker}</small>
                  <strong>{download.product}</strong>
                </span>
              </div>
              <a className="download-button" href={download.path} download>
                <DownloadIcon />
                Download ZIP
                <small>{download.size}</small>
              </a>
              <div className="checksum">
                <span>SHA-256</span>
                <code>{download.checksum}</code>
              </div>
            </article>
          ))}
        </div>
      </section>

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
