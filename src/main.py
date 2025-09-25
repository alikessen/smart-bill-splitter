from src.models.menu_item import MenuItem
from src.models.guest import Guest

def load_menu():
    return [
        MenuItem(1, "Calamari", "Fried squid with lemon", "Appetizer", 12.50),
        MenuItem(2, "Fish and Chips", "Crispy battered fish with fries", "Main", 28.00),
        MenuItem(3, "Cheesecake", "Classic New York cheesecake", "Dessert", 9.00),
    ]

if __name__ == "__main__":
    menu = load_menu()

    # Create two guests
    ali = Guest(1, "Ali")
    bob = Guest(2, "Bob")

    # Round 1 (Appetizers)
    ali.add_item_to_order(menu[0])  # Ali orders Calamari
    bob.add_item_to_order(menu[0])    # Bob orders Calamari

    # Round 2 (Mains)
    ali.add_item_to_order(menu[1])  # Ali orders Fish and Chips
    bob.add_item_to_order(menu[1])    # Bob orders Fish and Chips

    # Round 3 (Desserts)
    ali.add_item_to_order(menu[2])  # Ali orders Cheesecake

    # Show results
    print(ali)
    print(bob)