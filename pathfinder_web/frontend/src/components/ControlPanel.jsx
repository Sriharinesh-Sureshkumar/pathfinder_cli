const PRESETS = {
  openField: { rows: 20, cols: 30, seed: 123, wallProbability: 0.05 },
  maze: { rows: 25, cols: 35, seed: 999, wallProbability: 0.35 },
  highway: { rows: 20, cols: 40, seed: 777, wallProbability: 0.15 },
}

export default function ControlPanel({
  config,
  onConfigChange,
  onRun,
  editMode,
  onToggleEdit,
  isRunning,
}) {
  const update = (patch) => onConfigChange({ ...config, ...patch })

  const handlePreset = (key) => {
    onConfigChange({ ...config, ...PRESETS[key] })
  }

  const randomSeed = () => update({ seed: Math.floor(Math.random() * 100000) })

  return (
    <div className="control-panel">
      <div className="control-group">
        <label>Grid Size</label>
        <input
          type="number"
          min="5"
          max="200"
          value={config.rows}
          onChange={(e) => update({ rows: Number(e.target.value) })}
        />
        <span className="control-sep">×</span>
        <input
          type="number"
          min="5"
          max="200"
          value={config.cols}
          onChange={(e) => update({ cols: Number(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Source</label>
        <input
          type="number"
          min="0"
          value={config.startRow}
          onChange={(e) => update({ startRow: Number(e.target.value) })}
        />
        <input
          type="number"
          min="0"
          value={config.startCol}
          onChange={(e) => update({ startCol: Number(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Destination</label>
        <input
          type="number"
          min="0"
          value={config.endRow}
          onChange={(e) => update({ endRow: Number(e.target.value) })}
        />
        <input
          type="number"
          min="0"
          value={config.endCol}
          onChange={(e) => update({ endCol: Number(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Seed</label>
        <input
          type="number"
          value={config.seed}
          onChange={(e) => update({ seed: Number(e.target.value) })}
        />
        <button className="btn-secondary" onClick={randomSeed} type="button">
          Random
        </button>
      </div>

      <div className="control-group">
        <label>Animation Speed — {config.speed}x</label>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={config.speed}
          onChange={(e) => update({ speed: Number(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Wall Density — {Math.round(config.wallProbability * 100)}%</label>
        <input
          type="range"
          min="0"
          max="0.4"
          step="0.01"
          value={config.wallProbability}
          onChange={(e) => update({ wallProbability: Number(e.target.value) })}
        />
      </div>

      <div className="control-group presets">
        <button className="btn-preset" onClick={() => handlePreset('openField')} type="button">
          Open Field
        </button>
        <button className="btn-preset" onClick={() => handlePreset('maze')} type="button">
          Maze-like
        </button>
        <button className="btn-preset" onClick={() => handlePreset('highway')} type="button">
          Highway
        </button>
      </div>

      <div className="control-group">
        <label className="switch-label">
          <span>Edit Mode</span>
          <span
            className={`switch ${editMode ? 'switch-on' : ''}`}
            onClick={onToggleEdit}
            role="switch"
            aria-checked={editMode}
          >
            <span className="switch-knob" />
          </span>
        </label>
      </div>

      <button className="btn-run" onClick={onRun} disabled={isRunning} type="button">
        {isRunning ? 'Running…' : 'Run Simulation'}
      </button>
    </div>
  )
}
