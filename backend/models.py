from pydantic import BaseModel, HttpUrl


class AnalyzeRequest(BaseModel):
    url: HttpUrl


class WordData(BaseModel):
    word: str
    weight: float       # 0.0 to 1.0
    sentiment: float    # -1.0 to 1.0 (VADER compound)


class AnalyzeResponse(BaseModel):
    words: list[WordData]
    total: int
