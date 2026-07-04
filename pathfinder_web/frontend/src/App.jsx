import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import AlgoColumn from './components/AlgoColumn'
import GridDisplay from './components/GridDisplay'
import ComparisonTable from './components/ComparisonTable'

const API_BASE = 'http://127.0.0.1:8000'
const ALGOS = ['bfs', 'dijkstra', 'astar']
const BASE_TICK_MS = 10

const DEFAULT_CONFIG = {
  rows: 25,
  cols: 35,
  startRow: 0,
  startCol: 0,
  endRow: 24,
  endCol: 33,
  seed: 42,
  wallProbability: 0.2,
  speed: 1,
}

function makeProgress() {
  return { exploredCount: 0, pathCount: 0, phase: 'exploring' }
}

function coordsToKeySet(coords) {
  const set = new Set()
  for (const [r, c] of coords) set.add(`${r},${c}`)
  return set
}

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [editMode, setEditMode] = useState(false)
  const [customGrid, setCustomGrid] = useState(null)
  const [runData, setRunData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState(null)
  const [showAbout, setShowAbout] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!editMode) return
    setCustomGrid((prev) => {
      if (prev && prev.length === config.rows && prev[0].length === config.cols) return prev
      return Array.from({ length: config.rows }, () => Array(config.cols).fill(1))
    })
  }, [editMode, config.rows, config.cols])

  const handleEditCellClick = (r, c) => {
    setCustomGrid((prev) => {
      const next = prev.map((row) => row.slice())
      next[r][c] = next[r][c] === 0 ? 1 : 0
      return next
    })
  }

  const handleRun = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setError(null)
    setIsRunning(false)

    const body = {
      rows: config.rows,
      cols: config.cols,
      seed: config.seed,
      start: [config.startRow, config.startCol],
      end: [config.endRow, config.endCol],
      wall_probability: config.wallProbability,
    }
    if (editMode && customGrid) {
      body.custom_grid = customGrid
    }

    try {
      const res = await fetch(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Request failed')
      }
      setRunData(data)
      setProgress({ bfs: makeProgress(), dijkstra: makeProgress(), astar: makeProgress() })
      setIsRunning(true)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (!isRunning || !runData) return

    const intervalMs = Math.max(2, BASE_TICK_MS / config.speed)

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (!prev) return prev
        let allDone = true
        const next = {}

        for (const algo of ALGOS) {
          const r = runData[algo]
          const p = prev[algo]

          if (p.phase === 'exploring') {
            if (p.exploredCount < r.visited_order.length) {
              next[algo] = { ...p, exploredCount: p.exploredCount + 1 }
              allDone = false
            } else if (r.path) {
              next[algo] = { ...p, phase: 'path' }
              allDone = false
            } else {
              next[algo] = { ...p, phase: 'done' }
            }
          } else if (p.phase === 'path') {
            if (p.pathCount < r.path.length) {
              next[algo] = { ...p, pathCount: p.pathCount + 1 }
              allDone = false
            } else {
              next[algo] = { ...p, phase: 'done' }
            }
          } else {
            next[algo] = p
          }
        }

        if (allDone) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
        }

        return next
      })
    }, intervalMs)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, runData, config.speed])

  const columnData = useMemo(() => {
    if (!runData || !progress) return null
    const out = {}
    for (const algo of ALGOS) {
      const r = runData[algo]
      const p = progress[algo]
      out[algo] = {
        exploredCells: coordsToKeySet(r.visited_order.slice(0, p.exploredCount)),
        pathCells: r.path ? coordsToKeySet(r.path.slice(0, p.pathCount)) : new Set(),
        revealedNodeCount: p.exploredCount,
        isDone: p.phase === 'done',
      }
    }
    return out
  }, [runData, progress])

  const allColumnsDone = progress ? ALGOS.every((algo) => progress[algo].phase === 'done') : false

  const start = [config.startRow, config.startCol]
  const end = [config.endRow, config.endCol]

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} onShowAbout={() => setShowAbout(true)} />

      <div className="content">
        <ControlPanel
          config={config}
          onConfigChange={setConfig}
          onRun={handleRun}
          editMode={editMode}
          onToggleEdit={() => setEditMode((v) => !v)}
          isRunning={isRunning}
        />

        {error && <div className="error-banner">{error}</div>}

        {editMode && customGrid && (
          <div className="card edit-preview">
            <div className="edit-preview-header">Edit Mode — click cells to toggle walls</div>
            <GridDisplay
              grid={customGrid}
              start={start}
              end={end}
              algoKey="edit"
              editable
              onCellClick={handleEditCellClick}
            />
          </div>
        )}

        {runData && columnData && (
          <>
            <div className="columns">
              {ALGOS.map((algo) => (
                <AlgoColumn
                  key={algo}
                  algoKey={algo}
                  grid={runData.grid}
                  start={start}
                  end={end}
                  result={columnData[algo].isDone ? runData[algo] : null}
                  exploredCells={columnData[algo].exploredCells}
                  pathCells={columnData[algo].pathCells}
                  revealedNodeCount={columnData[algo].revealedNodeCount}
                />
              ))}
            </div>

            {allColumnsDone && <ComparisonTable results={runData} />}
          </>
        )}
      </div>

      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>About pathfinder-cli</h2>
            <p>
              A web visualiser for pathfinder-cli — a Python pathfinding tool implementing BFS,
              Dijkstra, and A* from scratch on a weighted grid, with zero graph libraries. This
              app runs all three algorithms on the same grid and query, and animates how each one
              explores the search space.
            </p>
            <button className="btn-secondary" onClick={() => setShowAbout(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
