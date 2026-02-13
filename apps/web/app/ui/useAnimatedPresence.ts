"use client";

import { useState, useEffect } from "react";

/**
 * Manages enter/exit animations for components that mount/unmount.
 * Returns `shouldRender` (whether the DOM node should exist) and
 * `isAnimating` (whether the enter animation class should be applied).
 *
 * `duration` should match the CSS transition/animation duration
 * (default 200ms = `duration-standard` from the design system).
 */
export function useAnimatedPresence(isOpen: boolean, duration = 200) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  return { shouldRender, isAnimating };
}
