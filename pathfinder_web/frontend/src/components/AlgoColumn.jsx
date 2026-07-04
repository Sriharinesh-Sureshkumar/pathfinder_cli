import GridDisplay from './GridDisplay'
import StatsCard from './StatsCard'

const BADGES = { bfs: 'UNWEIGHTED', dijkstra: 'WEIGHTED', astar: 'HEURISTIC' }
const NAMES = { bfs: 'BFS', dijkstra: 'Dijkstra', astar: 'A* Search' }
const DESCRIPTIONS = {
  bfs: [
    'Explores equally in all directions.',
    'Ignores terrain weights and finds the shortest path in terms of steps.',
    'Guarantees optimal path only on unweighted grids.',
  ],
  dijkstra: [
    'Considers terrain weights (costs) for each cell.',
    'Always finds the lowest total cost path.',
    'May explore many unnecessary nodes.',
  ],
  astar: [
    'Uses heuristics to guide the search.',
    'Finds lowest cost path like Dijkstra.',
    'Explores fewer nodes, usually fastest.',
  ],
}

export default function AlgoColumn({
  algoKey,
  grid,
  start,
  end,
  result,
  exploredCells,
  pathCells,
  revealedNodeCount,
}) {
  return (
    <div className={`algo-column algo-${algoKey}`}>
      <div className="algo-header">
        <div>
          <span className="algo-name">{NAMES[algoKey]}</span>
          <span className="algo-badge">{BADGES[algoKey]}</span>
        </div>
        <div className="nodes-counter">
          <div className="nodes-counter-value">{revealedNodeCount.toLocaleString()}</div>
          <div className="nodes-counter-label">Nodes Visited</div>
        </div>
      </div>

      <GridDisplay
        grid={grid}
        start={start}
        end={end}
        exploredCells={exploredCells}
        pathCells={pathCells}
        algoKey={algoKey}
      />

      <div className="stats-row">
        <StatsCard label="Path Cost" value={result ? result.cost : '—'} />
        <StatsCard label="Path Length" value={result && result.path ? result.path.length : '—'} />
        <StatsCard label="Execution Time" value={result ? `${result.elapsed_ms} ms` : '—'} />
        <StatsCard label="Memory Used" value={result ? `${result.memory_mb} MB` : '—'} />
      </div>

      <div className="algo-description">
        {DESCRIPTIONS[algoKey].map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  )
}
