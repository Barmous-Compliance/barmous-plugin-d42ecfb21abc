import Image from "next/image";

const releaseVersion = "v0.1.0";

const downloads = [
  {
    product: "Codex",
    maker: "OpenAI",
    path: "/downloads/barmous-compliance-codex-plugin-v0.1.0.zip",
    size: "966 KB",
    checksum:
      "8C938340C455B34684D9AF77140D6793D879725B3A616163FEE577E2DC367290",
  },
  {
    product: "Claude Code",
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
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">AI workspace plugins · evaluation preview</p>
          <h1>Bring Barmous compliance context into Codex and Claude Code.</h1>
          <p className="hero-lede">
            Connect your AI workspace to Barmous through audited,
            company-scoped, read-only tools for frameworks, released findings,
            evidence actions, remediation, and published reports.
          </p>

          <ul className="trust-list" aria-label="Plugin safeguards">
            <li><span>01</span> Read-only access</li>
            <li><span>02</span> Company-scoped</li>
            <li><span>03</span> Audited reads</li>
          </ul>
        </div>

        <aside className="release-card" aria-labelledby="release-heading">
          <div className="release-card-topline">
            <span className="release-kicker">Latest release</span>
            <span className="release-ready"><span /> Verified</span>
          </div>

          <div className="plugin-lockup">
            <Image src="/barmous-mark.png" alt="" width={58} height={58} unoptimized />
            <div>
              <h2 id="release-heading">Barmous Compliance</h2>
              <p>AI workspace plugins</p>
            </div>
          </div>

          <dl className="release-meta">
            <div><dt>Version</dt><dd>{releaseVersion}</dd></div>
            <div><dt>Released</dt><dd>02 Aug 2026</dd></div>
            <div><dt>Access</dt><dd>Read-only</dd></div>
          </dl>

          <div className="platform-downloads" aria-label="Plugin downloads">
            {downloads.map((download) => (
              <a
                className="platform-download"
                href={download.path}
                download
                key={download.product}
              >
                <span className="platform-copy">
                  <small>{download.maker}</small>
                  <strong>{download.product}</strong>
                </span>
                <span className="download-action">
                  <DownloadIcon />
                  <span>Download</span>
                  <small>ZIP · {download.size}</small>
                </span>
              </a>
            ))}
          </div>

          <p className="package-note">
            No agent token, credentials, or company data are included.
          </p>
        </aside>
      </section>

      <section className="details-grid" id="install">
        <article className="detail-card install-card">
          <p className="section-index">01 / CODEX</p>
          <h2>Install for Codex</h2>
          <p>
            Extract the Codex ZIP, open PowerShell inside the extracted folder,
            and run:
          </p>
          <pre><code>{`$pluginRoot = (Resolve-Path ".").Path
codex plugin marketplace add $pluginRoot
codex plugin add barmous-company-data@barmous`}</code></pre>
          <p className="after-command">
            Start a new Codex task and run <code>/mcp</code> to confirm the
            Barmous server is available.
          </p>
        </article>

        <article className="detail-card install-card">
          <p className="section-index">02 / CLAUDE CODE</p>
          <h2>Install for Claude Code</h2>
          <p>
            Add the Barmous marketplace, install the plugin, and enable it:
          </p>
          <pre><code>{`claude plugin marketplace add Barmous-Compliance/barmous-plugin-d42ecfb21abc
claude plugin install barmous-company-data@barmous
claude plugin enable barmous-company-data@barmous`}</code></pre>
          <p className="after-command">
            Claude Code securely prompts for the API URL and token. Run
            <code> /reload-plugins</code>, then <code>/mcp</code>.
          </p>
        </article>
      </section>

      <section className="integrity-card" aria-labelledby="integrity-heading">
        <div className="integrity-intro">
          <p className="section-index">03 / VERIFY</p>
          <h2 id="integrity-heading">Verified release packages</h2>
          <p>
            Requires Node.js 22.12–24.x, an authorized Barmous account, a
            production HTTPS backend URL, and a scoped agent token.
          </p>
        </div>
        <div className="checksum-list">
          {downloads.map((download) => (
            <div className="checksum-row" key={download.product}>
              <span>
                <strong>{download.product}</strong>
                <small>{download.size} · SHA-256</small>
              </span>
              <code>{download.checksum}</code>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <span>© 2026 Barmous Compliance</span>
        <span>Evaluation preview · No open-source license granted</span>
      </footer>
    </main>
  );
}
