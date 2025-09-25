# Smart Bill Splitter

The Smart Bill Splitter is a simple restaurant bill management application designed to make group dining easier.  
It allows guests to order food, calculate totals (including tax, service charge, and tip), and split the final bill using flexible methods.


---

## Features
- Menu Management  
  Define items with ID, name, description, category, and price.
- Order Taking  
  Guests can add items across multiple rounds (e.g., starters, mains, desserts).
- Bill Calculation  
  Subtotal + configurable tax, service charge, and tip.
- Bill Splitting  
  1. Split equally among all guests  
  2. Split by items consumed (with proportional tax/tip)  
  3. Split by custom amounts (track remaining balance)

---

## Tech Stack
- Language: Python 3.11  
- Backend: Core logic implemented in Python (classes and services)  
- Frontend:  
- Testing: pytest  
- Data Storage: 

---

## Setup and Run

Clone the repository and navigate into it:
```bash
git clone https://github.com/alikessen/smart-bill-splitter.git
cd smart-bill-splitter

pip install -r requirements.txt

python src/main.py