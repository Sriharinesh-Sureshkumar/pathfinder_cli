import time
from collections import deque

from pathfinder.grid import Grid, SearchResult


def bfs(grid: Grid, start: tuple[int, int], end: tuple[int, int]) -> SearchResult:
    t0 = time.perf_counter()

    queue = deque([start])
    visited = {start}
    parent = {start: None}
    nodes_explored = 0

    while queue:
        current = queue.popleft()
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
                cost=float(len(path) - 1),
                nodes_explored=nodes_explored,
                elapsed_seconds=elapsed,
            )

        row, col = current
        for neighbor in grid.neighbors(row, col):
            coord = (neighbor.row, neighbor.col)
            if coord not in visited:
                visited.add(coord)
                parent[coord] = current
                queue.append(coord)

    elapsed = time.perf_counter() - t0
    return SearchResult(
        path=None,
        cost=0.0,
        nodes_explored=nodes_explored,
        elapsed_seconds=elapsed,
    )
