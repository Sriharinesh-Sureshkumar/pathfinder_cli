from pathfinder.grid import Grid

USE_COLOUR = False
RESET = '\033[0m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
GRAY = '\033[90m'


def render_grid(grid: Grid, path: list[tuple[int, int]] | None) -> str:
    path_set = set(path) if path else set()
    start = path[0] if path else None
    end = path[-1] if path else None

    border = '+' + '-' * (grid.cols * 2 - 1) + '+'
    lines = [border]

    for row in range(grid.rows):
        chars = []
        for col in range(grid.cols):
            cell = grid.get(row, col)
            coord = (row, col)

            if coord == start:
                char = 'S'
            elif coord == end:
                char = 'E'
            elif coord in path_set:
                char = '*'
            elif cell.is_wall:
                char = '#'
            elif cell.cost > 1:
                char = str(cell.cost)
            else:
                char = '.'

            if USE_COLOUR:
                if char in ('S', 'E'):
                    char = YELLOW + char + RESET
                elif char == '*':
                    char = GREEN + char + RESET
                elif char == '#':
                    char = GRAY + char + RESET

            chars.append(char)

        lines.append('|' + ' '.join(chars) + '|')

    lines.append(border)
    return '\n'.join(lines)
