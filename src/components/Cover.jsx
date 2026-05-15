export default function Cover({ bgText, label }) {
  return (
    <div className="cover">
      <div className="cover-bg-text">{bgText}</div>
      <div className="cover-label">{label}</div>
    </div>
  )
}
