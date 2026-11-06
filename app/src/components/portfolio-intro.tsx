import { useEffect, useState } from "react";

import { siteAsset } from "@/lib/site-paths";

const INTRO_SESSION_KEY = "namay-portfolio-intro-seen";
const MINIMUM_INTRO_MS = 1400;

function preloadImage(source: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
    image.src = source;
    if (image.complete) finish();
  });
}

function preloadVideoMetadata(source: string) {
  return new Promise<void>((resolve) => {
    const video = document.createElement("video");
    let timeout = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      video.pause();
      video.removeAttribute("src");
      video.load();
      resolve();
    };

    video.preload = "metadata";
    video.muted = true;
    video.addEventListener("loadedmetadata", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    timeout = window.setTimeout(finish, 3200);
    video.src = source;
    video.load();
  });
}

export function PortfolioIntro() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "hidden">("visible");
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasPlayed = window.sessionStorage.getItem(INTRO_SESSION_KEY) === "true";

    if (reducedMotion || hasPlayed) {
      const skipFrame = window.requestAnimationFrame(() => setPhase("hidden"));
      return () => window.cancelAnimationFrame(skipFrame);
    }

    document.body.classList.add("intro-lock");
    const startedAt = performance.now();
    let completedAssets = 0;
    let leaveTimer = 0;
    let hideTimer = 0;
    let cancelled = false;

    const jobs = [
      preloadImage(siteAsset("assets/world/frame-current-poster.png")),
      preloadImage(siteAsset("assets/work/work-01.webp")),
      preloadImage(siteAsset("assets/brand/namay-prakash-mark.svg")),
      preloadVideoMetadata(siteAsset("assets/world/frame-current.mp4")),
    ].map((job) =>
      job.finally(() => {
        completedAssets += 1;
        if (!cancelled) setProgress(8 + Math.round((completedAssets / 4) * 82));
      }),
    );

    const minimumDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, Math.max(0, MINIMUM_INTRO_MS - (performance.now() - startedAt)));
    });

    void Promise.allSettled([...jobs, minimumDelay]).then(() => {
      if (cancelled) return;
      setProgress(100);
      leaveTimer = window.setTimeout(() => {
        setPhase("leaving");
        window.sessionStorage.setItem(INTRO_SESSION_KEY, "true");
        document.body.classList.remove("intro-lock");
        hideTimer = window.setTimeout(() => setPhase("hidden"), 900);
      }, 260);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      document.body.classList.remove("intro-lock");
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-label="Loading Namay Prakash's portfolio"
      aria-live="polite"
      className={`portfolio-intro${phase === "leaving" ? " is-leaving" : ""}`}
    >
      <div className="portfolio-intro__grain" aria-hidden="true" />
      <div className="portfolio-intro__layout">
        <div className="portfolio-intro__copy">
          <p className="portfolio-intro__eyebrow">Namay Prakash · Thumbnail designer</p>
          <h1>
            Hey, I’m Namay.
            <span>I turn first impressions into clicks.</span>
          </h1>
          <p className="portfolio-intro__support">
            Your designer of choice for thumbnails that earn attention.
          </p>

          <div className="portfolio-intro__progress-wrap">
            <div className="portfolio-intro__progress-meta">
              <span>Preparing the next frame</span>
              <span>{progress}%</span>
            </div>
            <div
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress}
              className="portfolio-intro__progress"
              role="progressbar"
            >
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>
        </div>

        <div className="portfolio-intro__portrait" aria-label="Namay portrait frame">
          <div className="portfolio-intro__portrait-orbit" aria-hidden="true" />
          <span className="portfolio-intro__monogram">NP</span>
          <p>Namay Prakash</p>
        </div>
      </div>
    </div>
  );
}
