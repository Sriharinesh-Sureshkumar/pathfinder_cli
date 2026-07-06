import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import AlgoColumn from './components/AlgoColumn'
import ComparisonTable from './components/ComparisonTable'

const API_BASE = 'http://127.0.0.1:8000'
const ALGOS = ['bfs', 'dijkstra', 'astar']
const BASE_TICK_MS = 10
const REPLAY_TICK_MS = 50
const SHARE_PARAM_KEYS = [
  'rows',
  'cols',
  'seed',
  'startRow',
  'startCol',
  'endRow',
  'endCol',
  'wallProb',
]

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

function cycleCellCost(cost) {
  if (cost === 1) return 0
  if (cost === 0) return 2
  if (cost >= 2 && cost < 5) return cost + 1
  return 1
}

function parseConfigFromSearch(search) {
  const params = new URLSearchParams(search)
  if (!SHARE_PARAM_KEYS.every((key) => params.has(key))) return null
  return {
    rows: Number(params.get('rows')),
    cols: Number(params.get('cols')),
    seed: Number(params.get('seed')),
    startRow: Number(params.get('startRow')),
    startCol: Number(params.get('startCol')),
    endRow: Number(params.get('endRow')),
    endCol: Number(params.get('endCol')),
    wallProbability: Number(params.get('wallProb')),
  }
}

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [editMode, setEditMode] = useState(false)
  const [customGrid, setCustomGrid] = useState(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [runData, setRunData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [replay, setReplay] = useState({ bfs: null, dijkstra: null, astar: null })
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState(null)
  const [showAbout, setShowAbout] = useState(false)
  const intervalRef = useRef(null)
  const replayIntervalsRef = useRef({})

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

  useEffect(() => {
    return () => {
      Object.values(replayIntervalsRef.current).forEach((id) => clearInterval(id))
    }
  }, [])

  const handleEditCellClick = (r, c, event) => {
    if (event && event.shiftKey) {
      setConfig((cfg) => ({ ...cfg, startRow: r, startCol: c }))
      return
    }
    if (event && (event.ctrlKey || event.metaKey)) {
      setConfig((cfg) => ({ ...cfg, endRow: r, endCol: c }))
      return
    }
    setCustomGrid((prev) => {
      const next = prev.map((row) => row.slice())
      next[r][c] = cycleCellCost(next[r][c])
      return next
    })
  }

  const updateShareUrl = (cfg) => {
    const params = new URLSearchParams({
      rows: cfg.rows,
      cols: cfg.cols,
      seed: cfg.seed,
      startRow: cfg.startRow,
      startCol: cfg.startCol,
      endRow: cfg.endRow,
      endCol: cfg.endCol,
      wallProb: cfg.wallProbability,
    })
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState(null, '', newUrl)
  }

  const runSimulation = async (cfg, useEditMode, grid) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    Object.values(replayIntervalsRef.current).forEach((id) => clearInterval(id))
    replayIntervalsRef.current = {}
    setReplay({ bfs: null, dijkstra: null, astar: null })
    setError(null)
    setIsRunning(false)

    const body = {
      rows: cfg.rows,
      cols: cfg.cols,
      seed: cfg.seed,
      start: [cfg.startRow, cfg.startCol],
      end: [cfg.endRow, cfg.endCol],
      wall_probability: cfg.wallProbability,
    }
    if (useEditMode && grid) {
      body.custom_grid = grid
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
      updateShareUrl(cfg)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleRun = () => {
    runSimulation(config, editMode, customGrid)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    const parsed = parseConfigFromSearch(window.location.search)
    if (!parsed) return
    const fullConfig = { ...DEFAULT_CONFIG, ...parsed }
    setConfig(fullConfig)
    runSimulation(fullConfig, false, null)
    // Runs once on mount to honor any shareable URL params present at load time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const startReplay = (algo) => {
    if (!runData || !progress || progress[algo].phase !== 'done') return
    const path = runData[algo].path
    if (!path || path.length === 0) return

    if (replayIntervalsRef.current[algo]) clearInterval(replayIntervalsRef.current[algo])
    setReplay((prev) => ({ ...prev, [algo]: 0 }))

    replayIntervalsRef.current[algo] = setInterval(() => {
      setReplay((prev) => {
        const count = prev[algo] ?? 0
        if (count >= path.length) {
          clearInterval(replayIntervalsRef.current[algo])
          return prev
        }
        return { ...prev, [algo]: count + 1 }
      })
    }, REPLAY_TICK_MS)
  }

  const replayAll = () => {
    ALGOS.forEach((algo) => startReplay(algo))
  }

  const columnData = useMemo(() => {
    if (!runData || !progress) return null
    const out = {}
    for (const algo of ALGOS) {
      const r = runData[algo]
      const p = progress[algo]
      const replayCount = replay[algo]
      const pathCount = replayCount != null ? replayCount : p.pathCount
      out[algo] = {
        exploredCells: coordsToKeySet(r.visited_order.slice(0, p.exploredCount)),
        pathCells: r.path ? coordsToKeySet(r.path.slice(0, pathCount)) : new Set(),
        revealedNodeCount: p.exploredCount,
        isDone: p.phase === 'done',
      }
    }
    return out
  }, [runData, progress, replay])

  const allColumnsDone = progress ? ALGOS.every((algo) => progress[algo].phase === 'done') : false

  const start = [config.startRow, config.startCol]
  const end = [config.endRow, config.endCol]
  const canShareLink = !(editMode && customGrid)

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
          canShareLink={canShareLink}
          onCopyLink={handleCopyLink}
          customGrid={customGrid}
          start={start}
          end={end}
          onEditCellClick={handleEditCellClick}
        />

        {error && <div className="error-banner">{error}</div>}

        {runData && columnData && (
          <>
            <div className="columns-toolbar">
              <label className="switch-label">
                <span>Show Terrain Heatmap</span>
                <span
                  className={`switch ${showHeatmap ? 'switch-on' : ''}`}
                  onClick={() => setShowHeatmap((v) => !v)}
                  role="switch"
                  aria-checked={showHeatmap}
                >
                  <span className="switch-knob" />
                </span>
              </label>
            </div>

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
                  heatmap={showHeatmap}
                  isDone={columnData[algo].isDone}
                  onReplay={() => startReplay(algo)}
                />
              ))}
            </div>

            {allColumnsDone && <ComparisonTable results={runData} onReplayAll={replayAll} />}
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
