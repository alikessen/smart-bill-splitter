from src.models.menu_item import MenuItem

class Order:
    def __init__(self):
        self.items = []

    # Add a menu item to the order
    def add_item(self, item: MenuItem):
        self.items.append(item)

    # Return the subtotal of all items in the order
    def calculate_subtotal(self) -> float:
        return sum(item.price for item in self.items)

    def __str__(self):
        if not self.items:
            return "Order is empty."
        return "\n".join(str(item) for item in self.items)
