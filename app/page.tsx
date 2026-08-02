import Image from "next/image";

const downloadPath =
  "/downloads/barmous-company-data-codex-plugin-0.1.0-codex.20260802110450.zip";
const version = "0.1.0+codex.20260802110450";
const checksum =
  "8C938340C455B34684D9AF77140D6793D879725B3A616163FEE577E2DC367290";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5.5 6v5.2c0 4.1 2.7 7.8 6.5 9.1 3.8-1.3 6.5-5 6.5-9.1V6L12 3Z" />
      <path d="m9.4 11.7 1.8 1.8 3.7-4" />
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
        <span className="link-status">
          <span className="status-dot" /> Public by link
        </span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Codex plugin · evaluation preview</p>
          <h1>Your company&apos;s compliance context, available in Codex.</h1>
          <p className="hero-lede">
            Connect Codex to Barmous through audited, company-scoped,
            read-only tools for frameworks, released findings, evidence
            actions, remediation, and published reports.
          </p>

          <ul className="trust-list" aria-label="Plugin safeguards">
            <li><span>01</span> Read-only access</li>
            <li><span>02</span> Company-scoped</li>
            <li><span>03</span> Audited reads</li>
          </ul>
        </div>

        <aside className="release-card" aria-labelledby="release-heading">
          <div className="release-card-topline">
            <span className="release-kicker">Latest preview</span>
            <span className="release-ready"><span /> Verified</span>
          </div>
          <div className="plugin-lockup">
            <Image src="/barmous-mark.png" alt="" width={58} height={58} unoptimized />
            <div>
              <h2 id="release-heading">Barmous Compliance</h2>
              <p>Codex plugin</p>
            </div>
          </div>

          <dl className="release-meta">
            <div><dt>Version</dt><dd>{version}</dd></div>
            <div><dt>Package</dt><dd>966 KB · ZIP</dd></div>
            <div><dt>Released</dt><dd>02 Aug 2026</dd></div>
          </dl>

          <a className="download-button" href={downloadPath} download>
            <DownloadIcon />
            <span>Download plugin</span>
            <small>ZIP · 966 KB</small>
          </a>

          <p className="package-note">
            No agent token, credentials, or company data are included.
          </p>
        </aside>
      </section>

      <section className="privacy-note" aria-label="Link access notice">
        <ShieldIcon />
        <div>
          <strong>Link-only preview</strong>
          <p>
            This page asks search engines not to index it, but it is not
            access-controlled. Anyone with the URL can download or reshare the
            package.
          </p>
        </div>
      </section>

      <section className="details-grid">
        <article className="detail-card install-card">
          <p className="section-index">01 / INSTALL</p>
          <h2>Install in a few commands</h2>
          <p>
            Extract the ZIP, open PowerShell inside the extracted folder, and
            run:
          </p>
          <pre><code>{`$pluginRoot = (Resolve-Path ".").Path
codex plugin marketplace add $pluginRoot
codex plugin add barmous-company-data@barmous`}</code></pre>
          <p className="after-command">
            Then start a new Codex task and run <code>/mcp</code> to confirm the
            Barmous server is available.
          </p>
        </article>

        <article className="detail-card requirements-card">
          <p className="section-index">02 / CONNECT</p>
          <h2>What you&apos;ll need</h2>
          <ul className="requirements-list">
            <li><span>Node</span><strong>22.12 through 24.x</strong></li>
            <li><span>Account</span><strong>Authorized Barmous access</strong></li>
            <li><span>Backend</span><strong>Production HTTPS URL</strong></li>
            <li><span>Token</span><strong>One-time scoped agent token</strong></li>
          </ul>
          <p className="security-copy">
            Create the token in <strong>Settings → Agent access</strong>. Revoke
            it immediately if exposed. Insecure HTTP is for localhost
            development only.
          </p>
        </article>
      </section>

      <section className="integrity-card" aria-labelledby="integrity-heading">
        <div>
          <p className="section-index">03 / VERIFY</p>
          <h2 id="integrity-heading">Package integrity</h2>
        </div>
        <div className="checksum-block">
          <span>SHA-256</span>
          <code>{checksum}</code>
        </div>
      </section>

      <footer>
        <span>© 2026 Barmous Compliance</span>
        <span>Evaluation preview · No open-source license granted</span>
      </footer>
    </main>
  );
}
