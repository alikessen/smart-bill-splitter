class MenuItem:
    def __init__(self, item_id: int, name: str, description: str, category: str, price: float):
        
        self.item_id = item_id
        self.name = name
        self.description = description
        self.category = category
        self.price = price

    def __str__(self):
        return f"{self.name} ({self.category}) - ${self.price:.2f}"

