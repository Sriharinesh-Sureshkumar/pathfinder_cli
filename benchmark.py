import time

from pathfinder.astar import astar
from pathfinder.bfs import bfs
from pathfinder.dijkstra import dijkstra
from pathfinder.generator import generate_grid

BENCHMARK_ROWS = 100
BENCHMARK_COLS = 100
BENCHMARK_SEED = 42
BENCHMARK_START = (0, 0)
BENCHMARK_END = (98, 99)


def main():
    grid = generate_grid(BENCHMARK_ROWS, BENCHMARK_COLS, BENCHMARK_SEED)

    algorithms = [('BFS', bfs), ('Dijkstra', dijkstra), ('A*', astar)]
    results = []
    for name, fn in algorithms:
        t0 = time.perf_counter()
        result = fn(grid, BENCHMARK_START, BENCHMARK_END)
        elapsed = time.perf_counter() - t0
        results.append((name, result, elapsed))

    sr, sc = BENCHMARK_START
    er, ec = BENCHMARK_END

    print(f"Grid: {BENCHMARK_ROWS} × {BENCHMARK_COLS}   Seed: {BENCHMARK_SEED}   Query: ({sr},{sc}) → ({er},{ec})")
    print("──────────────┬──────────┬───────────────┬──────────")
    print("Algorithm     │ Cost     │ Nodes explored│ Time (s)")
    print("──────────────┼──────────┼───────────────┼──────────")

    for name, result, elapsed in results:
        cost = result.cost if result.path is not None else 'N/A'
        print(f"{name:<14}│ {str(cost):<9}│ {result.nodes_explored:<15,}│ {elapsed:.3f}")

    print("──────────────┴──────────┴───────────────┴──────────")
    print("Note: BFS cost = hop count. Dijkstra/A* cost = weighted terrain sum.")


if __name__ == "__main__":
    main()
