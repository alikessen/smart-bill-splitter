from flask import Flask, request, jsonify
from src.models.menu_item import MenuItem
from src.models.order import Order
from src.models.table import Table
from src.models.bill import Bill
from src.models.bill_splitter import BillSplitter
from src.models.menu_loader import load_menu
from flask_cors import CORS

app = Flask(__name__, static_folder=".")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

#single table for now
table = Table(1)

# Load menu from JSON file
menu = load_menu("menu.json")


# Return all menu items
@app.route("/menu", methods=["GET"])
def get_menu():
    return jsonify([
        {"id": m.item_id, "name": m.name, "description": m.description, "category": m.category, "price": m.price}
        for m in menu
    ])


# Add a round of items to the table
@app.route("/order", methods=["POST"])
def add_order():
    data = request.get_json()
    order = Order()
    for item_id in data.get("items", []):
        for m in menu:
            if m.item_id == item_id:
                order.add_item(m)
    table.add_order(order)
    return jsonify({"message": "Order added", "table_subtotal": table.calculate_subtotal()})


# Return subtotal + charges + total with custom service and tip options
@app.route("/bill", methods=["GET", "POST"])
def get_bill():
    data = request.get_json(silent=True) or {}

    # Service charge toggle
    if data.get("service_enabled", True):
        service_rate = float(data.get("service_rate", 0.15))
    else:
        service_rate = 0.0

    # Tip rate (defaults to 10%)
    tip_rate = float(data.get("tip_rate", 0.10))

    bill = Bill(table, tax_rate=0.20, service_rate=service_rate, tip_rate=tip_rate)
    return jsonify(bill.breakdown())


# Clear all orders from the table
@app.route("/table/reset", methods=["POST"])
def reset_table():

    table.orders = []
    return jsonify({"message": "Table cleared"})


# Split bill equally among guests
@app.route("/split/equal", methods=["POST"])
def split_equal():

    data = request.get_json() or {}

    num_guests = data.get("num_guests", 1)

    # Handle service + tip config
    service_enabled = data.get("service_enabled", True)
    service_rate = data.get("service_rate", 0.15) if service_enabled else 0.0
    tip_rate = data.get("tip_rate", 0.10)

    bill = Bill(table, tax_rate=0.20, service_rate=service_rate, tip_rate=tip_rate)
    return jsonify(BillSplitter.split_equally(bill, num_guests))


# Split by items per guest with shared support
@app.route("/split/item", methods=["POST"])
def split_by_item():
 
    data = request.get_json() or {}

    # Extract service/tip
    if data.get("service_enabled", True):
        service_rate = data.get("service_rate", 0.15)
    else:
        service_rate = 0.0
    tip_rate = data.get("tip_rate", 0.10)

    # Remove meta fields before passing to BillSplitter
    guest_items = {
        k: v for k, v in data.items()
        if k not in ("service_enabled", "service_rate", "tip_rate")
    }

    bill = Bill(table, tax_rate=0.20, service_rate=service_rate, tip_rate=tip_rate)

    ordered_items = []
    for order in table.orders:
        ordered_items.extend(order.items)

    return jsonify(BillSplitter.split_by_item(bill, guest_items, ordered_items))


# Return all ordered items with unique keys 
@app.route("/table/items", methods=["GET"])
def get_table_items():

    ordered_items = []
    for order in table.orders:
        ordered_items.extend(order.items)

    items_with_keys = []
    counters = {}
    for m in ordered_items:
        counters[m.item_id] = counters.get(m.item_id, 0) + 1
        idx = counters[m.item_id]
        items_with_keys.append({
            "key": f"{m.item_id}-{idx}",   # e.g. "2-1", "2-2"
            "id": m.item_id,
            "name": m.name,
            "category": m.category,
            "description": m.description,
            "price": m.price
        })

    return jsonify(items_with_keys)


# Split by custom amounts
@app.route("/split/amount", methods=["POST"])
def split_by_amount():

    data = request.get_json() or {}

    # Extract service/tip
    service_enabled = data.pop("service_enabled", True)
    service_rate = data.pop("service_rate", 0.15) if service_enabled else 0.0
    tip_rate = data.pop("tip_rate", 0.10)

    bill = Bill(table, tax_rate=0.20, service_rate=service_rate, tip_rate=tip_rate)
    return jsonify(BillSplitter.split_by_amount(bill, data))
    

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
