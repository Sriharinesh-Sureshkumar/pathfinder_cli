import random

from pathfinder.grid import Cell, Grid

WALL_PROBABILITY = 0.20
TERRAIN_WEIGHTS = [1, 1, 1, 2, 3, 5]


def generate_grid(rows: int, cols: int, seed: int) -> Grid:
    rng = random.Random(seed)
    cells = []
    for row in range(rows):
        row_cells = []
        for col in range(cols):
            if rng.random() < WALL_PROBABILITY:
                cost = 0
            else:
                cost = rng.choice(TERRAIN_WEIGHTS)
            row_cells.append(Cell(row=row, col=col, cost=cost))
        cells.append(row_cells)
    return Grid(rows=rows, cols=cols, cells=cells)
