from pathfinder.generator import generate_grid
from pathfinder.grid import Cell, Grid


def make_open_grid(rows: int, cols: int) -> Grid:
    cells = [[Cell(row=r, col=c, cost=1) for c in range(cols)] for r in range(rows)]
    return Grid(rows=rows, cols=cols, cells=cells)


def test_center_neighbors():
    grid = make_open_grid(5, 5)
    assert len(grid.neighbors(2, 2)) == 4


def test_corner_neighbors():
    grid = make_open_grid(5, 5)
    assert len(grid.neighbors(0, 0)) == 2


def test_edge_neighbors():
    grid = make_open_grid(5, 5)
    assert len(grid.neighbors(0, 2)) == 3


def test_wall_excluded():
    grid = make_open_grid(3, 3)
    grid.cells[1][1].cost = 0
    neighbor_coords = [(n.row, n.col) for n in grid.neighbors(1, 0)]
    assert (1, 1) not in neighbor_coords


def test_generator_deterministic():
    grid_a = generate_grid(10, 10, 42)
    grid_b = generate_grid(10, 10, 42)
    costs_a = [cell.cost for row in grid_a.cells for cell in row]
    costs_b = [cell.cost for row in grid_b.cells for cell in row]
    assert costs_a == costs_b


def test_generator_different_seeds():
    grid_a = generate_grid(10, 10, 42)
    grid_b = generate_grid(10, 10, 99)
    costs_a = [cell.cost for row in grid_a.cells for cell in row]
    costs_b = [cell.cost for row in grid_b.cells for cell in row]
    assert costs_a != costs_b
