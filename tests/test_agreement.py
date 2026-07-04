from pathfinder.astar import astar
from pathfinder.bfs import bfs
from pathfinder.dijkstra import dijkstra
from pathfinder.generator import generate_grid
from pathfinder.grid import Cell, Grid


def make_open_grid(rows: int, cols: int) -> Grid:
    cells = [[Cell(row=r, col=c, cost=1) for c in range(cols)] for r in range(rows)]
    return Grid(rows=rows, cols=cols, cells=cells)


def test_uniform_cost_agreement():
    grid = make_open_grid(10, 10)
    bfs_result = bfs(grid, (0, 0), (9, 9))
    dijkstra_result = dijkstra(grid, (0, 0), (9, 9))
    assert bfs_result.cost == dijkstra_result.cost


def test_dijkstra_finds_optimal():
    cells = [[Cell(row=r, col=c, cost=1) for c in range(3)] for r in range(3)]
    cells[0][1].cost = 5
    grid = Grid(rows=3, cols=3, cells=cells)

    bfs_result = bfs(grid, (0, 0), (0, 2))
    dijkstra_result = dijkstra(grid, (0, 0), (0, 2))

    bfs_weighted_cost = sum(grid.get(r, c).cost for r, c in bfs_result.path[1:])
    assert dijkstra_result.cost <= bfs_weighted_cost


def test_astar_cost_equals_dijkstra():
    for seed in (2, 3, 4, 5, 6):
        grid = generate_grid(20, 20, seed)
        dijkstra_result = dijkstra(grid, (0, 0), (19, 19))
        astar_result = astar(grid, (0, 0), (19, 19))
        assert astar_result.cost == dijkstra_result.cost


def test_astar_nodes_less_than_dijkstra_benchmark():
    grid = generate_grid(100, 100, 42)
    dijkstra_result = dijkstra(grid, (0, 0), (98, 99))
    astar_result = astar(grid, (0, 0), (98, 99))

    assert dijkstra_result.path is not None
    assert astar_result.path is not None
    assert astar_result.nodes_explored < dijkstra_result.nodes_explored
