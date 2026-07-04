from pathfinder.dijkstra import dijkstra
from pathfinder.grid import Cell, Grid


def make_open_grid(rows: int, cols: int) -> Grid:
    cells = [[Cell(row=r, col=c, cost=1) for c in range(cols)] for r in range(rows)]
    return Grid(rows=rows, cols=cols, cells=cells)


def test_dijkstra_simple_path():
    grid = make_open_grid(5, 5)
    result = dijkstra(grid, (0, 0), (4, 4))
    assert result.path is not None
    assert result.cost > 0


def test_dijkstra_weighted_path():
    cells = [[Cell(row=r, col=c, cost=1) for c in range(3)] for r in range(3)]
    cells[0][1].cost = 5
    grid = Grid(rows=3, cols=3, cells=cells)

    result = dijkstra(grid, (0, 0), (0, 2))

    assert result.path is not None
    assert result.cost == 4
    assert (0, 1) not in result.path


def test_dijkstra_no_path():
    grid = make_open_grid(3, 3)
    grid.cells[0][1].cost = 0
    grid.cells[2][1].cost = 0
    grid.cells[1][0].cost = 0
    grid.cells[1][2].cost = 0
    result = dijkstra(grid, (0, 0), (1, 1))
    assert result.path is None


def test_dijkstra_start_equals_end():
    grid = make_open_grid(3, 3)
    result = dijkstra(grid, (1, 1), (1, 1))
    assert result.path == [(1, 1)]
    assert result.cost == 0
