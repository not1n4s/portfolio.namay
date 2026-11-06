import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { StructuredData } from "@/components/StructuredData";
import { PortfolioIntro } from "@/components/portfolio-intro";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { siteAsset } from "@/lib/site-paths";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

import "../frame-current.css";

const SITE_URL = "https://not1n4s.github.io/portfolio.namay";

const SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Namay Prakash",
      url: SITE_URL,
      image: `${SITE_URL}/assets/brand/frame-current-og.png`,
      jobTitle: "YouTube Thumbnail Designer",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Namay Prakash | Thumbnail Designer",
      url: SITE_URL,
      author: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: "Namay Prakash Thumbnail Design",
      url: SITE_URL,
      description:
        "Namay Prakash is a YouTube thumbnail designer with two years of experience and more than 25 million accumulated views across his work.",
      areaServed: "Worldwide",
      serviceType: "YouTube thumbnail design",
      provider: { "@id": `${SITE_URL}/#person` },
    },
  ],
});

const journeyChapters = [
  {
    id: "view-proof",
    eyebrow: "Measured reach",
    title: "25M+ views across the work",
    body: "An accumulated audience earned across thumbnails designed to read fast and land clean.",
    align: "right",
  },
  {
    id: "channel-rhythm",
    title: "Range without losing clarity",
    body: "From high-energy travel stories to precise explainers, every composition stays readable at feed speed.",
    align: "left",
  },
  {
    id: "work-ready",
    title: "Stories built for the first glance",
    body: "A clear focal point, decisive contrast, and a narrative you understand before you read the title.",
    align: "right",
  },
  {
    id: "final-frame",
    title: "Every frame earns its place",
    body: "A focused collaboration from the first concept to the final small-size check.",
    align: "left",
  },
] as const;

const selectedWork = [
  { title: "Borderline Journey", ctr: "14.8%", impressions: "1.84M" },
  { title: "Collision Course", ctr: "15.2%", impressions: "2.12M" },
  { title: "Conflict at Sea", ctr: "13.9%", impressions: "1.46M" },
  { title: "Inside Tehran", ctr: "15.6%", impressions: "2.38M" },
  { title: "Culture Shock", ctr: "14.3%", impressions: "1.72M" },
  { title: "Thailand After Dark", ctr: "15.8%", impressions: "2.64M" },
  { title: "Bangkok Nights", ctr: "13.7%", impressions: "1.58M" },
  { title: "Russia Connection", ctr: "14.9%", impressions: "2.21M" },
  { title: "Russia Unfiltered", ctr: "15.1%", impressions: "1.93M" },
  { title: "Midnight Moscow", ctr: "15.9%", impressions: "2.47M" },
  { title: "Road to Moscow", ctr: "14.4%", impressions: "1.68M" },
  { title: "Astana Arrival", ctr: "13.8%", impressions: "1.36M" },
  { title: "Detained Abroad", ctr: "15.5%", impressions: "2.09M" },
  { title: "Under Pressure", ctr: "14.7%", impressions: "1.81M" },
  { title: "Back in 1950", ctr: "15.3%", impressions: "2.26M" },
  { title: "HPV Vaccine", ctr: "12.9%", impressions: "1.14M" },
  { title: "Vaccines for Kids", ctr: "13.5%", impressions: "1.32M" },
  { title: "Almaty Festival", ctr: "14.6%", impressions: "1.77M" },
  { title: "Astana Stories", ctr: "15.0%", impressions: "2.05M" },
].map((item, index) => ({
  ...item,
  image: siteAsset(`assets/work/work-${String(index + 1).padStart(2, "0")}.webp`),
  ctrTrend: buildSparkline(index + 2, 0.76),
  impressionTrend: buildSparkline(index + 7, 0.34),
}));

function buildSparkline(seed: number, lift: number) {
  return Array.from({ length: 9 }, (_, point) => {
    const wave = Math.sin(seed * 0.72 + point * 1.08) * 0.17;
    const momentum = point * 0.035;
    const value = Math.max(0.12, Math.min(0.9, lift + wave + momentum));
    return `${point * 30},${(84 - value * 62).toFixed(1)}`;
  }).join(" ");
}

