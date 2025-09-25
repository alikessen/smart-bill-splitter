from src.models.order import Order

class Table:
    def __init__(self, table_id: int):
        self.table_id = table_id
        self.orders = []  # list of Order objects (multiple rounds)

    # Add a full round of orders to the table
    def add_order(self, order: Order):
        self.orders.append(order)

    # Return subtotal of all items ordered at the table
    def calculate_subtotal(self) -> float:
        return sum(order.calculate_subtotal() for order in self.orders)

    def __str__(self):
        all_items = []
        for order in self.orders:
            all_items.extend(order.items)

        if not all_items:
            return f"Table {self.table_id} has no orders."

        items_str = "\n".join(str(item) for item in all_items)
        subtotal = self.calculate_subtotal()
        return f"Table {self.table_id} Orders:\n{items_str}\nSubtotal: ${subtotal:.2f}"
