from flask import Flask, request, jsonify
from src.models.menu_item import MenuItem
from src.models.order import Order
from src.models.table import Table
from src.models.bill import Bill
from src.models.bill_splitter import BillSplitter

from flask_cors import CORS

app = Flask(__name__, static_folder=".")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

#single table for now
table = Table(1)

# Sample menu
menu = [
    MenuItem(1, "Calamari", "Fried squid with lemon", "Appetizer", 12.50),
    MenuItem(2, "Fish and Chips", "Crispy battered fish with fries", "Main", 28.00),
    MenuItem(3, "Cheesecake", "Classic New York cheesecake", "Dessert", 9.00)
]



@app.route("/menu", methods=["GET"])
def get_menu():
    """Return all menu items."""
    return jsonify([
        {"id": m.item_id, "name": m.name, "description": m.description, "category": m.category, "price": m.price}
        for m in menu
    ])

@app.route("/order", methods=["POST"])
def add_order():
    """Add a round of items to the table."""
    data = request.get_json()
    order = Order()
    for item_id in data.get("items", []):
        for m in menu:
            if m.item_id == item_id:
                order.add_item(m)
    table.add_order(order)
    return jsonify({"message": "Order added", "table_subtotal": table.calculate_subtotal()})

@app.route("/bill", methods=["GET"])
def get_bill():
    """Return subtotal + charges + total."""
    bill = Bill(table, tax_rate=0.20, service_rate=0.15, tip_rate=0.10)
    return jsonify(bill.breakdown())

@app.route("/split/equal", methods=["POST"])
def split_equal():
    """Split bill equally among guests."""
    data = request.get_json()
    num_guests = data.get("num_guests", 1)
    bill = Bill(table, tax_rate=0.20, service_rate=0.15, tip_rate=0.10)
    return jsonify(BillSplitter.split_equally(bill, num_guests))

@app.route("/split/item", methods=["POST"])
def split_by_item():
    """
    Split by items per guest (with shared support).
    Example body:
    {
      "Guest 1": { "items": [2], "shared": { "3": 0.5 } },
      "Guest 2": { "items": [1], "shared": { "3": 0.5 } }
    }
    """
    data = request.get_json()
    bill = Bill(table, tax_rate=0.20, service_rate=0.15, tip_rate=0.10)
    # Collect all ordered items (with duplicates preserved)
    ordered_items = []
    for order in table.orders:
        ordered_items.extend(order.items)

    return jsonify(BillSplitter.split_by_item(bill, data, ordered_items))

@app.route("/table/items", methods=["GET"])
def get_table_items():
    """Return all ordered items with unique keys (duplicates included)."""
    ordered_items = []
    for order in table.orders:
        ordered_items.extend(order.items)

    items_with_keys = []
    for idx, m in enumerate(ordered_items, start=1):
        items_with_keys.append({
            "key": f"{m.item_id}-{idx}",
            "id": m.item_id,
            "name": m.name,
            "category": m.category,
            "description": m.description,
            "price": m.price
        })

    return jsonify(items_with_keys)

@app.route("/split/amount", methods=["POST"])
def split_by_amount():
    """Split by custom amounts."""
    data = request.get_json()
    bill = Bill(table, tax_rate=0.20, service_rate=0.15, tip_rate=0.10)
    return jsonify(BillSplitter.split_by_amount(bill, data))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