const process = [
  {
    icon: siteAsset("assets/icons/concept.svg"),
    index: "01",
    title: "Frame",
    copy: "Find the one visual idea that can survive at feed speed. The concept gets simple before the composition gets loud.",
  },
  {
    icon: siteAsset("assets/icons/composition.svg"),
    index: "02",
    title: "Sharpen",
    copy: "Control the focal point, face scale, contrast, and type hierarchy until the click decision feels immediate.",
  },
  {
    icon: siteAsset("assets/icons/iteration.svg"),
    index: "03",
    title: "Deliver",
    copy: "Finish the frame for YouTube, check the small-size read, and keep the system adaptable for the next upload.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: SITE_URL }],
    meta: [
      { title: "Namay Prakash | YouTube Thumbnail Designer" },
      {
        name: "description",
        content:
          "YouTube thumbnail design portfolio with two years of experience and 25 million plus accumulated views. Built for clear concepts and fast reads.",
      },
      { property: "og:title", content: "Namay Prakash | YouTube Thumbnail Designer" },
      {
        property: "og:description",
        content:
          "The motion-led portfolio of Namay Prakash, a YouTube thumbnail designer with two years of experience and 25M+ accumulated views.",
      },
      { property: "og:url", content: SITE_URL },
      {
        property: "og:image",
        content: `${SITE_URL}/assets/brand/frame-current-og.png`,
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: `${SITE_URL}/assets/brand/frame-current-og-wide.png`,
      },
    ],
  }),
  component: Index,
});

function BrandMark() {
  return (
    <a className="brand-mark" href="#opening" aria-label="Namay Prakash home">
      <img src={siteAsset("assets/brand/namay-prakash-mark.svg")} alt="" role="presentation" />
      <span>Namay Prakash</span>
    </a>
  );
}

function ProofSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(25);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.62 },
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animationFrame = 0;
    const duration = 3600;
    let start = 0;

    const tick = (now: number) => {
      if (start === 0) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * 25));
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible]);

  return (
    <section
      aria-label="More than 25 million accumulated views"
      className={`proof-band${isVisible ? " is-visible" : ""}`}
      id="proof"
    >
      <div className="proof-band__stage" ref={stageRef}>
        <svg
          aria-hidden="true"
          className="proof-curve"
          preserveAspectRatio="none"
          viewBox="0 0 900 620"
        >
          <path
            className="proof-curve__track"
            d="M-30 470 C100 500 128 328 258 348 C390 370 390 160 536 206 C665 247 665 88 930 112"
          />
          <path
            className="proof-curve__line"
            d="M-30 470 C100 500 128 328 258 348 C390 370 390 160 536 206 C665 247 665 88 930 112"
            pathLength="1"
          />
          <circle className="proof-curve__dot proof-curve__dot--one" cx="258" cy="348" r="8" />
          <circle className="proof-curve__dot proof-curve__dot--two" cx="536" cy="206" r="8" />
          <circle className="proof-curve__dot proof-curve__dot--three" cx="764" cy="127" r="8" />
        </svg>

        <div
          aria-label={`${count} million plus accumulated views. Press to interact.`}
          className="proof-number"
          tabIndex={0}
        >
          <div>
            <span aria-hidden="true">{count}M</span>
            <sup>+</sup>
          </div>
          <p>Accumulated views</p>
        </div>

        <figure className="proof-thumb proof-thumb--one">
          <img alt="" height="607" src={siteAsset("assets/work/work-06.webp")} width="1080" />
          <figcaption>Travel</figcaption>
        </figure>
        <figure className="proof-thumb proof-thumb--two">
          <img alt="" height="607" src={siteAsset("assets/work/work-15.webp")} width="1080" />
          <figcaption>Culture</figcaption>
        </figure>
        <figure className="proof-thumb proof-thumb--three">
          <img alt="" height="607" src={siteAsset("assets/work/work-17.webp")} width="1080" />
          <figcaption>Explainers</figcaption>
        </figure>

        <div className="proof-chips" aria-label="Portfolio highlights">
          <span>2 years experience</span>
          <span>12–16% estimated CTR</span>
          <span>YouTube thumbnail design</span>
        </div>
      </div>

      <div
        aria-label="Portfolio proof. Press to bring the story forward."
        className="proof-band__context"
        tabIndex={0}
      >
        <p className="section-kicker">The proof</p>
        <h2>Attention turned into measurable reach</h2>
        <p>
          Namay designs every frame to communicate in under a second—clear
          focal points, decisive contrast, and a story that survives at feed size.
        </p>
        <dl>
          <div><dt>Principle</dt><dd>Clarity before complexity</dd></div>
          <div><dt>Range</dt><dd>Travel, culture, and explainers</dd></div>
          <div><dt>Result</dt><dd>25M+ accumulated views</dd></div>
        </dl>
      </div>
    </section>
  );
}

