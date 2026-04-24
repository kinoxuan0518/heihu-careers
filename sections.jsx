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

    // Initial full mask
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

        // Revealed region
        ctx.clearRect(0, top, cutX, lh);

        // Remaining mask
        if (p < 1) {
          ctx.fillStyle = "#09090B";
          ctx.fillRect(cutX, top, W - cutX, lh);

          // Trailing glow
          const tg = ctx.createLinearGradient(Math.max(0, cutX - 100), 0, cutX, 0);
          tg.addColorStop(0, "rgba(2,185,128,0)");
          tg.addColorStop(1, "rgba(2,185,128,0.18)");
          ctx.fillStyle = tg;
          ctx.fillRect(Math.max(0, cutX - 100), top, Math.min(100, cutX), lh);

          // Cutting head — bright vertical bar
          const hg = ctx.createLinearGradient(0, top, 0, top + lh);
          hg.addColorStop(0,   "rgba(200,255,230,0.7)");
          hg.addColorStop(0.35,"rgba(2,185,128,1)");
          hg.addColorStop(0.65,"rgba(2,185,128,1)");
          hg.addColorStop(1,   "rgba(200,255,230,0.5)");
          ctx.fillStyle = hg;
          ctx.fillRect(cutX - 2, top, 4, lh);

          // Outer glow bars
          ctx.fillStyle = "rgba(2,185,128,0.35)";
          ctx.fillRect(cutX - 7, top, 5, lh);
          ctx.fillStyle = "rgba(2,185,128,0.12)";
          ctx.fillRect(cutX - 16, top, 9, lh);

          // Sparks
          if (Math.random() < 0.55) {
            particles.push({
              x: cutX, y: top + Math.random() * lh,
              vx: Math.random() * 3.5 + 0.5, vy: (Math.random() - 0.5) * 3,
              life: 0.85 + Math.random() * 0.3, r: Math.random() * 1.4 + 0.4,
            });
          }
        }
      });

      // Update & draw sparks
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

    // cx per character (relative to title left edge)
    let cxCache = null;
    let mouseX = -9999;
    let raf2 = null;

    const AMPLITUDE = 26;  // px upward at peak
    const SIGMA     = 190; // gaussian width (px)
    const WAVE_K    = 0.018; // cosine ripple freq → wave shape, not just a bump

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
        // Wave shape: gaussian envelope × cosine → peak at mouse, oscillating tails
        const target = mouseX > -9000
          ? -AMPLITUDE * Math.exp(-(dx * dx) / (2 * SIGMA * SIGMA)) * Math.cos(dx * WAVE_K)
          : 0;

        // Spring-damper toward target
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


      <div className="wrap">
        <div className="hero-kicker reveal">
          <span className="pulse" />
          <span>AI for Industry · 2026</span>
          <span style={{ color: "var(--fg-muted)" }}>—</span>
          <span>黑湖科技 · Careers</span>
        </div>

        <h1 className="h-hero hero-title" ref={titleRef}>
          <span className="line"><span>{'代码的终极意义'.split('').map((c,i)=><span key={i} className="hero-char">{c}</span>)}</span></span>
          <span className="line"><span>{'是改变'.split('').map((c,i)=><span key={i} className="hero-char">{c}</span>)}<em>{'真实'.split('').map((c,i)=><span key={i} className="hero-char">{c}</span>)}</em></span></span>
          <span className="line"><span><em>{'世界'.split('').map((c,i)=><span key={i} className="hero-char">{c}</span>)}</em>{'。'.split('').map((c,i)=><span key={i} className="hero-char">{c}</span>)}</span></span>
        </h1>

        <p className="hero-sub reveal">
          今天，黑湖的软件已经进入数万家中国工厂。在那里，每一行代码都会影响真实的生产系统。
          我们拥有 AI 在制造业落地最稀缺的东西——真实世界的工业场景与数据。如果这让你有一点兴奋，往下看。
        </p>

        <div className="hero-actions reveal d-1">
          <button className="btn" onClick={onPrimary}>
            查看 {JOBS.length} 个在招职位 <Arrow />
          </button>
          <button className="btn btn-ghost" onClick={onSecondary}>
            了解我们是谁
          </button>
        </div>


        <div className="hero-meta">
          <OdometerStat value="40,000" suffix="+" label="服务工厂" duration={1800} delay={0} />
          <OdometerStat value="52.7" suffix="%" label="SaaS MES 市占率" duration={1600} delay={120} />
          <div className="cell reveal d-3">
            <div className="k">成立于</div>
            <div className="v">2016</div>
          </div>
          <div className="cell reveal d-4">
            <div className="k">市场排名</div>
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
            <div className="eyebrow"><span className="dot" /><span className="num">01</span><span>我们是谁</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">数据不会自己说话，<em className="green italic">但它会让沉默的工厂开口</em></LiquidHeading>
          </div>
        </div>

        <div className="article reveal d-1">
          <aside className="side">
            <div className="corner">
              <div className="eyebrow" style={{ marginBottom: 12 }}>一段背景</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.55, letterSpacing: "-0.01em", color: "var(--fg-2)" }}>
                中国有数百万中小工厂。它们是制造业的毛细血管，承载着无数就业和产业链的末端环节——但它们几乎是沉默的。
              </div>
            </div>
          </aside>

          <div>
            <p className="lead drop">
              我们从一部手机和一段云端代码开始，做了一件很"笨"的事——走进车间、跟工人同吃同住、把每一个排产算法跑到产线上。不是工厂不想要数据，是数据从来没有被采集过。黑湖用 SaaS 模式大幅降低了部署时间和成本，以 <b style={{ color: "var(--fg)" }}>52.7% 的市占率</b>位居中国 SaaS MES 市场第一，服务了 <b style={{ color: "var(--fg)" }}>40,000+ 家工厂</b>。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ Clients Strip ═══════════════════════════════
