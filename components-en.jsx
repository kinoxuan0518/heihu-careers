/* global React, window */
// ============ Heihu Careers v2 · Components (EN) ============

const { useEffect, useRef, useState, useMemo, useCallback } = React;

// ── Page reveal (animations handled by CSS) ──
function useReveal() {
  return useRef(null);
}

// ── Count-up animation ──
function useCountUp(end, duration = 1600) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numEnd = parseInt(end, 10);
    if (isNaN(numEnd)) { setVal(end); return; }
    let frame;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(numEnd * ease));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return [ref, val];
}

// ── Navigation ──
function Nav({ onApply }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="nav" style={scrolled ? { borderBottomColor: "var(--line-2)" } : {}}>
      <div className="nav-inner">
        <a href="#top" className="logo" aria-label="Blacklake">
          <img src="logo.png" alt="Blacklake" className="logo-img" />
        </a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#why">Why Join</a>
          <a href="#jobs">Roles</a>
          <a href="#stories">Stories</a>
          <a href="#life">Footprint</a>
          <a href="#perks">Perks</a>
        </div>
        <a href="index.html" className="nav-lang" style={{ fontSize: 13, color: "var(--fg-3)", marginRight: 12, textDecoration: "none" }}>中文</a>
        <button className="nav-cta" onClick={onApply}>
          View All Roles
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" fill="none" strokeWidth="1.2"/></svg>
        </button>
      </div>
    </nav>
  );
}