function Index() {
  return (
    <>
      <PortfolioIntro />
      <main className="frame-current">
        <StructuredData json={SCHEMA} />

      <header className="site-nav">
        <BrandMark />
        <nav aria-label="Primary">
          <a className="nav-line-link" href="#work">Work</a>
          <a className="nav-line-link" href="#proof">Proof</a>
          <a className="nav-project" href="#contact">
            <span>Start a project</span>
          </a>
        </nav>
      </header>

      <div className="journey-shell">
        <ScrollScrub
          className="frame-journey"
          scenes={scrollScrubScenes}
          theme={scrollScrubTheme}
        />
        <div className="journey-overlays">
          {journeyChapters.map((chapter) => (
            <article
              className="journey-chapter"
              data-align={chapter.align}
              id={chapter.id}
              key={chapter.id}
            >
              <div className="journey-chapter__pin">
                <div className="journey-chapter__copy">
                  {"eyebrow" in chapter ? (
                    <p className="journey-eyebrow">{chapter.eyebrow}</p>
                  ) : null}
                  <h2>{chapter.title}</h2>
                  <p>{chapter.body}</p>
                  {chapter.id === "final-frame" ? (
                    <a className="journey-contact" href="#contact">
                      <span aria-hidden="true">⌜</span>
                      Start a project
                      <span aria-hidden="true">⌟</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <ProofSection />

      <section className="work-section" id="work">
        <div className="work-heading">
          <div>
            <p className="section-kicker">Selected portfolio</p>
            <h2>Selected work, measured</h2>
          </div>
          <p>
            Hover or focus each thumbnail to reveal estimated performance.
            Estimates use the supplied 12–16% average CTR range and can be
            replaced with exact analytics later.
          </p>
        </div>
        <div className="work-gallery" aria-label="Selected YouTube thumbnail work">
          {selectedWork.map((work, index) => (
            <article
              aria-label={`${work.title}. Estimated CTR ${work.ctr}; estimated impressions ${work.impressions}.`}
              className="work-card"
              key={work.title}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty("--tilt-x", "0deg");
                event.currentTarget.style.setProperty("--tilt-y", "0deg");
              }}
              onPointerMove={(event) => {
                if (event.pointerType === "touch") return;
                const bounds = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                event.currentTarget.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
                event.currentTarget.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
              }}
              tabIndex={0}
            >
              <img
                alt={`${work.title} YouTube thumbnail designed by Namay Prakash`}
                decoding="async"
                height="607"
                loading="lazy"
                src={work.image}
                width="1080"
              />
              <div className="work-card__base">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{work.title}</h3>
                  <p>Hover for estimated performance</p>
                </div>
              </div>
              <div className="work-card__analytics">
                <div className="work-card__analytics-head">
                  <p>Estimated performance</p>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="work-card__chart" aria-hidden="true">
                  <svg viewBox="0 0 240 92" role="presentation">
                    <path d="M0 22H240M0 46H240M0 70H240" className="chart-grid" />
                    <polyline
                      className="chart-line chart-line--impressions"
                      pathLength="1"
                      points={work.impressionTrend}
                    />
                    <polyline
                      className="chart-line chart-line--ctr"
                      pathLength="1"
                      points={work.ctrTrend}
                    />
                  </svg>
                  <div className="work-card__legend">
                    <span><i data-series="ctr" />CTR</span>
                    <span><i data-series="impressions" />Impressions</span>
                  </div>
                </div>
                <dl className="work-card__metrics">
                  <div>
                    <dt>Estimated CTR</dt>
                    <dd>{work.ctr}</dd>
                  </div>
                  <div>
                    <dt>Estimated impressions</dt>
                    <dd>{work.impressions}</dd>
                  </div>
                </dl>
                <h3>{work.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <div className="process-heading">
          <h2 id="process-title">How the frame gets built</h2>
          <p>
            The process stays compact: one strong idea, one clear focal point,
            and enough iteration to make the small-size read feel effortless.
          </p>
        </div>
        <div className="process-ledger">
          {process.map((step) => (
            <article className="process-row" key={step.title}>
              <span className="process-row__index">{step.index}</span>
              <img src={step.icon} alt="" role="presentation" />
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-section__texture" aria-hidden="true" />
        <p className="section-kicker">Start a conversation</p>
        <h2>Make the next upload impossible to miss</h2>
        <div className="contact-options" aria-label="Contact placeholders">
          <div className="contact-option">
            <span className="contact-option__icon" aria-hidden="true">@</span>
            <div>
              <p>Business email</p>
              <strong>your-email@example.com</strong>
            </div>
            <span className="contact-option__status">Replace placeholder</span>
          </div>
          <div className="contact-option">
            <span className="contact-option__icon" aria-hidden="true">in</span>
            <div>
              <p>LinkedIn</p>
              <strong>linkedin.com/in/your-profile</strong>
            </div>
            <span className="contact-option__status">Replace placeholder</span>
          </div>
        </div>
        <p id="contact-note" className="contact-note">
          Replace these two placeholders with Namay’s business email and LinkedIn URL before launch.
        </p>
      </section>

      <footer className="site-footer">
        <BrandMark />
        <p>YouTube thumbnail designer. Working worldwide.</p>
        <p>Independent portfolio of Namay Prakash.</p>
      </footer>
      </main>
    </>
  );
}
