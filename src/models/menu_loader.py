import json
from pathlib import Path
from src.models.menu_item import MenuItem

def load_menu(file_path="menu.json"):
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Menu file not found: {file_path}")

    with open(path, "r") as f:
        data = json.load(f)

    # Turn each JSON entry into a MenuItem object
    return [MenuItem(**item) for item in data]
