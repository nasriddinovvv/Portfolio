/** Fixed ambient layer: drifting colour orbs, a faint grid, and film grain. */
export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__grid" />
      <div className="bg__orb bg__orb--1" />
      <div className="bg__orb bg__orb--2" />
      <div className="bg__orb bg__orb--3" />
      <div className="bg__grain" />
    </div>
  )
}
