from typing import List

class EmbeddingsProvider:
    def get_embedding(self, text: str) -> List[float]:
        # Return a mock 768-d vector
        return [0.0] * 768
