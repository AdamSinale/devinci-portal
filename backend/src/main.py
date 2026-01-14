from fastapi import FastAPI

app = FastAPI(title="DevInci Portal API")

@app.get("/api/health")
def health():
    return {"ok": True}
