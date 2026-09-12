import { useScrollProgress } from '../hooks/useScroll'

/** Thin gradient bar across the top showing how far down the page you are. */
export default function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div
      className="scroll-progress"
      style={{ transform: `scaleX(${progress})` }}
      role="progressbar"
      aria-label="Sahifa o'qilish darajasi"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  )
}
