"use client";

import { useEffect } from "react";

/**
 * Shared animated background with scroll-reactive parallax layers.
 * Mounted once at the app root so all routes share the same visual system.
 */
export function GlobalParallaxBackground() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const applyScrollDepth = () => {
      root.style.setProperty("--parallax-scroll", `${window.scrollY}px`);
      frame = 0;
    };

    const handleScroll = () => {
      if (reduceMotion.matches || frame !== 0) return;
      frame = window.requestAnimationFrame(applyScrollDepth);
    };

    applyScrollDepth();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      root.style.removeProperty("--parallax-scroll");
    };
  }, []);

  return (
    <div aria-hidden className="global-parallax">
      <div className="parallax-base" />
      <div className="parallax-orb parallax-orb-one" />
      <div className="parallax-orb parallax-orb-two" />
      <div className="parallax-orb parallax-orb-three" />
      <div className="parallax-grid" />
    </div>
  );
}
