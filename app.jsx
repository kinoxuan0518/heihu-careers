/* global React, ReactDOM, window, Nav, ScrollBar, Hero, About, ClientsStrip, WhyJoin, Jobs, Stories, PlacesSection, PerksSection, Process, CTA, Footer, JobDrawer, useReveal, CursorGlow, OEEGame */
// ============ Heihu Careers v2 · App ============

const { useState, useEffect } = React;

function App() {
  const [job, setJob] = useState(null);
  const rootRef = useReveal();

  // 滚动进入视口时触发 reveal 动画
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    const els = document.querySelectorAll('.reveal, .reveal-left');
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 锚点平滑跳转
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          const top = el.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div ref={rootRef} className="page">
      <CursorGlow />
      <ScrollBar />
      <Nav onApply={() => scrollTo("jobs")} />
      <Hero
        onPrimary={() => scrollTo("jobs")}
        onSecondary={() => scrollTo("about")}
      />
      <div className="rule" style={{ margin: "0 calc(var(--pad-x) * -1)" }} />
      <About />
      <WhyJoin />
      <Jobs onOpen={setJob} />
      <Stories />
      <PlacesSection />
      <PerksSection />
      <Process />
      <CTA onApply={() => scrollTo("jobs")} />
      <Footer />
      <JobDrawer job={job} onClose={() => setJob(null)} />
      <OEEGame />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
