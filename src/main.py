from src.models.menu_item import MenuItem
from src.models.order import Order
from src.models.bill import Bill
from src.models.table import Table
from src.models.bill_splitter import BillSplitter

def load_menu():
    return [
        MenuItem(1, "Calamari", "Fried squid with lemon", "Appetizer", 12.50),
        MenuItem(2, "Fish and Chips", "Crispy battered fish with fries", "Main", 28.00),
        MenuItem(3, "Cheesecake", "Classic New York cheesecake", "Dessert", 9.00),
    ]

if __name__ == "__main__":
    menu = load_menu()

    # Create a table
    table1 = Table(1)

    # Round 1 (Appetizers)
    round1 = Order()
    round1.add_item(menu[0])  # Calamari
    round1.add_item(menu[0])  # Another Calamari
    table1.add_order(round1)

    # Round 2 (Mains)
    round2 = Order()
    round2.add_item(menu[1])  # Fish and Chips
    round2.add_item(menu[1])  # Another Fish and Chips
    table1.add_order(round2)

    # Round 3 (Desserts)
    round3 = Order()
    round3.add_item(menu[2])  # Cheesecake
    table1.add_order(round3)

    # Bill calculation
    bill = Bill(table1, tax_rate=0.20, service_rate=0.15, tip_rate=0.10)
    print(bill)
    print("\n--- Splitting Examples ---")

    # 1. Equal Split (3 guests)
    print("Equal Split:", BillSplitter.split_equally(bill, 3))

    # 2. Split by Item (with shared appetizer)
    guest_items = {
        "Guest 1": { "items": [1, 2], "shared": {3: 0.5} },  # Calamari + Fish & Chips + half Cheesecake
        "Guest 2": { "items": [1, 2], "shared": {3: 0.5} }   # Calamari + Fish & Chips + half Cheesecake
    }
    print("Split by Item:", BillSplitter.split_by_item(bill, guest_items, menu))


    # 3. Split by Amount
    contributions = {"Guest 1": 50, "Guest 2": 75}
    print("Split by Amount:", BillSplitter.split_by_amount(bill, contributions))