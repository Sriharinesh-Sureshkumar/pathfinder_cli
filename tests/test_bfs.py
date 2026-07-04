from pathfinder.bfs import bfs
from pathfinder.grid import Cell, Grid


def make_open_grid(rows: int, cols: int) -> Grid:
    cells = [[Cell(row=r, col=c, cost=1) for c in range(cols)] for r in range(rows)]
    return Grid(rows=rows, cols=cols, cells=cells)


def test_bfs_simple_path():
    grid = make_open_grid(5, 5)
    result = bfs(grid, (0, 0), (4, 4))
    assert result.path is not None
    assert result.cost == len(result.path) - 1


def test_bfs_obstacle_detour():
    grid = make_open_grid(3, 3)
    grid.cells[0][1].cost = 0
    result = bfs(grid, (0, 0), (0, 2))
    assert result.path is not None


def test_bfs_no_path():
    grid = make_open_grid(3, 3)
    grid.cells[0][1].cost = 0
    grid.cells[2][1].cost = 0
    grid.cells[1][0].cost = 0
    grid.cells[1][2].cost = 0
    result = bfs(grid, (0, 0), (1, 1))
    assert result.path is None


def test_bfs_start_equals_end():
    grid = make_open_grid(3, 3)
    result = bfs(grid, (1, 1), (1, 1))
    assert result.path == [(1, 1)]
    assert result.cost == 0


def test_bfs_nodes_explored_positive():
    grid = make_open_grid(5, 5)
    result = bfs(grid, (0, 0), (4, 4))
    assert result.nodes_explored > 0
