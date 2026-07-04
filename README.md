# pathfinder-cli

BFS, Dijkstra, and A* pathfinding from scratch. No graph libraries.

![CI](https://github.com/Sriharinesh-Sureshkumar/pathfinder_cli/actions/workflows/ci.yml/badge.svg?branch=build)

## Install

```
pip install -e .
```

## Quick start

```
pathfinder --algo astar --start 0,0 --end 9,9 --rows 10 --cols 10 --render
```

```
+-------------------+
|S * 5 # 3 # . # 3 #|
|# * * * * . . . # .|
|3 . 3 # * 5 . 5 # .|
|. 2 5 . * 5 5 # 3 .|
|. 5 . . * * * 3 . 2|
|5 . # 3 3 3 * * . .|
|# # 3 # 2 3 . * 3 5|
|. 2 # 5 3 3 5 * . #|
|3 3 3 . # . . * # .|
|3 . 3 # 3 . 5 * * E|
+-------------------+
Algorithm  : astar
Grid       : 10 × 10  (seed 42)
Start      : (0, 0)   →   End : (9, 9)
─────────────────────────────────────────────
Path found : Yes
Path cost  : 35.0
Path length: 19 steps
Nodes expl : 71
Query time : 0.000 s
```

## Benchmark

```
Grid: 100 × 100   Seed: 42   Query: (0,0) → (98,99)
──────────────┬──────────┬───────────────┬──────────
Algorithm     │ Cost     │ Nodes explored│ Time (s)
──────────────┼──────────┼───────────────┼──────────
BFS           │ 197.0    │ 7,967          │ 0.013
Dijkstra      │ 285.0    │ 7,965          │ 0.019
A*            │ 285.0    │ 7,700          │ 0.021
──────────────┴──────────┴───────────────┴──────────
Note: BFS cost = hop count. Dijkstra/A* cost = weighted terrain sum.
```

## Algorithms

**BFS** explores the grid layer by layer outward from the start, using a FIFO queue to guarantee the first time it reaches a cell is via the fewest hops. It runs in O(V+E) time, where V is the number of cells and E is the number of edges between them. Use it when all moves cost the same and you only care about the shortest hop count, not terrain cost.

**Dijkstra** explores cells in order of lowest accumulated cost using a min-heap, with lazy deletion to skip stale heap entries instead of decreasing keys in place. It runs in O((V+E) log V) time due to the heap operations. Use it when terrain costs vary and you need the guaranteed lowest-cost path with no further information about the target's location.

**A\*** extends Dijkstra by adding a Manhattan-distance heuristic to the priority order, steering the search toward the goal instead of expanding uniformly in all directions. It runs in O((V+E) log V) time in the worst case, same as Dijkstra, but explores far fewer nodes in practice. Use it whenever you know the target's coordinates in advance, since the admissible heuristic finds the same optimal cost as Dijkstra with less work.

## Flags

| Flag        | Description                                          | Default |
|-------------|-------------------------------------------------------|---------|
| `--algo`    | Algorithm to run: `bfs`, `dijkstra`, or `astar`        | required (unless `--all`) |
| `--start`   | Start coordinate as `row,col`                          | required |
| `--end`     | End coordinate as `row,col`                            | required |
| `--rows`    | Number of grid rows                                    | `20` |
| `--cols`    | Number of grid columns                                 | `20` |
| `--seed`    | Random seed for grid generation                        | `42` |
| `--render`  | Print the ASCII grid with the path highlighted         | off |
| `--all`     | Run all 3 algorithms and print a comparison table       | off |
