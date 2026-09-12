import type { ElementType, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type RevealProps = {
  children: ReactNode
  /** Stagger in milliseconds, applied as a transition delay. */
  delay?: number
  as?: ElementType
  className?: string
  id?: string
}

/** Fades and lifts its children into place the first time they scroll into view. */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  id,
}: RevealProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>()

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal ${revealed ? 'reveal--in' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
