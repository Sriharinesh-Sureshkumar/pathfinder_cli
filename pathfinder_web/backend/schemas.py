from typing import Optional

from pydantic import BaseModel, Field, field_validator


class RunRequest(BaseModel):
    rows: int = Field(gt=0, le=200)
    cols: int = Field(gt=0, le=200)
    seed: int
    start: list[int]
    end: list[int]
    wall_probability: float = Field(ge=0.0, le=1.0, default=0.20)
    custom_grid: Optional[list[list[int]]] = None

    @field_validator("start", "end")
    @classmethod
    def validate_coord_pair(cls, value: list[int]) -> list[int]:
        if len(value) != 2:
            raise ValueError("coordinate must be a [row, col] pair")
        return value


class AlgorithmResult(BaseModel):
    visited_order: list[list[int]]
    path: Optional[list[list[int]]]
    cost: float
    nodes_explored: int
    elapsed_ms: float
    memory_mb: float


class RunResponse(BaseModel):
    grid: list[list[int]]
    bfs: AlgorithmResult
    dijkstra: AlgorithmResult
    astar: AlgorithmResult


class HealthResponse(BaseModel):
    status: str
