# Smart Bill Splitter

A simple web app to manage a restaurant bill and split it equally, by item, or by custom amount.
Built with Flask (backend) and React + Vite + Tailwind via Bolt.new (frontend).

---

## Features
- **Menu Management**: Menu items stored in `menu.json` with ID, name, description, category, and price.  
- **Order Taking**: Add items across multiple rounds (appetizers, mains, desserts).  
- **Bill Calculation**: Subtotal + tax (20%) + configurable service charge, and tip.  
- **Splitting Methods**:  
  - **Equal Split** – divide evenly among guests.  
  - **By Item** – assign specific items to each guest (supports shared items).  
  - **By Amount** – enter each guest’s contribution and track balance.  

---

## Tech Stack
- **Backend**: Python, Flask, flask-cors  
- **Frontend**: React, Vite, TypeScript, Tailwind  
- **Data**: JSON file (`menu.json`)  

---

## Prerequisites
Before running the project, make sure you have the following installed:

- **Python 3.10 or above** (for the backend)  
- **Node.js 18 or above** (includes npm, for the frontend)  

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/alikessen/smart-bill-splitter
cd smart-bill-splitter
```

### 2. Backend (Flask)
```bash
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at: **http://localhost:5050**

### 3. Frontend (Vite + React)
```bash
cd frontend
cp .env.example .env   # sets VITE_API_BASE=http://localhost:5050
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## API Endpoints

### Menu & Orders
- `GET /menu` → returns menu items  
- `POST /order` → `{ "items": [1, 2, 3] }` (IDs)  
- `GET /bill` or `POST /bill` → calculate bill with optional `{ "service_enabled": true, "service_rate": 0.15, "tip_rate": 0.10 }`  
- `POST /table/reset` → clears orders  
- `GET /table/items` → list current table’s ordered items  

### Splitting
- `POST /split/equal` → `{ "num_guests": 3, "service_enabled": true, "tip_rate": 0.1 }`  
- `POST /split/item` → per-guest item assignments  
- `POST /split/amount` → `{ "Guest 1": 50, "Guest 2": 75, "service_enabled": true, "tip_rate": 0.1 }`  

---

## Bill Splitting Logic

The application supports three methods of splitting the bill.  

### 1. Equal Split
- The total bill is divided evenly among the specified number of guests.  
- Example: A $90 bill split between 3 guests results in $30 per guest.  
- Implementation: simply `total / num_guests`.  

### 2. Split by Item
- Each guest selects the specific items they consumed.  
- Shared items are divided evenly among selected guests (half each if two people share an appetizer).  
- Tax, service, and tip are applied proportionally to each guest’s subtotal, so that guests only pay their fair share of extras.  
- Example:  
  - Guest A orders Steak ($20) + half Appetizer ($5).  
  - Guest B orders Sandwich ($15) + half Appetizer ($5).  
  - Each guest then pays their subtotal plus proportional tax/service/tip.  
- Implementation: items assigned to guests via dictionaries, with shared items represented as fractional values (e.g., `{ "Appetizer": 0.5 }`).  

### 3. Split by Amount
- Guests enter custom contributions.  
- The system tracks how much has been paid and calculates the Remaining balance or any Overpaid amount.  
- Example:  
  - Total bill: $100  
  - Guest A pays $60, Guest B pays $50  
  - Remaining = $100 – $110 = Overpaid $10  
- Implementation: dictionary mapping guest names → amounts. The system sums contributions and compares against the total.  

---

## Assumptions
- Single table is supported at a time (reset clears everything).  
- Tax is fixed at 20%.  
- Service charge and tip are configurable.  
- Shared items are divided evenly among selected guests.  
- Floating-point values are rounded to two decimal places for display.

---

## Design Choices
- **Object-Oriented Design**:  
  The core logic is encapsulated in classes (`MenuItem`, `Order`, `Table`, `Bill`, `BillSplitter`). This makes the code modular, easier to maintain, and extensible (for example, adding discounts or multiple tables later would only require updating certain classes).  

- **Data Structures**:  
  - **Lists** are used to store menu items, orders, and guests because they maintain order and allow duplicates.

  - **Dictionaries** are used for flexible mappings such as guest contributions and item assignments in the “split by item” feature. This makes it easy to look up amounts by guest name and to represent shared items with fractional values.  

- **API-first Approach**:  
  The backend provides clear endpoints (`/menu`, `/order`, `/bill`, `/split/*`) that are consumed by the frontend. This separation of concerns makes the frontend independent and easy to replace or extend.  

- **JSON for Persistence**:  
  The menu is stored in `menu.json`, allowing the application to load data at startup without hardcoding. 

- **Efficiency in Split by Item**:  
  Originally, the `split_by_item` function scanned the full list of ordered items every time a guest’s item key was matched. This was correct but inefficient for larger orders.  
  I refactored it to use a **lookup table** (`itemId-index -> MenuItem`) built once at the start.  
  - **Before**: O(Guests × Items × OrderedItems)  
  - **After**: O(Guests × Items) + O(OrderedItems) for preprocessing  
  This makes the function both faster and clearer, since it now follows three clear steps:  
  1. Build lookup for ordered items  
  2. Assign full and shared items to each guest  
  3. Apply proportional tax, service, and tip  

---
 
 
