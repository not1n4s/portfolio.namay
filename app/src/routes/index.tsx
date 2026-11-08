import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { StructuredData } from "@/components/StructuredData";
import { PortfolioIntro } from "@/components/portfolio-intro";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { siteAsset } from "@/lib/site-paths";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

import "../frame-current.css";

const SITE_URL = "https://not1n4s.github.io/portfolio.namay";
const LOCAL_WORK_KEY = "namay-portfolio-custom-work-v1";

type WorkItem = {
  id: string;
  title: string;
  ctr: number;
  impressions: number;
  image: string;
  ctrTrend: string;
  impressionTrend: string;
  source: "portfolio" | "browser";
};

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
        "Namay Prakash is a YouTube thumbnail designer with two years of experience and more than 5,000,000 accumulated views across his work.",
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
    title: "More than 5,000,000 reached",
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

const selectedWork: WorkItem[] = [
  { title: "Borderline Journey", ctr: 14.8, impressions: 238_000 },
  { title: "Collision Course", ctr: 15.2, impressions: 312_000 },
  { title: "Conflict at Sea", ctr: 13.9, impressions: 184_000 },
  { title: "Inside Tehran", ctr: 15.6, impressions: 356_000 },
  { title: "Culture Shock", ctr: 14.3, impressions: 221_000 },
  { title: "Thailand After Dark", ctr: 15.8, impressions: 389_000 },
  { title: "Bangkok Nights", ctr: 13.7, impressions: 197_000 },
  { title: "Russia Connection", ctr: 14.9, impressions: 308_000 },
  { title: "Russia Unfiltered", ctr: 15.1, impressions: 244_000 },
  { title: "Midnight Moscow", ctr: 15.9, impressions: 341_000 },
  { title: "Road to Moscow", ctr: 14.4, impressions: 216_000 },
  { title: "Astana Arrival", ctr: 13.8, impressions: 176_000 },
  { title: "Detained Abroad", ctr: 15.5, impressions: 297_000 },
  { title: "Under Pressure", ctr: 14.7, impressions: 229_000 },
  { title: "Back in 1950", ctr: 15.3, impressions: 318_000 },
  { title: "HPV Vaccine", ctr: 12.9, impressions: 142_000 },
  { title: "Vaccines for Kids", ctr: 13.5, impressions: 165_000 },
  { title: "Almaty Festival", ctr: 14.6, impressions: 253_000 },
  { title: "Astana Stories", ctr: 15.0, impressions: 284_000 },
].map((item, index) => ({
  ...item,
  id: `portfolio-${index + 1}`,
  image: siteAsset(`assets/work/work-${String(index + 1).padStart(2, "0")}.webp`),
  ctrTrend: buildSparkline(index + 2, 0.76),
  impressionTrend: buildSparkline(index + 7, 0.34),
  source: "portfolio" as const,
}));

const creators = [
  {
    name: "Travel with AK",
    url: "https://www.youtube.com/@travelwithak",
    image: siteAsset("assets/creators/travel-with-ak.jpg"),
  },
  {
    name: "Krrish World",
    url: "https://www.youtube.com/@KrrishsWorld",
    image: siteAsset("assets/creators/krrish-world.jpg"),
  },
  {
    name: "Dr. Biswaroop Roy Chowdhury",
    url: "https://www.youtube.com/@drbiswarooproychowdhury",
    image: siteAsset("assets/creators/dr-biswaroop-roy-chowdhury.jpg"),
  },
  {
    name: "Altaf Musafir",
    url: "https://www.youtube.com/@altafmusafir",
    image: siteAsset("assets/creators/altaf-musafir.jpg"),
  },
] as const;

function buildSparkline(seed: number, lift: number) {
  return Array.from({ length: 9 }, (_, point) => {
    const wave = Math.sin(seed * 0.72 + point * 1.08) * 0.17;
    const momentum = point * 0.035;
    const value = Math.max(0.12, Math.min(0.9, lift + wave + momentum));
    return `${point * 30},${(84 - value * 62).toFixed(1)}`;
  }).join(" ");
}