function ClientsStrip() {
  const items = CLIENTS.concat(CLIENTS); // 双倍用于无缝循环
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
            <div className="eyebrow"><span className="dot" /><span className="num">02</span><span>为什么加入黑湖</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">期待，<em className="green italic">和这样的你同行</em></LiquidHeading>
            <p className="sub">不是贴在墙上的标语，是我们招人时的筛子、做决定时的参考、跟客户解释"为什么这么做"的答案。</p>
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

// ─── Feature #3: MES Job Row helpers ─────────────────────────────────────────
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
        <div className="job-urgency-label">{urgency >= 80 ? '急需' : '招募中'}</div>
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
  const [cat, setCat] = useS("全部");
  const [loc, setLoc] = useS("全部城市");
  const filtered = useM(() => JOBS.filter(j =>
    (cat === "全部" || j.category === cat) &&
    (loc === "全部城市" || j.loc.includes(loc.split(" ")[0]))
  ), [cat, loc]);

  return (
    <section className="section" id="jobs">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow"><span className="dot" /><span className="num">03</span><span>在招职位</span></div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--fg-4)", textTransform: "uppercase" }}>
                {String(filtered.length).padStart(2, "0")} 个开放岗位
              </span>
            </div>
            <LiquidHeading className="h-1">找到下一个<em className="green italic">真正对的人</em></LiquidHeading>
          </div>
        </div>

        {/* 团队筛选 */}
        <div className="jobs-head reveal d-1">
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <span className="eyebrow" style={{ gap: 6 }}>团队</span>
            <div className="jobs-filters">
              {CATEGORIES.map(c => (
                <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        {/* 城市筛选 */}
        <div className="jobs-head reveal d-1" style={{ marginTop: -12 }}>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <span className="eyebrow" style={{ gap: 6 }}>城市</span>
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
              当前筛选下暂时没有空位——但我们一直欢迎主动投递。
            </div>
          )}
        </div>

        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }} className="reveal">
          <div style={{ fontSize: 14, color: "var(--fg-3)" }}>没有看到合适的岗位？欢迎把你感兴趣的方向告诉我们。</div>
          <a className="btn btn-ghost" href="mailto:careers@blacklake.cn?subject=主动投递">主动投递 <Arrow /></a>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════ Stories ═══════════════════════════════