// ── Arrow icon ──
const Arrow = ({ rot = 0, size = 14 }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 14 14" style={{ transform: `rotate(${rot}deg)` }}>
    <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// ── Scroll progress bar ──
function ScrollBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total ? (h.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-bar"><i style={{ width: `${p}%` }} /></div>;
}

// ── Avatar SVG ──
function AvatarSVG({ seed = 1 }) {
  const hues = [155, 42, 22, 205, 285, 95];
  const h = hues[seed % hues.length];
  return (
    <svg viewBox="0 0 40 40">
      <rect width="40" height="40" fill={`hsl(${h} 25% 18%)`} />
      <circle cx="20" cy="16" r="7" fill={`hsl(${h} 35% 45%)`} />
      <path d={`M5 40 Q20 ${26 + (seed % 4)} 35 40 Z`} fill={`hsl(${h} 35% 45%)`} />
    </svg>
  );
}

// ── Drawer: Job Detail ──
function JobDrawer({ job, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    if (job) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [job, onClose]);

  return (
    <>
      <div className={`drawer-mask ${job ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${job ? "open" : ""}`} aria-hidden={!job}>
        {job && (
          <>
            <div className="drawer-head">
              <span className="caption">{job.team} · {job.id}</span>
              <button className="drawer-close" onClick={onClose} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.3"/></svg>
              </button>
            </div>
            <div className="drawer-body">
              <div className="caption" style={{ marginBottom: 16 }}>{job.category}</div>
              <h1>{job.title}</h1>
              <div className="drawer-meta">
                <span className="chip"><span className="chip-dot"></span>{job.loc}</span>
                <span className="chip">{job.type}</span>
                <span className="chip">{job.level}</span>
              </div>
              <p style={{ fontFamily: "var(--serif)", fontSize: 21, lineHeight: 1.5, color: "var(--fg)" }}>{job.desc}</p>
              <h3>What You'll Do</h3>
              <ul>{job.resp.map((r, i) => <li key={i}>{r}</li>)}</ul>
              <h3>What We're Looking For</h3>
              <ul>{job.req.map((r, i) => <li key={i}>{r}</li>)}</ul>
              <h3>About the Team</h3>
              <p>You'll join the <b style={{ color: "var(--fg)" }}>{job.team}</b> team — currently 12-30 people, flat communication, project-based collaboration, led by a 10+ year industry veteran.</p>
            </div>
            <div className="drawer-cta">
              <div style={{ fontSize: 13, color: "var(--fg-3)" }}>We respond within 5 business days of receiving your resume</div>
              <a className="btn" href={`mailto:careers@blacklake.cn?subject=${encodeURIComponent('Application: ' + job.title)}&body=${encodeURIComponent('Role ID: ' + job.id + '\n\nPlease attach your resume or portfolio.')}`}>
                Apply Now <Arrow />
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function CursorGlow() {
  useEffect(() => {
    const el = document.createElement("div");
    el.className = "cursor-glow";
    document.body.appendChild(el);
    const onMove = e => {
      el.style.setProperty("--cx", e.clientX + "px");
      el.style.setProperty("--cy", e.clientY + "px");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); el.remove(); };
  }, []);
  return null;
}

function useTiltEffect(ref) {
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const onMove = e => {
      const card = e.target.closest(".story");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-y*10).toFixed(1)}deg) rotateY(${(x*10).toFixed(1)}deg) scale(1.025)`;
      card.style.zIndex = "2";
      const glare = card.querySelector(".story-glare");
      if (glare) {
        glare.style.opacity = "1";
        glare.style.background = `radial-gradient(circle at ${((x+0.5)*100).toFixed(0)}% ${((y+0.5)*100).toFixed(0)}%, rgba(255,255,255,0.11), transparent 65%)`;
      }
    };
    const onOut = e => {
      const card = e.target.closest(".story");
      if (!card || card.contains(e.relatedTarget)) return;
      card.style.transform = "";
      card.style.zIndex = "";
      const glare = card.querySelector(".story-glare");
      if (glare) glare.style.opacity = "0";
    };
    grid.addEventListener("mousemove", onMove);
    grid.addEventListener("mouseout", onOut);
    return () => { grid.removeEventListener("mousemove", onMove); grid.removeEventListener("mouseout", onOut); };
  }, []);
}

function usePerkRipple(ref) {
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    let rafId;
    const onMove = e => {
      const card = e.target.closest(".perk");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const rx = (e.clientX - r.left) / r.width;
      const ry = (e.clientY - r.top)  / r.height;
      card.style.setProperty("--ox", `${(rx * 100).toFixed(0)}%`);
      card.style.setProperty("--oy", `${(ry * 100).toFixed(0)}%`);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const mx = rx - 0.5, my = ry - 0.5;
        card.style.transform = `perspective(900px) rotateY(${(mx * 9).toFixed(2)}deg) rotateX(${(-my * 6).toFixed(2)}deg) translateZ(8px)`;
      });
    };
    const onOut = e => {
      const card = e.target.closest(".perk");
      if (!card || card.contains(e.relatedTarget)) return;
      cancelAnimationFrame(rafId);
      card.style.transform = '';
    };
    grid.addEventListener("mousemove", onMove);
    grid.addEventListener("mouseout", onOut);
    return () => {
      cancelAnimationFrame(rafId);
      grid.removeEventListener("mousemove", onMove);
      grid.removeEventListener("mouseout", onOut);
    };
  }, []);
}

function flattenChildren(children) {
  const out = [];
  React.Children.forEach(children, child => {
    if (child == null) return;
    if (typeof child === "string") {
      for (const c of child) out.push({ char: c === " " ? "\u00A0" : c, cls: "" });
    } else if (React.isValidElement(child)) {
      const cls = child.props.className || "";
      const inner = child.props.children;
      if (typeof inner === "string") {
        for (const c of inner) out.push({ char: c === " " ? "\u00A0" : c, cls });
      }
    }
  });
  return out;
}

function LiquidHeading({ children, className }) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const spans = Array.from(el.querySelectorAll(".bm-char"));
    const disp = spans.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    let posCache = null;
    let mouse = { x: -9999, y: -9999 };
    let raf = null;

    const cachePos = () => {
      const rect = el.getBoundingClientRect();
      posCache = spans.map(s => {
        const r = s.getBoundingClientRect();
        return { x: r.left + r.width * 0.5 - rect.left, y: r.top + r.height * 0.5 - rect.top };
      });
    };
    const cacheTimer = setTimeout(cachePos, 150);

    const animate = () => {
      if (!posCache) { raf = requestAnimationFrame(animate); return; }
      let anyActive = false;
      spans.forEach((span, i) => {
        const p = posCache[i];
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const R = 130, strength = 24;
        const influence = Math.exp(-(dist * dist) / (2 * R * R)) * strength;
        const angle = Math.atan2(dy, dx);
        const tx = Math.cos(angle) * influence;
        const ty = Math.sin(angle) * influence;
        const d = disp[i];
        d.vx = d.vx * 0.74 + (tx - d.x) * 0.19;
        d.vy = d.vy * 0.74 + (ty - d.y) * 0.19;
        d.x += d.vx; d.y += d.vy;

        if (Math.abs(d.x) > 0.05 || Math.abs(d.y) > 0.05) {
          anyActive = true;
          span.style.transform = `translate(${d.x.toFixed(1)}px,${d.y.toFixed(1)}px) rotate(${(d.x * 0.1).toFixed(1)}deg)`;
          if (!span.classList.contains("green")) {
            const mag = Math.min(Math.sqrt(d.x * d.x + d.y * d.y) / strength * 2, 1);
            span.style.color = `rgb(${Math.round(237+(2-237)*mag*0.65)},${Math.round(235+(185-235)*mag*0.65)},${Math.round(230+(128-230)*mag*0.65)})`;
          }
        } else {
          d.x = 0; d.y = 0; d.vx = 0; d.vy = 0;
          span.style.transform = "";
          if (!span.classList.contains("green")) span.style.color = "";
        }
      });
      if (anyActive || mouse.x > -9000) raf = requestAnimationFrame(animate);
      else raf = null;
    };

    const onMove = e => {
      const r = el.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!raf) raf = requestAnimationFrame(animate);
    };
    const onLeave = () => { mouse = { x: -9999, y: -9999 }; };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    const onResize = () => setTimeout(cachePos, 80);
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(cacheTimer);
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── Scroll-in: chars blur-fade up on viewport entry ──
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll('.bm-char'));
    spans.forEach((s, i) => s.style.setProperty('--ci', i));
    el.classList.add('lh-pending');
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.remove('lh-pending');
      el.classList.add('lh-revealed');
      io.disconnect();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = flattenChildren(children);
  return (
    <h2 ref={elRef} className={className}>
      {items.map((item, i) => (
        <span key={i} className={`bm-char${item.cls ? " " + item.cls : ""}`}>{item.char}</span>
      ))}
    </h2>
  );
}

// ── Odometer Stat (canvas drum-roll digits) ──
function OdometerStat({ value, suffix, label, duration = 1900, delay = 0 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf;

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setTimeout(run, delay);
    }, { threshold: 0.3 });
    io.observe(wrap);

    function run() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext("2d");

      const fs = Math.round(Math.min(Math.max(28, window.innerWidth * 0.03), 40));
      const FONT = `600 ${fs * dpr}px "Fraunces", "Noto Serif SC", serif`;
      ctx.font = FONT;

      const chars = (value + (suffix || "")).split("");
      const isNum = c => c >= "0" && c <= "9";
      const cw = chars.map(c => ctx.measureText(isNum(c) ? "0" : c).width);
      const totalW = cw.reduce((a, b) => a + b, 0);
      const H = fs * dpr * 1.28;

      canvas.width = Math.ceil(totalW);
      canvas.height = Math.ceil(H);
      canvas.style.width = `${Math.ceil(totalW / dpr)}px`;
      canvas.style.height = `${Math.ceil(H / dpr)}px`;

      ctx.font = FONT;
      ctx.textBaseline = "middle";

      const ease = t => {
        const c1 = 1.45, c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };

      const digitIdxs = chars.reduce((acc, c, i) => isNum(c) ? [...acc, i] : acc, []);
      let start = null;

      const tick = ts => {
        if (!start) start = ts;
        const elapsed = ts - start;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let x = 0;
        chars.forEach((c, i) => {
          const w = cw[i];
          if (isNum(c)) {
            const target = parseInt(c, 10);
            const rank = digitIdxs.indexOf(i);
            const t = Math.min(Math.max(elapsed - rank * 50, 0) / duration, 1);
            const ep = ease(t);
            const yOff = -ep * target * H;

            ctx.save();
            ctx.beginPath();
            ctx.rect(x, 0, w + 1, canvas.height);
            ctx.clip();

            for (let d = 0; d <= 9; d++) {
              const dy = yOff + d * H + H * 0.5;
              if (dy < -H || dy > H * 2) continue;
              const dist = Math.abs(d - ep * target);
              const alpha = d === target
                ? 0.3 + Math.min(t * 1.4, 0.7)
                : Math.max(0, 0.55 - dist * 0.16);
              ctx.fillStyle = `rgba(237,235,230,${alpha.toFixed(2)})`;
              ctx.fillText(String(d), x, dy);
            }
            ctx.restore();
          } else {
            const isAccent = c === "+" || c === "%";
            const a = Math.min(elapsed / 600, 1);
            ctx.fillStyle = isAccent
              ? `rgba(2,185,128,${(a * 0.85).toFixed(2)})`
              : `rgba(140,136,128,${(a * 0.8).toFixed(2)})`;
            ctx.fillText(c, x, H * 0.5);
          }
          x += w;
        });

        if (elapsed < duration + digitIdxs.length * 50 + 100) {
          raf = requestAnimationFrame(tick);
        }
      };

      raf = requestAnimationFrame(tick);
    }

    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, suffix, duration, delay]);

  return (
    <div ref={wrapRef} className="cell reveal">
      <div className="k">{label}</div>
      <div className="v" style={{ overflow: "visible", lineHeight: 1 }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>
    </div>
  );
}

Object.assign(window, { Nav, Arrow, ScrollBar, AvatarSVG, JobDrawer, useReveal, useCountUp, OdometerStat, LiquidHeading, CursorGlow, useTiltEffect, usePerkRipple });
