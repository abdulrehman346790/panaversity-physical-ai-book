from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    cerebras_api_key: str = ""
    groq_api_key: str = ""
    qdrant_url: str = ""
    qdrant_api_key: str = ""
    database_url: str = ""
    use_free_model: bool = True
    free_model_id: str = "cerebras/llama-3.3-70b"
    cors_origins: str = "http://localhost:3000"
    embedding_model: str = "text-embedding-3-small"
    use_ollama: bool = False
    ollama_url: str = "http://localhost:11434"
    ollama_embedding_model: str = "nomic-embed-text"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