const STORY_COLORS = {
  '商业化': '#F1783C', '市场': '#3794E9', '销售': '#EE5B54',
  'AI 造物': '#02B980', 'AI': '#00B9BE', '海外': '#D4A857',
};

// 每段引言的高光短语（绿线扫过）
const STORY_HL = [
  ["找不到离开的理由"],
  ["确实是奇葩"],
  ["浑身湿透仍坚持奔波"],
  ["退租上海房子", "和工人一起包装"],
  ["纠正的痕迹又被系统记录，形成第二次学习"],
  ["人胖了一圈"],
];

function buildQuoteSpans(text, hls) {
  const n = text.length;
  const inHL = new Array(n).fill(-1);
  (hls || []).forEach((phrase, pi) => {
    const idx = text.indexOf(phrase);
    if (idx !== -1) for (let k = idx; k < idx + phrase.length; k++) inHL[k] = pi;
  });

  const result = [];
  let ci = 0; // char index for stagger delay
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

  const spans = buildQuoteSpans(s.quote, STORY_HL[storyIdx]);

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
            <div className="eyebrow"><span className="dot" /><span className="num">04</span><span>来自团队</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">不是 slogan，<em className="green italic">是真的同事</em></LiquidHeading>
            <p className="sub">六段来自不同团队的自述。没有修辞，尽可能原样保留。</p>
          </div>
        </div>
        <div className="stories">
          {STORIES.map((s, i) => (
            <StoryCard key={i} s={s} storyIdx={i} color={STORY_COLORS[s.team] || 'var(--green)'} />
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
    { src: 'assets/office-1.jpg', cap: '武夷路 333 号' },
    { src: 'assets/office-2.jpg', cap: '园区中庭' },
    { src: 'assets/office-3.jpg', cap: '长廊与绿荫' },
    { src: 'assets/office-4.jpg', cap: '空中俯瞰' },
  ];

  const cities = [
    { name: '上海', badge: '总部', detail: "31°12'N · 121°28'E" },
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
            <div className="eyebrow"><span className="dot" /><span className="num">05</span><span>业务版图</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">从上海出发，<em className="green italic">扎根亚太</em></LiquidHeading>
            <p className="sub">总部上海，业务覆盖中国 30+ 省市；新加坡区域总部负责东南亚，已深入印度尼西亚与越南市场。</p>
          </div>
        </div>
      </div>

      {/* ── 全宽照片带 ── */}
      <div className="office-strip reveal d-1">
        {photos.map((p, i) => (
          <button key={i} className="office-frame" onClick={() => setPhotoFull(p.src)}>
            <img src={p.src} alt={p.cap} className="office-frame-img" loading="lazy" />
            <span className="office-frame-idx">0{i + 1}</span>
            <div className="office-frame-foot">
              <span className="office-frame-loc">上海 · 总部</span>
              <span className="office-frame-cap">{p.cap}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── 城市信息行 ── */}
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

      {/* ── 灯箱 ── */}
      {photoFull && (
        <div className="photo-lightbox" onClick={() => setPhotoFull(null)}>
          <img src={photoFull} alt="办公室" className="photo-lightbox-img" />
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
            <div className="eyebrow"><span className="dot" /><span className="num">06</span><span>福利 & 待遇</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">把基本的做<em className="green italic">扎实</em>，比花样重要</LiquidHeading>
            <p className="sub">没有按摩椅也没有免费啤酒塔。下面这些才是我们觉得真正有用的。</p>
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
            <div className="eyebrow"><span className="dot" /><span className="num">07</span><span>常见问题</span></div>
          </div>
          <div>
            <LiquidHeading className="h-1">你可能想<em className="green italic">先问我们</em>的</LiquidHeading>
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
              <span className="dot" /><span>下一步</span>
            </div>
            <h2>如果这些事让你<br />有一点兴奋——</h2>
            <p className="cta-sub">把你的简历、作品、想法砸过来。如果我们目前开放的岗位中没有合适的，你就自己创造一个。</p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-ghost" href="mailto:careers@blacklake.cn?subject=我想聊聊">先聊聊</a>
            <button className="btn" onClick={onApply}>查看职位 <Arrow /></button>
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
              黑湖科技，一家工业软件 + AI 公司。我们的目标很简单：让数据、AI 驱动制造。
            </p>
          </div>
          <div>
            <h4>招聘</h4>
            <ul>
              <li><a href="#jobs">在招职位</a></li>
              <li><a href="#process">加入流程</a></li>
              <li><a href="#perks">福利待遇</a></li>
              <li><a href="#">校园招聘</a></li>
            </ul>
          </div>
          <div>
            <h4>公司</h4>
            <ul>
              <li><a href="#about">关于我们</a></li>
              <li><a href="#stories">团队故事</a></li>
              <li><a href="#life">办公室</a></li>
              <li><a href="#">媒体报道</a></li>
            </ul>
          </div>
          <div>
            <h4>联系</h4>
            <ul>
              <li><a href="mailto:careers@blacklake.cn">careers@blacklake.cn</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">微信公众号</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <div>© 2026 Blacklake · 上海黑湖网络科技</div>
          <div>Made with care in Shanghai</div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════ OEE Mini-game (Easter Egg) ═══════════════════════════════
// Job categories + machine specializations
const OEE_CAT = {
  assembly: { label: '装配·排产', color: '#02B980' },
  ai:       { label: 'AI·数据',   color: '#40D898' },
  quality:  { label: '质量·报表', color: '#028A5A' },
};
const OEE_MACH_DEF = [
  { name: '装配线A', pref: 'assembly', ok: 'ai',      bad: 'quality' },
  { name: '装配线B', pref: 'ai',       ok: 'assembly', bad: 'quality' },
  { name: '质检台',  pref: 'quality',  ok: 'ai',       bad: 'assembly' },
];
const OEE_JOBS_DEF = [
  { name: '产线换型优化',   dur: 8,  u: 1, cat: 'assembly' },
  { name: '排产甘特刷新',   dur: 5,  u: 0, cat: 'assembly' },
  { name: '工单看板更新',   dur: 7,  u: 1, cat: 'assembly' },
  { name: 'MES排程推送',    dur: 10, u: 0, cat: 'assembly' },
  { name: '班次报工汇总',   dur: 6,  u: 1, cat: 'assembly' },
  { name: '设备参数同步',   dur: 9,  u: 0, cat: 'assembly' },
  { name: 'AI视觉标定',     dur: 9,  u: 1, cat: 'ai'       },
  { name: '产能预测模型',   dur: 12, u: 0, cat: 'ai'       },
  { name: '库存预警分析',   dur: 10, u: 1, cat: 'ai'       },
  { name: '排产算法训练',   dur: 13, u: 0, cat: 'ai'       },
  { name: '异常检测模型',   dur: 8,  u: 1, cat: 'ai'       },
  { name: '数据同步推送',   dur: 6,  u: 0, cat: 'ai'       },
  { name: '质量报表生成',   dur: 8,  u: 0, cat: 'quality'  },
  { name: 'SPC控制图更新',  dur: 7,  u: 1, cat: 'quality'  },
  { name: '设备OEE计算',    dur: 9,  u: 0, cat: 'quality'  },
  { name: '不良品追溯',     dur: 11, u: 1, cat: 'quality'  },
  { name: '供应商质检审核', dur: 12, u: 0, cat: 'quality'  },
  { name: '一次通过率统计', dur: 6,  u: 1, cat: 'quality'  },
];
// match → { dur multiplier, points, label, color }
const OEE_MATCH = {
  perfect: { mul: 1.0, pts: 3, label: '完美匹配', color: '#02B980' },
  ok:      { mul: 1.6, pts: 2, label: '勉强可做', color: '#028A5A' },
  bad:     { mul: 2.5, pts: 1, label: '不擅长！', color: '#7A2808' },
};
function _oeeMatch(mIdx, cat) {
  const m = OEE_MACH_DEF[mIdx];
  if (m.pref === cat) return 'perfect';
  if (m.ok   === cat) return 'ok';
  return 'bad';
}
const OEE_EXPIRE_MS = 18000;
const OEE_SPAWN_MS  = 3500;
const OEE_MAX_Q     = 8;
let _oeeJobId = 0;

function OEEGame() {
  const [active, setActive] = useS(false);
  const [timeLeft, setTimeLeft] = useS(60);
  const [queue, setQueue] = useS([]);
  const [machines, setMachines] = useS(OEE_MACH_DEF.map((d, i) => ({ ...d, i, job: null, progress: 0 })));
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
    _oeeJobId = 0;
    setTimeLeft(60); setQueue([]); setSelected(null); setHovered(null); setEnded(false);
    setStats({ done: 0, missed: 0, total: 0, pts: 0, maxPts: 0 });
    setMachines(OEE_MACH_DEF.map((d, i) => ({ ...d, i, job: null, progress: 0 })));
  }

  // Countdown
  useE(() => {
    if (!active || ended) return;
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setEnded(true); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [active, ended]);

  // Job spawner
  useE(() => {
    if (!active || ended) return;
    const spawn = () => {
      const tpl = OEE_JOBS_DEF[Math.floor(Math.random() * OEE_JOBS_DEF.length)];
      const job = { id: ++_oeeJobId, name: tpl.name, dur: tpl.dur, u: tpl.u, cat: tpl.cat, born: Date.now(), expireAt: Date.now() + OEE_EXPIRE_MS };
      setStats(s => ({ ...s, total: s.total + 1, maxPts: s.maxPts + 3 }));
      setQueue(q => q.length >= OEE_MAX_Q ? q : [...q, job]);
    };
    spawn();
    const t = setInterval(spawn, OEE_SPAWN_MS);
    return () => clearInterval(t);
  }, [active, ended]);

  // Machine progress + expiry tick
  useE(() => {
    if (!active || ended) return;
    const t = setInterval(() => {
      const now = Date.now();
      setNow(now);
      // expire queue
      setQueue(q => {
        const gone = q.filter(j => now > j.expireAt);
        if (gone.length) setStats(s => ({ ...s, missed: s.missed + gone.length }));
        return q.filter(j => now <= j.expireAt);
      });
      // machine progress
      setMachines(ms => ms.map(m => {
        if (!m.job) return m;
        const p = Math.min((now - m.job.startedAt) / 1000 / m.job.effDur, 1);
        if (p >= 1) {
          setStats(s => ({ ...s, done: s.done + 1, pts: s.pts + m.job.pts }));
          return { ...m, job: null, progress: 0 };
        }
        return { ...m, progress: p };
      }));
    }, 200);
    return () => clearInterval(t);
  }, [active, ended]);

  const assign = (mIdx) => {
    if (!selected || machines[mIdx].job) return;
    const match = _oeeMatch(mIdx, selected.cat);
    const cfg = OEE_MATCH[match];
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
            {Object.entries(OEE_CAT).map(([k, v]) => (
              <span key={k} className="oee-legend-item">
                <span className="oee-legend-dot" style={{ background: v.color }} />{v.label}
              </span>
            ))}
          </div>
          <div className="oee-timer-wrap">
            <div className="oee-timer-bar"><div className="oee-timer-fill" style={{ width: `${timerPct}%`, background: timeLeft < 15 ? '#C03010' : '#E87820', color: timeLeft < 15 ? '#C03010' : '#E87820' }} /></div>
            <span className="oee-timer-num" style={{ color: timeLeft < 15 ? '#C03010' : '#E87820' }}>{timeLeft}s</span>
          </div>
          <button className="oee-close" onClick={() => setActive(false)}>×</button>
        </div>

        {ended ? (
          <div className="oee-end">
            <div className="oee-end-label">MISSION COMPLETE · OEE RATING</div>
            <div className="oee-end-score" style={{ color: oee >= 80 ? '#02B980' : oee >= 50 ? '#028A5A' : '#7A2808' }}>{oee}<span>%</span></div>
            <div className="oee-end-sub">得分 {stats.pts}/{stats.maxPts} · 完成 {stats.done} · 错过 {stats.missed}</div>
            <div className="oee-end-tip">{oee >= 85 ? '完美调度！工厂满负荷运转' : oee >= 60 ? '良好 — 注意把作业分配给擅长的机器' : '提示：颜色相同的作业和机器配对可以获得3倍得分'}</div>
            <button className="btn" onClick={resetGame}>[ RESTART ]</button>
          </div>
        ) : (
          <div className="oee-body">

            {/* Job queue */}
            <div className="oee-queue">
              <div className="oee-col-label">INCOMING <span style={{ color: '#3A1A06' }}>{queue.length}/{OEE_MAX_Q}</span></div>
              {queue.length === 0 && <div className="oee-empty">AWAITING INPUT...</div>}
              {queue.map(j => {
                const cc = OEE_CAT[j.cat];
                const expPct = Math.max(0, (j.expireAt - now) / OEE_EXPIRE_MS * 100);
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
                  const def = OEE_MACH_DEF[i];
                  const specCfg = OEE_CAT[def.pref];
                  const match = selected ? _oeeMatch(i, selected.cat) : null;
                  const matchCfg = match ? OEE_MATCH[match] : null;
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
                            <span className="oee-cat-dot" style={{ background: OEE_CAT[m.job.cat]?.color }} />{m.job.name}
                          </div>
                          <div className="oee-mach-match" style={{ color: OEE_MATCH[m.job.match].color }}>{OEE_MATCH[m.job.match].label} +{m.job.pts}pt</div>
                          <div className="oee-progress-bar"><div className="oee-progress-fill" style={{ width: `${m.progress * 100}%`, background: OEE_MATCH[m.job.match].color }} /></div>
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
                  <span className="oee-cat-dot" style={{ background: OEE_CAT[selected.cat]?.color }} />
                  已选：<b>{selected.name}</b>
                  <span style={{ color: '#021A0C', marginLeft: 8 }}>完美匹配 +3pt · 勉强可做 +2pt · 不擅长 +1pt</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="oee-foot">
          <span>完成 <b style={{ color: '#02B980', textShadow: '0 0 8px rgba(2,185,128,0.55)' }}>{stats.done}</b></span>
          <span>错过 <b style={{ color: '#7A2808' }}>{stats.missed}</b></span>
          <span>得分 <b style={{ color: '#028A5A' }}>{stats.pts}</b><span style={{ color: '#021A0C' }}>/{stats.maxPts}</span></span>
          <span className="oee-oee">OEE <b style={{ color: oee >= 70 ? '#02B980' : oee >= 40 ? '#028A5A' : '#7A2808', textShadow: oee >= 70 ? '0 0 8px rgba(2,185,128,0.5)' : 'none' }}>{oee}%</b></span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Hero, About, ClientsStrip, WhyJoin, Jobs, Stories, PlacesSection, PerksSection, Process, CTA, Footer, OEEGame });
