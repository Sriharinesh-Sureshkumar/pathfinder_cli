export default function GridDisplay({
  grid,
  start,
  end,
  exploredCells,
  pathCells,
  algoKey,
  editable,
  onCellClick,
}) {
  if (!grid || grid.length === 0) return null
  const cols = grid[0].length

  return (
    <div className="grid-display" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {grid.map((rowArr, r) =>
        rowArr.map((cost, c) => {
          const key = `${r},${c}`
          const isStart = start[0] === r && start[1] === c
          const isEnd = end[0] === r && end[1] === c
          const isPath = pathCells ? pathCells.has(key) : false
          const isExplored = exploredCells ? exploredCells.has(key) : false

          const classes = ['cell']
          if (isStart) classes.push('cell-start')
          else if (isEnd) classes.push('cell-end')
          else if (cost === 0) classes.push('cell-wall')
          else if (isPath) classes.push(`cell-path-${algoKey}`)
          else if (isExplored) classes.push(`cell-explored-${algoKey}`)
          else classes.push(`cell-cost-${Math.min(cost, 5)}`)

          if (editable) classes.push('cell-editable')

          const label = isStart
            ? 'S'
            : isEnd
              ? 'D'
              : cost > 1 && !isPath && !isExplored
                ? cost
                : ''

          return (
            <div
              key={key}
              className={classes.join(' ')}
              onClick={editable ? () => onCellClick(r, c) : undefined}
            >
              {label}
            </div>
          )
        }),
      )}
    </div>
  )
}
