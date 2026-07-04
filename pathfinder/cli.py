import argparse
import sys
import time

from pathfinder.grid import Grid
from pathfinder.generator import generate_grid
from pathfinder.bfs import bfs
from pathfinder.dijkstra import dijkstra
from pathfinder.astar import astar
from pathfinder import render

render.USE_COLOUR = sys.stdout.isatty()


def parse_coord(s: str) -> tuple[int, int]:
    parts = s.split(',')
    if len(parts) != 2:
        raise argparse.ArgumentTypeError(f"invalid coordinate '{s}', expected format R,C")
    try:
        return (int(parts[0]), int(parts[1]))
    except ValueError:
        raise argparse.ArgumentTypeError(f"invalid coordinate '{s}', expected format R,C")


def validate_cell(grid: Grid, coord: tuple, name: str):
    row, col = coord
    if not grid.in_bounds(row, col):
        raise SystemExit(f"Error: {name} coordinate {coord} is out of bounds for a {grid.rows}x{grid.cols} grid")
    if grid.get(row, col).is_wall:
        raise SystemExit(f"Error: {name} coordinate {coord} is a wall cell")


def format_result(algo_name, result, grid_rows: int, grid_cols: int, seed: int, start: tuple, end: tuple) -> str:
    sr, sc = start
    er, ec = end

    lines = [
        f"Algorithm  : {algo_name}",
        f"Grid       : {grid_rows} × {grid_cols}  (seed {seed})",
        f"Start      : ({sr}, {sc})   →   End : ({er}, {ec})",
        "─────────────────────────────────────────────",
        f"Path found : {'Yes' if result.path is not None else 'No'}",
    ]

    if result.path is not None:
        lines.append(f"Path cost  : {result.cost}")
        lines.append(f"Path length: {len(result.path)} steps")

    lines.append(f"Nodes expl : {result.nodes_explored:,}")
    lines.append(f"Query time : {result.elapsed_seconds:.3f} s")

    return "\n".join(lines)


def run_single(algo: str, grid: Grid, start: tuple, end: tuple):
    if algo == 'bfs':
        return bfs(grid, start, end)
    if algo == 'dijkstra':
        return dijkstra(grid, start, end)
    if algo == 'astar':
        return astar(grid, start, end)
    raise ValueError(f"unknown algorithm '{algo}'")


def print_comparison_table(grid: Grid, start: tuple, end: tuple, rows: int, cols: int, seed: int):
    sr, sc = start
    er, ec = end

    algorithms = [('BFS', bfs), ('Dijkstra', dijkstra), ('A*', astar)]

    print(f"Grid: {rows} × {cols}   Seed: {seed}   Query: ({sr},{sc}) → ({er},{ec})")
    print("──────────────┬──────────┬───────────────┬──────────")
    print("Algorithm     │ Cost     │ Nodes explored│ Time (s)")
    print("──────────────┼──────────┼───────────────┼──────────")

    for name, algo_fn in algorithms:
        result = algo_fn(grid, start, end)
        cost = result.cost if result.path is not None else 'N/A'
        print(f"{name:<14}│ {str(cost):<9}│ {result.nodes_explored:<15,}│ {result.elapsed_seconds:.3f}")

    print("──────────────┴──────────┴───────────────┴──────────")
    print("Note: BFS cost = hop count. Dijkstra/A* cost = weighted terrain sum.")


def main():
    parser = argparse.ArgumentParser(prog='pathfinder', description='BFS, Dijkstra, and A* pathfinding on a weighted grid')
    parser.add_argument('--algo', choices=['bfs', 'dijkstra', 'astar'])
    parser.add_argument('--start', type=parse_coord, required=True)
    parser.add_argument('--end', type=parse_coord, required=True)
    parser.add_argument('--rows', type=int, default=20)
    parser.add_argument('--cols', type=int, default=20)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--render', action='store_true')
    parser.add_argument('--all', action='store_true')
    args = parser.parse_args()

    if not args.all and not args.algo:
        parser.error('--algo is required unless --all is passed')

    grid = generate_grid(args.rows, args.cols, args.seed)
    validate_cell(grid, args.start, 'start')
    validate_cell(grid, args.end, 'end')

    if args.all:
        print_comparison_table(grid, args.start, args.end, args.rows, args.cols, args.seed)
        sys.exit(0)

    result = run_single(args.algo, grid, args.start, args.end)

    if args.render:
        print(render.render_grid(grid, result.path))

    print(format_result(args.algo, result, args.rows, args.cols, args.seed, args.start, args.end))

    if result.path is None:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
