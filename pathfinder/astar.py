import heapq
import time

from pathfinder.grid import Grid, SearchResult


def manhattan(row: int, col: int, end_row: int, end_col: int) -> int:
    return abs(row - end_row) + abs(col - end_col)


def astar(grid: Grid, start: tuple[int, int], end: tuple[int, int]) -> SearchResult:
    t0 = time.perf_counter()

    start_row, start_col = start
    end_row, end_col = end

    h = manhattan(start_row, start_col, end_row, end_col)
    heap = [(h, 0, start_row, start_col)]
    settled = set()
    parent = {start: None}
    g_cost = {start: 0}
    nodes_explored = 0

    while heap:
        f, g, row, col = heapq.heappop(heap)
        current = (row, col)

        if current in settled:
            continue

        settled.add(current)
        nodes_explored += 1

        if current == end:
            path = []
            node = current
            while node is not None:
                path.append(node)
                node = parent[node]
            path.reverse()
            elapsed = time.perf_counter() - t0
            return SearchResult(
                path=path,
                cost=float(g_cost[end]),
                nodes_explored=nodes_explored,
                elapsed_seconds=elapsed,
            )

        for neighbor in grid.neighbors(row, col):
            n_coord = (neighbor.row, neighbor.col)
            new_g = g + neighbor.cost
            if n_coord not in settled and new_g < g_cost.get(n_coord, float("inf")):
                g_cost[n_coord] = new_g
                parent[n_coord] = current
                new_f = new_g + manhattan(neighbor.row, neighbor.col, end_row, end_col)
                heapq.heappush(heap, (new_f, new_g, neighbor.row, neighbor.col))

    elapsed = time.perf_counter() - t0
    return SearchResult(
        path=None,
        cost=0.0,
        nodes_explored=nodes_explored,
        elapsed_seconds=elapsed,
    )
