from pathfinder.astar import astar
from pathfinder.dijkstra import dijkstra
from pathfinder.generator import generate_grid
from pathfinder.grid import Cell, Grid


def make_open_grid(rows: int, cols: int) -> Grid:
    cells = [[Cell(row=r, col=c, cost=1) for c in range(cols)] for r in range(rows)]
    return Grid(rows=rows, cols=cols, cells=cells)


def test_astar_simple_path():
    grid = make_open_grid(5, 5)
    result = astar(grid, (0, 0), (4, 4))
    assert result.path is not None
    assert result.cost > 0


def test_astar_no_path():
    grid = make_open_grid(3, 3)
    grid.cells[0][1].cost = 0
    grid.cells[2][1].cost = 0
    grid.cells[1][0].cost = 0
    grid.cells[1][2].cost = 0
    result = astar(grid, (0, 0), (1, 1))
    assert result.path is None


def test_astar_start_equals_end():
    grid = make_open_grid(3, 3)
    result = astar(grid, (1, 1), (1, 1))
    assert result.path == [(1, 1)]
    assert result.cost == 0


def test_astar_fewer_nodes_than_dijkstra():
    grid = generate_grid(50, 50, 42)
    dijkstra_result = dijkstra(grid, (0, 0), (49, 49))
    astar_result = astar(grid, (0, 0), (49, 49))

    assert dijkstra_result.path is not None
    assert astar_result.path is not None
    assert astar_result.nodes_explored < dijkstra_result.nodes_explored
