import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#E05D52",
  background: "#10131A",
  ink: "#F3F0EA",
  muted: "#B6BBC4",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    align: "left",
    body: "I’m Namay Prakash, a YouTube thumbnail designer with two years of experience and 25M+ accumulated views.",
    clip: "/assets/world/frame-current.mp4",
    id: "opening",
    kicker: "Namay Prakash",
    label: "Opening",
    linger: 0.18,
    mobileClip: "/assets/world/frame-current-mobile.mp4",
    mobilePoster: "/assets/world/frame-current-mobile-poster.png",
    objectPosition: "50% 50%",
    poster: "/assets/world/frame-current-poster.png",
    scroll: 7.5,
    tags: ["2 years", "25M+ accumulated views"],
    title: "Thumbnails designed to earn the click",
  },
];
