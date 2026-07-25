import { useEffect, useRef } from 'react'

export default function Background() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      
      containerRef.current.style.setProperty('--mouse-x', `${x}px`)
      containerRef.current.style.setProperty('--mouse-y', `${y}px`)
    }

    const handleScroll = () => {
      if (!containerRef.current) return
      
      const scrollY = window.scrollY
      containerRef.current.style.setProperty('--scroll-y', `${scrollY}px`)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="background" ref={containerRef} aria-hidden="true">
      <div className="background__grid" />
      <div className="background__orb background__orb--1" />
      <div className="background__orb background__orb--2" />
      <div className="background__orb background__orb--3" />
      <div className="background__orb background__orb--4" />
      <div className="background__orb background__orb--5" />
      <div className="background__particles">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="background__particle" style={{
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${5 + Math.random() * 10}s`,
            '--size': `${2 + Math.random() * 4}px`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`
          } as React.CSSProperties} />
        ))}
      </div>
      <div className="background__noise" />
    </div>
  )
}
