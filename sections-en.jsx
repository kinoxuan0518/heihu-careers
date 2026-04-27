/* global React, window, VALUES, JOBS, CATEGORIES, LOCATIONS, STORIES, PERKS, PLACES, FAQS, HERO_STATS, CLIENTS, Arrow, AvatarSVG, useCountUp */

const { useState: useS, useMemo: useM, useRef: useR, useEffect: useE } = React;

// ─── Shared helpers ───────────────────────────────────────────────────────────
const _seededRand = (seed) => {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) | 0; return (s >>> 0) / 4294967296; };
};
function _jobHash(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h >>> 0;
}

// ═══════════════════════════════ Hero Terminal ═══════════════════════════════
function HeroTerminal() {
  const bodyRef   = useR(null);
  const canvasRef = useR(null);
  const logRef    = useR(null);

  useE(() => {
    const hero = document.querySelector('.hero');
    const body = bodyRef.current;
    if (!hero || !body) return;
    const BY = -18, BX = -6;
    let ry = BY, rx = BX, vry = 0, vrx = 0, tRy = BY, tRx = BX, raf = null;
    const step = () => {
      vry = vry * 0.68 + (tRy - ry) * 0.22;
      vrx = vrx * 0.68 + (tRx - rx) * 0.22;
      ry += vry; rx += vrx;
      body.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
      const done = Math.abs(ry-tRy)<0.05 && Math.abs(rx-tRx)<0.05 && Math.abs(vry)<0.02 && Math.abs(vrx)<0.02;
      raf = done ? null : requestAnimationFrame(step);
    };
    const onMove = e => {
      const r = hero.getBoundingClientRect();
      tRy = BY + ((e.clientX - r.left) / r.width  - 0.5) * 50;
      tRx = BX - ((e.clientY - r.top)  / r.height - 0.5) * 32;
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onLeave = () => { tRy = BY; tRx = BX; if (!raf) raf = requestAnimationFrame(step); };
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    return () => { cancelAnimationFrame(raf); hero.removeEventListener('mousemove', onMove); hero.removeEventListener('mouseleave', onLeave); };
  }, []);

  useE(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.offsetWidth || 296, H = 140;
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    const cx = W / 2, cy = H / 2;
    const S = 0.58;
    const V0 = [[-S,-S,-S],[S,-S,-S],[S,S,-S],[-S,S,-S],[-S,-S,S],[S,-S,S],[S,S,S],[-S,S,S]].map(([x,y,z])=>({x,y,z}));
    const EDGES = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const rotY = (v,a) => ({x:v.x*Math.cos(a)-v.z*Math.sin(a),y:v.y,z:v.x*Math.sin(a)+v.z*Math.cos(a)});
    const rotX = (v,a) => ({x:v.x,y:v.y*Math.cos(a)-v.z*Math.sin(a),z:v.y*Math.sin(a)+v.z*Math.cos(a)});
    const proj = (v,sc,d=2.8) => ({x:cx+v.x/(v.z+d)*sc, y:cy+v.y/(v.z+d)*sc});
    let raf, t0=null, angle=0, pulseIdx=-1, pulseTs=0;
    const BOOT = ['INIT SEQUENCE ·········','MES ENGINE ·········· LOAD','FACTORY LINK ·········· SYNC','UPLINK ·············· OK'];
    const LOGS = [
      {cls:'ok', t:'[OK] FACTORY NODES ··· 40,127'},
      {cls:'ok', t:'[OK] MES SCHEDULER ···· ACTIVE'},
      {cls:'ok', t:'[OK] QUALITY MONITOR ·· ONLINE'},
      {cls:'run',t:'[··] ANOMALY SCAN ····· RUNNING'},
      {cls:'ok', t:'[OK] AI VISION ·········· LIVE'},
      {cls:'ok', t:'[OK] OEE ENGINE ········ READY'},
      {cls:'warn',t:'[··] DATA SYNC ········· 98.3%'},
    ];
    let logIdx = 0;
    const addLog = () => {
      if (!logRef.current || logIdx >= LOGS.length) return;
      const {cls,t} = LOGS[logIdx++];
      const s = document.createElement('span');
      s.className = `ht-log-line ht-log-${cls}`; s.textContent = t;
      logRef.current.appendChild(s);
      logRef.current.scrollTop = logRef.current.scrollHeight;
    };
    const timers = LOGS.map((_,i) => setTimeout(addLog, 1400 + i * 1900));
    const draw = ts => {
      if (!t0) t0 = ts;
      const el = (ts - t0) / 1000;
      ctx.clearRect(0,0,W,H); ctx.fillStyle='#020808'; ctx.fillRect(0,0,W,H);
      if (el < 0.5) {
        // blank
      } else if (el < 4.2) {
        ctx.font='7.5px monospace'; ctx.textAlign='center';
        const n = Math.min(Math.floor((el-0.5)/0.9)+1, BOOT.length);
        BOOT.slice(0,n).forEach((line,i) => {
          ctx.fillStyle = i<n-1 ? 'rgba(2,185,128,0.3)' : 'rgba(2,185,128,0.85)';
          ctx.fillText(line, cx, cy - 16 + i*14);
        });
        if (Math.floor(el*2)%2===0) {
          ctx.fillStyle='rgba(2,185,128,0.85)';
          ctx.fillText('_', cx + ctx.measureText(BOOT[n-1]).width*0.5 + 4, cy-16+(n-1)*14);
        }
        if (el > 2.5) {
          const prog = Math.min((el-2.5)/1.7, 1);
          angle += 0.005;
          const ne = Math.floor(prog * EDGES.length);
          const sc = 24 + prog * 26;
          const vp = V0.map(v => proj(rotX(rotY(v,angle),0.28), sc));
          ctx.strokeStyle='rgba(2,185,128,0.38)'; ctx.lineWidth=0.8;
          for (let i=0;i<ne;i++) { const [a,b]=EDGES[i]; ctx.beginPath(); ctx.moveTo(vp[a].x,vp[a].y); ctx.lineTo(vp[b].x,vp[b].y); ctx.stroke(); }
          ctx.fillStyle='rgba(2,185,128,0.75)';
          for (let i=0;i<Math.floor(prog*8);i++) { ctx.beginPath(); ctx.arc(vp[i].x,vp[i].y,1.3,0,Math.PI*2); ctx.fill(); }
        }
      } else {
        angle += 0.007;
        if (ts - pulseTs > 2000 + Math.random()*1400) { pulseIdx = Math.floor(Math.random()*EDGES.length); pulseTs = ts; }
        const vp = V0.map(v => proj(rotX(rotY(v,angle),0.28), 50));
        EDGES.forEach(([a,b],i) => {
          const pulse = i===pulseIdx;
          ctx.strokeStyle = pulse ? '#02B980' : 'rgba(2,185,128,0.52)';
          ctx.lineWidth = pulse ? 1.5 : 0.9;
          ctx.shadowColor = pulse ? '#02B980' : 'transparent';
          ctx.shadowBlur  = pulse ? 5 : 0;
          ctx.beginPath(); ctx.moveTo(vp[a].x,vp[a].y); ctx.lineTo(vp[b].x,vp[b].y); ctx.stroke();
          ctx.shadowBlur = 0;
        });
        ctx.fillStyle='rgba(2,185,128,0.9)';
        vp.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,1.7,0,Math.PI*2); ctx.fill(); });
        ctx.font='6.5px monospace'; ctx.textAlign='right'; ctx.fillStyle='rgba(2,185,128,0.22)';
        ctx.fillText('OEE · LIVE', W-5, H-4); ctx.textAlign='left';
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  }, []);

  return (
    <div className="hero-terminal-col">
      <div className="hero-terminal-outer">
        <div className="hero-terminal-body" ref={bodyRef}>
          <div className="ht-face">
            <div className="ht-bezel">
              <div className="ht-topbar">
                <span>HEIHU MES v4.2</span>
                <span style={{color:'rgba(2,185,128,0.2)'}}>·</span>
                <span className="ht-online">● ONLINE</span>
              </div>
              <canvas ref={canvasRef} className="ht-canvas" />
              <div ref={logRef} className="ht-log" />
            </div>
            <span className="ht-power-led" />
          </div>
          <div className="ht-right" />
          <div className="ht-bottom" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════ Hero ═══════════════════════════════
function Hero({ onPrimary, onSecondary }) {
  const titleRef = useR(null);
  const canvasRef = useR(null);

  useE(() => {
    const title = titleRef.current;
    if (!title) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-title-canvas";
    title.appendChild(canvas);
    canvasRef.current = canvas;

    const rect = title.getBoundingClientRect();
    const lineEls = Array.from(title.querySelectorAll(".line"));
    const lineRects = lineEls.map(l => {
      const lr = l.getBoundingClientRect();
      return { top: lr.top - rect.top, height: lr.height };
    });

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    ctx.fillStyle = "#09090B";
    ctx.fillRect(0, 0, W, H);

    const LINE_DUR = 480, LINE_GAP = 90;
    const TOTAL = lineRects.length * (LINE_DUR + LINE_GAP);
    const particles = [];
    let startTime = null, raf;

    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, W, H);

      lineRects.forEach((lr, li) => {
        const lineStart = li * (LINE_DUR + LINE_GAP);
        const lElapsed = Math.max(0, elapsed - lineStart);
        const p = Math.min(lElapsed / LINE_DUR, 1);
        if (p <= 0) return;

        const cutX = p * W;
        const { top, height: lh } = lr;

        ctx.clearRect(0, top, cutX, lh);

        if (p < 1) {
          ctx.fillStyle = "#09090B";
          ctx.fillRect(cutX, top, W - cutX, lh);

          const tg = ctx.createLinearGradient(Math.max(0, cutX - 100), 0, cutX, 0);
          tg.addColorStop(0, "rgba(2,185,128,0)");
          tg.addColorStop(1, "rgba(2,185,128,0.18)");
          ctx.fillStyle = tg;
          ctx.fillRect(Math.max(0, cutX - 100), top, Math.min(100, cutX), lh);

          const hg = ctx.createLinearGradient(0, top, 0, top + lh);
          hg.addColorStop(0,   "rgba(200,255,230,0.7)");
          hg.addColorStop(0.35,"rgba(2,185,128,1)");
          hg.addColorStop(0.65,"rgba(2,185,128,1)");
          hg.addColorStop(1,   "rgba(200,255,230,0.5)");
          ctx.fillStyle = hg;
          ctx.fillRect(cutX - 2, top, 4, lh);

          ctx.fillStyle = "rgba(2,185,128,0.35)";
          ctx.fillRect(cutX - 7, top, 5, lh);
          ctx.fillStyle = "rgba(2,185,128,0.12)";
          ctx.fillRect(cutX - 16, top, 9, lh);

          if (Math.random() < 0.55) {
            particles.push({
              x: cutX, y: top + Math.random() * lh,
              vx: Math.random() * 3.5 + 0.5, vy: (Math.random() - 0.5) * 3,
              life: 0.85 + Math.random() * 0.3, r: Math.random() * 1.4 + 0.4,
            });
          }
        }
      });

      for (let i = particles.length - 1; i >= 0; i--) {
        const sp = particles[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.07; sp.life -= 0.045;
        if (sp.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(2,185,128,${Math.min(sp.life, 0.9).toFixed(2)})`;
        ctx.fill();
      }

      if (elapsed < TOTAL + 600 || particles.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
        title.classList.add("scan-done");
        canvas.style.transition = "opacity .5s";
        canvas.style.opacity = "0";
        setTimeout(() => canvas.remove(), 600);
      }
    };

    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, 250);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (canvas.parentNode) canvas.remove();
    };
  }, []);

  // ── Hero title wave effect: gaussian hill follows mouse X ──
  useE(() => {
    const title = titleRef.current;
    if (!title) return;

    let cxCache = null;
    let mouseX = -9999;
    let raf2 = null;

    const AMPLITUDE = 26;
    const SIGMA     = 190;
    const WAVE_K    = 0.018;

    const getSpans = () => Array.from(title.querySelectorAll('.hero-char'));

    const cacheX = () => {
      const rect = title.getBoundingClientRect();
      cxCache = getSpans().map(s => {
        const r = s.getBoundingClientRect();
        return r.left + r.width * 0.5 - rect.left;
      });
    };

    let dispY = [], velY = [];
    const initTimer = setTimeout(() => {
      cacheX();
      const n = getSpans().length;
      dispY = new Array(n).fill(0);
      velY  = new Array(n).fill(0);
    }, 350);

    const animate = () => {
      const spans = getSpans();
      if (!cxCache || spans.length !== dispY.length) { raf2 = requestAnimationFrame(animate); return; }

      let anyActive = false;
      spans.forEach((span, i) => {
        const dx = cxCache[i] - mouseX;
        const target = mouseX > -9000
          ? -AMPLITUDE * Math.exp(-(dx * dx) / (2 * SIGMA * SIGMA)) * Math.cos(dx * WAVE_K)
          : 0;

        velY[i] = velY[i] * 0.80 + (target - dispY[i]) * 0.14;
        dispY[i] += velY[i];

        if (Math.abs(dispY[i]) > 0.08 || Math.abs(velY[i]) > 0.02) {
          anyActive = true;
          span.style.transform = `translateY(${dispY[i].toFixed(1)}px)`;
        } else {
          dispY[i] = 0; velY[i] = 0;
          span.style.transform = '';
        }
      });

      if (anyActive || mouseX > -9000) raf2 = requestAnimationFrame(animate);
      else raf2 = null;
    };

    const onMove = e => {
      const r = title.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      if (!raf2) raf2 = requestAnimationFrame(animate);
    };
    const onLeave = () => { mouseX = -9999; };
    const onResize = () => setTimeout(cacheX, 80);

    title.addEventListener('mousemove', onMove);
    title.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(raf2);
      title.removeEventListener('mousemove', onMove);
      title.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="hero noise" id="top">
      <div className="glow-top" />

      <div className="wrap hero-wrap-grid">
        <div>
          <div className="hero-kicker reveal">
            <span className="pulse" />
            <span>AI for Industry · 2026</span>
            <span style={{ color: "var(--fg-muted)" }}>—</span>
            <span>Blacklake · Careers</span>
          </div>

          <h1 className="h-hero hero-title" ref={titleRef}>
            <span className="line"><span>{'The ultimate meaning'.split('').map((c,i)=><span key={i} className="hero-char">{c===' '?'\u00A0':c}</span>)}</span></span>
            <span className="line"><span>{'of code is to change'.split('').map((c,i)=><span key={i} className="hero-char">{c===' '?'\u00A0':c}</span>)}</span></span>
            <span className="line"><span>{'the '.split('').map((c,i)=><span key={i} className="hero-char">{c===' '?'\u00A0':c}</span>)}<em>{'real world'.split('').map((c,i)=><span key={i} className="hero-char">{c===' '?'\u00A0':c}</span>)}</em>{'.' .split('').map((c,i)=><span key={i} className="hero-char">{c}</span>)}</span></span>
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
            <OdometerStat value="40,000" suffix="+" label="Factories Served" duration={1800} delay={0} />
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
        <HeroTerminal />
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
            </div>
          </aside>

          <div>
            <p className="lead drop">
              We started with a smartphone and a piece of cloud code, doing something quite "dumb" — walking into workshops, eating and living alongside workers, running every scheduling algorithm on actual production lines. It's not that factories didn't want data — it's that data had never been collected before. Blacklake uses a SaaS model to drastically reduce deployment time and cost, holding <b style={{ color: "var(--fg)" }}>52.7% market share</b> as China's #1 SaaS MES, serving <b style={{ color: "var(--fg)" }}>40,000+ factories</b>.
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

// ─── BigMark scroll-reveal ───────────────────────────────────────────────────
function BigMarkReveal() {
  const ref = useR(null);
  const [prog, setProg] = useS(0);
  useE(() => {
    const update = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      setProg(Math.max(0, Math.min(1, p)));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  const lit = (n, total) => prog >= n / total;
  return (
    <div ref={ref} className="bigmark">
      <span style={{ display: 'block' }}>
        <span className={`bm-word bm-outline${lit(1,6)?' bm-lit':''}`}>Every</span>
        {' '}<span className={`bm-word${lit(2,6)?' bm-lit':''}`}>line of </span>
        <span className={`bm-word bm-em${lit(2,6)?' bm-lit':''}`}>code</span>
      </span>
      <span style={{ display: 'block', marginTop: 8 }}>
        <span className={`bm-word${lit(3,6)?' bm-lit':''}`}>hits a </span>
        <span className={`bm-word bm-em${lit(4,6)?' bm-lit':''}`}>real</span>
      </span>
      <span style={{ display: 'block', marginTop: 8 }}>
        <span className={`bm-word${lit(5,6)?' bm-lit':''}`}>factory floor.</span>
      </span>
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

        <div style={{ marginTop: 80 }}>
          <BigMarkReveal />
        </div>
      </div>
    </section>
  );
}

// ─── JobSparkline ─────────────────────────────────────────────────────────────
function JobSparkline({ job }) {
  const rand = _seededRand(_jobHash(job.id));
  const pts = Array.from({ length: 8 }, rand);
  const SW = 56, SH = 22;
  const step = SW / (pts.length - 1);
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(SH - v * SH * 0.75 - 2).toFixed(1)}`).join(" ");
  return (
    <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} className="job-sparkline">
      <path d={d} fill="none" stroke="var(--green)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

// ═══════════════════════════════ Jobs ═══════════════════════════════
function JobRow({ j, idx, onOpen }) {
  const ref = useR(null);

  useE(() => {
    const el = ref.current;
    if (!el) return;
    let rafId;
    const onMove = (e) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width - 0.5);
        const my = ((e.clientY - r.top) / r.height - 0.5);
        el.style.setProperty('--mx', mx.toFixed(3));
        el.style.setProperty('--my', my.toFixed(3));
        el.style.transform = `perspective(1000px) rotateY(${(mx * 6).toFixed(2)}deg) rotateX(${(-my * 3.5).toFixed(2)}deg) translateZ(8px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(rafId);
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
      el.style.transform = '';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const urgency = 55 + (_jobHash(j.id) % 40);
  const days = 1 + (_jobHash(j.id + 't') % 12);
  const tsLabel = days < 7 ? `${days}d ago` : `${Math.ceil(days / 7)}w ago`;

  return (
    <div ref={ref} className="job" onClick={() => onOpen(j)}>
      <div className="job-status">
        <span className="job-pulse-wrap">
          <span className="job-pulse-ring" />
          <span className="job-pulse-dot" />
        </span>
        <span className="job-num">{String(idx + 1).padStart(2, '00')}</span>
      </div>
      <div>
        <div className="job-title">{j.title}</div>
        <div className="job-level">{j.level} · {j.type}</div>
      </div>
      <div className="job-urgency-col">
        <div className="job-team">{j.team}</div>
        <div className="job-urgency-bar">
          <div className="job-urgency-fill" style={{ width: `${urgency}%`, boxShadow: urgency >= 80 ? '0 0 8px var(--green-glow)' : 'none' }} />
        </div>
        <div className="job-urgency-label">{urgency >= 80 ? 'Urgent' : 'Hiring'}</div>
      </div>
      <div className="job-loc-col">
        <div className="job-loc"><span className="loc-dot" />{j.loc}</div>
        <div className="job-ts">{tsLabel}</div>
      </div>
      <div className="job-arrow"><Arrow /></div>
    </div>
  );
}

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
            <JobRow key={j.id} j={j} idx={i} onOpen={onOpen} />
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
const STORY_COLORS_EN = {
  'Commercial':      '#F1783C',
  'Marketing':       '#3794E9',
  'Sales':           '#EE5B54',
  'AI Manufacturing':'#02B980',
  'AI':              '#00B9BE',
  'Overseas':        '#D4A857',
};

const STORY_HL_EN = [
  ["I can't find a reason to leave"],
  ["genuinely eccentric"],
  ["soaked through, still out there hustling"],
  ["gave up my Shanghai apartment", "packing with workers"],
  ["forming a second round of learning"],
  ["she's gained weight"],
];

function buildQuoteSpans(text, hls) {
  const n = text.length;
  const inHL = new Array(n).fill(-1);
  (hls || []).forEach((phrase, pi) => {
    const idx = text.indexOf(phrase);
    if (idx !== -1) for (let k = idx; k < idx + phrase.length; k++) inHL[k] = pi;
  });

  const result = [];
  let ci = 0;
  let i = 0;
  while (i < n) {
    if (inHL[i] !== -1) {
      const hlId = inHL[i];
      let j = i;
      while (j < n && inHL[j] === hlId) j++;
      const hlDelay = (ci * 28 + 420) + 'ms';
      result.push(
        <span key={`hl-${i}`} className="hl-phrase" style={{ '--hl-delay': hlDelay }}>
          {text.slice(i, j).split('').map((c, k) => (
            <span key={k} className="story-quote-char" style={{ animationDelay: `${(ci + k) * 28}ms` }}>{c}</span>
          ))}
        </span>
      );
      ci += j - i; i = j;
    } else {
      result.push(
        <span key={`c-${i}`} className="story-quote-char" style={{ animationDelay: `${ci * 28}ms` }}>{text[i]}</span>
      );
      ci++; i++;
    }
  }
  return result;
}

function StoryCard({ s, storyIdx, color }) {
  const cardRef = useR(null);
  const [revealed, setRevealed] = useS(false);

  useE(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRevealed(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const spans = buildQuoteSpans(s.quote, STORY_HL_EN[storyIdx]);

  return (
    <article ref={cardRef} className={`story${revealed ? ' revealed' : ''}`}>
      <span className="story-tag" style={{ color, borderColor: color + '55', background: color + '18' }}>{s.team}</span>
      <blockquote className="story-quote">"{spans}"</blockquote>
      <div className="story-foot">
        <div className="story-avatar"><AvatarSVG seed={storyIdx + 1} /></div>
        <div>
          <div className="story-name">{s.fullName || s.name}</div>
          <div className="story-role">{s.role}</div>
        </div>
      </div>
    </article>
  );
}

function Stories() {
  return (
    <section className="stories-section section" id="stories">
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
        <div className="stories">
          {STORIES.map((s, i) => (
            <StoryCard key={i} s={s} storyIdx={i} color={STORY_COLORS_EN[s.team] || 'var(--green)'} />
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

// ═══════════════════════════════ OEE Mini-game (Easter Egg) ═══════════════════════════════
const OEE_CAT_EN = {
  assembly: { label: 'Assembly',  color: '#02B980' },
  ai:       { label: 'AI · Data', color: '#40D898' },
  quality:  { label: 'Quality',   color: '#028A5A' },
};
const OEE_MACH_DEF_EN = [
  { name: 'Line A',     pref: 'assembly', ok: 'ai',       bad: 'quality' },
  { name: 'Line B',     pref: 'ai',       ok: 'assembly', bad: 'quality' },
  { name: 'QC Station', pref: 'quality',  ok: 'ai',       bad: 'assembly' },
];
const OEE_JOBS_DEF_EN = [
  { name: 'Changeover Optimization',   dur: 8,  u: 1, cat: 'assembly' },
  { name: 'Gantt Schedule Refresh',    dur: 5,  u: 0, cat: 'assembly' },
  { name: 'Work Order Board Update',   dur: 7,  u: 1, cat: 'assembly' },
  { name: 'MES Schedule Push',         dur: 10, u: 0, cat: 'assembly' },
  { name: 'Shift Report Summary',      dur: 6,  u: 1, cat: 'assembly' },
  { name: 'Equipment Param Sync',      dur: 9,  u: 0, cat: 'assembly' },
  { name: 'AI Vision Calibration',     dur: 9,  u: 1, cat: 'ai'       },
  { name: 'Capacity Forecast Model',   dur: 12, u: 0, cat: 'ai'       },
  { name: 'Inventory Alert Analysis',  dur: 10, u: 1, cat: 'ai'       },
  { name: 'Scheduling Algorithm Train',dur: 13, u: 0, cat: 'ai'       },
  { name: 'Anomaly Detection Model',   dur: 8,  u: 1, cat: 'ai'       },
  { name: 'Data Sync Push',            dur: 6,  u: 0, cat: 'ai'       },
  { name: 'Quality Report Generate',   dur: 8,  u: 0, cat: 'quality'  },
  { name: 'SPC Control Chart Update',  dur: 7,  u: 1, cat: 'quality'  },
  { name: 'Equipment OEE Calc',        dur: 9,  u: 0, cat: 'quality'  },
  { name: 'Defect Traceability',       dur: 11, u: 1, cat: 'quality'  },
  { name: 'Supplier QC Audit',         dur: 12, u: 0, cat: 'quality'  },
  { name: 'First-Pass Yield Stats',    dur: 6,  u: 1, cat: 'quality'  },
];
const OEE_MATCH_EN = {
  perfect: { mul: 1.0, pts: 3, label: 'Perfect',  color: '#02B980' },
  ok:      { mul: 1.6, pts: 2, label: 'Workable', color: '#028A5A' },
  bad:     { mul: 2.5, pts: 1, label: 'Poor Fit', color: '#7A2808' },
};
const OEE_EXPIRE_MS_EN = 18000, OEE_SPAWN_MS_EN = 3500, OEE_MAX_Q_EN = 8;
let _oeeJobIdEN = 0;
function _oeeMatchEN(mIdx, cat) {
  const m = OEE_MACH_DEF_EN[mIdx];
  if (m.pref === cat) return 'perfect';
  if (m.ok   === cat) return 'ok';
  return 'bad';
}

function OEEGame() {
  const [active, setActive] = useS(false);
  const [timeLeft, setTimeLeft] = useS(60);
  const [queue, setQueue] = useS([]);
  const [machines, setMachines] = useS(OEE_MACH_DEF_EN.map((d, i) => ({ ...d, i, job: null, progress: 0 })));
  const [selected, setSelected] = useS(null);
  const [hovered, setHovered] = useS(null);
  const [now, setNow] = useS(Date.now);
  const [stats, setStats] = useS({ done: 0, missed: 0, total: 0, pts: 0, maxPts: 0 });
  const [ended, setEnded] = useS(false);

  useE(() => {
    const show = () => { resetGame(); setActive(true); };
    window.addEventListener('oee-game', show);
    return () => window.removeEventListener('oee-game', show);
  }, []);

  function resetGame() {
    _oeeJobIdEN = 0;
    setTimeLeft(60); setQueue([]); setSelected(null); setHovered(null); setEnded(false);
    setStats({ done: 0, missed: 0, total: 0, pts: 0, maxPts: 0 });
    setMachines(OEE_MACH_DEF_EN.map((d, i) => ({ ...d, i, job: null, progress: 0 })));
  }

  useE(() => {
    if (!active || ended) return;
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setEnded(true); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [active, ended]);

  useE(() => {
    if (!active || ended) return;
    const spawn = () => {
      const tpl = OEE_JOBS_DEF_EN[Math.floor(Math.random() * OEE_JOBS_DEF_EN.length)];
      const job = { id: ++_oeeJobIdEN, name: tpl.name, dur: tpl.dur, u: tpl.u, cat: tpl.cat, born: Date.now(), expireAt: Date.now() + OEE_EXPIRE_MS_EN };
      setStats(s => ({ ...s, total: s.total + 1, maxPts: s.maxPts + 3 }));
      setQueue(q => q.length >= OEE_MAX_Q_EN ? q : [...q, job]);
    };
    spawn();
    const t = setInterval(spawn, OEE_SPAWN_MS_EN);
    return () => clearInterval(t);
  }, [active, ended]);

  useE(() => {
    if (!active || ended) return;
    const t = setInterval(() => {
      const n = Date.now(); setNow(n);
      setQueue(q => { const gone = q.filter(j => n > j.expireAt); if (gone.length) setStats(s => ({ ...s, missed: s.missed + gone.length })); return q.filter(j => n <= j.expireAt); });
      setMachines(ms => ms.map(m => {
        if (!m.job) return m;
        const p = Math.min((n - m.job.startedAt) / 1000 / m.job.effDur, 1);
        if (p >= 1) { setStats(s => ({ ...s, done: s.done + 1, pts: s.pts + m.job.pts })); return { ...m, job: null, progress: 0 }; }
        return { ...m, progress: p };
      }));
    }, 200);
    return () => clearInterval(t);
  }, [active, ended]);

  const assign = (mIdx) => {
    if (!selected || machines[mIdx].job) return;
    const match = _oeeMatchEN(mIdx, selected.cat);
    const cfg = OEE_MATCH_EN[match];
    const job = { ...selected, startedAt: Date.now(), effDur: selected.dur * cfg.mul, match, pts: cfg.pts };
    setMachines(ms => ms.map((m, i) => i === mIdx ? { ...m, job, progress: 0 } : m));
    setQueue(q => q.filter(j => j.id !== selected.id));
    setSelected(null); setHovered(null);
  };

  const oee = stats.maxPts > 0 ? Math.round(stats.pts / stats.maxPts * 1000) / 10 : 0;
  const timerPct = timeLeft / 60 * 100;
  if (!active) return null;

  return (
    <div className="oee-overlay" onClick={e => e.target === e.currentTarget && setActive(false)}>
      <div className="oee-modal">

        {/* Header */}
        <div className="oee-head">
          <div className="oee-title"><span className="oee-logo-dot" /><span>DISPATCH · SYS</span><span className="oee-badge">● ONLINE</span></div>
          <div className="oee-legend">
            {Object.entries(OEE_CAT_EN).map(([k, v]) => (
              <span key={k} className="oee-legend-item">
                <span className="oee-legend-dot" style={{ background: v.color }} />{v.label}
              </span>
            ))}
          </div>
          <div className="oee-timer-wrap">
            <div className="oee-timer-bar"><div className="oee-timer-fill" style={{ width: `${timerPct}%`, background: timeLeft < 15 ? '#C03010' : '#02B980' }} /></div>
            <span className="oee-timer-num" style={{ color: timeLeft < 15 ? '#C03010' : '#02B980' }}>{timeLeft}s</span>
          </div>
          <button className="oee-close" onClick={() => setActive(false)}>×</button>
        </div>

        {ended ? (
          <div className="oee-end">
            <div className="oee-end-label">MISSION COMPLETE · OEE RATING</div>
            <div className="oee-end-score" style={{ color: oee >= 80 ? '#02B980' : oee >= 50 ? '#028A5A' : '#7A2808' }}>{oee}<span>%</span></div>
            <div className="oee-end-sub">Score {stats.pts}/{stats.maxPts} · Done {stats.done} · Missed {stats.missed}</div>
            <div className="oee-end-tip">{oee >= 85 ? 'Perfect scheduling! Factory at full capacity.' : oee >= 60 ? 'Good — match jobs to their preferred machines.' : 'Tip: matching job colors to machines gives 3× points.'}</div>
            <button className="btn" onClick={resetGame}>[ RESTART ]</button>
          </div>
        ) : (
          <div className="oee-body">

            {/* Job queue */}
            <div className="oee-queue">
              <div className="oee-col-label">INCOMING <span style={{ color: '#3A1A06' }}>{queue.length}/{OEE_MAX_Q_EN}</span></div>
              {queue.length === 0 && <div className="oee-empty">AWAITING INPUT...</div>}
              {queue.map(j => {
                const cc = OEE_CAT_EN[j.cat];
                const expPct = Math.max(0, (j.expireAt - now) / OEE_EXPIRE_MS_EN * 100);
                const isSel = selected?.id === j.id;
                return (
                  <div key={j.id} className={`oee-job${isSel ? ' selected' : ''}`}
                    style={isSel ? { borderColor: cc.color, background: cc.color + '14' } : {}}
                    onClick={() => setSelected(isSel ? null : j)}>
                    <div className="oee-job-top">
                      <span className="oee-cat-pill" style={{ color: cc.color, borderColor: cc.color + '55', background: cc.color + '18' }}>{cc.label}</span>
                      {j.u ? <span className="oee-urgent-dot" /> : null}
                    </div>
                    <div className="oee-job-name">{j.name}</div>
                    <div className="oee-job-foot">
                      <span className="oee-job-dur">{j.dur}s</span>
                      <div className="oee-expire-bar"><div className="oee-expire-fill" style={{ width: `${expPct}%`, background: expPct < 25 ? '#C03010' : 'rgba(2,185,128,0.4)' }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Machines */}
            <div className="oee-machines">
              <div className="oee-col-label">WORK CELLS</div>
              <div className="oee-machine-grid">
                {machines.map((m, i) => {
                  const def = OEE_MACH_DEF_EN[i];
                  const specCfg = OEE_CAT_EN[def.pref];
                  const match = selected ? _oeeMatchEN(i, selected.cat) : null;
                  const matchCfg = match ? OEE_MATCH_EN[match] : null;
                  const droppable = selected && !m.job;
                  const isHov = hovered === i;
                  return (
                    <div key={m.name}
                      className={`oee-machine${m.job ? ' busy' : ' idle'}${droppable ? ' droppable' : ''}`}
                      style={droppable ? { borderColor: matchCfg.color + (isHov ? 'ff' : '88'), background: matchCfg.color + '0f' } : {}}
                      onClick={() => assign(i)}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}>
                      <div className="oee-mach-head">
                        <span className="oee-mach-name">{m.name}</span>
                        <span className="oee-mach-spec" style={{ color: specCfg.color, borderColor: specCfg.color + '44', background: specCfg.color + '18' }}>{specCfg.label}</span>
                      </div>
                      {m.job ? (
                        <>
                          <div className="oee-mach-job">
                            <span className="oee-cat-dot" style={{ background: OEE_CAT_EN[m.job.cat]?.color }} />{m.job.name}
                          </div>
                          <div className="oee-mach-match" style={{ color: OEE_MATCH_EN[m.job.match].color }}>{OEE_MATCH_EN[m.job.match].label} +{m.job.pts}pt</div>
                          <div className="oee-progress-bar"><div className="oee-progress-fill" style={{ width: `${m.progress * 100}%`, background: OEE_MATCH_EN[m.job.match].color }} /></div>
                        </>
                      ) : droppable ? (
                        <div className="oee-mach-idle" style={{ color: matchCfg.color }}>{matchCfg.label} — ASSIGN</div>
                      ) : (
                        <div className="oee-mach-idle">[ STANDBY ]</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selected && (
                <div className="oee-hint">
                  <span className="oee-cat-dot" style={{ background: OEE_CAT_EN[selected.cat]?.color }} />
                  Selected: <b>{selected.name}</b>
                  <span style={{ color: '#021A0C', marginLeft: 8 }}>Perfect +3pt · Workable +2pt · Poor fit +1pt</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="oee-foot">
          <span>Done <b style={{ color: '#02B980', textShadow: '0 0 8px rgba(2,185,128,0.55)' }}>{stats.done}</b></span>
          <span>Missed <b style={{ color: '#7A2808' }}>{stats.missed}</b></span>
          <span>Score <b style={{ color: '#028A5A' }}>{stats.pts}</b><span style={{ color: '#021A0C' }}>/{stats.maxPts}</span></span>
          <span className="oee-oee">OEE <b style={{ color: oee >= 70 ? '#02B980' : oee >= 40 ? '#028A5A' : '#7A2808', textShadow: oee >= 70 ? '0 0 8px rgba(2,185,128,0.5)' : 'none' }}>{oee}%</b></span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Hero, About, ClientsStrip, WhyJoin, Jobs, Stories, PlacesSection, PerksSection, Process, CTA, Footer, OEEGame });
