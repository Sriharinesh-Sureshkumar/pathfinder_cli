import heapq
import random
import tracemalloc
from collections import deque

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pathfinder.astar import astar, manhattan
from pathfinder.bfs import bfs
from pathfinder.dijkstra import dijkstra
from pathfinder.generator import TERRAIN_WEIGHTS
from pathfinder.grid import Cell, Grid

from schemas import AlgorithmResult, HealthResponse, RunRequest, RunResponse

app = FastAPI(title="pathfinder-cli web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_grid(rows: int, cols: int, seed: int, wall_probability: float) -> Grid:
    rng = random.Random(seed)
    cells = []
    for row in range(rows):
        row_cells = []
        for col in range(cols):
            if rng.random() < wall_probability:
                cost = 0
            else:
                cost = rng.choice(TERRAIN_WEIGHTS)
            row_cells.append(Cell(row=row, col=col, cost=cost))
        cells.append(row_cells)
    return Grid(rows=rows, cols=cols, cells=cells)


def grid_from_custom(rows: int, cols: int, custom_grid: list[list[int]]) -> Grid:
    cells = [
        [Cell(row=r, col=c, cost=custom_grid[r][c]) for c in range(cols)]
        for r in range(rows)
    ]
    return Grid(rows=rows, cols=cols, cells=cells)


def bfs_trace(grid: Grid, start: tuple, end: tuple) -> list:
    queue = deque([start])
    visited = {start}
    visited_order = []
    while queue:
        current = queue.popleft()
        visited_order.append(current)
        if current == end:
            break
        row, col = current
        for neighbor in grid.neighbors(row, col):
            coord = (neighbor.row, neighbor.col)
            if coord not in visited:
                visited.add(coord)
                queue.append(coord)
    return visited_order


def dijkstra_trace(grid: Grid, start: tuple, end: tuple) -> list:
    heap = [(0, start[0], start[1])]
    settled = set()
    g_cost = {start: 0}
    visited_order = []
    while heap:
        cost, row, col = heapq.heappop(heap)
        current = (row, col)
        if current in settled:
            continue
        settled.add(current)
        visited_order.append(current)
        if current == end:
            break
        for neighbor in grid.neighbors(row, col):
            n_coord = (neighbor.row, neighbor.col)
            new_cost = cost + neighbor.cost
            if n_coord not in settled and new_cost < g_cost.get(n_coord, float("inf")):
                g_cost[n_coord] = new_cost
                heapq.heappush(heap, (new_cost, neighbor.row, neighbor.col))
    return visited_order


def astar_trace(grid: Grid, start: tuple, end: tuple) -> list:
    end_row, end_col = end
    h = manhattan(start[0], start[1], end_row, end_col)
    heap = [(h, 0, start[0], start[1])]
    settled = set()
    g_cost = {start: 0}
    visited_order = []
    while heap:
        f, g, row, col = heapq.heappop(heap)
        current = (row, col)
        if current in settled:
            continue
        settled.add(current)
        visited_order.append(current)
        if current == end:
            break
        for neighbor in grid.neighbors(row, col):
            n_coord = (neighbor.row, neighbor.col)
            new_g = g + neighbor.cost
            if n_coord not in settled and new_g < g_cost.get(n_coord, float("inf")):
                g_cost[n_coord] = new_g
                new_f = new_g + manhattan(neighbor.row, neighbor.col, end_row, end_col)
                heapq.heappush(heap, (new_f, new_g, neighbor.row, neighbor.col))
    return visited_order


def run_and_measure(fn, grid: Grid, start: tuple, end: tuple, trace_fn) -> AlgorithmResult:
    tracemalloc.start()
    result = fn(grid, start, end)
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    memory_mb = round(peak / (1024 * 1024), 2)

    visited_order = trace_fn(grid, start, end)

    return AlgorithmResult(
        visited_order=[list(coord) for coord in visited_order],
        path=[list(coord) for coord in result.path] if result.path is not None else None,
        cost=result.cost,
        nodes_explored=result.nodes_explored,
        elapsed_ms=round(result.elapsed_seconds * 1000, 3),
        memory_mb=memory_mb,
    )


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok")


@app.post("/api/run", response_model=RunResponse)
def run(request: RunRequest):
    start = (request.start[0], request.start[1])
    end = (request.end[0], request.end[1])

    if request.custom_grid is not None:
        grid = grid_from_custom(request.rows, request.cols, request.custom_grid)
    else:
        grid = build_grid(request.rows, request.cols, request.seed, request.wall_probability)

    for name, coord in (("start", start), ("end", end)):
        if not grid.in_bounds(coord[0], coord[1]):
            raise HTTPException(status_code=400, detail=f"{name} coordinate {coord} is out of bounds")
        if grid.get(coord[0], coord[1]).is_wall:
            raise HTTPException(status_code=400, detail=f"{name} coordinate {coord} is a wall cell")

    bfs_result = run_and_measure(bfs, grid, start, end, bfs_trace)
    dijkstra_result = run_and_measure(dijkstra, grid, start, end, dijkstra_trace)
    astar_result = run_and_measure(astar, grid, start, end, astar_trace)

    return RunResponse(
        grid=[[cell.cost for cell in row] for row in grid.cells],
        bfs=bfs_result,
        dijkstra=dijkstra_result,
        astar=astar_result,
    )
