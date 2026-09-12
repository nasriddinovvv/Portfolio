import { useEffect, useRef, useState } from 'react'

/** True when the user has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/**
 * Reveals an element the first time it scrolls into view.
 * Returns a ref to attach and whether it has been revealed yet.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  // Reduced motion means everything starts visible — no animation to wait for.
  const [revealed, setRevealed] = useState(prefersReducedMotion)

  useEffect(() => {
    const element = ref.current
    if (!element || revealed) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, revealed])

  return { ref, revealed }
}

/**
 * Counts up to `target` once the element is in view. Used for the stat blocks.
 */
export function useCountUp(target: number, durationMs = 1200) {
  const { ref, revealed } = useReveal<HTMLSpanElement>(0.4)
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0)

  useEffect(() => {
    if (!revealed || prefersReducedMotion()) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      // Ease-out cubic: fast at first, settles gently on the final number.
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [revealed, target, durationMs])

  return { ref, value }
}
