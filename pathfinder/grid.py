from dataclasses import dataclass


@dataclass
class Cell:
    row: int
    col: int
    cost: int

    @property
    def is_wall(self) -> bool:
        return self.cost == 0


@dataclass
class Grid:
    rows: int
    cols: int
    cells: list[list[Cell]]

    def in_bounds(self, row: int, col: int) -> bool:
        return 0 <= row < self.rows and 0 <= col < self.cols

    def get(self, row: int, col: int) -> Cell:
        return self.cells[row][col]

    def neighbors(self, row: int, col: int) -> list[Cell]:
        result = []
        for d_row, d_col in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            n_row, n_col = row + d_row, col + d_col
            if self.in_bounds(n_row, n_col):
                cell = self.get(n_row, n_col)
                if not cell.is_wall:
                    result.append(cell)
        return result


@dataclass
class SearchResult:
    path: list[tuple[int, int]] | None
    cost: float
    nodes_explored: int
    elapsed_seconds: float
