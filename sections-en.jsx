/* global React, window, VALUES, JOBS, CATEGORIES, LOCATIONS, STORIES, PERKS, PLACES, FAQS, HERO_STATS, CLIENTS, Arrow, AvatarSVG, useCountUp */

const { useState: useS, useMemo: useM, useRef: useR, useEffect: useE } = React;

// ═══════════════════════════════ Hero ═══════════════════════════════
function Hero({ onPrimary, onSecondary }) {
  const titleRef = useR(null);

  useE(() => {
    const title = titleRef.current;
    if (!title) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-title-canvas";
    title.appendChild(canvas);

    const rect = title.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const DURATION = 1400;
    const LINE_H = 3;
    const GLOW_H = 60;

    ctx.fillStyle = "#09090B";
    ctx.fillRect(0, 0, W, H);

    let startTime = null;
    let raf;

    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const y = progress * H;

      ctx.clearRect(0, 0, W, y - LINE_H);
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, y + LINE_H, W, H);

      const grad = ctx.createLinearGradient(0, y - GLOW_H, 0, y + LINE_H + 8);
      grad.addColorStop(0, "rgba(2,185,128,0)");
      grad.addColorStop(0.6, "rgba(2,185,128,0.08)");
      grad.addColorStop(0.85, "rgba(2,185,128,0.35)");
      grad.addColorStop(1, "rgba(2,185,128,0.9)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - GLOW_H, W, GLOW_H + LINE_H + 8);

      ctx.fillStyle = "rgba(2,185,128,0.95)";
      ctx.fillRect(0, y, W, LINE_H);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
        title.classList.add("scan-done");
        canvas.style.transition = "opacity .4s";
        canvas.style.opacity = "0";
        setTimeout(() => canvas.remove(), 500);
      }
    };

    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, 200);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (canvas.parentNode) canvas.remove();
    };
  }, []);

  return (
    <section className="hero noise" id="top">
      <div className="glow-top" />

      <div className="wrap">
        <div className="hero-kicker reveal">
          <span className="pulse" />
          <span>AI for Industry · 2026</span>
          <span style={{ color: "var(--fg-muted)" }}>—</span>
          <span>Blacklake · Careers</span>
        </div>

        <h1 className="h-hero hero-title" ref={titleRef}>
          <span className="line"><span>The ultimate meaning</span></span>
          <span className="line"><span>of code is to change</span></span>
          <span className="line"><span>the <em>real world</em>.</span></span>
        </h1>

        <p className="hero-sub reveal">
          Today, Blacklake's software runs inside tens of thousands of Chinese factories. There, every line of code
          impacts real production systems. We possess what AI needs most to land in manufacturing — real-world
          industrial scenarios and data. If that excites you even a little, keep reading.
        </p>

        <div className="hero-actions reveal d-1">
          <button className="btn" onClick={onPrimary}>
            View {JOBS.length} Open Roles <Arrow />
          </button>
          <button className="btn btn-ghost" onClick={onSecondary}>
            Learn Who We Are
          </button>
        </div>

        <div className="hero-meta">
          <OdometerStat value="37,000" suffix="+" label="Factories Served" duration={1800} delay={0} />
          <OdometerStat value="52.7" suffix="%" label="SaaS MES Market Share" duration={1600} delay={120} />
          <div className="cell reveal d-3">
            <div className="k">Founded</div>
            <div className="v">2016</div>
          </div>
          <div className="cell reveal d-4">
            <div className="k">Market Rank</div>
            <div className="v">No.<span style={{ color: "var(--green)" }}>1</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ About ═══════════════════════════════
function About() {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">01</span><span>Who We Are</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">Data doesn't speak for itself, <em className="green italic">but it gives silent factories a voice</em></LiquidHeading>
          </div>
        </div>

        <div className="article reveal d-1">
          <aside className="side">
            <div className="corner">
              <div className="eyebrow" style={{ marginBottom: 12 }}>Context</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.55, letterSpacing: "-0.01em", color: "var(--fg-2)" }}>
                China has millions of small and medium factories. They are the capillaries of manufacturing — supporting countless jobs and the last mile of supply chains — yet they are almost entirely silent.
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="chip">MES</span>
                <span className="chip">Intelligent Scheduling</span>
                <span className="chip">Quality Analytics</span>
                <span className="chip">Shop Floor Collaboration</span>
              </div>
            </div>
          </aside>

          <div>
            <p className="lead drop">
              We started with a smartphone and a piece of cloud code, doing something quite "dumb" — walking into workshops, eating and living alongside workers, running every scheduling algorithm on actual production lines. It's not that factories didn't want data — it's that data had never been collected before. Blacklake uses a SaaS model to drastically reduce deployment time and cost, holding <b style={{ color: "var(--fg)" }}>52.7% market share</b> as China's #1 SaaS MES, serving <b style={{ color: "var(--fg)" }}>37,000+ factories</b>. Tesla's supply chain, GAC Group, Nongfu Spring, China Resources, Mixue, and tens of thousands of SME manufacturers together form the full landscape of Chinese manufacturing we serve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ Clients Strip ═══════════════════════════════
