import { useScrollProgress } from '../hooks/useScroll'

export default function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__bar" style={{ width: `${progress}%` }} />
    </div>
  )
}
