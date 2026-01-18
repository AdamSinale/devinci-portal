
from fastapi import HTTPException

class SystemError(HTTPException):
    def __init__(self, err_code: int = 500, err_detail: str = "Internal Server Error"):
        raise HTTPException(status_code=err_code, detail=err_detail)
