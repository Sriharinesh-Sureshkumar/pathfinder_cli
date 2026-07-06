const ALGOS = ['bfs', 'dijkstra', 'astar']
const ALGO_LABELS = {
  bfs: 'BFS (Unweighted)',
  dijkstra: 'Dijkstra (Weighted)',
  astar: 'A* Search (Heuristic)',
}

const ROWS = [
  { key: 'nodes_explored', label: 'Nodes Visited', format: (v) => v.toLocaleString() },
  { key: 'cost', label: 'Path Cost (Total Weight)', format: (v) => v },
  { key: 'pathLength', label: 'Path Length (Steps)', format: (v) => v },
  { key: 'elapsed_ms', label: 'Execution Time', format: (v) => `${v} ms` },
  { key: 'memory_mb', label: 'Memory Used', format: (v) => `${v} MB` },
]

function getValue(results, algo, rowKey) {
  const r = results[algo]
  if (rowKey === 'pathLength') return r.path ? r.path.length : null
  return r[rowKey]
}

function winnerFor(results, row) {
  let best = null
  let bestAlgo = null
  for (const algo of ALGOS) {
    const v = getValue(results, algo, row.key)
    if (v === null || v === undefined) continue
    if (best === null || v < best) {
      best = v
      bestAlgo = algo
    }
  }
  return bestAlgo
}

export default function ComparisonTable({ results, onReplayAll }) {
  if (!results) return null

  return (
    <div className="comparison-wrapper">
      <div className="comparison-actions">
        <button className="btn-secondary" onClick={onReplayAll} type="button">
          Replay All 3
        </button>
      </div>
      <div className="comparison-table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>BFS (Unweighted)</th>
              <th>Dijkstra (Weighted)</th>
              <th>A* Search (Heuristic)</th>
              <th>Top Performer</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const winner = winnerFor(results, row)
              return (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  {ALGOS.map((algo) => {
                    const value = getValue(results, algo, row.key)
                    return <td key={algo}>{value === null ? '—' : row.format(value)}</td>
                  })}
                  <td className={`winner-cell ${winner ? `winner-${winner}` : ''}`}>
                    {winner ? ALGO_LABELS[winner] : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="comparison-note">
        Note: BFS cost is a hop count (number of steps), not a weighted terrain sum, so its Path
        Cost isn&apos;t directly comparable to Dijkstra/A*&apos;s weighted cost. Dijkstra and A*
        always agree on the optimal weighted cost — A* typically reaches it after visiting fewer
        nodes.
      </p>
    </div>
  )
}