function ClientsStrip() {
  const items = CLIENTS.concat(CLIENTS);
  return (
    <div className="clients-strip">
      <div className="clients-track">
        {items.map((c, i) => (
          <React.Fragment key={i}>
            <span className="client-name">{c}</span>
            {i < items.length - 1 && <span className="client-sep">·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════ WhyJoin ═══════════════════════════════
function WhyJoin() {
  return (
    <section className="section" id="why">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">02</span><span>Why Join Blacklake</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">We hope to <em className="green italic">walk this road with you</em></LiquidHeading>
            <p className="sub">Not slogans on a wall — these are our hiring filter, our decision framework, and the answer when customers ask "why do you do it this way."</p>
          </div>
        </div>

        <div className="values reveal d-1">
          {VALUES.map(v => (
            <div key={v.idx} className="val">
              <div className="val-idx">/ {v.idx}</div>
              <div className="val-title">{v.title}</div>
              <div className="val-meta">{v.meta}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80 }} className="reveal d-2">
          <div className="bigmark" aria-hidden="true">
            <span className="outline">Every</span> line of <em>code</em>
            <span style={{ display: "block", marginTop: 8 }}>hits a <em>real</em></span>
            <span style={{ display: "block", marginTop: 8 }}>factory floor.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ Jobs ═══════════════════════════════
function Jobs({ onOpen }) {
  const [cat, setCat] = useS("All");
  const [loc, setLoc] = useS("All Cities");
  const filtered = useM(() => JOBS.filter(j =>
    (cat === "All" || j.category === cat) &&
    (loc === "All Cities" || j.loc.includes(loc.split(" ")[0]))
  ), [cat, loc]);

  return (
    <section className="section" id="jobs">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">03</span><span>Open Roles</span></div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--fg-4)", textTransform: "uppercase" }}>
                {String(filtered.length).padStart(2, "0")} open roles
              </span>
            </div>
            <LiquidHeading className="h-1">Finding the next <em className="green italic">right person</em></LiquidHeading>
          </div>
        </div>

        {/* Team filter */}
        <div className="jobs-head reveal d-1">
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <span className="eyebrow" style={{ gap: 6 }}>Team</span>
            <div className="jobs-filters">
              {CATEGORIES.map(c => (
                <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        {/* Location filter */}
        <div className="jobs-head reveal d-1" style={{ marginTop: -12 }}>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <span className="eyebrow" style={{ gap: 6 }}>Location</span>
            <div className="jobs-filters">
              {LOCATIONS.map(c => (
                <button key={c} className={`chip ${loc === c ? "active" : ""}`} onClick={() => setLoc(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="jobs-list reveal d-2">
          {filtered.map((j, i) => (
            <div key={j.id} className="job" onClick={() => onOpen(j)}>
              <div className="job-num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="job-title">{j.title}</div>
                <div className="job-level">{j.level} · {j.type}</div>
              </div>
              <div className="job-team">{j.team}</div>
              <div className="job-loc">
                <span className="loc-dot" />
                {j.loc}
              </div>
              <div className="job-arrow"><Arrow /></div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--fg-3)", fontFamily: "var(--serif)", fontSize: 20 }}>
              No openings match your current filters — but we always welcome spontaneous applications.
            </div>
          )}
        </div>

        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }} className="reveal">
          <div style={{ fontSize: 14, color: "var(--fg-3)" }}>Don't see the right role? Tell us what you're interested in.</div>
          <a className="btn btn-ghost" href="mailto:careers@blacklake.cn?subject=Open Application">Open Application <Arrow /></a>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ Stories ═══════════════════════════════
function Stories() {
  const gridRef = useR(null);
  useTiltEffect(gridRef);
  return (
    <section className="section stories-section" id="stories">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">04</span><span>From the Team</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">Not slogans — <em className="green italic">real colleagues</em></LiquidHeading>
            <p className="sub">Six first-person accounts from different teams. No polish, kept as close to the original as possible.</p>
          </div>
        </div>

        <div className="stories" ref={gridRef}>
          {STORIES.map((s, i) => (
            <article key={i} className="story reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="story-glare" />
              <div className="story-tag">{s.team}</div>
              <blockquote className="story-quote">"{s.quote}"</blockquote>
              <div className="story-foot">
                <div className="story-avatar"><AvatarSVG seed={i + 1} /></div>
                <div>
                  <div className="story-name">{s.fullName || s.name}</div>
                  <div className="story-role">{s.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ Places · Contact Sheet ═══════════════════════════════
function PlacesSection() {
  const [photoFull, setPhotoFull] = useS(null);

  const photos = [
    { src: 'assets/office-1.jpg', cap: '333 Wuyi Road' },
    { src: 'assets/office-2.jpg', cap: 'Campus Courtyard' },
    { src: 'assets/office-3.jpg', cap: 'Covered Walkway' },
    { src: 'assets/office-4.jpg', cap: 'Aerial View' },
  ];

  const cities = [
    { name: 'Shanghai', badge: 'HQ', detail: "31°12'N · 121°28'E" },
  ];

  useE(() => {
    const h = e => e.key === 'Escape' && setPhotoFull(null);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <section className="section section-places" id="life">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">05</span><span>Our Footprint</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">From Shanghai, <em className="green italic">rooted across Asia-Pacific</em></LiquidHeading>
            <p className="sub">Headquartered in Shanghai, operating across 30+ provinces in China — with a regional HQ in Singapore and growing presence in Indonesia and Vietnam.</p>
          </div>
        </div>
      </div>

      <div className="office-strip reveal d-1">
        {photos.map((p, i) => (
          <button key={i} className="office-frame" onClick={() => setPhotoFull(p.src)}>
            <img src={p.src} alt={p.cap} className="office-frame-img" loading="lazy" />
            <span className="office-frame-idx">0{i + 1}</span>
            <div className="office-frame-foot">
              <span className="office-frame-loc">Shanghai · HQ</span>
              <span className="office-frame-cap">{p.cap}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="wrap">
        <div className="office-cities reveal d-2">
          {cities.map((c, i) => (
            <div key={i} className="office-city">
              <span className="loc-dot" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="office-city-name">{c.name}</span>
                  {c.badge && <span className="office-city-badge">{c.badge}</span>}
                </div>
                {c.detail && <div className="office-city-detail">{c.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {photoFull && (
        <div className="photo-lightbox" onClick={() => setPhotoFull(null)}>
          <img src={photoFull} alt="Office" className="photo-lightbox-img" />
          <button className="photo-lightbox-close" onClick={e => { e.stopPropagation(); setPhotoFull(null); }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════ Perks ═══════════════════════════════
function PerksSection() {
  const gridRef = useR(null);
  usePerkRipple(gridRef);
  return (
    <section className="section" id="perks">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">06</span><span>Perks & Benefits</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">Getting the <em className="green italic">fundamentals</em> right matters more than gimmicks</LiquidHeading>
            <p className="sub">No massage chairs, no free beer taps. Here's what we think actually matters.</p>
          </div>
        </div>

        <div className="perks reveal d-1" ref={gridRef}>
          {PERKS.map((p) => (
            <div key={p.idx} className="perk">
              <div className="perk-idx">/ {p.idx}</div>
              <div className="perk-t">{p.t}</div>
              <div className="perk-d">{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ FAQ ═══════════════════════════════
function Process() {
  return (
    <section className="section" id="process">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">07</span><span>FAQ</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">Things you might want to <em className="green italic">ask us first</em></LiquidHeading>
          </div>
        </div>

        <div className="reveal d-1">
          {FAQS.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useS(false);
  const innerRef = useR(null);
  const [h, setH] = useS(0);
  useE(() => {
    if (!innerRef.current) return;
    const ro = new ResizeObserver(() => setH(innerRef.current.scrollHeight));
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="faq-item">
      <button className="faq-btn" onClick={() => setOpen(o => !o)}>
        <span className="faq-q">{q}</span>
        <span className="faq-icon" style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform .3s var(--ease)" }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </span>
      </button>
      <div className="faq-body" style={{ height: open ? h : 0 }}>
        <div ref={innerRef} style={{ paddingBottom: 20 }}><p>{a}</p></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════ CTA ═══════════════════════════════
function CTA({ onApply }) {
  return (
    <section className="section-sm">
      <div className="wrap">
        <div className="cta-block reveal">
          <div>
            <div className="eyebrow" style={{ color: "var(--fg-4)", marginBottom: 24 }}>
              <span className="dot" /><span>Next Step</span>
            </div>
            <h2>If any of this<br />excites you —</h2>
            <p className="cta-sub">Send us your resume, portfolio, or ideas. If none of our current openings fit, create your own role.</p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-ghost" href="mailto:careers@blacklake.cn?subject=Let's Chat">Let's Chat</a>
            <button className="btn" onClick={onApply}>View Roles <Arrow /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ Footer ═══════════════════════════════
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div>
            <div className="logo" style={{ marginBottom: 14 }}>
              <img src="logo.png" alt="Blacklake" className="logo-img" />
            </div>
            <p style={{ maxWidth: "36ch", lineHeight: 1.72, color: "var(--fg-3)", fontSize: 14 }}>
              Blacklake — an industrial software + AI company. Our goal is simple: let data and AI drive manufacturing.
            </p>
          </div>
          <div>
            <h4>Careers</h4>
            <ul>
              <li><a href="#jobs">Open Roles</a></li>
              <li><a href="#process">How to Join</a></li>
              <li><a href="#perks">Perks & Benefits</a></li>
              <li><a href="#">Campus Recruiting</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#stories">Team Stories</a></li>
              <li><a href="#life">Offices</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:careers@blacklake.cn">careers@blacklake.cn</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">WeChat</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <div>© 2026 Blacklake · Shanghai Blacklake Network Technology</div>
          <div>Made with care in Shanghai</div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Hero, About, ClientsStrip, WhyJoin, Jobs, Stories, PlacesSection, PerksSection, Process, CTA, Footer });