function formatImpressions(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

function createUploadedTrends(ctr: number, impressions: number, title: string) {
  const titleSeed = Array.from(title).reduce((total, character) => total + character.charCodeAt(0), 0);
  const seed = titleSeed + Math.round(ctr * 10) + Math.round(impressions / 1_000);
  const ctrLift = Math.max(0.3, Math.min(0.8, ctr / 20));
  const impressionLift = Math.max(0.24, Math.min(0.72, Math.log10(impressions + 10) / 8));

  return {
    ctrTrend: buildSparkline(seed, ctrLift),
    impressionTrend: buildSparkline(seed + 5, impressionLift),
  };
}

function prepareThumbnail(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose a JPG, PNG, or WebP thumbnail."));
      return;
    }

    const reader = new FileReader();
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 960;
      canvas.height = 540;

      if (!context) {
        reject(new Error("This browser could not prepare the thumbnail."));
        return;
      }

      const targetRatio = canvas.width / canvas.height;
      const sourceRatio = image.naturalWidth / image.naturalHeight;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (sourceRatio > targetRatio) {
        sourceWidth = image.naturalHeight * targetRatio;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = image.naturalWidth / targetRatio;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
      }

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      resolve(canvas.toDataURL("image/webp", 0.82));
    };
    image.onerror = () => {
      reject(new Error("The selected image could not be read."));
    };
    reader.onload = () => {
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
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
          "YouTube thumbnail design portfolio with two years of experience and more than 5,000,000 accumulated views. Built for clear concepts and fast reads.",
      },
      { property: "og:title", content: "Namay Prakash | YouTube Thumbnail Designer" },
      {
        property: "og:description",
        content:
          "The motion-led portfolio of Namay Prakash, a YouTube thumbnail designer with two years of experience and more than 5,000,000 accumulated views.",
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

function ContactBubble() {
  return (
    <a
      aria-label="Go to Namay Prakash's contact details"
      className="contact-bubble"
      href="#contact"
    >
      <span aria-hidden="true">@</span>
      <span>Let’s talk</span>
    </a>
  );
}

function WorkedForSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const track = carousel.querySelector<HTMLElement>(".creator-carousel__track");
    const groups = track
      ? [...track.querySelectorAll<HTMLElement>(".creator-carousel__group")]
      : [];
    if (!track || groups.length < 3) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let resumeAt = 0;
    let segmentWidth = 0;
    let segmentStart = 0;
    let pointerDown = false;
    let hovered = false;
    let focused = false;
    let visible = true;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartScroll = 0;
    let dragAxis: "pending" | "horizontal" | "vertical" = "pending";
    let suppressClickUntil = 0;

    const measure = () => {
      const previousWidth = segmentWidth;
      const previousStart = segmentStart;
      const previousOffset = previousWidth
        ? (carousel.scrollLeft - previousStart) / previousWidth
        : 0;
      segmentWidth = groups[1].offsetLeft - groups[0].offsetLeft;
      segmentStart = groups[1].offsetLeft;
      carousel.scrollLeft = segmentStart + previousOffset * segmentWidth;
    };

    const normalizeLoop = () => {
      if (!segmentWidth) return;
      if (carousel.scrollLeft >= groups[2].offsetLeft) {
        carousel.scrollLeft -= segmentWidth;
      } else if (carousel.scrollLeft <= groups[0].offsetLeft + 1) {
        carousel.scrollLeft += segmentWidth;
      }
    };

    const pauseAfterInteraction = () => {
      resumeAt = performance.now() + 1800;
    };

    const tick = (now: number) => {
      const elapsed = Math.min(now - lastFrame, 64);
      lastFrame = now;
      if (
        !reducedMotion &&
        visible &&
        !pointerDown &&
        !hovered &&
        !focused &&
        now >= resumeAt
      ) {
        carousel.scrollLeft += elapsed * 0.038;
        normalizeLoop();
      }
      animationFrame = window.requestAnimationFrame(tick);
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartScroll = carousel.scrollLeft;
      dragAxis = "pending";
      pauseAfterInteraction();
      carousel.dataset.dragging = "true";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDown) return;
      const deltaX = event.clientX - dragStartX;
      const deltaY = event.clientY - dragStartY;
      if (dragAxis === "pending") {
        if (Math.hypot(deltaX, deltaY) < 7) return;
        dragAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
        if (dragAxis === "horizontal") {
          carousel.setPointerCapture(event.pointerId);
        }
      }
      if (dragAxis !== "horizontal") return;
      event.preventDefault();
      carousel.scrollLeft = dragStartScroll - deltaX;
      suppressClickUntil = performance.now() + 500;
    };

    const onPointerUp = (event: PointerEvent) => {
      pointerDown = false;
      pauseAfterInteraction();
      delete carousel.dataset.dragging;
      if (carousel.hasPointerCapture(event.pointerId)) {
        carousel.releasePointerCapture(event.pointerId);
      }
      normalizeLoop();
    };
    const onClickCapture = (event: MouseEvent) => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        (event.target as HTMLElement | null)?.blur?.();
        focused = false;
      }
    };
    const onMouseEnter = () => {
      if (hoverCapable) hovered = true;
    };
    const onMouseLeave = () => {
      if (hoverCapable) {
        hovered = false;
        pauseAfterInteraction();
      }
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!carousel.contains(event.relatedTarget as Node | null)) {
        focused = false;
        pauseAfterInteraction();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        lastFrame = performance.now();
      },
      { threshold: 0.05 },
    );

    measure();
    observer.observe(carousel);
    carousel.addEventListener("pointerdown", onPointerDown, { passive: true });
    carousel.addEventListener("pointermove", onPointerMove, { passive: false });
    carousel.addEventListener("pointerup", onPointerUp, { passive: true });
    carousel.addEventListener("pointercancel", onPointerUp, { passive: true });
    carousel.addEventListener("click", onClickCapture, true);
    carousel.addEventListener("mouseenter", onMouseEnter);
    carousel.addEventListener("mouseleave", onMouseLeave);
    carousel.addEventListener("focusin", onFocusIn);
    carousel.addEventListener("focusout", onFocusOut);
    carousel.addEventListener("wheel", pauseAfterInteraction, { passive: true });
    window.addEventListener("resize", measure);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      carousel.removeEventListener("pointerdown", onPointerDown);
      carousel.removeEventListener("pointermove", onPointerMove);
      carousel.removeEventListener("pointerup", onPointerUp);
      carousel.removeEventListener("pointercancel", onPointerUp);
      carousel.removeEventListener("click", onClickCapture, true);
      carousel.removeEventListener("mouseenter", onMouseEnter);
      carousel.removeEventListener("mouseleave", onMouseLeave);
      carousel.removeEventListener("focusin", onFocusIn);
      carousel.removeEventListener("focusout", onFocusOut);
      carousel.removeEventListener("wheel", pauseAfterInteraction);
      window.removeEventListener("resize", measure);
      delete carousel.dataset.dragging;
    };
  }, []);

  return (
    <section className="creators-section" aria-labelledby="creators-title">
      <div className="creators-section__heading">
        <p className="section-kicker">Worked for</p>
        <h2 id="creators-title">Creators who trust the frame</h2>
        <p>Drag or swipe the reel. It pauses while you explore and resumes automatically.</p>
      </div>
      <div
        aria-label="YouTube creators Namay has worked with"
        className="creator-carousel"
        ref={carouselRef}
        role="region"
      >
        <div className="creator-carousel__track">
          {[0, 1, 2].map((group) => (
            <div
              aria-hidden={group === 1 ? undefined : "true"}
              className="creator-carousel__group"
              key={group}
            >
              {creators.map((creator) => (
                <a
                  className="creator-capsule"
                  href={creator.url}
                  key={`${group}-${creator.name}`}
                  rel="noreferrer"
                  tabIndex={group === 1 ? undefined : -1}
                  target="_blank"
                >
                  <span className="creator-capsule__avatar" aria-hidden="true">
                    <img alt="" height="128" loading="lazy" src={creator.image} width="128" />
                  </span>
                  <span>{creator.name}</span>
                  <span className="creator-capsule__arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({
  index,
  work,
}: {
  index: number;
  work: WorkItem;
}) {
  const isBrowserAddition = work.source === "browser";
  const performanceLabel = isBrowserAddition ? "Submitted performance" : "Estimated performance";
  const spokenLabel = isBrowserAddition ? "submitted" : "estimated";

  return (
    <article
      aria-label={`${work.title}. ${spokenLabel} CTR ${work.ctr.toFixed(1)}%; ${spokenLabel} impressions ${work.impressions.toLocaleString("en-US")}.`}
      className="work-card"
      data-browser-addition={isBrowserAddition || undefined}
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
        height="540"
        loading="lazy"
        src={work.image}
        width="960"
      />
      <div className="work-card__base">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3>{work.title}</h3>
          <p>{isBrowserAddition ? "New browser addition" : "Hover for estimated performance"}</p>
        </div>
      </div>
      <div className="work-card__analytics">
        <div className="work-card__analytics-head">
          <p>{performanceLabel}</p>
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
            <dt>{isBrowserAddition ? "CTR" : "Estimated CTR"}</dt>
            <dd>{work.ctr.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>{isBrowserAddition ? "Impressions" : "Estimated impressions"}</dt>
            <dd>{formatImpressions(work.impressions)}</dd>
          </div>
        </dl>
        <h3>{work.title}</h3>
      </div>
    </article>
  );
}

function ProofSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(5_000_000);

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
    const duration = 7200;
    let start = 0;

    const tick = (now: number) => {
      if (start === 0) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased =
        progress < 0.5
          ? 4 * Math.pow(progress, 3)
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setCount(Math.round(eased * 5_000_000));
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible]);

  return (
    <section
      aria-label="More than 5,000,000 accumulated views"
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
          aria-label={`More than ${count.toLocaleString("en-US")} accumulated views. Press to interact.`}
          className="proof-number"
          tabIndex={0}
        >
          <p className="proof-number__more">More than</p>
          <div>
            <span aria-hidden="true">{count.toLocaleString("en-US")}</span>
          </div>
          <svg
            aria-hidden="true"
            className="proof-number__eyes"
            viewBox="0 0 100 32"
          >
            <g>
              <path d="M2 16C9 4 23 4 30 16C23 28 9 28 2 16Z" />
              <circle cx="16" cy="16" r="5" />
              <path d="M70 16C77 4 91 4 98 16C91 28 77 28 70 16Z" />
              <circle cx="84" cy="16" r="5" />
            </g>
          </svg>
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
          <img alt="" height="607" src={siteAsset("assets/work/work-03.webp")} width="1080" />
          <figcaption>Storytelling</figcaption>
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
          <div><dt>Result</dt><dd>More than 5,000,000</dd></div>
        </dl>
      </div>
    </section>
  );
}

function Index() {
  const [browserWork, setBrowserWork] = useState<WorkItem[]>([]);
  const [studioOpen, setStudioOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [isPreparingThumbnail, setIsPreparingThumbnail] = useState(false);
  const [studioMessage, setStudioMessage] = useState("");
  const [form, setForm] = useState({ title: "", ctr: "", impressions: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let restoreFrame = 0;
    try {
      const saved = window.localStorage.getItem(LOCAL_WORK_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as WorkItem[];
      if (!Array.isArray(parsed)) return;
      const validWork = parsed.filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.ctr === "number" &&
            typeof item.impressions === "number" &&
            typeof item.image === "string",
        );
      restoreFrame = window.requestAnimationFrame(() => setBrowserWork(validWork));
    } catch {
      restoreFrame = window.requestAnimationFrame(() => {
        setStudioMessage("Saved browser projects could not be restored.");
      });
    }

    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  const allWork = useMemo(() => [...browserWork, ...selectedWork], [browserWork]);

  const handleThumbnail = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStudioMessage("");
    setIsPreparingThumbnail(true);

    try {
      const prepared = await prepareThumbnail(file);
      setThumbnail(prepared);
      setThumbnailName(file.name);
    } catch (error) {
      setThumbnail("");
      setThumbnailName("");
      setStudioMessage(error instanceof Error ? error.message : "The thumbnail could not be prepared.");
    } finally {
      setIsPreparingThumbnail(false);
    }
  };

  const addWork = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    const ctr = Number(form.ctr);
    const impressions = Number(form.impressions);

    if (!title || !thumbnail || !Number.isFinite(ctr) || !Number.isFinite(impressions)) {
      setStudioMessage("Add a title, thumbnail, CTR, and impressions before publishing the card.");
      return;
    }

    if (ctr <= 0 || ctr > 100 || impressions < 1) {
      setStudioMessage("CTR must be between 0.1 and 100, and impressions must be at least 1.");
      return;
    }

    const trends = createUploadedTrends(ctr, impressions, title);
    const nextItem: WorkItem = {
      id: `browser-${Date.now()}`,
      title,
      ctr,
      impressions: Math.round(impressions),
      image: thumbnail,
      source: "browser",
      ...trends,
    };
    const next = [nextItem, ...browserWork];
    setBrowserWork(next);

    try {
      window.localStorage.setItem(LOCAL_WORK_KEY, JSON.stringify(next));
      setStudioMessage(`${title} was added to Selected Work and saved in this browser.`);
    } catch {
      setStudioMessage(`${title} was added for this visit, but browser storage is full.`);
    }

    setForm({ title: "", ctr: "", impressions: "" });
    setThumbnail("");
    setThumbnailName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearBrowserWork = () => {
    window.localStorage.removeItem(LOCAL_WORK_KEY);
    setBrowserWork([]);
    setStudioMessage("Browser-added projects were removed.");
  };

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

      <WorkedForSection />

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
        <div className={`work-studio${studioOpen ? " is-open" : ""}`}>
          <button
            aria-controls="work-studio-form"
            aria-expanded={studioOpen}
            className="work-studio__toggle"
            onClick={() => setStudioOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true">+</span>
            <span>
              <strong>Add a new project</strong>
              <small>Upload thumbnail + generate performance graph</small>
            </span>
            <span aria-hidden="true">{studioOpen ? "Close" : "Open"}</span>
          </button>

          {studioOpen ? (
            <form className="work-studio__form" id="work-studio-form" onSubmit={addWork}>
              <label className={`work-studio__drop${thumbnail ? " has-image" : ""}`}>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnail}
                  ref={fileInputRef}
                  type="file"
                />
                {thumbnail ? (
                  <img alt="New thumbnail preview" src={thumbnail} />
                ) : (
                  <span aria-hidden="true">↑</span>
                )}
                <span>
                  <strong>{isPreparingThumbnail ? "Preparing thumbnail…" : thumbnailName || "Upload thumbnail"}</strong>
                  <small>JPG, PNG, or WebP · automatically cropped to 16:9</small>
                </span>
              </label>

              <div className="work-studio__fields">
                <label>
                  <span>Project title</span>
                  <input
                    maxLength={80}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="e.g. Night train to Tehran"
                    required
                    type="text"
                    value={form.title}
                  />
                </label>
                <label>
                  <span>CTR rate (%)</span>
                  <input
                    max="100"
                    min="0.1"
                    onChange={(event) => setForm((current) => ({ ...current, ctr: event.target.value }))}
                    placeholder="14.8"
                    required
                    step="0.1"
                    type="number"
                    value={form.ctr}
                  />
                </label>
                <label>
                  <span>Impressions</span>
                  <input
                    min="1"
                    onChange={(event) => setForm((current) => ({ ...current, impressions: event.target.value }))}
                    placeholder="238000"
                    required
                    step="1"
                    type="number"
                    value={form.impressions}
                  />
                </label>
              </div>

              <div className="work-studio__actions">
                <p>Saved privately in this browser. Each submission generates a fresh CTR and impressions graph.</p>
                {browserWork.length > 0 ? (
                  <button className="work-studio__clear" onClick={clearBrowserWork} type="button">
                    Clear browser additions
                  </button>
                ) : null}
                <button className="work-studio__submit" disabled={isPreparingThumbnail} type="submit">
                  Generate + add to work
                </button>
              </div>
              <p aria-live="polite" className="work-studio__message">{studioMessage}</p>
            </form>
          ) : null}
        </div>
        <div className="work-gallery" aria-label="Selected YouTube thumbnail work">
          {allWork.map((work, index) => (
            <WorkCard index={index} key={work.id} work={work} />
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
        <div className="contact-options" aria-label="Contact options">
          <a
            aria-label="Email Namay Prakash at namaycreations@gmail.com"
            className="contact-option"
            href="mailto:namaycreations@gmail.com"
          >
            <span className="contact-option__icon" aria-hidden="true">@</span>
            <div>
              <p>Business email</p>
              <strong>namaycreations@gmail.com</strong>
            </div>
            <span className="contact-option__status">Email Namay</span>
          </a>
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
          Use the business email to start a project. Namay’s LinkedIn URL will be added when available.
        </p>
      </section>

      <footer className="site-footer">
        <BrandMark />
        <p>YouTube thumbnail designer. Working worldwide.</p>
        <p>Independent portfolio of Namay Prakash.</p>
      </footer>
      </main>
      <ContactBubble />
    </>
  );
}
