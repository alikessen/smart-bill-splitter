from src.models.menu_item import MenuItem

def load_menu():
    return [
        MenuItem(1, "Calamari", "Fried squid with lemon", "Appetizer", 12.50),
        MenuItem(2, "Fish and Chips", "Crispy battered fish with fries", "Main", 28.00),
        MenuItem(3, "Cheesecake", "Classic New York cheesecake", "Dessert", 9.00),
    ]

if __name__ == "__main__":
    menu = load_menu()
    for item in menu:
        print(item)