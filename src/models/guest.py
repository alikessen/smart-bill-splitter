from src.models.order import Order
from src.models.menu_item import MenuItem

class Guest:
    def __init__(self, guest_id: int, name: str):
        self.guest_id = guest_id
        self.name = name
        self.order = Order()

    # Guest adds a menu item to their order
    def add_item_to_order(self, item: MenuItem):
        self.order.add_item(item)

    # Get the subtotal for this guest's order
    def get_subtotal(self) -> float:
        return self.order.calculate_subtotal()

    def __str__(self):
        return f"Guest {self.name} (ID: {self.guest_id}) - Subtotal: ${self.get_subtotal():.2f}"
