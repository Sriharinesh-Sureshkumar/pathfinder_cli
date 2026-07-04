export default function StatsCard({ label, value }) {
  return (
    <div className="stats-card">
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
    </div>
  )
}
