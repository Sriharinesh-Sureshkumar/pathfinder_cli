import heapq
import time

from pathfinder.grid import Grid, SearchResult


def dijkstra(grid: Grid, start: tuple[int, int], end: tuple[int, int]) -> SearchResult:
    t0 = time.perf_counter()

    heap = [(0, start[0], start[1])]
    settled = set()
    parent = {start: None}
    g_cost = {start: 0}
    nodes_explored = 0

    while heap:
        cost, row, col = heapq.heappop(heap)
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
            new_cost = cost + neighbor.cost
            if n_coord not in settled and new_cost < g_cost.get(n_coord, float("inf")):
                g_cost[n_coord] = new_cost
                parent[n_coord] = current
                heapq.heappush(heap, (new_cost, neighbor.row, neighbor.col))

    elapsed = time.perf_counter() - t0
    return SearchResult(
        path=None,
        cost=0.0,
        nodes_explored=nodes_explored,
        elapsed_seconds=elapsed,
    )
